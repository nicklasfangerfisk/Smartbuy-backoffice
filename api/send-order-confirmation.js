// Vercel API endpoint for sending order confirmation emails

export default async function handler(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Email API called:', {
    method: req.method,
    body: req.body ? Object.keys(req.body) : 'no body',
    hasApiKey: !!process.env.SENDGRID_API_KEY,
    hasFromEmail: !!process.env.SENDGRID_FROM_EMAIL
  });

  try {
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'SendGrid API key not configured in environment variables' 
      });
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      console.error('SENDGRID_FROM_EMAIL not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'SendGrid from email not configured in environment variables' 
      });
    }

    const { orderUuid, storefrontId, testEmail } = req.body;

    // Handle test email
    if (testEmail) {
      console.log('Sending test email to:', testEmail);
      try {
        const { sendTestOrderConfirmationEmail } = await import('../src/utils/emailService.js');
        const success = await sendTestOrderConfirmationEmail(testEmail, storefrontId);
        console.log('Test email result:', success);
        return res.status(200).json({ 
          success, 
          message: success ? 'Test email sent successfully' : 'Failed to send test email'
        });
      } catch (emailError) {
        console.error('Email service error:', emailError);
        return res.status(500).json({ 
          success: false, 
          error: `Email service error: ${emailError.message}` 
        });
      }
    }

    // Handle actual order confirmation
    if (!orderUuid) {
      return res.status(400).json({ error: 'Order UUID is required' });
    }

    console.log('Sending order confirmation for:', orderUuid);
    try {
      const { sendOrderConfirmationEmail } = await import('../src/utils/emailService.js');
      const success = await sendOrderConfirmationEmail(orderUuid, storefrontId);
      
      if (success) {
        console.log('Order confirmation sent successfully');
        res.status(200).json({ 
          success: true, 
          message: 'Order confirmation email sent successfully' 
        });
      } else {
        console.log('Order confirmation failed');
        res.status(500).json({ 
          success: false, 
          error: 'Failed to send order confirmation email' 
        });
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      return res.status(500).json({ 
        success: false, 
        error: `Email service error: ${emailError.message}` 
      });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
