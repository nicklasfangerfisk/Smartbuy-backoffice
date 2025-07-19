-- Option B: Separate checkout table
-- More scalable approach - separate table for checkout data

-- Create checkout sessions table
CREATE TABLE IF NOT EXISTS "order_checkouts" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "order_uuid" UUID NOT NULL REFERENCES "Orders"("uuid") ON DELETE CASCADE,
  "customer_info" JSONB NOT NULL,
  "payment_info" JSONB NOT NULL, -- Encrypted/tokenized payment data
  "delivery_info" JSONB NOT NULL,
  "billing_address" JSONB,
  "delivery_address" JSONB,
  "checkout_completed" BOOLEAN DEFAULT false,
  "checkout_completed_at" TIMESTAMP WITH TIME ZONE,
  "payment_intent_id" TEXT, -- For Stripe/payment gateway integration
  "payment_status" TEXT DEFAULT 'pending', -- pending, processing, succeeded, failed
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "metadata" JSONB
);

-- Add indexes
CREATE INDEX IF NOT EXISTS "idx_order_checkouts_order_uuid" ON "order_checkouts"("order_uuid");
CREATE INDEX IF NOT EXISTS "idx_order_checkouts_payment_status" ON "order_checkouts"("payment_status");
CREATE INDEX IF NOT EXISTS "idx_order_checkouts_completed_at" ON "order_checkouts"("checkout_completed_at");
CREATE INDEX IF NOT EXISTS "idx_order_checkouts_payment_intent" ON "order_checkouts"("payment_intent_id");

-- Enable RLS
ALTER TABLE "order_checkouts" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "order_checkouts_read_policy" ON "order_checkouts"
  FOR SELECT USING (true);

CREATE POLICY "order_checkouts_insert_policy" ON "order_checkouts"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "order_checkouts_update_policy" ON "order_checkouts"
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_checkout_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER trg_update_checkout_timestamp
  BEFORE UPDATE ON "order_checkouts"
  FOR EACH ROW
  EXECUTE FUNCTION update_checkout_updated_at();

-- Function to handle checkout completion
CREATE OR REPLACE FUNCTION complete_order_checkout(p_order_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  checkout_record RECORD;
BEGIN
  -- Get the checkout data
  SELECT * INTO checkout_record 
  FROM "order_checkouts" 
  WHERE "order_uuid" = p_order_uuid 
  AND "checkout_completed" = true
  ORDER BY "created_at" DESC 
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Update order status and add customer info
  UPDATE "Orders" SET
    "status" = 'Paid',
    "customer_name" = checkout_record.customer_info->>'name',
    "customer_email" = checkout_record.customer_info->>'email'
  WHERE "uuid" = p_order_uuid;
  
  -- Log checkout completion event
  INSERT INTO "order_events" (
    "order_uuid",
    "event_type",
    "event_data",
    "title",
    "description",
    "created_by"
  ) VALUES (
    p_order_uuid,
    'checkout_completed',
    jsonb_build_object(
      'checkout_id', checkout_record.id,
      'payment_method', checkout_record.payment_info->>'method',
      'delivery_method', checkout_record.delivery_info->>'method',
      'payment_intent_id', checkout_record.payment_intent_id
    ),
    'Checkout completed',
    'Customer completed checkout and payment was processed',
    'Checkout System'
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE "order_checkouts" IS 'Stores checkout session data for orders including payment and delivery information';
COMMENT ON COLUMN "order_checkouts"."customer_info" IS 'Customer information collected during checkout';
COMMENT ON COLUMN "order_checkouts"."payment_info" IS 'Payment method and tokenized payment data (never store raw card details)';
COMMENT ON COLUMN "order_checkouts"."delivery_info" IS 'Delivery method and preferences';
COMMENT ON COLUMN "order_checkouts"."payment_intent_id" IS 'Payment gateway intent ID for tracking';
COMMENT ON COLUMN "order_checkouts"."payment_status" IS 'Current payment status from payment gateway';
COMMENT ON COLUMN "order_checkouts"."metadata" IS 'Additional checkout metadata for extensibility';
