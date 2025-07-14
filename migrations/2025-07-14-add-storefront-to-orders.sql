-- Add storefront_id to Orders table to link orders to specific storefronts
ALTER TABLE "Orders"
ADD COLUMN IF NOT EXISTS storefront_id UUID REFERENCES storefronts(id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_storefront_id ON "Orders"(storefront_id);

-- Comment for documentation
COMMENT ON COLUMN "Orders".storefront_id IS 'Reference to the storefront where this order was placed';
