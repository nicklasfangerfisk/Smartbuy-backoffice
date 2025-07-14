import sgMail from '@sendgrid/mail';
import { supabase } from './supabaseClient';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface StorefrontInfo {
  id: string;
  name: string;
  url?: string;
  logo_url?: string;
  is_online: boolean;
}

export interface OrderConfirmationData {
  order: {
    uuid: string;
    order_number_display: string;
    customer_name: string;
    customer_email: string;
    order_total: number;
    date: string;
    status: string;
  };
  orderItems: Array<{
    ProductName: string;
    quantity: number;
    unitprice: number;
    discount?: number;
    total: number;
  }>;
  storefront: StorefrontInfo;
}

/**
 * Generates HTML email template for order confirmation
 */
export function generateOrderConfirmationHTML(data: OrderConfirmationData): string {
  const { order, orderItems, storefront } = data;
  
  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const totalDiscount = orderItems.reduce((sum, item) => sum + (item.discount || 0) * item.quantity, 0);
  
  // Format currency (assuming USD for now, could be made configurable per storefront)
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
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
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            max-height: 60px;
            margin-bottom: 15px;
        }
        .storefront-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin: 0;
        }
        .order-number {
            font-size: 18px;
            color: #27ae60;
            font-weight: 600;
            margin: 15px 0;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
        }
        .order-details {
            background-color: #f8f9fa;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-details h3 {
            margin-top: 0;
            color: #2c3e50;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .items-table th,
        .items-table td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #dee2e6;
        }
        .items-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        .quantity {
            text-align: center;
        }
        .price {
            text-align: right;
        }
        .total-section {
            border-top: 2px solid #e9ecef;
            padding-top: 15px;
            margin-top: 20px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
        }
        .total-row.final {
            font-size: 18px;
            font-weight: bold;
            color: #27ae60;
            border-top: 1px solid #dee2e6;
            padding-top: 10px;
            margin-top: 15px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            margin: 20px 0;
        }
        .discount {
            color: #dc3545;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .items-table {
                font-size: 14px;
            }
            .items-table th,
            .items-table td {
                padding: 8px 4px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            ${storefront.logo_url ? `<img src="${storefront.logo_url}" alt="${storefront.name}" class="logo">` : ''}
            <h1 class="storefront-name">${storefront.name}</h1>
            <div class="order-number">Order Confirmation #${order.order_number_display}</div>
        </div>

        <div class="greeting">
            <p>Hello ${order.customer_name},</p>
            <p>Thank you for your order! We're pleased to confirm that your order has been received and is being processed.</p>
        </div>

        <div class="order-details">
            <h3>Order Summary</h3>
            <p><strong>Order Number:</strong> ${order.order_number_display}</p>
            <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${order.customer_name}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="quantity">Qty</th>
                    <th class="price">Price</th>
                    <th class="price">Total</th>
                </tr>
            </thead>
            <tbody>
                ${orderItems.map(item => `
                    <tr>
                        <td>
                            ${item.ProductName}
                            ${item.discount && item.discount > 0 ? `<br><span class="discount">${item.discount}% discount applied</span>` : ''}
                        </td>
                        <td class="quantity">${item.quantity}</td>
                        <td class="price">${formatCurrency(item.unitprice)}</td>
                        <td class="price">${formatCurrency(item.total)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(subtotal)}</span>
            </div>
            ${totalDiscount > 0 ? `
                <div class="total-row">
                    <span>Total Discounts:</span>
                    <span class="discount">-${formatCurrency(totalDiscount)}</span>
                </div>
            ` : ''}
            <div class="total-row final">
                <span>Total:</span>
                <span>${formatCurrency(order.order_total)}</span>
            </div>
        </div>

        ${storefront.url ? `
            <div style="text-align: center;">
                <a href="${storefront.url}" class="button">Visit Our Store</a>
            </div>
        ` : ''}

        <div class="footer">
            <p>If you have any questions about your order, please don't hesitate to contact us.</p>
            ${storefront.url ? `<p>Visit us online at <a href="${storefront.url}">${storefront.url}</a></p>` : ''}
            <p>Thank you for choosing ${storefront.name}!</p>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Fetches storefront information from database
 */
export async function getStorefrontById(storefrontId: string): Promise<StorefrontInfo | null> {
  try {
    const { data, error } = await supabase
      .from('storefronts')
      .select('*')
      .eq('id', storefrontId)
      .single();

    if (error) {
      console.error('Error fetching storefront:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching storefront:', error);
    return null;
  }
}

/**
 * Fetches order items for a given order
 */
export async function getOrderItems(orderUuid: string) {
  try {
    const { data, error } = await supabase
      .from('OrderItems')
      .select(`
        uuid,
        quantity,
        unitprice,
        discount,
        Products:product_uuid(ProductName)
      `)
      .eq('order_uuid', orderUuid);

    if (error) throw error;

    return data?.map((item: any) => ({
      ProductName: item.Products?.ProductName || 'Unknown Product',
      quantity: item.quantity,
      unitprice: item.unitprice || 0,
      discount: item.discount || 0,
      total: (item.unitprice || 0) * item.quantity - (item.discount || 0) * item.quantity
    })) || [];
  } catch (error) {
    console.error('Error fetching order items:', error);
    return [];
  }
}

/**
 * Sends order confirmation email using SendGrid
 */
export async function sendOrderConfirmationEmail(orderUuid: string, storefrontId?: string): Promise<boolean> {
  try {
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return false;
    }

    // Fetch order details
    const { data: orderData, error: orderError } = await supabase
      .from('Orders')
      .select('*')
      .eq('uuid', orderUuid)
      .single();

    if (orderError || !orderData) {
      console.error('Error fetching order:', orderError);
      return false;
    }

    // Use storefront_id from order if not provided
    const orderStorefrontId = storefrontId || orderData.storefront_id;
    
    // Fetch storefront info (use default if none specified)
    let storefront: StorefrontInfo;
    if (orderStorefrontId) {
      const fetchedStorefront = await getStorefrontById(orderStorefrontId);
      if (!fetchedStorefront) {
        console.error('Storefront not found:', orderStorefrontId);
        return false;
      }
      storefront = fetchedStorefront;
    } else {
      // Default storefront if none specified
      storefront = {
        id: 'default',
        name: 'SmartBack Store',
        url: '',
        logo_url: '',
        is_online: true
      };
    }

    // Fetch order items
    const orderItems = await getOrderItems(orderUuid);

    if (orderItems.length === 0) {
      console.error('No order items found for order:', orderUuid);
      return false;
    }

    // Prepare email data
    const emailData: OrderConfirmationData = {
      order: {
        uuid: orderData.uuid,
        order_number_display: orderData.order_number_display || `Order #${orderData.order_number}`,
        customer_name: orderData.customer_name || 'Valued Customer',
        customer_email: orderData.customer_email,
        order_total: orderData.order_total || 0,
        date: orderData.date || orderData['Created at'],
        status: orderData.status
      },
      orderItems,
      storefront
    };

    // Generate HTML content
    const htmlContent = generateOrderConfirmationHTML(emailData);

    // Prepare email message
    const msg = {
      to: emailData.order.customer_email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@smartback.com',
        name: storefront.name
      },
      subject: `Order Confirmation - ${emailData.order.order_number_display} from ${storefront.name}`,
      html: htmlContent,
      text: `
Hello ${emailData.order.customer_name},

Thank you for your order from ${storefront.name}!

Order Number: ${emailData.order.order_number_display}
Order Date: ${new Date(emailData.order.date).toLocaleDateString()}
Total: $${emailData.order.order_total.toFixed(2)}

Order Items:
${orderItems.map(item => 
  `- ${item.ProductName} (Qty: ${item.quantity}) - $${item.total.toFixed(2)}`
).join('\n')}

If you have any questions, please don't hesitate to contact us.

Thank you for choosing ${storefront.name}!
      `.trim()
    };

    // Send email
    await sgMail.send(msg);
    console.log('Order confirmation email sent successfully to:', emailData.order.customer_email);
    
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
}

/**
 * Sends a test order confirmation email (for development/testing)
 */
export async function sendTestOrderConfirmationEmail(
  testEmail: string, 
  storefrontId?: string
): Promise<boolean> {
  const testData: OrderConfirmationData = {
    order: {
      uuid: 'test-uuid',
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
      return false;
    }

    const htmlContent = generateOrderConfirmationHTML(testData);

    const msg = {
      to: testEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@smartback.com',
        name: testData.storefront.name
      },
      subject: `TEST - Order Confirmation - ${testData.order.order_number_display}`,
      html: htmlContent,
      text: 'This is a test email for order confirmation functionality.'
    };

    await sgMail.send(msg);
    console.log('Test order confirmation email sent successfully to:', testEmail);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
}
