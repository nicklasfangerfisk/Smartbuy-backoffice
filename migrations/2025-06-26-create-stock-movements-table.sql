-- Migration to create the stock_movements table
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id),
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('incoming', 'outgoing')),
    quantity INT NOT NULL CHECK (quantity > 0),
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    reason TEXT,
    purchase_order_id INT REFERENCES purchase_orders(id)
);

-- Index for faster lookups by product_id
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);

-- Index for faster lookups by purchase_order_id
CREATE INDEX idx_stock_movements_purchase_order_id ON stock_movements(purchase_order_id);
