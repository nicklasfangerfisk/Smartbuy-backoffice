import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';
import 'dotenv/config';

// Setup Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Setup SendGrid
const sendGridApiKey = process.env.SENDGRID_API_KEY || '';
const sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL || '';

if (!sendGridApiKey || !sendGridFromEmail) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

sgMail.setApiKey(sendGridApiKey);

async function sendOrderConfirmationByOrderNumber(orderNumber) {
  try {
    console.log(`🔍 Looking for order: ${orderNumber}`);
    
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();
    
    if (orderError) {
      console.error('❌ Error fetching order:', orderError);
      return;
    }
    
    if (!order) {
      console.error('❌ Order not found');
      return;
    }
    
    console.log(`✅ Found order: ${order.customer_name} (${order.customer_email})`);
    
    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('orderitems')
      .select(`
        *,
        products:product_uuid (ProductName, SalesPrice)
      `)
      .eq('order_uuid', order.uuid);
    
    if (itemsError) {
      console.error('❌ Error fetching order items:', itemsError);
      return;
    }
    
    console.log(`📦 Order has ${orderItems?.length || 0} items`);
    
    // Get storefront info if available
    let storefront = null;
    if (order.storefront_id) {
      const { data: storefrontData } = await supabase
        .from('storefronts')
        .select('*')
        .eq('id', order.storefront_id)
        .single();
      storefront = storefrontData;
    }
    
    // Generate email content
    const orderTotal = order.total || 0;
    const itemsList = orderItems?.map(item => 
      `- ${item.products?.ProductName || 'Unknown Product'} x${item.quantity} = ${item.price || 0} kr.`
    ).join('\n') || 'No items';
    
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333;">Order Confirmation</h1>
        ${storefront ? `<p style="color: #666;">From ${storefront.name}</p>` : ''}
    </div>
    
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin-top: 0;">Order Details</h2>
        <p><strong>Order Number:</strong> ${order.order_number}</p>
        <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
        <p><strong>Customer:</strong> ${order.customer_name}</p>
        <p><strong>Status:</strong> ${order.status}</p>
    </div>
    
    <div style="margin-bottom: 20px;">
        <h2>Items Ordered</h2>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px;">${itemsList}</pre>
    </div>
    
    <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; text-align: center;">
        <h3 style="margin: 0; color: #333;">Total: ${orderTotal} kr.</h3>
    </div>
    
    <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
        <p>Thank you for your order!</p>
        <p>This is an automated confirmation email.</p>
    </div>
</body>
</html>`;

    // Send email
    const msg = {
      to: order.customer_email,
      from: sendGridFromEmail,
      subject: `Order Confirmation - #${order.order_number}`,
      html: emailContent,
      text: `
Order Confirmation

Order Number: ${order.order_number}
Date: ${new Date(order.date).toLocaleDateString()}
Customer: ${order.customer_name}
Status: ${order.status}

Items:
${itemsList}

Total: ${orderTotal} kr.

Thank you for your order!
      `
    };

    console.log('📧 Sending email...');
    const response = await sgMail.send(msg);
    console.log('✅ Email sent successfully!');
    console.log('📊 SendGrid response:', response[0].statusCode);
    console.log('🎯 Sent to:', order.customer_email);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('SendGrid error:', error.response.body);
    }
  }
}

// Get order number from command line argument
const orderNumber = process.argv[2];

if (!orderNumber) {
  console.log('Usage: node send-order-email.js <order_number>');
  console.log('Example: node send-order-email.js 100042');
  process.exit(1);
}

sendOrderConfirmationByOrderNumber(orderNumber);
