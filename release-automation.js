#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getCurrentCopenhagenTime() {
  // Use proper Copenhagen timezone with automatic DST handling
  const now = new Date();
  const copenhagenTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Copenhagen"}));
  
  const year = copenhagenTime.getFullYear();
  const month = String(copenhagenTime.getMonth() + 1).padStart(2, '0');
  const day = String(copenhagenTime.getDate()).padStart(2, '0');
  const hours = String(copenhagenTime.getHours()).padStart(2, '0');
  const minutes = String(copenhagenTime.getMinutes()).padStart(2, '0');
  const seconds = String(copenhagenTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function incrementVersion(currentVersion, type) {
  const parts = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2]++;
      break;
  }
  
  return parts.join('.');
}

function getCurrentVersion() {
  const releaseLogPath = path.join(__dirname, 'public/RELEASE_LOG.md');
  const releaseLog = fs.readFileSync(releaseLogPath, 'utf8');
  
  const lines = releaseLog.split('\n');
  let pastComments = false;
  
  for (const line of lines) {
    if (line.includes('-->')) {
      pastComments = true;
      continue;
    }
    
    if (pastComments) {
      const versionMatch = line.match(/## \[(\d+\.\d+\.\d+)\]/);
      if (versionMatch) {
        return versionMatch[1];
      }
    }
  }
  
  return '1.0.0'; // fallback
}

function createReleaseEntry(version, title, sections) {
  const timestamp = getCurrentCopenhagenTime();
  let entry = `## [${version}] - ${timestamp}\n`;
  entry += `**${title}**\n`;
  
  // Add sections (Added, Changed, Fixed)
  for (const [sectionName, items] of Object.entries(sections)) {
    if (items && items.length > 0) {
      entry += `### ${sectionName}\n`;
      for (const item of items) {
        entry += `- ${item}\n`;
      }
      entry += '\n';
    }
  }
  
  return entry;
}

function updateReleaseLog(newEntry) {
  const releaseLogPath = path.join(__dirname, 'public/RELEASE_LOG.md');
  const content = fs.readFileSync(releaseLogPath, 'utf8');

  // Find the insertion point (after the comment block)
  const commentEndIndex = content.indexOf('-->');
  if (commentEndIndex === -1) {
    throw new Error('Could not find comment block end in RELEASE_LOG.md');
  }
  
  const insertionPoint = content.indexOf('\n', commentEndIndex) + 1;
  const beforeInsertion = content.substring(0, insertionPoint);
  const afterInsertion = content.substring(insertionPoint);
  
  const updatedContent = beforeInsertion + '\n' + newEntry + afterInsertion;
  
  fs.writeFileSync(releaseLogPath, updatedContent);
}

function runCommand(command, description) {
  log(`🔄 ${description}...`, 'blue');
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} completed`, 'green');
    return output;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    throw error;
  }
}

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function askMultipleItems(sectionName) {
  return new Promise(async (resolve) => {
    const items = [];
    log(`\n📝 Enter ${sectionName} items (press Enter on empty line to finish):`, 'cyan');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const askForItem = () => {
      rl.question('- ', (answer) => {
        if (answer.trim() === '') {
          rl.close();
          resolve(items);
        } else {
          items.push(answer.trim());
          askForItem();
        }
      });
    };
    
    askForItem();
  });
}

async function main() {
  try {
    log('🚀 SmartBack Release Automation Tool', 'magenta');
    log('=====================================', 'magenta');
    
    // Get current version
    const currentVersion = getCurrentVersion();
    log(`📦 Current version: ${currentVersion}`, 'cyan');
    
    // Ask for version increment type
    const versionType = await askQuestion('\n🔢 Version increment type (major/minor/patch) [patch]: ');
    const incrementType = versionType.toLowerCase() || 'patch';
    
    if (!['major', 'minor', 'patch'].includes(incrementType)) {
      log('❌ Invalid version type. Must be major, minor, or patch.', 'red');
      process.exit(1);
    }
    
    const newVersion = incrementVersion(currentVersion, incrementType);
    log(`📈 New version: ${newVersion}`, 'green');
    
    // Ask for release title
    const title = await askQuestion('\n📋 Release title: ');
    if (!title) {
      log('❌ Release title is required.', 'red');
      process.exit(1);
    }
    
    // Ask for sections
    const sections = {};
    
    const wantAdded = await askQuestion('\n➕ Include "Added" section? (y/n) [n]: ');
    if (wantAdded.toLowerCase() === 'y') {
      sections.Added = await askMultipleItems('Added');
    }
    
    const wantChanged = await askQuestion('\n🔄 Include "Changed" section? (y/n) [n]: ');
    if (wantChanged.toLowerCase() === 'y') {
      sections.Changed = await askMultipleItems('Changed');
    }
    
    const wantFixed = await askQuestion('\n🔧 Include "Fixed" section? (y/n) [n]: ');
    if (wantFixed.toLowerCase() === 'y') {
      sections.Fixed = await askMultipleItems('Fixed');
    }
    
    // Create release entry
    log('\n📝 Creating release entry...', 'blue');
    const releaseEntry = createReleaseEntry(newVersion, title, sections);
    
    log('\n📋 Release entry preview:', 'yellow');
    log('-------------------------', 'yellow');
    console.log(releaseEntry);
    log('-------------------------', 'yellow');
    
    const confirm = await askQuestion('\n✅ Proceed with this release? (y/n) [y]: ');
    if (confirm.toLowerCase() === 'n') {
      log('❌ Release cancelled.', 'red');
      process.exit(0);
    }
    
    // Update release log
    log('\n📝 Updating RELEASE_LOG.md...', 'blue');
    updateReleaseLog(releaseEntry);
    log('✅ RELEASE_LOG.md updated', 'green');
    
    // Sync version
    runCommand('npm run sync-version', 'Syncing version');
    
    // Build application
    runCommand('npm run build', 'Building application');
    
    // Git operations
    runCommand('git add .', 'Staging changes');
    runCommand(`git commit -m "Release ${newVersion}: ${title}"`, 'Committing changes');
    runCommand('git push', 'Pushing to repository');
    
    // Tag the release
    runCommand(`git tag -a v${newVersion} -m "Release ${newVersion}: ${title}"`, 'Creating release tag');
    runCommand('git push --tags', 'Pushing tags');
    
    log('\n🎉 Release completed successfully!', 'green');
    log('===================================', 'green');
    log(`📦 Version: ${newVersion}`, 'cyan');
    log(`🕐 Timestamp: ${getCurrentCopenhagenTime()}`, 'cyan');
    log(`📋 Title: ${title}`, 'cyan');
    log(`🏷️  Tag: v${newVersion}`, 'cyan');
    log(`🔗 Repository: Updated and pushed`, 'cyan');
    
  } catch (error) {
    log(`\n❌ Release failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the main function
main();
