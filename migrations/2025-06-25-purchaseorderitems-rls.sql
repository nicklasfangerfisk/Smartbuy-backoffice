-- Enable Row Level Security (RLS) for purchaseorderitems
ALTER TABLE purchaseorderitems ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select purchase order items
CREATE POLICY "Allow authenticated users to select purchase order items" ON purchaseorderitems
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert purchase order items
CREATE POLICY "Allow authenticated users to insert purchase order items" ON purchaseorderitems
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update purchase order items
CREATE POLICY "Allow authenticated users to update purchase order items" ON purchaseorderitems
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete purchase order items
CREATE POLICY "Allow authenticated users to delete purchase order items" ON purchaseorderitems
  FOR DELETE
  USING (auth.role() = 'authenticated');
