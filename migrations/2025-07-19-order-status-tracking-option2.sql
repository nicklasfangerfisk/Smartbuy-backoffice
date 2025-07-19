-- Option 2: Comprehensive Events Table
-- Migration: Create comprehensive order events tracking system

-- First, update the order_status enum to include all new statuses
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Confirmed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Packed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Delivery';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Complete';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Returned';

-- Create the comprehensive order events table
CREATE TABLE IF NOT EXISTS order_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_uuid UUID NOT NULL REFERENCES orders(uuid) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'status_change', 'support_ticket', 'email_sent', 'payment_received', etc.
  event_data JSONB NOT NULL, -- Flexible data structure for different event types
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  title TEXT, -- Human-readable title for the event
  description TEXT -- Optional description
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_events_order_uuid ON order_events(order_uuid);
CREATE INDEX IF NOT EXISTS idx_order_events_created_at ON order_events(created_at);
CREATE INDEX IF NOT EXISTS idx_order_events_event_type ON order_events(event_type);
CREATE INDEX IF NOT EXISTS idx_order_events_event_data ON order_events USING GIN (event_data);

-- Add RLS (Row Level Security) policies
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all order events
CREATE POLICY order_events_read_policy ON order_events
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert order events
CREATE POLICY order_events_insert_policy ON order_events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update their own entries
CREATE POLICY order_events_update_policy ON order_events
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Function to automatically create events when order status changes
CREATE OR REPLACE FUNCTION create_order_status_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create event if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_events (
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
        'order_number', NEW.order_number_display
      ),
      COALESCE(NEW."Created by"::text, 'System'),
      'Status changed to ' || NEW.status::text,
      'Order status changed from ' || COALESCE(OLD.status::text, 'null') || ' to ' || NEW.status::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically track status changes
DROP TRIGGER IF EXISTS trg_order_status_event ON "Orders";
CREATE TRIGGER trg_order_status_event
  AFTER UPDATE ON "Orders"
  FOR EACH ROW
  EXECUTE FUNCTION create_order_status_event();

-- Helper function to add custom events
CREATE OR REPLACE FUNCTION add_order_event(
  p_order_uuid UUID,
  p_event_type TEXT,
  p_event_data JSONB,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_created_by TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO order_events (
    order_uuid,
    event_type,
    event_data,
    created_by,
    title,
    "description"
  ) VALUES (
    p_order_uuid,
    p_event_type,
    p_event_data,
    p_created_by,
    p_title,
    p_description
  ) RETURNING "id" INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Backfill existing orders with initial status events
INSERT INTO "order_events" (
  "order_uuid",
  "event_type",
  "event_data",
  "created_at",
  "created_by",
  "title",
  "description"
)
SELECT 
  "uuid",
  'status_change',
  jsonb_build_object(
    'old_status', null,
    'new_status', COALESCE("status", 'Draft'),
    'order_number', "order_number_display"
  ),
  "Created at",
  COALESCE("Created by"::text, 'System'),
  'Order created with status ' || COALESCE("status"::text, 'Draft'),
  'Initial status from order creation'
FROM "Orders"
WHERE NOT EXISTS (
  SELECT 1 FROM "order_events" 
  WHERE "order_uuid" = "Orders"."uuid" 
  AND "event_type" = 'status_change'
);

COMMENT ON TABLE "order_events" IS 'Comprehensive event tracking for orders including status changes, emails, support tickets, etc.';
COMMENT ON COLUMN "order_events"."order_uuid" IS 'Reference to the order';
COMMENT ON COLUMN "order_events"."event_type" IS 'Type of event (status_change, email_sent, support_ticket, etc.)';
COMMENT ON COLUMN "order_events"."event_data" IS 'Flexible JSON data structure containing event-specific information';
COMMENT ON COLUMN "order_events"."created_at" IS 'When the event occurred';
COMMENT ON COLUMN "order_events"."created_by" IS 'Who triggered the event';
COMMENT ON COLUMN "order_events"."title" IS 'Human-readable title for the event';
COMMENT ON COLUMN "order_events"."description" IS 'Optional detailed description of the event';
