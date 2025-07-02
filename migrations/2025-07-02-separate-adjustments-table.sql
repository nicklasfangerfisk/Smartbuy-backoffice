-- Alternative: Create separate table for adjustments with clear direction
-- This keeps the existing stock_movements table unchanged

CREATE TABLE stock_adjustments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES "Products"(uuid) ON DELETE CASCADE,
    adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('increase', 'decrease')),
    quantity INT NOT NULL CHECK (quantity > 0), -- Always positive, direction is in type
    reason TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    date TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Allow authenticated users to select adjustments" ON stock_adjustments
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert adjustments" ON stock_adjustments  
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to prevent negative stock from adjustments
CREATE OR REPLACE FUNCTION check_adjustment_not_negative()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
    adjustment_effect INTEGER;
BEGIN
    -- Calculate current stock from movements
    SELECT COALESCE(SUM(
        CASE 
            WHEN movement_type = 'incoming' THEN quantity
            WHEN movement_type = 'outgoing' THEN -quantity  
            ELSE 0
        END
    ), 0) INTO current_stock
    FROM stock_movements 
    WHERE product_id = NEW.product_id;
    
    -- Add existing adjustments
    SELECT current_stock + COALESCE(SUM(
        CASE 
            WHEN adjustment_type = 'increase' THEN quantity
            WHEN adjustment_type = 'decrease' THEN -quantity
            ELSE 0
        END
    ), 0) INTO current_stock
    FROM stock_adjustments 
    WHERE product_id = NEW.product_id;
    
    -- Calculate effect of this adjustment
    adjustment_effect := CASE 
        WHEN NEW.adjustment_type = 'increase' THEN NEW.quantity
        WHEN NEW.adjustment_type = 'decrease' THEN -NEW.quantity
        ELSE 0
    END;
    
    -- Prevent negative stock
    IF (current_stock + adjustment_effect) < 0 THEN
        RAISE EXCEPTION 'Adjustment would result in negative stock. Current: %, Adjustment: %, Result: %', 
            current_stock, adjustment_effect, (current_stock + adjustment_effect);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent negative stock
CREATE TRIGGER prevent_negative_stock_adjustments
    BEFORE INSERT OR UPDATE ON stock_adjustments
    FOR EACH ROW
    EXECUTE FUNCTION check_adjustment_not_negative();

-- View to combine movements and adjustments for easy querying
CREATE VIEW stock_movements_with_adjustments AS
SELECT 
    'movement'::text as source_type,
    id::text,
    product_id,
    movement_type as type,
    CASE 
        WHEN movement_type = 'incoming' THEN quantity
        WHEN movement_type = 'outgoing' THEN -quantity
        ELSE 0
    END as net_quantity,
    reason,
    date
FROM stock_movements
UNION ALL
SELECT 
    'adjustment'::text as source_type,
    id::text,
    product_id,
    adjustment_type as type,
    CASE 
        WHEN adjustment_type = 'increase' THEN quantity
        WHEN adjustment_type = 'decrease' THEN -quantity
        ELSE 0
    END as net_quantity,
    reason,
    date
FROM stock_adjustments
ORDER BY date DESC;

COMMENT ON TABLE stock_adjustments IS 'Manual stock adjustments with clear increase/decrease direction';
COMMENT ON VIEW stock_movements_with_adjustments IS 'Unified view of all stock changes including movements and adjustments';
