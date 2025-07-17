// Test if the API file can be imported and executed directly
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function testAPIFile() {
  try {
    console.log('🧪 Testing API file directly...');
    
    // Import the API handler
    const { default: handler } = await import('./api/send-order-confirmation.js');
    
    // Mock request and response objects
    const req = {
      method: 'POST',
      body: {
        testEmail: 'pernillealstrup88@gmail.com'
      }
    };
    
    const res = {
      status: (code) => ({ json: (data) => console.log(`Status: ${code}`, data) }),
      json: (data) => console.log('Response:', data)
    };
    
    console.log('Calling handler...');
    await handler(req, res);
    
  } catch (error) {
    console.error('❌ Error testing API file:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAPIFile();
