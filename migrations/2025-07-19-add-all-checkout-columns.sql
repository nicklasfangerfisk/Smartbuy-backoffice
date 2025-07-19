-- Migration: Add ALL missing checkout columns in orders table
-- Date: 2025-07-19  
-- Description: Add all checkout-related columns that might be missing (safe with IF NOT EXISTS)

-- Add ALL potentially missing checkout-related columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_method TEXT,
ADD COLUMN IF NOT EXISTS checkout_data JSONB,
ADD COLUMN IF NOT EXISTS checkout_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS billing_address JSONB;

-- Add indexes for better query performance (safe with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_orders_delivery_method ON orders(delivery_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_checkout_completed_at ON orders(checkout_completed_at);
CREATE INDEX IF NOT EXISTS idx_orders_checkout_data_gin ON orders USING GIN (checkout_data);
CREATE INDEX IF NOT EXISTS idx_orders_billing_address_gin ON orders USING GIN (billing_address);

-- Add comments to document the column purposes
COMMENT ON COLUMN orders.delivery_method IS 'Delivery method (standard, express, pickup, etc.)';
COMMENT ON COLUMN orders.checkout_data IS 'Complete checkout session data including customer info, payment details, and form state';
COMMENT ON COLUMN orders.checkout_completed_at IS 'Timestamp when checkout process was completed and order status changed to Paid';
COMMENT ON COLUMN orders.payment_method IS 'Payment method used (credit_card, paypal, bank_transfer, etc.)';
COMMENT ON COLUMN orders.billing_address IS 'Customer billing address for payment processing';

-- Migration completed successfully
-- Added any missing checkout columns (delivery_method, checkout_data, checkout_completed_at, payment_method, billing_address)
