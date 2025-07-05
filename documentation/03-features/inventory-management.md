# Inventory Management System

## Overview

The SmartBack inventory management system provides comprehensive tracking and control of stock movements, ensuring accurate inventory levels and preventing operational issues. The system is built on a real-time calculation model with database-level integrity constraints.

## Core Features

### 1. Real-time Stock Calculation

#### Calculation Model
- **No Static Fields**: Inventory levels are calculated in real-time by aggregating all stock movements
- **Audit Trail**: Every stock change is recorded and traceable
- **Movement Types**:
  - `incoming`: Stock received from suppliers (+quantity)
  - `outgoing`: Stock shipped to customers (-quantity)
  - `adjustment`: Manual corrections (signed quantity)

#### Stock Calculation Logic
```typescript
const calculateStock = (movements: StockMovement[]) => {
  return movements.reduce((total, movement) => {
    switch (movement.movement_type) {
      case 'incoming':
        return total + movement.quantity;
      case 'outgoing':
        return total - movement.quantity;
      case 'adjustment':
        return total + movement.quantity; // Signed quantity
      default:
        return total;
    }
  }, 0);
};
```

### 2. Manual Stock Adjustments

#### Access Methods

**Desktop Version**
- **Location**: Stock Movements page (`/src/Page/PageMovementsDesktop.tsx`)
- **Access**: "Adjust" button in the top action bar
- **Interface**: Modal dialog with comprehensive form controls

**Mobile Version**
- **Location**: Stock Movements page (`/src/Page/PageMovementsMobile.tsx`)
- **Access**: Floating Action Button (FAB) in bottom-right corner
- **Interface**: Full-screen responsive dialog optimized for mobile

#### Adjustment Workflow

1. **Product Selection**
   - Dropdown lists all products with names and IDs
   - Format: "Product Name (ID: Product ID)"
   - Alphabetical sorting for quick navigation

2. **Current Stock Display**
   - Real-time calculation of current stock level
   - Automatic loading when product is selected
   - Warning system for zero or negative stock

3. **Target Stock Input**
   - User enters desired actual stock level
   - Smart detection of increase/decrease
   - Real-time preview of adjustment calculation
   - Color coding: Green for increases (+X), Red for decreases (-X)

4. **Reason Documentation**
   - Required text field for adjustment reason
   - Examples: "damage", "loss", "found inventory", "physical count correction"
   - Maintains audit trail and accountability

5. **Validation and Submission**
   - Form validation prevents invalid inputs
   - Submit button disabled when no change needed
   - Real-time feedback and error handling

#### Smart Detection Logic
```typescript
const calculateAdjustment = (currentStock: number, targetStock: number) => {
  const difference = targetStock - currentStock;
  
  if (difference > 0) {
    return {
      type: 'increase',
      quantity: difference,
      display: `+${difference}`,
      color: 'green'
    };
  } else if (difference < 0) {
    return {
      type: 'decrease',
      quantity: difference, // Negative value
      display: `${difference}`,
      color: 'red'
    };
  } else {
    return {
      type: 'no-change',
      quantity: 0,
      display: '0',
      color: 'neutral'
    };
  }
};
```

### 3. Movement Tracking and Display

#### Movement Type Indicators
- **↑ Incoming** (Green): Stock received from suppliers
- **↓ Outgoing** (Red): Stock shipped to customers
- **⚖ Adjustment** (Yellow): Manual stock corrections

#### Visual Display Features
- **Color-coded quantities**: Green for increases, Red for decreases
- **Bold formatting**: High visibility for quantity changes
- **Product information**: Primary name, secondary ID
- **Shortened UUIDs**: First 8 characters for readability
- **Timestamp display**: Clear date and time information

#### Search and Filtering
- **Multi-field search**: Movement ID, Product ID, Movement type, Reason, Product name
- **Real-time filtering**: Instant results as user types
- **Persistent search**: Search terms maintained across operations

### 4. Stock Movement Types

#### Incoming Movements
- **Source**: Purchase orders, supplier deliveries
- **Quantity**: Always positive
- **Effect**: Increases inventory
- **Examples**: Receiving purchased goods, returns from customers

#### Outgoing Movements
- **Source**: Customer orders, shipments
- **Quantity**: Always positive (subtracted from stock)
- **Effect**: Decreases inventory
- **Examples**: Order fulfillment, transfers to other locations

#### Adjustment Movements
- **Source**: Manual corrections
- **Quantity**: Signed (positive for increases, negative for decreases)
- **Effect**: Increases or decreases inventory
- **Examples**: Physical count corrections, damage, loss, found inventory

### 5. Data Integrity and Validation

#### Negative Stock Prevention

