const fs = require('fs');
const path = require('path');

// Read the release log
const releaseLogPath = path.join(__dirname, 'RELEASE_LOG.md');
const releaseLog = fs.readFileSync(releaseLogPath, 'utf8');

// Extract the latest version - find first version after the comment block ends
const lines = releaseLog.split('\n');
let latestVersion = null;
let pastComments = false;

for (const line of lines) {
  // Look for the end of comments
  if (line.includes('-->')) {
    pastComments = true;
    continue;
  }
  
  // Only start looking for versions after we're past the comment block
  if (pastComments) {
    const versionMatch = line.match(/## \[(\d+\.\d+\.\d+)\]/);
    if (versionMatch) {
      latestVersion = versionMatch[1];
      break; // Take the first version found after comments
    }
  }
}

if (!latestVersion) {
  console.error('❌ Could not find version in RELEASE_LOG.md');
  process.exit(1);
}

// Read package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

console.log(`Current package.json version: ${currentVersion}`);
console.log(`Latest release log version: ${latestVersion}`);

if (currentVersion !== latestVersion) {
  console.log('⚠️  Version mismatch detected!');
  console.log(`Updating package.json from ${currentVersion} to ${latestVersion}`);
  
  // Update package.json
  packageJson.version = latestVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log('✅ Version synchronized successfully!');
} else {
  console.log('✅ Versions are already in sync!');
}

// Also check if we need to update the build version display anywhere
console.log(`\n📦 Build version is now: ${latestVersion}`);
