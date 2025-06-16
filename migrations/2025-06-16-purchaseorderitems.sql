-- Migration: Create PurchaseOrderItems table for purchase order line items

CREATE TABLE IF NOT EXISTS "PurchaseOrderItems" (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id uuid REFERENCES "PurchaseOrders"(id) ON DELETE CASCADE,
    product_id uuid REFERENCES "Products"(uuid) ON DELETE SET NULL,
    quantity integer NOT NULL DEFAULT 1,
    unit_price numeric(12,2) NOT NULL DEFAULT 0.00,
    total_price numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order_id ON "PurchaseOrderItems"(purchase_order_id);