**Database-Level Enforcement**
```sql
-- Trigger function to prevent negative stock
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
  ), 0) + 
  CASE
    WHEN NEW.movement_type = 'incoming' THEN NEW.quantity
    WHEN NEW.movement_type = 'outgoing' THEN -NEW.quantity
    WHEN NEW.movement_type = 'adjustment' THEN NEW.quantity
    ELSE 0
  END
  INTO new_stock
  FROM stock_movements
  WHERE product_id = NEW.product_id;

  IF new_stock < 0 THEN
    RAISE EXCEPTION 'Stock for product % would go below zero', NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Application-Level Validation**
- Client-side validation before submission
- Server-side validation in API endpoints
- User-friendly error messages
- Graceful handling of edge cases

#### Audit Trail
- **Complete History**: All movements recorded with timestamps
- **User Tracking**: Movement creator identification
- **Reason Documentation**: Required explanations for adjustments
- **Immutable Records**: No deletion of movement records

### 6. Purchase Order Integration

#### Receiving Process
- **PO Fulfillment**: Automated stock updates when receiving goods
- **Partial Receipts**: Support for partial deliveries
- **Quality Control**: Separate received vs. accepted quantities
- **Batch Tracking**: Optional batch/lot number recording

#### Workflow
1. Purchase order created
2. Goods received (creates incoming movement)
3. Quality inspection (optional)
4. Stock adjustment if needed (damage, short delivery)
5. Final stock level reflects actual received quantity

### 7. Order Fulfillment Integration

#### Shipping Process
- **Order Creation**: Reserves inventory for pending orders
- **Fulfillment**: Creates outgoing movements when shipped
- **Returns**: Incoming movements for returned items
- **Cancellations**: Reverses inventory reservations

#### Workflow
1. Order placed (optional reservation)
2. Picking and packing
3. Shipment (creates outgoing movement)
4. Stock level updated automatically

### 8. Reporting and Analytics

#### Stock Reports
- **Current Inventory**: Real-time stock levels for all products
- **Movement History**: Detailed audit trail with filtering
- **Low Stock Alerts**: Products below minimum thresholds
- **Adjustment Summary**: Monthly/quarterly adjustment reports

#### Performance Metrics
- **Stock Turnover**: Inventory velocity calculations
- **Adjustment Frequency**: Tracking of manual corrections
- **Accuracy Metrics**: Comparison of expected vs. actual stock
- **Trend Analysis**: Historical stock level trends

### 9. Mobile Optimization

#### Mobile-First Design
- **Touch-Friendly Interface**: Large buttons and touch targets
- **Responsive Layout**: Edge-to-edge mobile design
- **Full-Screen Dialogs**: Optimized for mobile screens
- **Quick Actions**: Easy access to common operations

#### Mobile-Specific Features
- **Floating Action Button**: Quick access to adjustments
- **Card-Based Layout**: Touch-optimized information display
- **Gesture Support**: Swipe navigation (future enhancement)
- **Offline Capability**: Local caching (future enhancement)

### 10. Performance Considerations

#### Database Optimization
- **Indexed Columns**: `product_id`, `date`, `movement_type`
- **Efficient Queries**: Optimized stock calculation queries
- **Batch Operations**: Bulk movement processing
- **Caching Strategy**: Redis caching for frequently accessed data

#### Application Performance
- **Real-time Updates**: Efficient state management
- **Lazy Loading**: Deferred loading of movement history
- **Pagination**: Large dataset handling
- **Memory Management**: Proper cleanup of resources

## Future Enhancements

### Planned Features

#### Batch Operations
- **Bulk Adjustments**: Multiple products in single operation
- **CSV Import**: Bulk adjustment from spreadsheet
- **Template Support**: Predefined adjustment templates
- **Approval Workflow**: Multi-step approval for large adjustments

#### Advanced Features
- **Barcode Integration**: Camera scanning for product selection
- **Photo Documentation**: Image attachments for adjustments
- **Location Tracking**: Warehouse/bin location management
- **Forecasting**: Predictive stock level analytics

#### Integration Opportunities
- **API Endpoints**: REST API for external systems
- **Webhook Support**: Real-time notifications
- **Third-party Systems**: ERP and warehouse management integration
- **Mobile App**: Native mobile application

### Technical Improvements

#### Performance Enhancements
- **Database Partitioning**: Large table optimization
- **Materialized Views**: Pre-calculated stock levels
- **Real-time Subscriptions**: WebSocket-based updates
- **Background Processing**: Async movement processing

#### User Experience
- **Progressive Web App**: Enhanced mobile experience
- **Offline Support**: Local data caching
- **Voice Input**: Voice-to-text for mobile
- **Gesture Controls**: Swipe and touch gestures

## Best Practices

### Development Guidelines

1. **Always Use Database Triggers**: Enforce constraints at the database level
2. **Validate at Multiple Levels**: Client, server, and database validation
3. **Maintain Audit Trails**: Never delete movement records
4. **Test Edge Cases**: Concurrent operations, network failures
5. **Monitor Performance**: Regular query optimization and indexing

### Operational Guidelines

1. **Regular Audits**: Periodic physical inventory counts
2. **User Training**: Proper adjustment procedures
3. **Error Monitoring**: Track adjustment frequency and patterns
4. **Data Backup**: Regular database backups
5. **Access Control**: Proper user permissions and roles

### Security Considerations

1. **Authentication**: Secure user authentication
2. **Authorization**: Role-based access control
3. **Data Encryption**: Encrypted data transmission
4. **Audit Logging**: User action tracking
5. **Input Validation**: Sanitize all user inputs

The SmartBack inventory management system provides a robust, scalable solution for tracking and managing inventory with real-time accuracy, comprehensive audit trails, and user-friendly interfaces across desktop and mobile platforms.
