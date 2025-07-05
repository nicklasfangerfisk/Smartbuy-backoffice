#!/usr/bin/env node

// Validation script to check if release automation is properly set up

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'cyan') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description}`, 'red');
    return false;
  }
}

function checkPackageScript(scriptName) {
  const packagePath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (packageJson.scripts && packageJson.scripts[scriptName]) {
      log(`✅ npm script "${scriptName}" exists`, 'green');
      return true;
    } else {
      log(`❌ npm script "${scriptName}" missing`, 'red');
      return false;
    }
  } else {
    log(`❌ package.json not found`, 'red');
    return false;
  }
}

function main() {
  log('🔍 Release Automation Validation', 'magenta');
  log('================================', 'magenta');
  
  let allChecksPass = true;
  
  // Check required files
  allChecksPass &= checkFile('release-automation.js', 'Release automation script');
  allChecksPass &= checkFile('copilot-auto-release.js', 'Copilot auto-release script');
  allChecksPass &= checkFile('sync-version.js', 'Version sync script');
  allChecksPass &= checkFile('documentation/RELEASE_LOG.md', 'Release log');
  allChecksPass &= checkFile('documentation/RELEASE_AUTOMATION.md', 'Automation documentation');
  allChecksPass &= checkFile('documentation/COPILOT_AUTO_RELEASE.md', 'Copilot documentation');
  
  // Check package.json scripts
  allChecksPass &= checkPackageScript('copilot-patch');
  allChecksPass &= checkPackageScript('copilot-minor');
  allChecksPass &= checkPackageScript('copilot-major');
  allChecksPass &= checkPackageScript('auto-release');
  allChecksPass &= checkPackageScript('sync-version');
  allChecksPass &= checkPackageScript('release');
  allChecksPass &= checkPackageScript('build');
  
  // Check file permissions
  try {
    fs.accessSync(path.join(__dirname, 'release-automation.js'), fs.constants.X_OK);
    log('✅ Release automation script is executable', 'green');
  } catch (error) {
    log('❌ Release automation script is not executable', 'red');
    allChecksPass = false;
  }
  
  log('\n' + '='.repeat(40), 'magenta');
  if (allChecksPass) {
    log('🎉 All checks passed! Copilot Auto-Release is ready.', 'green');
    log('\n🤖 Copilot Commands (Recommended):', 'cyan');
    log('npm run copilot-patch    # Bug fixes', 'yellow');
    log('npm run copilot-minor    # New features', 'yellow');
    log('npm run copilot-major    # Breaking changes', 'yellow');
    log('\n📋 Interactive Command:', 'cyan');
    log('npm run auto-release     # Manual entry', 'yellow');
  } else {
    log('❌ Some checks failed. Please fix the issues above.', 'red');
  }
}

main();
