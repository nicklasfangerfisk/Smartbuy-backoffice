const fs = require('fs');

// Read raw Jest JSON report
const rawData = JSON.parse(fs.readFileSync('jest-results.json'));

// Format the data into the required structure
const formattedData = {
  timestamp: new Date().toISOString(),
  total: rawData.numTotalTests,
  passed: rawData.numPassedTests,
  failed: rawData.numFailedTests,
  skipped: rawData.numPendingTests,
  suites: rawData.testResults.map(suite => ({
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

// Write the formatted data to a new file
fs.writeFileSync('formatted-jest-results.json', JSON.stringify(formattedData, null, 2));
