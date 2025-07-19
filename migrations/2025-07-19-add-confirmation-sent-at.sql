-- Migration: Add confirmation_sent_at column to orders table
-- Date: 2025-07-19  
-- Description: Add timestamp to track when order confirmation email was sent

-- Add confirmation_sent_at column to track when confirmation email was sent
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_confirmation_sent_at ON orders(confirmation_sent_at);

-- Add comment to document the column purpose
COMMENT ON COLUMN orders.confirmation_sent_at IS 'Timestamp when order confirmation email was sent to customer';

-- Migration completed successfully
-- Added confirmation_sent_at column for tracking order confirmation email sends
