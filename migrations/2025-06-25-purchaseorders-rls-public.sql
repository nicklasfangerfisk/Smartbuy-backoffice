-- Enable RLS on "PurchaseOrders" for all users (including unauthenticated)
ALTER TABLE "PurchaseOrders" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow SELECT for all users
CREATE POLICY "Allow select on PurchaseOrders for all users"
  ON "PurchaseOrders"
  FOR SELECT
  USING (true);

-- Policy: Allow INSERT for all users
CREATE POLICY "Allow insert on PurchaseOrders for all users"
  ON "PurchaseOrders"
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow UPDATE for all users
CREATE POLICY "Allow update on PurchaseOrders for all users"
  ON "PurchaseOrders"
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Allow DELETE for all users
CREATE POLICY "Allow delete on PurchaseOrders for all users"
  ON "PurchaseOrders"
  FOR DELETE
  USING (true);
