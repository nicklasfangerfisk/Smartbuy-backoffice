-- Add discount column to Orders table for order-level discount (integer, percent)
ALTER TABLE "Orders"
ADD COLUMN IF NOT EXISTS discount integer DEFAULT 0 NOT NULL;

-- Optionally, add a comment for clarity
COMMENT ON COLUMN "Orders".discount IS 'Order-level discount percentage (integer, 0-100)';
