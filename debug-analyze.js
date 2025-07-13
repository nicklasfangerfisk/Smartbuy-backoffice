const { execSync } = require('child_process');

function analyzeFileDiff(fileName, diff) {
  console.log(`Analyzing file: ${fileName}`);
  console.log(`Diff length: ${diff.length}`);
  
  const lowerName = fileName.toLowerCase();
  const diffLower = diff.toLowerCase();
  
  console.log(`Lower name: ${lowerName}`);
  console.log(`Contains release: ${lowerName.includes('release')}`);
  console.log(`Contains automation: ${lowerName.includes('automation')}`);
  
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
  
  return `Updated ${fileName}`;
}

// Test with smart-auto-release.js
console.log('Testing with smart-auto-release.js:');
try {
  const diff = execSync('git diff --cached -- "smart-auto-release.js"', { encoding: 'utf8' });
  console.log('Diff exists:', !!diff);
  if (diff) {
    const result = analyzeFileDiff('smart-auto-release.js', diff);
    console.log('Analysis result:', result);
  } else {
    console.log('No diff found for smart-auto-release.js');
  }
} catch (error) {
  console.log('Error getting diff:', error.message);
}
