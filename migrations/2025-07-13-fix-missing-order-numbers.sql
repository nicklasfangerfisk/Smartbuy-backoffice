-- Fix missing order numbers for existing purchase orders
-- This script generates order numbers for orders that don't have one

UPDATE "PurchaseOrders" 
SET order_number = 'PO-' || to_char(order_date, 'YYYYMMDD') || '-' || LPAD((ROW_NUMBER() OVER (ORDER BY created_at))::text, 4, '0')
WHERE order_number IS NULL OR order_number = '';

-- Alternatively, if you prefer a simpler approach:
-- UPDATE "PurchaseOrders" 
-- SET order_number = 'PO-' || id
-- WHERE order_number IS NULL OR order_number = '';
