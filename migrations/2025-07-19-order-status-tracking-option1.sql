-- Option 1: Simple Status History Table
-- Migration: Create order status history tracking table

-- First, update the order_status enum to include all new statuses
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Confirmed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Packed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Delivery';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Complete';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Returned';

-- Create the order status history table
CREATE TABLE IF NOT EXISTS "order_status_history" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "order_uuid" UUID NOT NULL REFERENCES "Orders"("uuid") ON DELETE CASCADE,
  "status" order_status NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "created_by" TEXT,
  "notes" TEXT,
  "metadata" JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_order_status_history_order_uuid" ON "order_status_history"("order_uuid");
CREATE INDEX IF NOT EXISTS "idx_order_status_history_created_at" ON "order_status_history"("created_at");
CREATE INDEX IF NOT EXISTS "idx_order_status_history_status" ON "order_status_history"("status");

-- Add RLS (Row Level Security) policies
ALTER TABLE "order_status_history" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all order status history
CREATE POLICY "order_status_history_read_policy" ON "order_status_history"
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert order status history
CREATE POLICY "order_status_history_insert_policy" ON "order_status_history"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update their own entries
CREATE POLICY "order_status_history_update_policy" ON "order_status_history"
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

-- Create trigger to automatically track status changes
DROP TRIGGER IF EXISTS trg_order_status_history ON "Orders";
CREATE TRIGGER trg_order_status_history
  AFTER UPDATE ON "Orders"
  FOR EACH ROW
  EXECUTE FUNCTION create_order_status_history();

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

COMMENT ON TABLE "order_status_history" IS 'Tracks all status changes for orders with timestamps and optional notes';
COMMENT ON COLUMN "order_status_history"."order_uuid" IS 'Reference to the order';
COMMENT ON COLUMN "order_status_history"."status" IS 'The status the order changed to';
COMMENT ON COLUMN "order_status_history"."created_at" IS 'When the status change occurred';
COMMENT ON COLUMN "order_status_history"."created_by" IS 'Who made the status change';
COMMENT ON COLUMN "order_status_history"."notes" IS 'Optional notes about the status change';
COMMENT ON COLUMN "order_status_history"."metadata" IS 'Additional flexible data about the status change';
