-- Option A: Extend Orders table with checkout fields
-- Simple approach - adds checkout data directly to Orders table

-- Add checkout fields to Orders table
ALTER TABLE "Orders" 
ADD COLUMN IF NOT EXISTS "checkout_data" JSONB,
ADD COLUMN IF NOT EXISTS "checkout_completed_at" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "payment_method" TEXT,
ADD COLUMN IF NOT EXISTS "delivery_method" TEXT,
ADD COLUMN IF NOT EXISTS "delivery_address" JSONB,
ADD COLUMN IF NOT EXISTS "billing_address" JSONB;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_orders_checkout_completed_at" ON "Orders"("checkout_completed_at");
CREATE INDEX IF NOT EXISTS "idx_orders_payment_method" ON "Orders"("payment_method");
CREATE INDEX IF NOT EXISTS "idx_orders_delivery_method" ON "Orders"("delivery_method");

-- Add comments
COMMENT ON COLUMN "Orders"."checkout_data" IS 'Complete checkout data including customer info, payment, delivery details';
COMMENT ON COLUMN "Orders"."checkout_completed_at" IS 'When the checkout process was completed (order moved from Draft to Paid)';
COMMENT ON COLUMN "Orders"."payment_method" IS 'Payment method used (card, mobilepay, viabill, etc.)';
COMMENT ON COLUMN "Orders"."delivery_method" IS 'Delivery method selected (standard, express, overnight)';
COMMENT ON COLUMN "Orders"."delivery_address" IS 'Delivery address as JSON';
COMMENT ON COLUMN "Orders"."billing_address" IS 'Billing address as JSON (if different from delivery)';

-- Update the order status tracking trigger to log checkout completion
CREATE OR REPLACE FUNCTION create_order_status_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create event if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO "order_events" (
      "order_uuid",
      "event_type",
      "event_data",
      "created_by",
      "title",
      "description"
    ) VALUES (
      NEW.uuid,
      'status_change',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'order_number', NEW.order_number_display,
        'payment_method', NEW.payment_method,
        'checkout_completed_at', NEW.checkout_completed_at
      ),
      COALESCE(NEW."Created by"::text, 'System'),
      'Status changed to ' || NEW.status::text,
      'Order status changed from ' || COALESCE(OLD.status::text, 'null') || ' to ' || NEW.status::text
    );
    
    -- If status changed to Paid, also create a checkout completion event
    IF NEW.status = 'Paid' AND OLD.status != 'Paid' THEN
      INSERT INTO "order_events" (
        "order_uuid",
        "event_type",
        "event_data",
        "created_by",
        "title",
        "description"
      ) VALUES (
        NEW.uuid,
        'checkout_completed',
        COALESCE(NEW.checkout_data, '{}'::jsonb),
        COALESCE(NEW."Created by"::text, 'Customer'),
        'Checkout completed',
        'Customer completed checkout and payment was processed'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
