// Server-side email service for Vercel API functions
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * @typedef {Object} StorefrontInfo
 * @property {string} id
 * @property {string} name
 * @property {string} [url]
 * @property {string} [logo_url]
 * @property {boolean} is_online
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} ProductName
 * @property {number} quantity
 * @property {number} unitprice
 * @property {number} [discount]
 * @property {number} total
 */

/**
 * @typedef {Object} OrderConfirmationData
 * @property {Object} order
 * @property {string} order.uuid
 * @property {string} order.order_number_display
 * @property {string} order.customer_name
 * @property {string} order.customer_email
 * @property {number} order.order_total
 * @property {string} order.date
 * @property {string} order.status
 * @property {OrderItem[]} orderItems
 * @property {StorefrontInfo} storefront
 */

/**
 * Generates HTML email template for order confirmation
 */
function generateOrderConfirmationHTML(data) {
  const { order, orderItems, storefront } = data;
  
  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const totalDiscount = orderItems.reduce((sum, item) => sum + (item.discount || 0) * item.quantity, 0);
  
  // Format currency (assuming USD for now, could be made configurable per storefront)
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${order.order_number_display}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .order-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background: #f8f9fa; font-weight: bold; }
        .total-section { background: #e3f2fd; padding: 15px; border-radius: 5px; text-align: right; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order!</p>
        </div>
        
        <div class="order-details">
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> ${order.order_number_display}</p>
            <p><strong>Customer Name:</strong> ${order.customer_name}</p>
            <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
        </div>
        
        <h3>Order Items</h3>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${orderItems.map(item => `
                    <tr>
                        <td>${item.ProductName}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.unitprice)}</td>
                        <td>${formatCurrency(item.total)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="total-section">
            <p><strong>Order Total: ${formatCurrency(order.order_total)}</strong></p>
        </div>
        
        <div class="footer">
            <p>Thank you for choosing ${storefront.name}!</p>
            ${storefront.url ? `<p>Visit us at: <a href="${storefront.url}">${storefront.url}</a></p>` : ''}
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Sends a test order confirmation email (for development/testing)
 */
async function sendTestOrderConfirmationEmail(testEmail, storefrontId) {
  console.log('sendTestOrderConfirmationEmail called with:', { testEmail, storefrontId });
  
  const testData = {
    order: {
      uuid: 'test-uuid-' + Date.now(),
      order_number_display: 'SO-100001',
      customer_name: 'Test Customer',
      customer_email: testEmail,
      order_total: 99.99,
      date: new Date().toISOString(),
      status: 'Paid'
    },
    orderItems: [
      {
        ProductName: 'Sample Product 1',
        quantity: 2,
        unitprice: 25.00,
        discount: 0,
        total: 50.00
      },
      {
        ProductName: 'Sample Product 2',
        quantity: 1,
        unitprice: 49.99,
        discount: 0,
        total: 49.99
      }
    ],
    storefront: {
      id: storefrontId || 'test',
      name: 'Test Storefront',
      url: 'https://example.com',
      logo_url: '',
      is_online: true
    }
  };

  try {
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      throw new Error('SendGrid API key not configured');
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      console.error('SendGrid from email not configured');
      throw new Error('SendGrid from email not configured');
    }

    console.log('Generating HTML content...');
    const htmlContent = generateOrderConfirmationHTML(testData);
    console.log('HTML content generated, length:', htmlContent.length);

    const msg = {
      to: testEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: testData.storefront.name
      },
      subject: `TEST - Order Confirmation - ${testData.order.order_number_display}`,
      html: htmlContent,
      text: `
Hello ${testData.order.customer_name},

Thank you for your order from ${testData.storefront.name}!

Order Number: ${testData.order.order_number_display}
Order Date: ${new Date(testData.order.date).toLocaleDateString()}
Total: $${testData.order.order_total.toFixed(2)}

Order Items:
${testData.orderItems.map(item => 
  `- ${item.ProductName} (Qty: ${item.quantity}) - $${item.total.toFixed(2)}`
).join('\n')}

This is a test email for order confirmation functionality.

Thank you for choosing ${testData.storefront.name}!
      `.trim()
    };

    console.log('Attempting to send email via SendGrid...');
    const result = await sgMail.send(msg);
    console.log('SendGrid send result:', result[0].statusCode);
    
    console.log('Test order confirmation email sent successfully to:', testEmail);
    return true;
  } catch (error) {
    console.error('Error sending test email:', {
      message: error.message,
      code: error.code,
      response: error.response && error.response.body ? error.response.body : undefined
    });
    throw error;
  }
}

/**
 * Sends order confirmation email for a real order
 */
async function sendOrderConfirmationEmail(orderUuid, storefrontId, targetEmail = null) {
  console.log('sendOrderConfirmationEmail called with:', { orderUuid, storefrontId, targetEmail });
  
  try {
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      throw new Error('SendGrid API key not configured');
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      console.error('SendGrid from email not configured');
      throw new Error('SendGrid from email not configured');
    }

    // For now, send a simple order confirmation email
    // In a real implementation, you would fetch order details from your database
    console.log('Generating order confirmation email for order:', orderUuid);
    
    const orderData = {
      order: {
        uuid: orderUuid,
        order_number_display: `ORD-${orderUuid.substring(0, 8).toUpperCase()}`,
        customer_name: 'Valued Customer',
        customer_email: targetEmail || 'customer@example.com',
        order_total: 99.99,
        date: new Date().toISOString(),
        status: 'Paid'
      },
      orderItems: [
        {
          ProductName: 'Sample Product',
          quantity: 1,
          unitprice: 99.99,
          discount: 0,
          total: 99.99
        }
      ],
      storefront: {
        id: storefrontId || 'default',
        name: 'Your Store',
        url: 'https://yourstore.com',
        logo_url: '',
        is_online: true
      }
    };

    const htmlContent = generateOrderConfirmationHTML(orderData);
    console.log('HTML content generated for order confirmation, length:', htmlContent.length);

    const msg = {
      to: orderData.order.customer_email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: orderData.storefront.name
      },
      subject: `Order Confirmation - ${orderData.order.order_number_display}`,
      html: htmlContent,
      text: `
Hello ${orderData.order.customer_name},

Thank you for your order!

Order Number: ${orderData.order.order_number_display}
Order Date: ${new Date(orderData.order.date).toLocaleDateString()}
Total: $${orderData.order.order_total.toFixed(2)}

This is a confirmation email for order ${orderUuid}.

Thank you for choosing ${orderData.storefront.name}!
      `.trim()
    };

    console.log('Attempting to send order confirmation email via SendGrid to:', orderData.order.customer_email);
    const result = await sgMail.send(msg);
    console.log('SendGrid send result:', result[0].statusCode);
    
    console.log('Order confirmation email sent successfully for order:', orderUuid);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', {
      message: error.message,
      code: error.code,
      response: error.response && error.response.body ? error.response.body : undefined
    });
    throw error;
  }
}

// CommonJS exports
module.exports = {
  generateOrderConfirmationHTML,
  sendTestOrderConfirmationEmail,
  sendOrderConfirmationEmail
};
