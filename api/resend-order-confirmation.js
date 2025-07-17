// Vercel API endpoint for resending order confirmation emails

export default async function handler(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('Resend Order Confirmation API called:', {
      method: req.method,
      body: Object.keys(req.body || {}),
      hasApiKey: !!process.env.SENDGRID_API_KEY,
      hasFromEmail: !!process.env.SENDGRID_FROM_EMAIL
    });

    const { orderData, customerEmail, customerName } = req.body;

    // Validate required fields
    if (!orderData || !customerEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: orderData and customerEmail are required' 
      });
    }

    // Import the email service
    const { sendOrderConfirmationEmail } = require('./emailService.js');

    // Send the email
    const result = await sendOrderConfirmationEmail({
      orderData,
      customerEmail,
      customerName: customerName || 'Valued Customer'
    });

    console.log('Resend email result:', result);

    res.status(200).json({ 
      success: true, 
      message: 'Order confirmation email resent successfully',
      messageId: result.messageId 
    });

  } catch (error) {
    console.error('Error resending order confirmation email:', error);
    res.status(500).json({ 
      error: 'Failed to resend order confirmation email',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
