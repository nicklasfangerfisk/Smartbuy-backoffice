-- Robust triggers and function to keep order_items_count and order_total always up to date

-- 1. Function to update rollups
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
    )
  WHERE uuid = update_order_rollups.order_uuid;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger for INSERT
CREATE OR REPLACE FUNCTION after_orderitem_insert()
RETURNS trigger AS $$
BEGIN
  PERFORM update_order_rollups(NEW.order_uuid);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orderitem_insert_trigger ON "OrderItems";
CREATE TRIGGER orderitem_insert_trigger
AFTER INSERT ON "OrderItems"
FOR EACH ROW EXECUTE FUNCTION after_orderitem_insert();

-- 3. Trigger for UPDATE
CREATE OR REPLACE FUNCTION after_orderitem_update()
RETURNS trigger AS $$
BEGIN
  IF OLD.order_uuid IS DISTINCT FROM NEW.order_uuid THEN
    PERFORM update_order_rollups(OLD.order_uuid);
  END IF;
  PERFORM update_order_rollups(NEW.order_uuid);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orderitem_update_trigger ON "OrderItems";
CREATE TRIGGER orderitem_update_trigger
AFTER UPDATE ON "OrderItems"
FOR EACH ROW EXECUTE FUNCTION after_orderitem_update();

-- 4. Trigger for DELETE
CREATE OR REPLACE FUNCTION after_orderitem_delete()
RETURNS trigger AS $$
BEGIN
  PERFORM update_order_rollups(OLD.order_uuid);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orderitem_delete_trigger ON "OrderItems";
CREATE TRIGGER orderitem_delete_trigger
AFTER DELETE ON "OrderItems"
FOR EACH ROW EXECUTE FUNCTION after_orderitem_delete();

-- 5. (Optional) Backfill for existing Orders
-- UPDATE "Orders"
-- SET
--   order_items_count = (SELECT COUNT(*) FROM "OrderItems" WHERE order_uuid = "Orders".uuid),
--   order_total = (SELECT COALESCE(SUM(price), 0) FROM "OrderItems" WHERE order_uuid = "Orders".uuid);
