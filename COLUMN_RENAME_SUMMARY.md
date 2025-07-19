# Database Schema Fix: Add Missing Checkout Columns

## 📋 Migration Summary

**Date:** July 19, 2025  
**Purpose:** Fix missing columns in `orders` table for checkout functionality

## ❌ **Error Resolved**
- "Could not find the 'delivery_address' column of 'orders' in the schema cache"
- "Could not find the 'delivery_method' column of 'orders' in the schema cache"

## ✅ Files Created/Updated

### 1. **Migration File**
- **File:** `/migrations/2025-07-19-rename-shipping-to-delivery-address.sql`
- **Actions:**
  - Renames `orders.shipping_address` → `orders.delivery_address`
  - Adds missing columns: `delivery_method`, `checkout_data`, `checkout_completed_at`, `payment_method`, `billing_address`
  - Creates indexes for all new columns
  - Updates column comments for documentation
  - Renames GIN index: `idx_orders_shipping_address_gin` → `idx_orders_delivery_address_gin`

### 2. **Test File Updates**
- **File:** `test-checkout-persistence.js`
- **Changes:**
  - Updated SELECT statements to use `delivery_address`
  - Updated INSERT statements to use `delivery_address`
  - Maintains test functionality with new column name

## 🔧 Migration Details

```sql
-- Rename column
ALTER TABLE orders 
RENAME COLUMN shipping_address TO delivery_address;

-- Add missing checkout columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_method TEXT,
ADD COLUMN IF NOT EXISTS checkout_data JSONB,
ADD COLUMN IF NOT EXISTS checkout_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS billing_address JSONB;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_delivery_method ON orders(delivery_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_checkout_completed_at ON orders(checkout_completed_at);
CREATE INDEX IF NOT EXISTS idx_orders_checkout_data_gin ON orders USING GIN (checkout_data);
CREATE INDEX IF NOT EXISTS idx_orders_billing_address_gin ON orders USING GIN (billing_address);
```

## ✅ Columns Added

| Column | Type | Purpose |
|--------|------|---------|
| `delivery_address` | JSONB | Customer delivery address (renamed from shipping_address) |
| `delivery_method` | TEXT | Delivery method (standard, express, pickup, etc.) |
| `checkout_data` | JSONB | Complete checkout session data |
| `checkout_completed_at` | TIMESTAMPTZ | When checkout was completed |
| `payment_method` | TEXT | Payment method used |
| `billing_address` | JSONB | Customer billing address |

## ✅ Already Consistent Files

These files were already using the correct column names:
- `src/components/OrderCheckoutDialog.tsx`
- `migrations/2025-07-19-checkout-data-option-a.sql`
- `migrations/2025-07-19-checkout-data-option-b.sql`

## 🚀 Next Steps

1. **Apply Migration:**
   ```bash
   # Apply the migration to your database
   npx supabase db push
   ```

2. **Verify Changes:**
   ```sql
   -- Check all columns exist
   \d orders
   
   -- Verify indexes were created
   \di idx_orders_*
   ```

3. **Test Checkout:**
   - Test the OrderCheckoutDialog component
   - Verify checkout process completes without column errors
   - Test the OrderTimeline component

## 📝 Notes

- All checkout-related columns are now present in the orders table
- Proper indexes created for query performance
- GIN indexes for JSONB columns (addresses and checkout_data)
- B-tree indexes for frequently queried TEXT columns
- This resolves all "column not found" errors in checkout process

**Migration ready to apply - fixes all missing checkout columns!** 🎯
