# Manual Stock Adjustment Feature

## Overview

The Manual Stock Adjustment feature allows authorized users to create manual inventory adjustments directly from the Stock Movements page. This feature is essential for maintaining accurate inventory levels by accounting for physica### Future Enhancements

#### Potential Improvements
- **Batch Adjustments**: Support for multiple products in single operation
- **Photo Documentation**: Attach images to adjustment reasons (especially valuable on mobile)
- **Approval Workflow**: Multi-step approval for large adjustments
- **Barcode Integration**: Use camera/barcode scanning for product selection on mobile
- **Voice Input**: Voice-to-text for adjustment reasons on mobile devices
- **Offline Support**: Allow adjustments when network connectivity is poor
- **Templates**: Predefined reason templates for common scenarios
- **Advanced Analytics**: Reporting on adjustment patterns and trends
- **Gesture Support**: Swipe gestures for mobile navigation

#### Integration Opportunities
- **Progressive Web App**: Enhanced mobile experience with PWA features
- **API Endpoints**: Expose adjustment functionality via REST API
- **Third-party Systems**: Integration with external inventory management tools
- **Push Notifications**: Alert stakeholders of significant adjustments on mobile
- **Location Services**: GPS tracking for adjustment location (warehouse management), damage, loss, found inventory, and other scenarios that require manual intervention.

## Feature Location

### Desktop Version
**Page**: Stock Movements Desktop (`/src/Page/PageMovementsDesktop.tsx`)  
**Access**: "Adjust" button in the top action bar  
**User Interface**: Modal dialog with comprehensive form controls

### Mobile Version  
**Page**: Stock Movements Mobile (`/src/Page/PageMovementsMobile.tsx`)  
**Access**: Floating Action Button (FAB) in bottom-right corner  
**User Interface**: Full-screen responsive dialog optimized for mobile

## Key Features

### 1. Access Methods

#### Desktop: Adjust Button
- **Location**: Top action bar next to the search field
- **Icon**: Add icon (➕) for intuitive recognition
- **Function**: Opens the manual adjustment dialog

#### Mobile: Floating Action Button (FAB)
- **Location**: Fixed position in bottom-right corner
- **Icon**: Add icon (➕) with primary color
- **Function**: Opens full-screen mobile adjustment dialog
- **Z-index**: Positioned above other UI elements for easy access

### 2. Responsive Adjustment Interface

#### Desktop Modal Dialog
- **Size**: Fixed width modal (500px) with centered positioning
- **Layout**: Vertical form layout with clear sectioning
- **Navigation**: Modal overlay with close button

#### Mobile Full-Screen Dialog  
- **Size**: Full-width with responsive height (max 90vh)
- **Layout**: Touch-optimized with adequate spacing
- **Navigation**: Header with close button and scrollable content
- **Cards**: Product information displayed in card format for better mobile readability

#### Product Selection
- **Dropdown**: Lists all products with names and IDs for easy identification
- **Format**: "Product Name (ID: Product ID)"
- **Sorting**: Alphabetical by product name for quick navigation

#### Real-time Stock Level Display
- **Current Stock Calculation**: Automatically calculates and displays current stock level when a product is selected
- **Calculation Method**: Aggregates all stock movements for the selected product:
  - `incoming` movements: +quantity
  - `adjustment` movements: +quantity  
  - `outgoing` movements: -quantity
- **Loading State**: Shows "Loading..." while calculating stock levels
- **Warning System**: Displays warning for products at or below zero stock level

#### Actual Stock Level Input with Smart Detection
- **Input Type**: Number field for entering the desired actual stock level
- **Range**: 0 to 999,999
- **User Experience**: 
  - User enters the actual stock level they want (e.g., if current is 10 and user enters 15, system detects +5 increase)
  - System automatically calculates if it's an increase or decrease
  - Intuitive: "What should the stock level be?" rather than "How much to add/subtract?"
- **Smart Detection**: 
  - If new level > current level = stock increase (adjustment)
  - If new level < current level = stock decrease (adjustment)
  - If new level = current level = no change (button disabled)
- **Real-time Preview**: Shows calculated difference as user types
- **Color Coding**: 
  - Green for increases with "+X" display
  - Red for decreases with "-X" display
  - Neutral for no change

#### Reason Documentation
- **Purpose**: Documents why the adjustment is being made
- **Examples**: "damage", "loss", "found inventory", "physical count correction"
- **Usage**: Helps maintain audit trail and accountability

### 3. Smart Stock Movement Handling

All manual adjustments use the "adjustment" movement type with **signed quantities** for maximum reliability and simplicity.

