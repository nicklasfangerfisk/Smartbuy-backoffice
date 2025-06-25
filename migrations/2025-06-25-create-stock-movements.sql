-- Migration to create the stock_movements table
CREATE TABLE stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES "Products"(uuid) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('incoming', 'outgoing', 'adjustment')),
    quantity INT NOT NULL CHECK (quantity > 0),
    reason TEXT,
    date TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Enable Row-Level Security (RLS) for the stock_movements table
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow authenticated users to select from the stock_movements table
CREATE POLICY "Allow authenticated users to select stock movements" ON stock_movements
FOR SELECT
USING (auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to insert into the stock_movements table
CREATE POLICY "Allow authenticated users to insert stock movements" ON stock_movements
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to update the stock_movements table
CREATE POLICY "Allow authenticated users to update stock movements" ON stock_movements
FOR UPDATE
WITH CHECK (auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to delete from the stock_movements table
CREATE POLICY "Allow authenticated users to delete stock movements" ON stock_movements
FOR DELETE
USING (auth.role() = 'authenticated');
