-- Add a 6-digit, SO-prefixed, auto-incrementing order number to Orders
-- 1. Add a new column for the order number
ALTER TABLE "Orders"
ADD COLUMN IF NOT EXISTS order_number integer GENERATED ALWAYS AS IDENTITY (START WITH 100000 INCREMENT BY 1) UNIQUE;

-- 2. Add a generated text column for the display order id (e.g. SO-100000)
ALTER TABLE "Orders"
ADD COLUMN IF NOT EXISTS order_number_display text GENERATED ALWAYS AS ('SO-' || lpad(order_number::text, 6, '0')) STORED;

-- 3. (Optional) Backfill for existing rows if needed (should not be needed for identity columns)
-- UPDATE "Orders" SET order_number = nextval(pg_get_serial_sequence('"Orders"', 'order_number')) WHERE order_number IS NULL;
