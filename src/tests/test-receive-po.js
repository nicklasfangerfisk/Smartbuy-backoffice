// Simple Node.js script to test your backend API
const axios = require('axios');

async function testReceivePO() {
  try {
    // Hardcoded new Supabase API key for testing
    const SUPABASE_API_KEY = 'sb_secret_v4ZyiUWC0bOrPII_fhhIPw_6l_bR5O-';
    const response = await axios.post('http://localhost:3000/api/receive-purchase-order', {
      purchaseOrderId: 82, // <-- replace with a valid purchase order ID
      items: [
        { product_id: 60, quantity_received: 1 } // <-- replace with a valid product ID
      ]
    }, {
      headers: {
        'x-api-key': SUPABASE_API_KEY
      }
    });
    console.log('API response:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('API error:', error.response.data);
    } else {
      console.error('Request error:', error.message);
    }
  }
}

testReceivePO();
