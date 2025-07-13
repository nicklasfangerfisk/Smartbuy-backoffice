const { execSync } = require('child_process');

function getGitChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    // Get list of changed files (both staged and unstaged)
    const changedFiles = [];
    const statusLines = status.split('\n').filter(line => line.trim());
    
    for (const line of statusLines) {
      if (line.length >= 3) {
        const fileName = line.substring(3).trim();
        if (fileName && !fileName.includes('RELEASE_LOG.md') && !fileName.includes('package.json')) {
          changedFiles.push(fileName);
        }
      }
    }
    
    // Analyze the actual file changes to generate meaningful descriptions
    let changeDescriptions = [];
    
    for (const file of changedFiles) {
      try {
        // Get the diff for this file
        const diff = execSync(`git diff HEAD -- "${file}"`, { encoding: 'utf8' });
        if (diff) {
          // Analyze the diff to understand what changed
          const description = analyzeFileDiff(file, diff);
          if (description) {
            changeDescriptions.push(description);
          }
        }
      } catch (diffError) {
        // If git diff fails, just note the file was changed
        const description = analyzeFileByName(file);
        if (description) {
          changeDescriptions.push(description);
        }
      }
    }
    
    return { 
      hasChanges: changedFiles.length > 0, 
      recentFiles: changedFiles,
      commitMessages: changeDescriptions // Use change descriptions instead of commit messages
    };
  } catch (error) {
    return { hasChanges: false, recentFiles: [], commitMessages: [] };
  }
}

function analyzeFileDiff(fileName, diff) {
  const lowerName = fileName.toLowerCase();
  const diffLower = diff.toLowerCase();
  
  if (lowerName.includes('release') || lowerName.includes('automation')) {
    return `Enhanced release automation logic`;
  }
  
  // Analyze based on file type and content
  if (lowerName.includes('component') || lowerName.includes('.tsx') || lowerName.includes('.jsx')) {
    if (diffLower.includes('+') && diffLower.includes('function') || diffLower.includes('const ')) {
      return `Enhanced ${fileName.split('/').pop()} component functionality`;
    }
    if (diffLower.includes('style') || diffLower.includes('css')) {
      return `Updated ${fileName.split('/').pop()} component styling`;
    }
    return `Modified ${fileName.split('/').pop()} component`;
  }
  
  return `Updated ${fileName.split('/').pop()}`;
}

function analyzeFileByName(fileName) {
  if (fileName.toLowerCase().includes('release') || fileName.toLowerCase().includes('automation')) {
    return `Updated release automation system`;
  }
  
  const baseName = fileName.split('/').pop().replace(/\.tsx?$/, '').replace(/\.jsx?$/, '');
  return `Updated ${baseName}`;
}

console.log('Testing getGitChanges function:');
const result = getGitChanges();
console.log(JSON.stringify(result, null, 2));
