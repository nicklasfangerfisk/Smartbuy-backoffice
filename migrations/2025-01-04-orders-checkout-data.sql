-- Add checkout data persistence to orders table
-- This stores complete checkout session data for order tracking and customer service

-- Add checkout data columns to orders table
ALTER TABLE orders 
ADD COLUMN checkout_data JSONB,
ADD COLUMN checkout_completed_at TIMESTAMPTZ,
ADD COLUMN payment_method VARCHAR(50),
ADD COLUMN billing_address JSONB,
ADD COLUMN shipping_address JSONB,
ADD COLUMN order_notes TEXT;

-- Add indexes for common queries
CREATE INDEX idx_orders_checkout_completed_at ON orders (checkout_completed_at);
CREATE INDEX idx_orders_payment_method ON orders (payment_method);

-- Add GIN index for JSONB fields for fast queries
CREATE INDEX idx_orders_checkout_data_gin ON orders USING GIN (checkout_data);
CREATE INDEX idx_orders_billing_address_gin ON orders USING GIN (billing_address);
CREATE INDEX idx_orders_shipping_address_gin ON orders USING GIN (shipping_address);

-- Add comments for documentation
COMMENT ON COLUMN orders.checkout_data IS 'Complete checkout session data including customer info, payment details, and form state';
COMMENT ON COLUMN orders.checkout_completed_at IS 'Timestamp when checkout process was completed and order status changed to Paid';
COMMENT ON COLUMN orders.payment_method IS 'Payment method used (credit_card, paypal, bank_transfer, etc.)';
COMMENT ON COLUMN orders.billing_address IS 'Billing address JSON object with name, address, city, state, zip, country';
COMMENT ON COLUMN orders.shipping_address IS 'Shipping address JSON object with name, address, city, state, zip, country';
COMMENT ON COLUMN orders.order_notes IS 'Customer notes or special instructions for the order';

-- Update the update_orders_timestamp trigger to handle new columns
-- (The trigger already exists and will automatically handle the new columns)
