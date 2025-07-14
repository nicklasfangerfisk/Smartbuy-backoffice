# ActionDialogPurchaseOrderOrder Component

## Overview
This component replaces the simple "Order" button functionality with a comprehensive dialog that displays supplier information and email options before submitting a purchase order.

## Features
- **Supplier Information Display**: Shows company name, contact person, email, and phone number (read-only)
- **Warning Alert**: Informs user that the order will be submitted via email to the supplier
- **Email Options**: 
  - "CC Me" checkbox to include user's email in CC
  - Additional CC field for multiple recipients (comma-separated)
- **Order Details**: Displays order number, date, and total
- **Smart Validation**: Submit button is disabled if supplier has no email address

## Integration
The component is integrated into `PagePurchaseOrders.tsx` and replaces the previous direct status update for pending orders.

### Usage Flow
1. User clicks "Order" button on a pending purchase order
2. `ActionDialogPurchaseOrderOrder` opens with supplier and order information
3. User can optionally add themselves to CC and additional recipients
4. User clicks "Submit Order" to update status to "Ordered"
5. Dialog closes and purchase orders list refreshes

## Files Modified
- `/src/Dialog/ActionDialogPurchaseOrderOrder.tsx` (new component)
- `/src/Page/PagePurchaseOrders.tsx` (integration)

## Testing
To test the new functionality:
1. Navigate to Purchase Orders page
2. Create a purchase order with "Pending" status
3. Click the "Order" button - new dialog should open
4. Verify supplier information is displayed
5. Test CC options and form validation
6. Submit order and verify status changes to "Ordered"

## Future Enhancements
- Email sending integration (currently logged to console)
- Email template customization
- Order attachment generation (PDF)
- Delivery confirmation tracking
