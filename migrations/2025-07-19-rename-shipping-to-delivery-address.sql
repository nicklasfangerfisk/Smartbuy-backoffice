-- Migration: Add missing delivery_method column in orders table
-- Date: 2025-07-19
-- Description: Add delivery_method column that was missing from previous migration

-- Add only the delivery_method column since delivery_address already exists
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_method TEXT;

-- Add index for delivery_method
CREATE INDEX IF NOT EXISTS idx_orders_delivery_method ON orders(delivery_method);

-- Add comment to document the column purpose
COMMENT ON COLUMN orders.delivery_method IS 'Delivery method (standard, express, pickup, etc.)';

-- Migration completed successfully
-- The orders table now has the delivery_method column
