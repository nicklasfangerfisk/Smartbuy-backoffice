-- Function to track material movements for purchase orders, products, and orders
CREATE OR REPLACE FUNCTION track_material_movements(
    movement_type TEXT, -- 'incoming', 'outgoing', or 'adjustment'
    product_id UUID,
    quantity INT,
    reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Insert a record into the stock_movements table
    INSERT INTO stock_movements (product_id, movement_type, quantity, reason, date)
    VALUES (product_id, movement_type, quantity, reason, NOW());

    -- Update the inventory levels based on the movement type
    IF movement_type = 'incoming' THEN
        UPDATE products
        SET current_stock = current_stock + quantity
        WHERE uuid = product_id;
    ELSIF movement_type = 'outgoing' THEN
        UPDATE products
        SET current_stock = current_stock - quantity
        WHERE uuid = product_id;
    ELSIF movement_type = 'adjustment' THEN
        -- Adjustments are handled manually, no automatic stock update
        NULL;
    ELSE
        RAISE EXCEPTION 'Invalid movement type: %', movement_type;
    END IF;
END;
$$ LANGUAGE plpgsql;
