// Simple test server to test email functionality
import express from 'express';
import cors from 'cors';
import { sendOrderConfirmationEmail, sendTestOrderConfirmationEmail } from './src/utils/emailService.js';

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint
app.post('/api/send-order-confirmation', async (req, res) => {
  try {
    const { orderUuid, testEmail, storefront_id } = req.body;

    console.log('Received request:', { orderUuid, testEmail, storefront_id });

    // Handle test email
    if (testEmail) {
      console.log('Sending test email to:', testEmail);
      const success = await sendTestOrderConfirmationEmail(testEmail, storefront_id);
      return res.json({ 
        success, 
        message: success ? 'Test email sent successfully' : 'Failed to send test email'
      });
    }

    // Handle actual order confirmation
    if (!orderUuid) {
      return res.status(400).json({ error: 'Order UUID is required' });
    }

    console.log('Sending order confirmation for:', orderUuid);
    const success = await sendOrderConfirmationEmail(orderUuid, storefront_id);
    
    res.json({ 
      success, 
      message: success ? 'Order confirmation email sent successfully' : 'Failed to send email'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Test email server running on http://localhost:${PORT}`);
  console.log(`📧 Email API available at http://localhost:${PORT}/api/send-order-confirmation`);
});
