# Renaming DialogPageSupplierDesktop to DialogSupplier

## Summary of Changes

This rename simplifies the component name and aligns with the general naming convention for dialog components in the project.

## Files Modified

### 1. **Renamed File**
- `src/Dialog/DialogPageSupplierDesktop.tsx` → `src/Dialog/DialogSupplier.tsx`

### 2. **Component Renaming**
- Component: `DialogPageSupplierDesktop` → `DialogSupplier`
- Props interface: `SupplierDisplayProps` (unchanged)

### 3. **Documentation Updates**
- **currency-implementation.md**: Updated file reference
- **07-legacy/PERFORMANCE_ANALYSIS.md**: Updated file reference  
- **07-legacy/APPLICATION_STRUCTURE_ANALYSIS.md**: Updated file reference

## Component Usage Status

This component appears to be **currently unused** in the active codebase:
- ❌ No imports found in any active source files
- ❌ No component usage found in any active source files
- ✅ Only referenced in documentation files

## Component Functionality

The `DialogSupplier` component provides:
- **Supplier Information Display**: Company details, contact information
- **Purchase Orders Table**: Shows all purchase orders for the supplier
- **Responsive Layout**: Two-column layout with supplier info on left, purchase orders on right

### Key Features:
```tsx
interface SupplierDisplayProps {
  supplier: Supplier;
  onClose: () => void;
}
```

- Displays supplier company and contact information in cards
- Shows purchase orders table with order number, date, status, total, and notes
- Includes loading and error states for purchase orders
- Provides close button functionality

## Verification

- ✅ TypeScript compilation successful (no new errors introduced)
- ✅ Development server running without issues
- ✅ File successfully renamed
- ✅ Component export updated
- ✅ Documentation references updated

## Future Integration

When this component needs to be used, it can be imported as:
```typescript
import DialogSupplier from '../Dialog/DialogSupplier';

// Usage
<DialogSupplier 
  supplier={supplierData} 
  onClose={() => setDialogOpen(false)} 
/>
```

## Notes

This component appears to be a legacy desktop-specific supplier display dialog that may have been superseded by the unified `SupplierForm` component which handles both viewing and editing supplier information. The renaming maintains the component for potential future use while simplifying its name.
