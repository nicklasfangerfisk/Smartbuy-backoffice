-- Migration: Add min_stock, max_stock, and reorder_amount to Products table
ALTER TABLE "Products"
ADD COLUMN IF NOT EXISTS min_stock integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_stock integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_amount integer DEFAULT 0;

-- Optionally, add comments for documentation
COMMENT ON COLUMN "Products".min_stock IS 'Minimum stock threshold for the product';
COMMENT ON COLUMN "Products".max_stock IS 'Maximum stock threshold for the product';
COMMENT ON COLUMN "Products".reorder_amount IS 'Preferred reorder quantity for the product';
