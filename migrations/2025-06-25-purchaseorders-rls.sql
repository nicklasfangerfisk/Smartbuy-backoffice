-- Enable RLS on "PurchaseOrders"
ALTER TABLE "PurchaseOrders" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow SELECT for authenticated users
CREATE POLICY "Allow select on PurchaseOrders for authenticated users"
  ON "PurchaseOrders"
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Allow INSERT for authenticated users
CREATE POLICY "Allow insert on PurchaseOrders for authenticated users"
  ON "PurchaseOrders"
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow UPDATE for authenticated users
CREATE POLICY "Allow update on PurchaseOrders for authenticated users"
  ON "PurchaseOrders"
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow DELETE for authenticated users
CREATE POLICY "Allow delete on PurchaseOrders for authenticated users"
  ON "PurchaseOrders"
  FOR DELETE
  USING (auth.role() = 'authenticated');
