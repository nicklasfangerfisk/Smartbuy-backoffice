-- Migration: Auto-generate sequential order_number for PurchaseOrders as PO-1000, PO-1001, ...

-- 1. Create a sequence for purchase order numbers starting at 1000
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'purchase_order_number_seq') THEN
        CREATE SEQUENCE purchase_order_number_seq START 1000;
    END IF;
END$$;

-- 2. Create a trigger function to set order_number
CREATE OR REPLACE FUNCTION set_purchase_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := 'PO-' || LPAD(nextval('purchase_order_number_seq')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach the trigger to the PurchaseOrders table
DROP TRIGGER IF EXISTS trg_set_purchase_order_number ON "PurchaseOrders";
CREATE TRIGGER trg_set_purchase_order_number
BEFORE INSERT ON "PurchaseOrders"
FOR EACH ROW EXECUTE FUNCTION set_purchase_order_number();
