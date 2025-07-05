#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
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
  const now = new Date();
  // Copenhagen time approximation
  const copenhagenOffset = now.getTimezoneOffset() === -60 ? 1 : 2;
  const copenhagenTime = new Date(now.getTime() + (copenhagenOffset * 60 * 60 * 1000));
  
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
  const releaseLogPath = path.join(__dirname, 'documentation', 'RELEASE_LOG.md');
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
  
  return '1.0.0';
}

function getGitChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const diff = execSync('git diff --name-only HEAD~1', { encoding: 'utf8' }).trim();
    return { hasChanges: status.length > 0, recentFiles: diff.split('\n').filter(f => f) };
  } catch (error) {
    return { hasChanges: false, recentFiles: [] };
  }
}

function generateReleaseTitle(versionType, recentFiles) {
  const titles = {
    major: [
      'Major System Upgrade',
      'Breaking Changes and Enhancements',
      'Complete System Overhaul',
      'Major Feature Release'
    ],
    minor: [
      'New Features and Improvements',
      'Feature Enhancement Release',
      'System Improvements',
      'Enhanced Functionality'
    ],
    patch: [
      'Bug Fixes and Stability',
      'Maintenance Release',
      'Bug Fixes and Minor Improvements',
      'Stability and Performance Fixes'
    ]
  };
  
  // Try to be smart about the title based on files changed
  if (recentFiles.some(f => f.includes('src/Page'))) {
    return versionType === 'major' ? 'Major UI Overhaul' : 
           versionType === 'minor' ? 'New Page Features' : 'UI Bug Fixes';
  }
  
  if (recentFiles.some(f => f.includes('documentation'))) {
    return versionType === 'major' ? 'Major Documentation Update' : 
           versionType === 'minor' ? 'Documentation Enhancements' : 'Documentation Fixes';
  }
  
  if (recentFiles.some(f => f.includes('component'))) {
    return versionType === 'major' ? 'Component System Redesign' : 
           versionType === 'minor' ? 'New Component Features' : 'Component Bug Fixes';
  }
  
  // Default to random title from category
  const categoryTitles = titles[versionType] || titles.patch;
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
}

function generateReleaseContent(versionType, recentFiles) {
  const content = { Added: [], Changed: [], Fixed: [] };
  
  // Generate content based on version type and files changed
  if (versionType === 'major') {
    content.Added.push('Major system architecture improvements');
    content.Changed.push('Complete redesign of core components');
    content.Changed.push('Updated user interface and experience');
    if (recentFiles.some(f => f.includes('src/'))) {
      content.Added.push('New application features and capabilities');
    }
  } else if (versionType === 'minor') {
    content.Added.push('New feature implementations');
    content.Changed.push('Enhanced existing functionality');
    content.Changed.push('Improved user experience');
    if (recentFiles.some(f => f.includes('documentation'))) {
      content.Added.push('Updated documentation and guides');
    }
  } else {
    content.Fixed.push('Bug fixes and stability improvements');
    content.Fixed.push('Performance optimizations');
    if (recentFiles.some(f => f.includes('src/'))) {
      content.Fixed.push('Resolved user interface issues');
    }
    if (recentFiles.some(f => f.includes('documentation'))) {
      content.Fixed.push('Updated documentation accuracy');
    }
  }
  
  return content;
}

function createReleaseEntry(version, title, sections) {
  const timestamp = getCurrentCopenhagenTime();
  let entry = `## [${version}] - ${timestamp}\n`;
  entry += `**${title}**\n`;
  
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
  const releaseLogPath = path.join(__dirname, 'documentation', 'RELEASE_LOG.md');
  const content = fs.readFileSync(releaseLogPath, 'utf8');
  
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
    execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} completed`, 'green');
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    throw error;
  }
}

function main() {
  try {
    // Get command line argument for version type
    const versionType = process.argv[2] || 'patch';
    
    if (!['major', 'minor', 'patch'].includes(versionType)) {
      log('❌ Invalid version type. Use: major, minor, or patch', 'red');
      log('Usage: npm run copilot-release patch', 'yellow');
      log('       npm run copilot-release minor', 'yellow');
      log('       npm run copilot-release major', 'yellow');
      process.exit(1);
    }
    
    log('🤖 Copilot Auto-Release Mode', 'magenta');
    log('===========================', 'magenta');
    
    // Get current version and increment
    const currentVersion = getCurrentVersion();
    const newVersion = incrementVersion(currentVersion, versionType);
    
    log(`📦 Current version: ${currentVersion}`, 'cyan');
    log(`📈 New version: ${newVersion} (${versionType})`, 'green');
    
    // Analyze git changes
    const { hasChanges, recentFiles } = getGitChanges();
    log(`📊 Recent files changed: ${recentFiles.length}`, 'cyan');
    
    // Generate release content automatically
    const title = generateReleaseTitle(versionType, recentFiles);
    const sections = generateReleaseContent(versionType, recentFiles);
    
    log(`📋 Generated title: ${title}`, 'yellow');
    log(`📝 Generated ${Object.keys(sections).filter(k => sections[k].length > 0).length} sections`, 'yellow');
    
    // Create release entry
    const releaseEntry = createReleaseEntry(newVersion, title, sections);
    
    log('\n📋 Auto-generated release entry:', 'yellow');
    log('--------------------------------', 'yellow');
    console.log(releaseEntry);
    log('--------------------------------', 'yellow');
    
    // Update release log
    log('📝 Updating RELEASE_LOG.md...', 'blue');
    updateReleaseLog(releaseEntry);
    log('✅ RELEASE_LOG.md updated', 'green');
    
    // Execute release workflow
    runCommand('npm run sync-version', 'Syncing version');
    runCommand('npm run build', 'Building application');
    runCommand('git add .', 'Staging changes');
    runCommand(`git commit -m "Release ${newVersion}: ${title}"`, 'Committing changes');
    runCommand('git push', 'Pushing to repository');
    runCommand(`git tag -a v${newVersion} -m "Release ${newVersion}: ${title}"`, 'Creating release tag');
    runCommand('git push --tags', 'Pushing tags');
    
    log('\n🎉 Copilot Auto-Release completed successfully!', 'green');
    log('============================================', 'green');
    log(`📦 Version: ${newVersion}`, 'cyan');
    log(`🕐 Timestamp: ${getCurrentCopenhagenTime()}`, 'cyan');
    log(`📋 Title: ${title}`, 'cyan');
    log(`🏷️  Tag: v${newVersion}`, 'cyan');
    log(`🤖 Generated by: Copilot Auto-Release`, 'cyan');
    
  } catch (error) {
    log(`\n❌ Auto-release failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
