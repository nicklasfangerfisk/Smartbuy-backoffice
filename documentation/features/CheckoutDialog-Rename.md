# Renaming CheckoutDialog to ActionDialogOrderCheckout

## Summary of Changes

This rename aligns with the naming convention used for other action dialogs in the project (like `ActionDialogPurchaseOrderOrder`).

## Files Modified

### 1. **Renamed File**
- `src/Dialog/CheckoutDialog.tsx` → `src/Dialog/ActionDialogOrderCheckout.tsx`

### 2. **Component & Interface Renaming**
- Component: `CheckoutDialog` → `ActionDialogOrderCheckout`
- Props Interface: `CheckoutDialogProps` → `ActionDialogOrderCheckoutProps`

### 3. **Import Updates**
- **PageOrders.tsx**: Updated import and component usage
- **SubDialogOrderCheckoutReview.tsx**: Updated type imports
- **SubDialogOrderCheckoutPayment.tsx**: Updated type imports
- **tests/checkout.test.tsx**: Updated imports, component usage, and test descriptions

## Files That Reference the Component

### Import References Updated:
```typescript
// Before
import CheckoutDialog from '../Dialog/CheckoutDialog';

// After  
import ActionDialogOrderCheckout from '../Dialog/ActionDialogOrderCheckout';
```

### Type Import References Updated:
```typescript
// Before
import type { CustomerInfo, PaymentInfo, OrderItem } from '../CheckoutDialog';

// After
import type { CustomerInfo, PaymentInfo, OrderItem } from '../ActionDialogOrderCheckout';
```

### Component Usage Updated:
```jsx
// Before
<CheckoutDialog open={...} onClose={...} />

// After
<ActionDialogOrderCheckout open={...} onClose={...} />
```

## State Variables Unchanged

The following state variables in `PageOrders.tsx` were intentionally **not** changed as they refer to the dialog's open/closed state, not the component name:
- `checkoutDialogOpen`
- `setCheckoutDialogOpen()`

## Verification

- ✅ TypeScript compilation successful (no new errors introduced)
- ✅ Development server running without issues
- ✅ All imports and references updated
- ✅ Test file updated with new component name
- ✅ HMR (Hot Module Replacement) working correctly

## Notes

The renaming maintains all existing functionality while following the project's naming convention for action dialog components. The dialog continues to handle the checkout process for orders with the same three-step flow:
1. Customer Information
2. Delivery Options  
3. Payment Method
