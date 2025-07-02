-- Minimal improvement: Add enum for adjustment direction to make parsing more reliable
-- This keeps the current structure but makes it more robust

-- 1. Create enum for adjustment directions
CREATE TYPE adjustment_direction AS ENUM ('increase', 'decrease');

-- 2. Add direction column to existing table
ALTER TABLE stock_movements 
ADD COLUMN adjustment_direction adjustment_direction NULL;

-- 3. Add constraint that adjustment_direction must be set for adjustment type
ALTER TABLE stock_movements 
ADD CONSTRAINT adjustment_direction_required 
CHECK (
    (movement_type != 'adjustment') OR 
    (movement_type = 'adjustment' AND adjustment_direction IS NOT NULL)
);

-- 4. Create function to calculate stock safely
CREATE OR REPLACE FUNCTION calculate_current_stock(p_product_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_stock INTEGER;
BEGIN
    SELECT COALESCE(SUM(
        CASE 
            WHEN movement_type = 'incoming' THEN quantity
            WHEN movement_type = 'outgoing' THEN -quantity
            WHEN movement_type = 'adjustment' AND adjustment_direction = 'increase' THEN quantity
            WHEN movement_type = 'adjustment' AND adjustment_direction = 'decrease' THEN -quantity
            ELSE 0
        END
    ), 0) INTO total_stock
    FROM stock_movements 
    WHERE product_id = p_product_id;
    
    RETURN total_stock;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to prevent negative stock
CREATE OR REPLACE FUNCTION check_stock_not_negative_v2()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- Calculate what stock would be after this movement
    current_stock := calculate_current_stock(NEW.product_id);
    
    -- Prevent negative stock
    IF current_stock < 0 THEN
        RAISE EXCEPTION 'Stock cannot go negative. Current stock would be: %', current_stock;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_negative_stock_v2
    AFTER INSERT OR UPDATE ON stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION check_stock_not_negative_v2();

COMMENT ON COLUMN stock_movements.adjustment_direction 
IS 'Required for adjustment type movements to indicate increase or decrease';

COMMENT ON FUNCTION calculate_current_stock(UUID) 
IS 'Safely calculates current stock for a product using proper direction logic';
