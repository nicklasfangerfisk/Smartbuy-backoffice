require('dotenv').config();
const fetch = require('node-fetch');
const { execSync } = require('child_process');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Service Role Key is not set or empty.');
  console.error('SUPABASE_URL:', supabaseUrl ? supabaseUrl : 'NOT SET');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'NOT SET');
  process.exit(1);
}

// Run Jest and capture results
const jestOutput = execSync('npx jest --json').toString();
const jestResults = JSON.parse(jestOutput);

const payload = {
  total_tests: jestResults.numTotalTests,
  passed_tests: jestResults.numPassedTests,
  failed_tests: jestResults.numFailedTests,
  skipped_tests: jestResults.numPendingTests,
  results: jestResults.testResults.map(suite => ({
    name: suite.name,
    passed: suite.numPassingTests,
    failed: suite.numFailingTests,
    tests: suite.assertionResults.map(test => ({
      name: test.fullName,
      status: test.status,
      errorMessage: test.failureMessages.join('\n') || null
    }))
  }))
};

fetch(`${supabaseUrl}/rest/v1/jest_results`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  },
  body: JSON.stringify(payload)
})
.then(async response => {
  const rawBody = await response.text();
  console.log('Raw response body:', rawBody);

  if (!response.ok) {
    throw new Error(`Failed to insert Jest results: ${response.statusText}`);
  }

  return JSON.parse(rawBody);
})
.then(data => console.log('Inserted Jest results:', data))
.catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
