# Currency Implementation - Danish Kroner (DKK)

This document outlines the implementation of Danish kroner (DKK) as the primary currency throughout the Smartback application.

## Overview

The application has been updated to use Danish kroner (DKK) instead of US dollars (USD) for all currency-related functionality. This includes display formatting, calculations, and data handling.

## Implementation Details

### 1. Centralized Currency Utilities

A new utility file has been created at `src/utils/currencyUtils.ts` that provides:

- **`formatCurrency(amount)`**: Formats numbers using Danish locale and DKK currency
- **`formatCurrencyWithSymbol(amount, symbolAfter)`**: Formats with customizable symbol position
- **`parseCurrency(currencyString)`**: Parses currency strings back to numbers
- **`getCurrencySymbol()`**: Returns the currency symbol ("kr")

### 2. Configuration

The currency configuration is centralized with the following settings:

```typescript
export const CURRENCY_CONFIG = {
  currency: 'DKK',
  locale: 'da-DK',
  symbol: 'kr'
} as const;
```

### 3. Updated Components

The following components have been updated to use Danish kroner:

#### Pages
- `PageProducts.tsx` - Product pricing display
- `PageOrders.tsx` - Order totals and amounts
- `PagePurchaseOrders.tsx` - Purchase order totals
- `PageDashboard.tsx` - Sales totals and metrics

#### Dialogs
- `OrderTableDetails.tsx` - Order item pricing
- `OrderDetailsDialog.tsx` - Order item details
- `SupplierDisplay.tsx` - Purchase order totals
- `DialogSupplier.tsx` - Purchase order display
- `SubDialogPurchaseOrderItems.tsx` - Item total calculations

### 4. Format Examples

The Danish kroner formatting follows Danish conventions:

- **Standard format**: `123,45 kr` (symbol after amount)
- **Alternative format**: `kr 123,45` (symbol before amount)
- **Decimal separator**: Comma (`,`)
- **Thousands separator**: Dot (`.`) for large numbers

### 5. Database Considerations

The database schema remains unchanged as it stores numerical values. Only the display and formatting layer has been updated to use Danish kroner.

### 6. Migration Notes

- All hardcoded USD symbols (`$`) have been replaced with proper DKK formatting
- Intl.NumberFormat implementations have been updated from `en-US` + `USD` to `da-DK` + `DKK`
- The centralized utilities ensure consistency across the application

## Usage Examples

```typescript
import { formatCurrency, formatCurrencyWithSymbol } from '../utils/currencyUtils';

// Standard formatting
const price = formatCurrency(1234.56); // "1.234,56 kr"

// Custom symbol position
const priceAfter = formatCurrencyWithSymbol(1234.56, true);   // "1.234,56 kr"
const priceBefore = formatCurrencyWithSymbol(1234.56, false); // "kr 1.234,56"
```

## Testing

After implementing these changes, verify:

1. All monetary values display in Danish kroner format
2. Currency symbols appear correctly throughout the application
3. Calculations and totals work properly with the new formatting
4. Forms and inputs handle Danish decimal notation correctly

## Future Considerations

- Consider adding currency conversion features if needed
- Implement user preferences for currency display if supporting multiple regions
- Ensure proper handling of VAT and tax calculations according to Danish regulations
