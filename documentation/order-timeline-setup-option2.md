# Order Timeline - Option 2 Setup

You've chosen **Option 2: Comprehensive Events Table** for order timeline tracking. This approach uses a single `order_events` table to handle all order-related events including status changes.

## 📋 Setup Instructions

### Step 1: Run the Migration

Copy and paste the contents of `migrations/2025-07-19-order-status-tracking-option2.sql` into your Supabase SQL Editor and execute it.

**Or manually execute these key commands:**

```sql
-- 1. Add new status values to enum
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Confirmed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Packed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Delivery';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Complete';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Returned';

-- 2. Create the events table
CREATE TABLE IF NOT EXISTS "order_events" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "order_uuid" UUID NOT NULL REFERENCES "Orders"("uuid") ON DELETE CASCADE,
  "event_type" TEXT NOT NULL,
  "event_data" JSONB NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "created_by" TEXT,
  "title" TEXT,
  "description" TEXT
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS "idx_order_events_order_uuid" ON "order_events"("order_uuid");
CREATE INDEX IF NOT EXISTS "idx_order_events_created_at" ON "order_events"("created_at");
CREATE INDEX IF NOT EXISTS "idx_order_events_event_type" ON "order_events"("event_type");
CREATE INDEX IF NOT EXISTS "idx_order_events_event_data" ON "order_events" USING GIN ("event_data");

-- 4. Enable RLS
ALTER TABLE "order_events" ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
CREATE POLICY "order_events_read_policy" ON "order_events" FOR SELECT USING (true);
CREATE POLICY "order_events_insert_policy" ON "order_events" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "order_events_update_policy" ON "order_events" FOR UPDATE USING (auth.role() = 'authenticated');
```

### Step 2: Test the Setup

Run the test script to verify everything is working:

```bash
node test-order-timeline.js
```

This will:
- ✅ Check if the table exists
- ✅ Find an existing order to test with
- ✅ Create test events
- ✅ Test automatic status change tracking
- ✅ Verify the helper functions work

### Step 3: Try the Timeline

1. Open the app and navigate to an order
2. Edit or view an existing order
3. You should see the timeline as a third column (desktop only)
4. Try changing the order status to see real-time updates

## 🎯 What You Get

### Automatic Status Tracking
- Every status change is automatically logged with timestamp
- Triggers create events when order status changes
- Full audit trail of status progression

### Manual Event Logging
- Email events are logged when order confirmations are sent
- Support for custom events via the service layer
- Extensible event types for future needs

### Timeline Display
- Visual timeline with color-coded status indicators
- Status overview showing order progression
- Detailed event history with timestamps
- Interactive status changes (non-read-only mode)

## 🔧 Event Types Supported

- **status_change**: Order status transitions
- **email_sent**: Email notifications sent
- **support_ticket**: Support ticket events
- **payment_received**: Payment events
- **shipping_update**: Shipping/tracking updates
- **timeline_test**: Test events
- **Custom types**: Extensible for your needs

## 🚀 Usage Examples

### In the Order Dialog
The timeline appears automatically as the third column when viewing/editing orders.

### Programmatic Usage
```typescript
// Add a custom event
await OrderTimelineService.addEvent(
  orderUuid,
  'custom_event',
  { key: 'value' },
  'Event Title',
  'Event description'
);

// Add an email event
await OrderTimelineService.addEmailSentEvent(
  orderUuid,
  'order_confirmation',
  'customer@example.com'
);

// Add a support ticket event
await OrderTimelineService.addSupportTicketEvent(
  orderUuid,
  'T-12345',
  'resolved',
  'Delivery inquiry'
);
```

## 🗂️ Database Schema

### order_events Table
- `id`: UUID primary key
- `order_uuid`: Foreign key to Orders table
- `event_type`: Type of event (string)
- `event_data`: Flexible JSON data
- `created_at`: Timestamp
- `created_by`: Who created the event
- `title`: Human-readable title
- `description`: Optional description

### Event Data Examples

**Status Change:**
```json
{
  "old_status": "Draft",
  "new_status": "Paid",
  "order_number": "SO-20250719-1234"
}
```

**Email Sent:**
```json
{
  "email_type": "order_confirmation",
  "recipient": "customer@example.com",
  "subject": "Order Confirmation",
  "timestamp": "2025-07-19T10:30:00Z"
}
```

**Support Ticket:**
```json
{
  "ticket_id": "T-12345",
  "status": "resolved",
  "subject": "Delivery inquiry"
}
```

## 📈 Next Steps

1. **Run the migration** in Supabase SQL Editor
2. **Test the functionality** with the test script
3. **Customize event types** as needed for your workflow
4. **Add more integrations** (shipping, payments, etc.)
5. **Monitor performance** with the provided indexes

The timeline is now ready to use and will provide comprehensive order tracking for your application! 🎉
