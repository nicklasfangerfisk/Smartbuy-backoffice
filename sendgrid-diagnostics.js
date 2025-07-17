import sgMail from '@sendgrid/mail';
import 'dotenv/config';

const sendGridApiKey = process.env.SENDGRID_API_KEY || '';
const sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL || '';

sgMail.setApiKey(sendGridApiKey);

async function checkSenderAuthentication() {
  try {
    console.log('🔍 Checking sender authentication...');
    
    // Use SendGrid's REST API to check sender verification
    const response = await fetch('https://api.sendgrid.com/v3/verified_senders', {
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Verified senders:', data.results?.length || 0);
      data.results?.forEach(sender => {
        console.log(`   - ${sender.from_email} (Status: ${sender.verified_status})`);
      });
    } else {
      console.error('❌ Failed to check verified senders:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error checking sender authentication:', error.message);
  }
}

async function checkApiKeyPermissions() {
  try {
    console.log('\n🔑 Checking API key permissions...');
    
    const response = await fetch('https://api.sendgrid.com/v3/scopes', {
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API key scopes:', data.scopes?.length || 0);
      const mailScopes = data.scopes?.filter(scope => scope.includes('mail')) || [];
      console.log('📧 Mail-related scopes:');
      mailScopes.forEach(scope => console.log(`   - ${scope}`));
      
      if (!mailScopes.some(scope => scope.includes('send'))) {
        console.warn('⚠️  No mail.send scope found - this might be the issue!');
      }
    } else {
      console.error('❌ Failed to check API key scopes:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error checking API key permissions:', error.message);
  }
}

async function sendSimpleTestEmail() {
  try {
    console.log('\n📧 Sending simplified test email...');
    
    const msg = {
      to: sendGridFromEmail, // Send to the same verified address
      from: sendGridFromEmail,
      subject: 'Simple Test - ' + new Date().toISOString(),
      text: 'This is a simple test email to verify SendGrid functionality.',
      html: '<p>This is a simple test email to verify SendGrid functionality.</p>'
    };

    console.log('📤 Sending to:', msg.to);
    console.log('📤 From:', msg.from);
    
    const response = await sgMail.send(msg);
    console.log('✅ Simple email response:', response[0].statusCode);
    console.log('📨 Message ID:', response[0].headers['x-message-id']);
    
    // Let's also try to check the activity
    setTimeout(async () => {
      try {
        console.log('\n📊 Checking email activity...');
        const activityResponse = await fetch('https://api.sendgrid.com/v3/messages', {
          headers: {
            'Authorization': `Bearer ${sendGridApiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          console.log('📈 Recent messages:', activityData.messages?.length || 0);
        } else {
          console.log('⚠️  Could not fetch message activity');
        }
      } catch (err) {
        console.log('⚠️  Error checking activity:', err.message);
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error sending simple email:', error.message);
    if (error.response?.body) {
      console.error('📋 Error details:', JSON.stringify(error.response.body, null, 2));
    }
  }
}

async function runDiagnostics() {
  console.log('🔧 Running SendGrid diagnostics...\n');
  console.log('API Key:', sendGridApiKey.substring(0, 15) + '...');
  console.log('From Email:', sendGridFromEmail);
  console.log('');
  
  await checkSenderAuthentication();
  await checkApiKeyPermissions();
  await sendSimpleTestEmail();
  
  console.log('\n💡 Troubleshooting tips:');
  console.log('1. Check if sender email is verified in SendGrid dashboard');
  console.log('2. Ensure API key has "Mail Send" permissions');
  console.log('3. Check if account is in trial mode with restrictions');
  console.log('4. Look for emails in spam/junk folder');
  console.log('5. Check SendGrid Activity tab for delivery status');
}

runDiagnostics();
