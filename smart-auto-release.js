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
  
  return '1.0.0';
}

function getGitChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    // Get list of changed files (both staged and unstaged)
    const changedFiles = [];
    const statusLines = status.split('\n').filter(line => line.trim());
    
    for (const line of statusLines) {
      if (line.length >= 3) {
        const statusCode = line.substring(0, 2);
        const fileName = line.substring(3).trim();
        if (fileName && !fileName.includes('RELEASE_LOG.md') && !fileName.includes('package.json')) {
          changedFiles.push({ file: fileName, status: statusCode });
        }
      }
    }
    
    // Analyze the actual file changes to generate meaningful descriptions
    let changeDescriptions = [];
    
    for (const fileInfo of changedFiles) {
      try {
        // Determine which diff command to use based on file status
        let diffCommand;
        if (fileInfo.status.startsWith('A')) {
          // New file - use staged diff
          diffCommand = `git diff --cached -- "${fileInfo.file}"`;
        } else if (fileInfo.status[0] !== ' ') {
          // Staged changes - use cached diff
          diffCommand = `git diff --cached -- "${fileInfo.file}"`;
        } else {
          // Unstaged changes - use working tree diff
          diffCommand = `git diff HEAD -- "${fileInfo.file}"`;
        }
        
        const diff = execSync(diffCommand, { encoding: 'utf8' });
        if (diff) {
          // Analyze the diff to understand what changed
          const description = analyzeFileDiff(fileInfo.file, diff);
          if (description) {
            changeDescriptions.push(description);
          }
        }
      } catch (diffError) {
        // If git diff fails, just note the file was changed
        const description = analyzeFileByName(fileInfo.file);
        if (description) {
          changeDescriptions.push(description);
        }
      }
    }
    
    return { 
      hasChanges: changedFiles.length > 0, 
      recentFiles: changedFiles.map(f => f.file),
      commitMessages: changeDescriptions // Use change descriptions instead of commit messages
    };
  } catch (error) {
    return { hasChanges: false, recentFiles: [], commitMessages: [] };
  }
}

