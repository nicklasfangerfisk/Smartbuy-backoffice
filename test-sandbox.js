import sgMail from '@sendgrid/mail';
import 'dotenv/config';

const sendGridApiKey = process.env.SENDGRID_API_KEY || '';
sgMail.setApiKey(sendGridApiKey);

async function testSandboxMode() {
  try {
    console.log('🧪 Testing SendGrid in sandbox mode...');
    
    const msg = {
      to: 'nicklas_bak@outlook.dk',
      from: 'nicklas_bak@outlook.dk',
      subject: 'Sandbox Test Email',
      text: 'This is a sandbox test.',
      html: '<p>This is a sandbox test.</p>',
      mailSettings: {
        sandboxMode: {
          enable: true
        }
      }
    };

    const response = await sgMail.send(msg);
    console.log('✅ Sandbox email "sent" successfully!');
    console.log('📊 Response:', response[0].statusCode);
    console.log('📨 Message ID:', response[0].headers['x-message-id']);
    console.log('');
    console.log('🎯 This confirms the API setup is working!');
    console.log('📝 The issue is sender verification - please verify nicklas_bak@outlook.dk in SendGrid dashboard');
    
  } catch (error) {
    console.error('❌ Sandbox test failed:', error.message);
    if (error.response?.body) {
      console.error('Error details:', JSON.stringify(error.response.body, null, 2));
    }
  }
}

testSandboxMode();
