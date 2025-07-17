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

console.log('Environment check:');
console.log('- Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('- Service Key:', supabaseServiceKey ? 'Set' : 'Missing');
console.log('- SendGrid API Key:', sendGridApiKey ? `Set (${sendGridApiKey.substring(0, 10)}...)` : 'Missing');
console.log('- SendGrid From Email:', sendGridFromEmail || 'Missing');

if (!sendGridApiKey) {
  console.error('❌ SENDGRID_API_KEY is not set');
  process.exit(1);
}

if (!sendGridFromEmail) {
  console.error('❌ SENDGRID_FROM_EMAIL is not set');
  process.exit(1);
}

sgMail.setApiKey(sendGridApiKey);

async function sendTestEmail() {
  try {
    console.log('\n🧪 Testing SendGrid email...');
    console.log('🔑 API Key being used:', sendGridApiKey.substring(0, 15) + '...');
    console.log('📧 From email:', sendGridFromEmail);
    
    // First, let's test the API key validity
    try {
      console.log('🔍 Testing API key validity...');
      const testResponse = await sgMail.send({
        to: sendGridFromEmail, // Send to self first
        from: sendGridFromEmail,
        subject: 'API Key Test',
        text: 'Testing API key validity'
      });
      console.log('✅ API key test response:', testResponse[0].statusCode);
    } catch (apiError) {
      console.error('❌ API key test failed:', apiError.message);
      if (apiError.response) {
        console.error('API error details:', apiError.response.body);
      }
      return;
    }
    
    const msg = {
      to: 'pernillealstrup88@gmail.com', // Testing with Gmail address
      from: sendGridFromEmail,
      subject: 'Hello World - Test Email from Smartback',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Hello World! 👋</h1>
          <p>This is a test email from your Smartback application.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            This email was sent to verify that SendGrid is working correctly.
          </p>
        </div>
      `,
      text: `
        Hello World!
        
        This is a test email from your Smartback application.
        Timestamp: ${new Date().toISOString()}
        Environment: ${process.env.NODE_ENV || 'development'}
        
        This email was sent to verify that SendGrid is working correctly.
      `
    };

    console.log('📤 Sending actual test email...');
    const response = await sgMail.send(msg);
    console.log('✅ Email sent successfully!');
    console.log('📧 Email details:');
    console.log('   - To:', msg.to);
    console.log('   - From:', msg.from);
    console.log('   - Subject:', msg.subject);
    console.log('📊 SendGrid response:', response[0].statusCode);
    console.log('🔍 Full response headers:', JSON.stringify(response[0].headers, null, 2));
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    if (error.response) {
      console.error('SendGrid error details:', JSON.stringify(error.response.body, null, 2));
    }
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

// Also test getting a storefront for context
async function testStorefrontData() {
  try {
    console.log('\n🏪 Testing storefront data...');
    
    const { data: storefronts, error } = await supabase
      .from('storefronts')
      .select('id, name, is_online, logo_url')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching storefronts:', error);
    } else {
      console.log('✅ Storefronts found:', storefronts?.length || 0);
      storefronts?.forEach(store => {
        console.log(`   - ${store.name} (ID: ${store.id}, Online: ${store.is_online})`);
      });
    }
  } catch (err) {
    console.error('❌ Storefront test error:', err);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting email and data tests...\n');
  
  await testStorefrontData();
  await sendTestEmail();
  
  console.log('\n✨ Tests completed!');
}

runTests();
