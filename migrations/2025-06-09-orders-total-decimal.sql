-- Add order_total_decimal to Orders table for precise two-decimal order total
ALTER TABLE "Orders"
ADD COLUMN IF NOT EXISTS order_total_decimal numeric(12,2) DEFAULT 0.00 NOT NULL;

-- Update the rollup function to also set order_total_decimal
CREATE OR REPLACE FUNCTION update_order_rollups(order_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE "Orders"
  SET
    order_items_count = (
      SELECT COUNT(*) FROM "OrderItems" WHERE order_uuid = update_order_rollups.order_uuid
    ),
    order_total = (
      SELECT COALESCE(SUM(price), 0) FROM "OrderItems" WHERE order_uuid = update_order_rollups.order_uuid
    ),
    order_total_decimal = (
      SELECT COALESCE(ROUND(SUM(price)::numeric, 2), 0.00) FROM "OrderItems" WHERE order_uuid = update_order_rollups.order_uuid
    )
  WHERE uuid = update_order_rollups.order_uuid;
END;
$$ LANGUAGE plpgsql;

-- (Optional) Backfill for existing Orders
-- UPDATE "Orders"
-- SET
--   order_total_decimal = (SELECT COALESCE(ROUND(SUM(price)::numeric, 2), 0.00) FROM "OrderItems" WHERE order_uuid = "Orders".uuid);
