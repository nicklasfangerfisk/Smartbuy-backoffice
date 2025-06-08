-- Migration to fix trigger and function for OrderItems UUID schema
-- Update orderitems_after_write and update_order_rollups to use order_uuid instead of OrderID

-- Drop all triggers that depend on orderitems_after_write
DROP TRIGGER IF EXISTS orderitems_after_insert ON "OrderItems";
DROP TRIGGER IF EXISTS orderitems_after_update ON "OrderItems";
DROP TRIGGER IF EXISTS orderitems_after_delete ON "OrderItems";
DROP TRIGGER IF EXISTS orderitems_after_write_trigger ON "OrderItems";
DROP FUNCTION IF EXISTS orderitems_after_write();

-- Recreate the function with the correct column name
CREATE OR REPLACE FUNCTION orderitems_after_write()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_order_rollups(NEW.order_uuid);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the unified trigger
CREATE TRIGGER orderitems_after_write_trigger
AFTER INSERT OR UPDATE OR DELETE ON "OrderItems"
FOR EACH ROW EXECUTE FUNCTION orderitems_after_write();

-- Drop the old update_order_rollups function before recreating it with new parameter name
DROP FUNCTION IF EXISTS update_order_rollups(uuid);

-- Update update_order_rollups to accept order_uuid and use new column names
CREATE OR REPLACE FUNCTION update_order_rollups(order_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE "Orders"
    SET
      order_items_count = (SELECT COUNT(*) FROM "OrderItems" WHERE "OrderItems".order_uuid = update_order_rollups.order_uuid),
      order_total = (SELECT COALESCE(SUM(price * COALESCE(quantity, 1)), 0) FROM "OrderItems" WHERE "OrderItems".order_uuid = update_order_rollups.order_uuid)
    WHERE uuid = update_order_rollups.order_uuid;
END;
$$ LANGUAGE plpgsql;