#### All Manual Adjustments (Both Increases and Decreases)
- **Movement Type**: Always `adjustment`
- **Quantity**: Stored as signed integer (positive for increases, negative for decreases)
- **Database Protection**: Database-level triggers prevent negative stock levels
- **Reason Format**: Simple descriptive text (e.g., "Manual adjustment: damage", "Physical count correction")

This approach ensures:
1. **No text parsing required** - direction is determined by quantity sign
2. **Database-enforced constraints** prevent negative stock levels with triggers
3. **Simplest possible calculations** - just sum all quantities
4. **Type-safe and reliable** - no complex logic needed
5. **Clear separation** between customer deliveries (outgoing) and manual corrections (adjustment)

### 4. Enhanced Visual Display

#### Movement Type Indicators
- **↑ Incoming** (Green): Stock received from suppliers or purchase orders
- **↓ Outgoing** (Red): Stock shipped to customers
- **⚖ Adjustment** (Yellow): Manual stock adjustments (increases or decreases)

#### Quantity Display
- **Color Coding**: 
  - Green with "+" prefix for increases (incoming/positive adjustments)
  - Red with "-" prefix for decreases (outgoing/negative adjustments)
- **Bold Formatting**: Makes quantity changes highly visible

#### Product Information
- **Primary Display**: Product name for easy identification
- **Secondary Display**: Product ID in smaller text
- **Fallback**: "Unknown Product" for orphaned movements

#### ID Display
- **Format**: Shortened UUID display (first 8 characters + "...")
- **Purpose**: Maintains traceability while improving readability

### 5. Real-time Stock Calculation Engine

```typescript
// SIMPLIFIED calculation logic with signed quantities
const totalStock = movements.reduce((total, movement) => {
    switch (movement.movement_type) {
        case 'incoming':
            return total + movement.quantity;
        case 'outgoing':
            return total - movement.quantity;
        case 'adjustment':
            return total + movement.quantity; // Quantity is already signed (+/-)
        default:
            return total;
    }
}, 0);
```

### 6. Enhanced Search Functionality

The search feature works across multiple fields:
- Movement ID
- Product ID (UUID)
- Movement type
- Reason text
- Product name
- Product ID (numeric)

### 7. Data Integrity & User Experience

#### Form Validation
- **Required Fields**: Product selection and actual stock level different from current
- **Real-time Validation**: Submit button disabled until valid input or when no change needed
- **User Feedback**: Clear error messages and success notifications
- **No-Change Prevention**: Button disabled when entered level equals current stock level

#### Loading States
- **Stock Calculation**: Loading indicator while fetching and calculating stock
- **Form Submission**: Loading button state during adjustment creation
- **Optimistic Updates**: Immediate table refresh after successful submission

#### Error Handling
- **Database Errors**: Proper error catching with user-friendly messages
- **Network Issues**: Graceful handling of connection problems
- **Data Validation**: Client-side validation before server submission

#### State Management
- **Form Reset**: All fields cleared on successful submission or cancellation
- **Clean Slate**: Dialog opens with fresh state each time
- **Persistent Search**: Search terms maintained across dialog operations

## Technical Implementation

### Database Integration
- **Table**: `stock_movements`
- **Columns Used**:
  - `product_id`: UUID reference to Products table
  - `movement_type`: Always 'adjustment' for manual corrections
  - `quantity`: Signed integer (positive for increases, negative for decreases)
  - `reason`: Simple descriptive text
  - `date`: Automatic timestamp
- **Database Protection**: Triggers prevent negative stock levels automatically

### Type Safety
- **TypeScript Integration**: Full type definitions for all data structures
- **Joined Data Types**: Proper typing for product information joins
- **State Types**: Comprehensive typing for all React state variables

### Performance Considerations
- **Efficient Queries**: Targeted stock calculation queries per product
- **Optimized Joins**: Single query for movement data with product information
- **Lazy Loading**: Stock calculations only when product is selected

### Responsive Design

#### Desktop Experience
- **Modal Sizing**: 500px width with centered positioning
- **Form Layout**: Vertical stack with clear visual hierarchy
- **Button Placement**: Right-aligned action buttons

#### Mobile Experience  
- **Full-Screen Dialog**: Maximizes screen real estate for form inputs
- **Touch-Optimized**: Large touch targets and adequate spacing
- **Card-Based Layout**: Current stock displayed in prominent card format
- **Responsive Typography**: Appropriately sized text for mobile reading
- **Floating Action Button**: Persistent access to adjustment feature
- **Keyboard Handling**: Proper mobile keyboard support for number inputs

#### Cross-Platform Features
- **Consistent Logic**: Identical signed quantity calculation on both platforms
- **Same Type Safety**: Shared TypeScript types across desktop and mobile
- **Unified Data Flow**: Identical Supabase integration and error handling

## User Workflow

