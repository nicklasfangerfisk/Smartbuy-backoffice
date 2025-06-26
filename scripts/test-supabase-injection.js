require('dotenv').config();
const fetch = require('node-fetch');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Service Role Key is not set or empty.');
  process.exit(1);
}

const testPayload = {
  total_tests: 10,
  passed_tests: 8,
  failed_tests: 2,
  skipped_tests: 0,
  results: [
    {
      name: 'Test Suite 1',
      passed: 5,
      failed: 1,
      tests: [
        { name: 'Test 1', status: 'passed', errorMessage: null },
        { name: 'Test 2', status: 'failed', errorMessage: 'Expected true but got false' }
      ]
    },
    {
      name: 'Test Suite 2',
      passed: 3,
      failed: 1,
      tests: [
        { name: 'Test 3', status: 'passed', errorMessage: null },
        { name: 'Test 4', status: 'failed', errorMessage: 'Timeout error' }
      ]
    }
  ]
};

fetch(`${supabaseUrl}/rest/v1/jest_results`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  },
  body: JSON.stringify(testPayload)
})
.then(async response => {
  console.log('HTTP Status:', response.status, response.statusText);
  const rawBody = await response.text();
  console.log('Raw response body:', rawBody);

  if (!response.ok) {
    throw new Error(`Failed to insert test payload: ${response.statusText}`);
  }

  console.log('Test payload inserted successfully.');
})
.catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
