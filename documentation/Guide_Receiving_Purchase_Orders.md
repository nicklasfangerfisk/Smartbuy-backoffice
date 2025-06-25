# Guide: Receiving Purchase Orders and Logging Stock Movements

## Overview
This guide describes the approach and UI/UX for receiving purchase orders in the Smartback inventory system, including how to log received quantities and create stock movement records.

## Approach

### 1. **Creating a Purchase Order**
- The user creates a new purchase order in the UI, specifying:
  - Supplier
  - List of products and quantities to order
  - Expected delivery date for each item (if applicable)
- The purchase order is saved with a status of `pending` or `ordered`.
- Each item in the purchase order is stored with its own status (e.g., `pending`, `ordered`).
- The purchase order remains in this status until goods are received.

### 2. **Receiving Purchase Orders**
- When goods arrive from a supplier, the user opens the purchase order in the UI.
- Each item in the purchase order is displayed with:
  - Product name/ID
  - Quantity ordered
  - (Editable) Quantity received (defaults to quantity ordered)
  - Expected delivery date
- The user can adjust the quantity received for each item (e.g., if some items are missing or damaged).

### 3. **Creating Stock Movements**
- When the user confirms receipt:
  - For each item, a new `stock_movements` record is created with:
    - `product_id`: The product being received
    - `movement_type`: `'incoming'`
    - `quantity`: The quantity received (as entered by the user)
    - `date`: The date of receipt
    - `reason`: (Optional, e.g., 'PO Receipt')
    - (Optionally) Reference to the purchase order/item
- This ensures:
  - Inventory is only updated when items are actually received
  - Full audit trail of all receipts
  - Partial receipts and discrepancies are handled

### 4. **UI/UX Requirements**
- The "Receive Purchase Order" dialog or page should:
  - List all items in the PO with editable "quantity received" fields
  - Default "quantity received" to "quantity ordered"
  - Allow the user to adjust received quantities
  - Provide Save/Confirm and Cancel actions
  - On Save/Confirm, create stock movement records for each item received
  - Optionally, update the PO/item status (e.g., to 'received' or 'partially received')

### 5. **Example Workflow**
1. User opens a PO and clicks "Receive".
2. Dialog opens listing all items, each with quantity ordered and editable quantity received (defaulted).
3. User reviews/adjusts quantities, then clicks "Confirm Receipt".
4. System creates `stock_movements` entries for each item received.
5. Inventory is updated in real time.

## Benefits
- Ensures inventory is only updated for actual receipts
- Handles partial deliveries and discrepancies
- Maintains a full audit trail
- Supports best practices for inventory control

---

*For implementation details, see the Inventory Function Specification and the stock_movements table design.*
