-- Enable Row Level Security (RLS) for purchaseorderitems for all users (including unauthenticated)
ALTER TABLE purchaseorderitems ENABLE ROW LEVEL SECURITY;

-- Allow all users to select purchase order items
CREATE POLICY "Allow all users to select purchase order items" ON purchaseorderitems
  FOR SELECT
  USING (true);

-- Allow all users to insert purchase order items
CREATE POLICY "Allow all users to insert purchase order items" ON purchaseorderitems
  FOR INSERT
  WITH CHECK (true);

-- Allow all users to update purchase order items
CREATE POLICY "Allow all users to update purchase order items" ON purchaseorderitems
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow all users to delete purchase order items
CREATE POLICY "Allow all users to delete purchase order items" ON purchaseorderitems
  FOR DELETE
  USING (true);
