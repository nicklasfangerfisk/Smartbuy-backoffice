-- Option 3: Hybrid Approach - Separate Status History and General Events
-- Migration: Create both status history and general events tables

-- First, update the order_status enum to include all new statuses
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Confirmed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Packed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Delivery';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Complete';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Returned';

-- 1. Create the order status history table (focused on status changes)
CREATE TABLE IF NOT EXISTS "order_status_history" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "order_uuid" UUID NOT NULL REFERENCES "Orders"("uuid") ON DELETE CASCADE,
  "status" order_status NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "created_by" TEXT,
  "notes" TEXT,
  "metadata" JSONB
);

-- 2. Create the general order events table (for other events)
CREATE TABLE IF NOT EXISTS "order_events" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "order_uuid" UUID NOT NULL REFERENCES "Orders"("uuid") ON DELETE CASCADE,
  "event_type" TEXT NOT NULL, -- 'email_sent', 'support_ticket', 'payment_received', 'refund_processed', etc.
  "event_data" JSONB NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "created_by" TEXT,
  "title" TEXT,
  "description" TEXT
);

-- Create indexes for status history
CREATE INDEX IF NOT EXISTS "idx_order_status_history_order_uuid" ON "order_status_history"("order_uuid");
CREATE INDEX IF NOT EXISTS "idx_order_status_history_created_at" ON "order_status_history"("created_at");
CREATE INDEX IF NOT EXISTS "idx_order_status_history_status" ON "order_status_history"("status");

-- Create indexes for events
CREATE INDEX IF NOT EXISTS "idx_order_events_order_uuid" ON "order_events"("order_uuid");
CREATE INDEX IF NOT EXISTS "idx_order_events_created_at" ON "order_events"("created_at");
CREATE INDEX IF NOT EXISTS "idx_order_events_event_type" ON "order_events"("event_type");
CREATE INDEX IF NOT EXISTS "idx_order_events_event_data" ON "order_events" USING GIN ("event_data");

-- Add RLS for status history
ALTER TABLE "order_status_history" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_status_history_read_policy" ON "order_status_history"
  FOR SELECT USING (true);

CREATE POLICY "order_status_history_insert_policy" ON "order_status_history"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "order_status_history_update_policy" ON "order_status_history"
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Add RLS for events
ALTER TABLE "order_events" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_events_read_policy" ON "order_events"
  FOR SELECT USING (true);

CREATE POLICY "order_events_insert_policy" ON "order_events"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "order_events_update_policy" ON "order_events"
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Function to automatically create status history when order status changes
CREATE OR REPLACE FUNCTION create_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create history if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO "order_status_history" (
      "order_uuid",
      "status",
      "created_by",
      "notes"
    ) VALUES (
      NEW.uuid,
      NEW.status,
      COALESCE(NEW."Created by", 'System'),
      'Status changed from ' || COALESCE(OLD.status::text, 'null') || ' to ' || NEW.status::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status history
DROP TRIGGER IF EXISTS trg_order_status_history ON "Orders";
CREATE TRIGGER trg_order_status_history
  AFTER UPDATE ON "Orders"
  FOR EACH ROW
  EXECUTE FUNCTION create_order_status_history();

-- Helper function to add general events
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
  INSERT INTO "order_events" (
    "order_uuid",
    "event_type",
    "event_data",
    "created_by",
    "title",
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

-- Helper function to add status change manually (if needed)
CREATE OR REPLACE FUNCTION add_order_status_change(
  p_order_uuid UUID,
  p_status order_status,
  p_notes TEXT DEFAULT NULL,
  p_created_by TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  status_id UUID;
BEGIN
  INSERT INTO "order_status_history" (
    "order_uuid",
    "status",
    "created_by",
    "notes"
  ) VALUES (
    p_order_uuid,
    p_status,
    p_created_by,
    p_notes
  ) RETURNING "id" INTO status_id;
  
  RETURN status_id;
END;
$$ LANGUAGE plpgsql;

-- Backfill existing orders with initial status history
INSERT INTO "order_status_history" (
  "order_uuid",
  "status",
  "created_at",
  "created_by",
  "notes"
)
SELECT 
  "uuid",
  COALESCE("status", 'Draft'),
  "Created at",
  COALESCE("Created by", 'System'),
  'Initial status from order creation'
FROM "Orders"
WHERE NOT EXISTS (
  SELECT 1 FROM "order_status_history" 
  WHERE "order_uuid" = "Orders"."uuid"
);

COMMENT ON TABLE "order_status_history" IS 'Tracks order status changes with timestamps and notes';
COMMENT ON TABLE "order_events" IS 'Tracks general order events like emails, support tickets, payments, etc.';

COMMENT ON COLUMN "order_status_history"."order_uuid" IS 'Reference to the order';
COMMENT ON COLUMN "order_status_history"."status" IS 'The status the order changed to';
COMMENT ON COLUMN "order_status_history"."created_at" IS 'When the status change occurred';
COMMENT ON COLUMN "order_status_history"."created_by" IS 'Who made the status change';

COMMENT ON COLUMN "order_events"."order_uuid" IS 'Reference to the order';
COMMENT ON COLUMN "order_events"."event_type" IS 'Type of event (email_sent, support_ticket, etc.)';
COMMENT ON COLUMN "order_events"."event_data" IS 'Event-specific data in JSON format';
COMMENT ON COLUMN "order_events"."title" IS 'Human-readable title for the event';
