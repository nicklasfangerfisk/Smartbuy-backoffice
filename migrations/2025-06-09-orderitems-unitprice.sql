-- Migration: Rename price to unitprice, add price (calculated), and update triggers/functions

-- 1. Rename price to unitprice
ALTER TABLE "OrderItems" RENAME COLUMN price TO unitprice;

-- 2. Add price column (numeric, not null, default 0)
ALTER TABLE "OrderItems" ADD COLUMN price numeric NOT NULL DEFAULT 0;

-- 3. Update triggers/functions to calculate price as (quantity * unitprice - COALESCE(Discount, 0))
DROP TRIGGER IF EXISTS orderitems_after_write_trigger ON "OrderItems";
DROP FUNCTION IF EXISTS orderitems_after_write();

CREATE OR REPLACE FUNCTION orderitems_after_write()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate price for this row
  NEW.price := COALESCE(NEW.quantity, 1) * COALESCE(NEW.unitprice, 0) - COALESCE(NEW.Discount, 0);
  -- Update order rollups
  PERFORM update_order_rollups(NEW.order_uuid);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orderitems_after_write_trigger
BEFORE INSERT OR UPDATE ON "OrderItems"
FOR EACH ROW EXECUTE FUNCTION orderitems_after_write();

-- 4. Backfill price for existing rows
UPDATE "OrderItems"
SET price = COALESCE(quantity, 1) * COALESCE(unitprice, 0) - COALESCE(Discount, 0);
