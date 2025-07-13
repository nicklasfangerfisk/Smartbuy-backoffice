const { execSync } = require('child_process');

// Test: Make a change and see what gets detected
console.log('Making a test change...');

// Create a small test change
const fs = require('fs');
const testContent = `// Test change - ${new Date().toISOString()}\nconsole.log('test');`;
fs.writeFileSync('test-file.js', testContent);

console.log('Staging the test file...');
execSync('git add test-file.js');

// Now test our detection
const status = execSync('git status --porcelain', { encoding: 'utf8' });
console.log('Git status result:', JSON.stringify(status));

const statusLines = status.split('\n').filter(line => line.trim());
for (const line of statusLines) {
  if (line.length >= 3) {
    const statusCode = line.substring(0, 2);
    const fileName = line.substring(3).trim();
    console.log(`File: ${fileName}, Status: "${statusCode}"`);
    
    if (fileName === 'test-file.js') {
      try {
        const diff = execSync(`git diff --cached -- "${fileName}"`, { encoding: 'utf8' });
        console.log('Diff result:', diff ? 'HAS DIFF' : 'NO DIFF');
        if (diff) {
          console.log('Diff content length:', diff.length);
          console.log('First 200 chars:', diff.substring(0, 200));
        }
      } catch (error) {
        console.log('Diff error:', error.message);
      }
    }
  }
}

// Clean up
execSync('git reset HEAD test-file.js');
fs.unlinkSync('test-file.js');
