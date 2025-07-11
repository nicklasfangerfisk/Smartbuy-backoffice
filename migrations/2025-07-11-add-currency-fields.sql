-- Add currency and exchange rate fields to tables with price columns
-- This migration extends price persistence to support multi-currency with exchange rates

-- 1. Products table - Add currency fields for SalesPrice and CostPrice
ALTER TABLE "Products" 
ADD COLUMN IF NOT EXISTS salesprice_currency VARCHAR(3) DEFAULT 'DKK' NOT NULL,
ADD COLUMN IF NOT EXISTS salesprice_exchrate NUMERIC(10,6) DEFAULT 1.000000 NOT NULL,
ADD COLUMN IF NOT EXISTS costprice_currency VARCHAR(3) DEFAULT 'DKK' NOT NULL,
ADD COLUMN IF NOT EXISTS costprice_exchrate NUMERIC(10,6) DEFAULT 1.000000 NOT NULL;

-- 2. Orders table - Add currency fields for order_total
ALTER TABLE "Orders" 
ADD COLUMN IF NOT EXISTS order_total_currency VARCHAR(3) DEFAULT 'DKK' NOT NULL,
ADD COLUMN IF NOT EXISTS order_total_exchrate NUMERIC(10,6) DEFAULT 1.000000 NOT NULL;

-- 3. OrderItems table - Add currency fields for unitprice and price
ALTER TABLE "OrderItems" 
ADD COLUMN IF NOT EXISTS unitprice_currency VARCHAR(3) DEFAULT 'DKK' NOT NULL,
ADD COLUMN IF NOT EXISTS unitprice_exchrate NUMERIC(10,6) DEFAULT 1.000000 NOT NULL,
ADD COLUMN IF NOT EXISTS price_currency VARCHAR(3) DEFAULT 'DKK' NOT NULL,
ADD COLUMN IF NOT EXISTS price_exchrate NUMERIC(10,6) DEFAULT 1.000000 NOT NULL;

-- 4. PurchaseOrderItems table - Add currency fields for unit_price
ALTER TABLE "purchaseorderitems" 
ADD COLUMN IF NOT EXISTS unit_price_currency VARCHAR(3) DEFAULT 'DKK' NOT NULL,
ADD COLUMN IF NOT EXISTS unit_price_exchrate NUMERIC(10,6) DEFAULT 1.000000 NOT NULL;

-- 5. Create indexes for better query performance on currency fields
CREATE INDEX IF NOT EXISTS idx_products_salesprice_currency ON "Products"(salesprice_currency);
CREATE INDEX IF NOT EXISTS idx_products_costprice_currency ON "Products"(costprice_currency);
CREATE INDEX IF NOT EXISTS idx_orders_currency ON "Orders"(order_total_currency);
CREATE INDEX IF NOT EXISTS idx_orderitems_unitprice_currency ON "OrderItems"(unitprice_currency);
CREATE INDEX IF NOT EXISTS idx_orderitems_price_currency ON "OrderItems"(price_currency);
CREATE INDEX IF NOT EXISTS idx_purchaseorderitems_currency ON "purchaseorderitems" (unit_price_currency);

-- 6. Add comments for documentation
COMMENT ON COLUMN "Products".salesprice_currency IS 'Currency code for sales price (ISO 4217, e.g., DKK, USD, EUR)';
COMMENT ON COLUMN "Products".salesprice_exchrate IS 'Exchange rate from base currency (DKK) to sales price currency';
COMMENT ON COLUMN "Products".costprice_currency IS 'Currency code for cost price (ISO 4217, e.g., DKK, USD, EUR)';
COMMENT ON COLUMN "Products".costprice_exchrate IS 'Exchange rate from base currency (DKK) to cost price currency';

COMMENT ON COLUMN "Orders".order_total_currency IS 'Currency code for order total (ISO 4217, e.g., DKK, USD, EUR)';
COMMENT ON COLUMN "Orders".order_total_exchrate IS 'Exchange rate from base currency (DKK) to order total currency';

COMMENT ON COLUMN "OrderItems".unitprice_currency IS 'Currency code for unit price (ISO 4217, e.g., DKK, USD, EUR)';
COMMENT ON COLUMN "OrderItems".unitprice_exchrate IS 'Exchange rate from base currency (DKK) to unit price currency';
COMMENT ON COLUMN "OrderItems".price_currency IS 'Currency code for total price (ISO 4217, e.g., DKK, USD, EUR)';
COMMENT ON COLUMN "OrderItems".price_exchrate IS 'Exchange rate from base currency (DKK) to total price currency';

COMMENT ON COLUMN "purchaseorderitems".unit_price_currency IS 'Currency code for unit price (ISO 4217, e.g., DKK, USD, EUR)';
COMMENT ON COLUMN "purchaseorderitems".unit_price_exchrate IS 'Exchange rate from base currency (DKK) to unit price currency';