### Desktop Workflow
1. **Access**: User navigates to Stock Movements page
2. **Initiate**: Clicks "Adjust" button in top action bar
3. **Select Product**: Chooses product from dropdown
4. **Review Current Stock**: System displays current calculated stock level
5. **Enter Target Level**: Inputs the desired actual stock level (system calculates increase/decrease automatically)
6. **Preview Change**: Reviews the calculated adjustment (+X increase or -X decrease)
7. **Validate**: System ensures the new level is different from current (disables button if same)
8. **Document**: Enters reason for the adjustment
9. **Submit**: Clicks "Create Adjustment" to save (only enabled when change is needed)
10. **Confirmation**: Receives success message and sees updated table
11. **Audit Trail**: Movement appears in table with proper categorization

### Mobile Workflow  
1. **Access**: User navigates to Stock Movements page
2. **Browse**: Views movement history in card-based mobile layout
3. **Initiate**: Taps Floating Action Button (FAB) in bottom-right corner
4. **Full-Screen Form**: Mobile-optimized dialog opens
5. **Select Product**: Chooses product from mobile-friendly dropdown
6. **Review Current Stock**: Large card displays current stock with visual warnings
7. **Enter Target Level**: Touch-optimized number input for desired stock level
8. **Real-time Preview**: Color-coded adjustment preview (green for increase, red for decrease)
9. **Document Reason**: Multi-line text field for adjustment explanation
10. **Submit**: Large "Create Adjustment" button (disabled until valid change entered)
11. **Mobile Confirmation**: Success alert and return to updated movement list
12. **Visual Update**: New adjustment appears in mobile card layout

## Integration with Existing Systems

### Inventory Calculation Model
- **Audit-Trail Based**: Follows system's real-time calculation approach
- **No Direct Stock Updates**: Maintains separation between movements and calculated levels
- **Negative Stock Prevention**: Works with existing database triggers and constraints

### Stock Movement Ecosystem
- **Consistent Patterns**: Uses same movement types as purchase orders and sales
- **Unified Reporting**: Adjustments appear in same table as other movements
- **Search Integration**: Adjustments searchable alongside other movement types

### Database Constraints
- **Quantity Validation**: Respects `CHECK (quantity > 0)` constraint
- **Foreign Key Integrity**: Maintains referential integrity with Products table
- **Row Level Security**: Works with existing RLS policies for authenticated users

## Benefits

### Operational Benefits
- **Inventory Accuracy**: Enables correction of physical discrepancies
- **Audit Compliance**: Full trail of all manual adjustments with reasons
- **Real-time Updates**: Immediate reflection in inventory calculations
- **User Efficiency**: Streamlined process for common inventory tasks

### Technical Benefits
- **Data Integrity**: Maintains consistency with existing inventory model
- **Scalability**: Efficient queries that scale with inventory size
- **Maintainability**: Clean separation of concerns and reusable components
- **Type Safety**: Full TypeScript coverage preventing runtime errors

### Business Benefits
- **Operational Continuity**: Enables quick resolution of inventory discrepancies
- **Compliance Ready**: Detailed audit trail for regulatory requirements
- **Damage Control**: Easy recording of damaged or lost inventory
- **Found Inventory**: Simple process for recording discovered stock

## Future Enhancements

### Potential Improvements
- **Batch Adjustments**: Support for multiple products in single operation
- **Photo Documentation**: Attach images to adjustment reasons
- **Approval Workflow**: Multi-step approval for large adjustments
- **Barcode Integration**: Use barcode scanning for product selection
- **Templates**: Predefined reason templates for common scenarios
- **Advanced Analytics**: Reporting on adjustment patterns and trends

### Integration Opportunities
- **Mobile App**: Extend functionality to mobile applications
- **API Endpoints**: Expose adjustment functionality via REST API
- **Third-party Systems**: Integration with external inventory management tools
- **Notification System**: Alert stakeholders of significant adjustments

## Conclusion

The Manual Stock Adjustment feature provides a robust, user-friendly solution for maintaining accurate inventory levels while preserving data integrity and audit compliance. It seamlessly integrates with the existing inventory system architecture and provides immediate value for operational inventory management across both desktop and mobile platforms.

### Desktop Implementation
The desktop version offers a comprehensive modal interface perfect for detailed inventory management tasks, with full keyboard navigation and efficient workflows for power users.

### Mobile Implementation  
The mobile version features a touch-optimized interface with floating action button access, card-based layouts, and full-screen dialogs designed specifically for mobile inventory management scenarios.

### Unified Architecture
Both implementations share the same core logic, TypeScript types, and database integration, ensuring consistent behavior and maintainability across platforms while providing platform-specific user experiences.

The implementation follows best practices for React development, responsive design, TypeScript usage, and database design, ensuring maintainability and scalability for future enhancements on both desktop and mobile platforms.
