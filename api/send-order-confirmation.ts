import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendOrderConfirmationEmail, sendTestOrderConfirmationEmail } from '../src/utils/emailService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderUuid, storefrontId, testEmail } = req.body;

    // Handle test email
    if (testEmail) {
      const success = await sendTestOrderConfirmationEmail(testEmail, storefrontId);
      return res.status(200).json({ 
        success, 
        message: success ? 'Test email sent successfully' : 'Failed to send test email'
      });
    }

    // Handle actual order confirmation
    if (!orderUuid) {
      return res.status(400).json({ error: 'Order UUID is required' });
    }

    const success = await sendOrderConfirmationEmail(orderUuid, storefrontId);
    
    if (success) {
      res.status(200).json({ 
        success: true, 
        message: 'Order confirmation email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send order confirmation email' 
      });
    }
  } catch (error: any) {
    console.error('API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
