-- Migration: Change discount to percentage (0-100) and update price calculation

-- 1. Alter discount column to numeric (if not already)
ALTER TABLE "OrderItems" ALTER COLUMN discount TYPE numeric USING discount::numeric;

-- 2. Update triggers/functions to calculate price as (quantity * unitprice) minus percentage discount
DROP TRIGGER IF EXISTS orderitems_after_write_trigger ON "OrderItems";
DROP FUNCTION IF EXISTS orderitems_after_write();

CREATE OR REPLACE FUNCTION orderitems_after_write()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate price for this row using percentage discount
  IF NEW.discount IS NOT NULL THEN
    NEW.price := COALESCE(NEW.quantity, 1) * COALESCE(NEW.unitprice, 0) * (1 - (NEW.discount / 100));
  ELSE
    NEW.price := COALESCE(NEW.quantity, 1) * COALESCE(NEW.unitprice, 0);
  END IF;
  -- Update order rollups
  PERFORM update_order_rollups(NEW.order_uuid);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orderitems_after_write_trigger
BEFORE INSERT OR UPDATE ON "OrderItems"
FOR EACH ROW EXECUTE FUNCTION orderitems_after_write();

-- 3. Backfill price for existing rows
UPDATE "OrderItems"
SET price = COALESCE(quantity, 1) * COALESCE(unitprice, 0) * (1 - (COALESCE(discount, 0) / 100));
