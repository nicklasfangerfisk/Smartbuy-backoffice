# Prevention of Negative Stock in Inventory System

## Overview
This document describes the approach and implementation for preventing product stock from going below zero in the Smartback inventory system. This is critical for maintaining data integrity, operational accuracy, and auditability.

## Why Prevent Negative Stock?
- **Business Logic:** Negative stock is not physically possible and usually indicates a bug, race condition, or data entry error.
- **Auditability:** Preventing negative stock ensures all inventory movements are valid and traceable.
- **Operational Safety:** Prevents overselling and operational disruptions.

## How Negative Stock is Prevented

### 1. **Stock Calculation Model**
- Inventory levels are not stored as a static field, but are calculated in real time by aggregating all `stock_movements` for each product.
- This approach is highly auditable and always reflects the true state of inventory.

### 2. **Database Enforcement**
- **All stock changes must go through a single SQL function or trigger** (e.g., `track_material_movements`).
- Before inserting an outgoing or adjustment movement, the function calculates the new stock level.
- If the new stock would be negative, the function raises an exception and blocks the transaction.

#### Example: PostgreSQL Trigger/Function
```sql
CREATE OR REPLACE FUNCTION prevent_negative_stock()
RETURNS TRIGGER AS $$
DECLARE
  new_stock integer;
BEGIN
  -- Calculate new stock after this movement
  SELECT COALESCE(SUM(
    CASE
      WHEN movement_type = 'incoming' THEN quantity
      WHEN movement_type = 'outgoing' THEN -quantity
      WHEN movement_type = 'adjustment' THEN quantity
      ELSE 0
    END
  ), 0)
  INTO new_stock
  FROM stock_movements
  WHERE product_id = NEW.product_id
  UNION ALL
  SELECT
    CASE
      WHEN NEW.movement_type = 'incoming' THEN NEW.quantity
      WHEN NEW.movement_type = 'outgoing' THEN -NEW.quantity
      WHEN NEW.movement_type = 'adjustment' THEN NEW.quantity
      ELSE 0
    END;

  IF new_stock < 0 THEN
    RAISE EXCEPTION 'Stock for product % would go below zero', NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_negative_stock
BEFORE INSERT ON stock_movements
FOR EACH ROW EXECUTE FUNCTION prevent_negative_stock();
```

### 3. **Best Practices**
- **Always enforce at the database level** (not just in the API or frontend).
- **Index** the `product_id` and `date` columns in `stock_movements` for performance.
- **Test** all stock movement endpoints for edge cases (concurrent orders, adjustments, etc).

## Summary
- Inventory is always calculated from the audit log of movements.
- Negative stock is prevented by a database trigger or function.
- This ensures operational safety, auditability, and data integrity.

---

*For more details, see the Inventory Function Specification and the implementation of the `track_material_movements` function in your migrations.*
