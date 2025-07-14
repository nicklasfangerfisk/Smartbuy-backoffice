# Order Confirmation Email System

## Overview

The SmartBack order confirmation email system automatically sends professional, branded confirmation emails to customers when they complete their orders. The system integrates with Twilio SendGrid for reliable email delivery and supports storefront-specific customization.

## Features

### 🎨 Storefront-Specific Branding
- **Custom Logo**: Each storefront can display its own logo in email headers
- **Storefront Name**: Used as sender name and throughout the email content
- **Store Links**: Includes "Visit Our Store" button when storefront URL is configured
- **Consistent Styling**: Maintains professional appearance across all storefronts

### 📧 Professional Email Design
- **Responsive Layout**: Mobile-friendly design that works on all devices
- **Order Summary**: Complete itemized breakdown with pricing
- **Customer Information**: Order number, date, and customer details
- **Discount Handling**: Displays both item-level and order-level discounts
- **Professional Typography**: Clean, readable fonts and layout

### 🔧 Technical Features
- **Automatic Triggering**: Emails sent when orders transition to "Paid" status
- **Error Handling**: Continues order processing even if email fails
- **Testing Functionality**: Built-in test email system for development
- **Manual Resend**: Admin can manually resend confirmation emails
- **Fallback Support**: Works with or without storefront assignment

## Setup Instructions

### 1. SendGrid Configuration

Add the following environment variables to your deployment:

```bash
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### 2. Database Migration

The system requires the `storefront_id` column in the Orders table:

```sql
-- Already applied in migration 2025-07-14-add-storefront-to-orders.sql
ALTER TABLE "Orders"
ADD COLUMN IF NOT EXISTS storefront_id UUID REFERENCES storefronts(id);
```

### 3. Storefront Setup

1. Navigate to **Storefronts** in the admin panel
2. Create or edit storefronts with:
   - **Name**: Appears in emails and as sender name
   - **URL**: Optional website link for "Visit Store" button
   - **Logo**: Optional logo displayed in email header
   - **Online Status**: Only online storefronts appear in order creation

## Usage

### Automatic Email Sending

Emails are automatically sent when:
1. Customer completes checkout process
2. Order status changes from "Draft" to "Paid"
3. Order has a valid customer email address

### Manual Email Management

#### Testing Emails
1. Go to **Administration → Email Settings**
2. Select a storefront (or use default)
3. Enter test email address
4. Click "Send Test Email"

#### Resending Confirmation Emails
1. Open any paid order in the orders list
2. Click "Resend Email" button (appears for paid orders with email)
3. Email will be sent immediately

### Order Creation with Storefronts

When creating orders:
1. Select appropriate storefront from dropdown
2. Email will use that storefront's branding
3. If no storefront selected, uses default branding

## API Endpoints

### Send Order Confirmation
```typescript
POST /api/send-order-confirmation
{
  "orderUuid": "string",
  "storefrontId": "string" // optional
}
```

### Send Test Email
```typescript
POST /api/send-order-confirmation
{
  "testEmail": "string",
  "storefrontId": "string" // optional
}
```

### Resend Confirmation
```typescript
POST /api/resend-order-confirmation
{
  "orderUuid": "string",
  "resendEmail": true
}
```

## Email Template Structure

The email template includes:

```html
<!-- Header with storefront logo and name -->
<div class="header">
  <img src="storefront_logo" alt="Storefront Name">
  <h1>Storefront Name</h1>
  <div class="order-number">Order #SO-100001</div>
</div>

<!-- Customer greeting and order details -->
<div class="order-details">
  <p>Order Number: SO-100001</p>
  <p>Date: July 14, 2025</p>
  <p>Customer: John Doe</p>
</div>

<!-- Itemized order table -->
<table class="items-table">
  <!-- Products with quantities and pricing -->
</table>

<!-- Total breakdown with discounts -->
<div class="total-section">
  <!-- Subtotal, discounts, final total -->
</div>

<!-- Call-to-action and footer -->
<div class="footer">
  <!-- Store link and contact information -->
</div>
```

## Error Handling

The system is designed to be resilient:

- **Email Failures**: Order completion continues even if email fails
- **Missing Storefronts**: Falls back to default branding
- **Configuration Issues**: Logs errors without breaking order flow
- **Invalid Data**: Validates input and provides meaningful error messages

## Monitoring and Troubleshooting

### Common Issues

1. **Emails Not Sending**
   - Check SENDGRID_API_KEY configuration
   - Verify SENDGRID_FROM_EMAIL domain is verified in SendGrid
   - Check server logs for error messages

2. **Wrong Branding**
   - Verify storefront_id is correctly set on orders
   - Check storefront online status
   - Ensure logo URLs are accessible

3. **Missing Order Items**
   - Verify OrderItems table has data for the order
   - Check product names are not null
   - Ensure proper foreign key relationships

### Debugging

Enable detailed logging by checking:
- Browser console for client-side errors
- Server logs for API endpoint errors
- SendGrid dashboard for email delivery status

## Development Notes

### File Structure
```
src/
├── utils/
│   ├── emailService.ts          # Core email functionality
│   └── orderUtils.ts           # Order completion utilities
├── api/
│   ├── send-order-confirmation.ts    # Main email API
│   └── resend-order-confirmation.ts  # Manual resend API
├── Page/
│   └── PageEmailSettings.tsx   # Admin testing interface
└── Dialog/
    ├── ActionDialogOrderCheckout.tsx  # Checkout integration
    └── DialogOrder.tsx          # Order creation/editing
```

### Key Functions
- `sendOrderConfirmationEmail()`: Main email sending function
- `generateOrderConfirmationHTML()`: Email template generator
- `completeOrder()`: Order completion with email integration
- `createOrderWithItems()`: Order creation utility

## Security Considerations

- API keys stored as environment variables
- Input validation on all email endpoints
- Rate limiting recommended for production
- Customer email addresses handled securely
- No sensitive order data in email logs

## Future Enhancements

Potential improvements:
- **Email Templates**: Custom HTML templates per storefront
- **Multi-language**: Localized emails based on customer location
- **Email Tracking**: Open/click tracking integration
- **SMS Notifications**: Optional SMS confirmations
- **Scheduled Emails**: Follow-up emails for incomplete orders

---

## Quick Start Checklist

- [ ] Configure SendGrid API key and sender email
- [ ] Apply database migration for storefront_id
- [ ] Set up at least one storefront with branding
- [ ] Test email functionality via Email Settings page
- [ ] Create test order and verify email is sent
- [ ] Monitor email delivery in SendGrid dashboard

For support, check the server logs and SendGrid delivery dashboard for detailed error information.
