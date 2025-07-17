// Test the API endpoint that's failing
import fetch from 'node-fetch';

async function testAPIEndpoint() {
  try {
    console.log('🧪 Testing API endpoint...');
    
    const response = await fetch('http://localhost:3002/api/send-order-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testEmail: 'pernillealstrup88@gmail.com'
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    } else {
      const result = await response.json();
      console.log('✅ Success response:', result);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testAPIEndpoint();
