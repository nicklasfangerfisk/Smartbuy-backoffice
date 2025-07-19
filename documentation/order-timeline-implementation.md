# Order Timeline Implementation

This document describes the new Order Timeline feature that provides comprehensive tracking of order status changes and events.

## Components

### 1. OrderTimeline Component (`src/components/OrderTimeline.tsx`)

A reusable timeline component that displays:
- **Primary Events**: Order status changes (Draft → Paid → Confirmed → Packed → Delivery → Complete)
- **Secondary Events**: Support tickets, emails sent, custom events
- **Interactive Status Changes**: Allows manual status updates (when not in read-only mode)

#### Props:
- `orderUuid`: UUID of the order
- `currentStatus`: Current order status
- `onStatusChange`: Callback for status changes
- `readOnly`: Whether timeline is read-only (default: false)
- `showSecondaryEvents`: Show secondary events (default: true)

#### Usage:
```tsx
<OrderTimeline
  orderUuid={order.uuid}
  currentStatus={order.status}
  onStatusChange={(newStatus) => {
    // Handle status change
    setOrderStatus(newStatus);
  }}
  readOnly={false}
  showSecondaryEvents={true}
/>
```

### 2. OrderTimelineService (`src/services/orderTimelineService.ts`)

Service layer for timeline data management:
- `loadStatusHistory(orderUuid)`: Load order status history
- `loadEvents(orderUuid)`: Load order events
- `addStatusChange(orderUuid, status, notes, createdBy)`: Add status change
- `addEvent(orderUuid, eventType, eventData, title, description)`: Add custom event
- `addEmailSentEvent(orderUuid, emailType, recipient, subject)`: Add email event
- `addSupportTicketEvent(orderUuid, ticketId, status, subject)`: Add support ticket event

## Database Schema Options

Choose one of the following migration options:

### Option 1: Simple Status History (Recommended)
- **File**: `migrations/2025-07-19-order-status-tracking-option1.sql`
- **Tables**: `order_status_history`
- **Best for**: Simple status tracking with basic event logging

### Option 2: Comprehensive Events Table
- **File**: `migrations/2025-07-19-order-status-tracking-option2.sql`
- **Tables**: `order_events` (handles both status changes and other events)
- **Best for**: Unified event tracking system

### Option 3: Hybrid Approach
- **File**: `migrations/2025-07-19-order-status-tracking-option3.sql`
- **Tables**: `order_status_history` + `order_events`
- **Best for**: Separate concerns - status changes vs. general events

## Updated Order Statuses

The order status enum has been expanded to include:

1. **Draft** - A saved cart that can be checked out
2. **Paid** - When a user has secured payment and placed the order  
3. **Confirmed** - When the system has issued an official order confirmation
4. **Packed** - When the order has been packed awaiting shipment
5. **Delivery** - When the package has been forwarded to shipment supplier
6. **Complete** - When the order is completely fulfilled
7. **Returned** - When the order has fully or partially returned by the customer
8. **Cancelled** - When the order has been cancelled before payment

## Integration with DialogOrder

The OrderTimeline has been integrated as a third column in the Order Dialog:
- **Left Column**: Order information and customer details
- **Middle Column**: Order items
- **Right Column**: Order timeline (300px width, desktop only)

The dialog width has been increased to 1400px to accommodate the timeline.

## Features

### Automatic Status Tracking
- Database triggers automatically create status history entries when order status changes
- Timeline updates in real-time when status changes are made

### Event Logging
- Email sent events are automatically logged when order confirmation emails are resent
- Support for custom events and support ticket tracking
- Extensible event system with JSON metadata

### Graceful Degradation  
- Component works with mock data when database tables don't exist yet
- Automatic table existence checking
- Fallback to demonstration data for development

### Visual Design
- Vertical timeline with color-coded status indicators
- Status overview showing progression through order lifecycle
- Detailed activity history with timestamps and notes
- Responsive design (timeline hidden on mobile, shown as third column on desktop)

## Next Steps

1. **Choose and run one of the migration files** to set up the database schema
2. **Test the timeline functionality** by creating/editing orders
3. **Customize event types** as needed for your specific workflows
4. **Add integration with support ticket system** if applicable
5. **Extend with additional event types** (payment events, shipping updates, etc.)

## Example Events

The system supports various event types:

```typescript
// Email events
OrderTimelineService.addEmailSentEvent(orderUuid, 'order_confirmation', 'customer@example.com');

// Support ticket events  
OrderTimelineService.addSupportTicketEvent(orderUuid, 'T-12345', 'resolved', 'Delivery inquiry');

// Custom events
OrderTimelineService.addEvent(
  orderUuid,
  'payment_refund',
  { amount: 100, reason: 'Customer request' },
  'Refund processed',
  'Partial refund of $100 issued'
);
```

This implementation provides a comprehensive, scalable solution for order tracking that can be extended as your business requirements evolve.
