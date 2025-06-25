const fs = require('fs');
const path = require('path');

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

const resultsFilePath = path.join('Testflow', 'data', 'jest-results.json');
let accumulatedResults = [];

if (fs.existsSync(resultsFilePath)) {
  const existingData = JSON.parse(fs.readFileSync(resultsFilePath));
  accumulatedResults = existingData.concat(formattedData);
} else {
  accumulatedResults.push(formattedData);
}

fs.mkdirSync(path.dirname(resultsFilePath), { recursive: true });
fs.writeFileSync(resultsFilePath, JSON.stringify(accumulatedResults, null, 2));