function generateReleaseTitle(versionType, recentFiles, commitMessages = []) {
  // Try to generate title from commit messages first
  if (commitMessages.length > 0) {
    const commitText = commitMessages.join(' ').toLowerCase();
    
    // Look for specific patterns in commits
    if (commitText.includes('timezone') || commitText.includes('time')) {
      return 'Timezone and Time Handling Fixes';
    }
    if (commitText.includes('purchase order') || commitText.includes('po ')) {
      return versionType === 'major' ? 'Purchase Order System Overhaul' : 
             versionType === 'minor' ? 'Purchase Order Enhancements' : 'Purchase Order Bug Fixes';
    }
    if (commitText.includes('supplier')) {
      return versionType === 'major' ? 'Supplier Management Redesign' : 
             versionType === 'minor' ? 'Supplier Feature Enhancements' : 'Supplier Bug Fixes';
    }
    if (commitText.includes('form') || commitText.includes('dialog')) {
      return versionType === 'major' ? 'Form System Redesign' : 
             versionType === 'minor' ? 'Form Improvements' : 'Form Bug Fixes';
    }
    if (commitText.includes('mobile') || commitText.includes('responsive')) {
      return versionType === 'major' ? 'Mobile Experience Overhaul' : 
             versionType === 'minor' ? 'Mobile Enhancements' : 'Mobile Bug Fixes';
    }
    if (commitText.includes('release') || commitText.includes('automation')) {
      return 'Release Automation Improvements';
    }
  }

  // Fallback to file-based detection
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

function generateReleaseContent(versionType, recentFiles, commitMessages = []) {
  const content = { Added: [], Changed: [], Fixed: [] };
  
  // Parse commit messages for meaningful content
  const processedCommits = new Set(); // Avoid duplicates
  
  for (const commit of commitMessages) {
    const lowerCommit = commit.toLowerCase();
    
    // Skip generic, automated, or release commits
    if (lowerCommit.includes('merge') || 
        lowerCommit.includes('bump version') || 
        lowerCommit.includes('release') ||
        lowerCommit.startsWith('v3.') ||
        lowerCommit.startsWith('v2.') ||
        lowerCommit.startsWith('v1.') ||
        lowerCommit.includes(': ') && (lowerCommit.includes('v3.') || lowerCommit.includes('v2.')) ||
        processedCommits.has(commit)) {
      continue;
    }
    
    processedCommits.add(commit);
    
    // Categorize based on commit message keywords or content
    if (lowerCommit.includes('add') || lowerCommit.includes('implement') || lowerCommit.includes('create') || lowerCommit.includes('new') || lowerCommit.includes('enhanced')) {
      content.Added.push(commit.charAt(0).toUpperCase() + commit.slice(1));
    } else if (lowerCommit.includes('fix') || lowerCommit.includes('resolve') || lowerCommit.includes('correct') || lowerCommit.includes('bug') || lowerCommit.includes('fixed')) {
      content.Fixed.push(commit.charAt(0).toUpperCase() + commit.slice(1));
    } else if (lowerCommit.includes('update') || lowerCommit.includes('enhance') || lowerCommit.includes('improve') || lowerCommit.includes('change') || lowerCommit.includes('modified')) {
      content.Changed.push(commit.charAt(0).toUpperCase() + commit.slice(1));
    } else {
      // For our analyzed descriptions, use smart categorization
      if (lowerCommit.includes('timezone') || lowerCommit.includes('time') || lowerCommit.includes('automation') || lowerCommit.includes('detection')) {
        content.Fixed.push(commit.charAt(0).toUpperCase() + commit.slice(1));
      } else if (lowerCommit.includes('component') || lowerCommit.includes('page') || lowerCommit.includes('form')) {
        content.Changed.push(commit.charAt(0).toUpperCase() + commit.slice(1));
      } else {
        // Default to Changed for other analyzed content
        content.Changed.push(commit.charAt(0).toUpperCase() + commit.slice(1));
      }
    }
  }
  
  // If no meaningful commits found, fall back to generic content
  if (content.Added.length === 0 && content.Changed.length === 0 && content.Fixed.length === 0) {
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
  const releaseLogPath = path.join(__dirname, 'public/RELEASE_LOG.md');
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

function analyzeFileDiff(fileName, diff) {
  const lowerName = fileName.toLowerCase();
  const diffLower = diff.toLowerCase();
  
  // Special handling for automation files
  if (lowerName.includes('release') || lowerName.includes('automation')) {
    if (diffLower.includes('timezone') || diffLower.includes('copenhagen')) {
      return 'Fixed timezone handling in release automation';
    }
    if (diffLower.includes('diff') || diffLower.includes('git status')) {
      return 'Enhanced change detection in release automation';
    }
    if (diffLower.includes('analyze') || diffLower.includes('description')) {
      return 'Improved release note generation logic';
    }
    return 'Enhanced release automation system';
  }
  
  // Analyze based on file type and content
  if (lowerName.includes('component') || lowerName.includes('.tsx') || lowerName.includes('.jsx')) {
    if (diffLower.includes('+') && (diffLower.includes('function') || diffLower.includes('const '))) {
      return `Enhanced ${fileName.split('/').pop()} component functionality`;
    }
    if (diffLower.includes('style') || diffLower.includes('css')) {
      return `Updated ${fileName.split('/').pop()} component styling`;
    }
    return `Modified ${fileName.split('/').pop()} component`;
  }
  
  if (lowerName.includes('page') && (lowerName.includes('.tsx') || lowerName.includes('.jsx'))) {
    return `Updated ${fileName.split('/').pop().replace(/\.tsx?$/, '')} page functionality`;
  }
  
  if (lowerName.includes('dialog') || lowerName.includes('modal')) {
    return `Improved ${fileName.split('/').pop().replace(/\.tsx?$/, '')} dialog/modal`;
  }
  
  if (lowerName.includes('form')) {
    return `Enhanced ${fileName.split('/').pop().replace(/\.tsx?$/, '')} form functionality`;
  }
  
  if (lowerName.includes('api') || lowerName.includes('service')) {
    return `Updated ${fileName.split('/').pop()} API/service logic`;
  }
  
  if (lowerName.includes('util') || lowerName.includes('helper')) {
    return `Improved ${fileName.split('/').pop()} utility functions`;
  }
  
  return null; // Skip files we can't meaningfully describe
}

function analyzeFileByName(fileName) {
  const baseName = fileName.split('/').pop().replace(/\.tsx?$/, '').replace(/\.jsx?$/, '');
  
  if (fileName.toLowerCase().includes('component')) {
    return `Updated ${baseName} component`;
  }
  
  if (fileName.toLowerCase().includes('page')) {
    return `Modified ${baseName} page`;
  }
  
  return `Updated ${baseName}`;
}

function main() {
  try {
    // Get command line argument for version type
    const versionType = process.argv[2] || 'patch';
    
    if (!['major', 'minor', 'patch'].includes(versionType)) {
      log('❌ Invalid version type. Use: major, minor, or patch', 'red');
      log('Usage: npm run smart-release patch', 'yellow');
      log('       npm run smart-release minor', 'yellow');
      log('       npm run smart-release major', 'yellow');
      process.exit(1);
    }
    
    log('🚀 SmartBack Auto-Release Mode', 'magenta');
    log('===============================', 'magenta');
    
    // Get current version and increment
    const currentVersion = getCurrentVersion();
    const newVersion = incrementVersion(currentVersion, versionType);
    
    log(`📦 Current version: ${currentVersion}`, 'cyan');
    log(`📈 New version: ${newVersion} (${versionType})`, 'green');
    
    // Analyze git changes
    const { hasChanges, recentFiles, commitMessages } = getGitChanges();
    log(`📊 Recent files changed: ${recentFiles.length}`, 'cyan');
    log(`📝 Recent commits found: ${commitMessages.length}`, 'cyan');
    
    // Generate release content automatically
    const title = generateReleaseTitle(versionType, recentFiles, commitMessages);
    const sections = generateReleaseContent(versionType, recentFiles, commitMessages);
    
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
    
    log('\n🎉 SmartBack Auto-Release completed successfully!', 'green');
    log('==============================================', 'green');
    log(`📦 Version: ${newVersion}`, 'cyan');
    log(`🕐 Timestamp: ${getCurrentCopenhagenTime()}`, 'cyan');
    log(`📋 Title: ${title}`, 'cyan');
    log(`🏷️  Tag: v${newVersion}`, 'cyan');
    log(`🤖 Generated by: SmartBack Auto-Release`, 'cyan');
    
  } catch (error) {
    log(`\n❌ Auto-release failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
