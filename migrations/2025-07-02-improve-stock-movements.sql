-- Migration: Improve stock movements to handle signed quantities
-- This allows for cleaner stock calculations without text parsing

-- 1. Remove the quantity > 0 constraint to allow negative adjustments
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_quantity_check;

-- 2. Add new constraint that allows negative quantities only for adjustments
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_quantity_check 
CHECK (
    (movement_type IN ('incoming', 'outgoing') AND quantity > 0) OR
    (movement_type = 'adjustment' AND quantity != 0)
);

-- 3. Add a check constraint to prevent negative stock levels
-- This requires a function to calculate current stock
CREATE OR REPLACE FUNCTION check_stock_not_negative()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- Calculate current stock after this movement
    SELECT COALESCE(SUM(
        CASE 
            WHEN movement_type = 'incoming' THEN quantity
            WHEN movement_type = 'outgoing' THEN -quantity  
            WHEN movement_type = 'adjustment' THEN quantity
            ELSE 0
        END
    ), 0) INTO current_stock
    FROM stock_movements 
    WHERE product_id = NEW.product_id;
    
    -- Prevent negative stock
    IF current_stock < 0 THEN
        RAISE EXCEPTION 'Stock cannot go negative. Current stock would be: %', current_stock;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to enforce non-negative stock
CREATE TRIGGER prevent_negative_stock
    AFTER INSERT OR UPDATE ON stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION check_stock_not_negative();

COMMENT ON CONSTRAINT stock_movements_quantity_check ON stock_movements 
IS 'Incoming/outgoing must be positive, adjustments can be positive or negative but not zero';

COMMENT ON FUNCTION check_stock_not_negative() 
IS 'Prevents stock levels from going below zero by calculating total stock after movement';
