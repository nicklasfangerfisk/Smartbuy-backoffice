const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Note: In a real environment, you'd use environment variables
// For now, we'll create the migration script that can be run manually

const migrationSQL = fs.readFileSync(
  path.join(__dirname, 'migrations/2025-07-02-improve-stock-movements.sql'), 
  'utf8'
);

console.log('='.repeat(60));
console.log('DATABASE MIGRATION: Improve Stock Movements (Option 1)');
console.log('='.repeat(60));
console.log('\nThis migration will:');
console.log('1. Remove the quantity > 0 constraint');
console.log('2. Allow negative quantities for adjustments only');
console.log('3. Add database-level negative stock prevention');
console.log('4. Create triggers to maintain data integrity');
console.log('\n' + '='.repeat(60));
console.log('SQL MIGRATION TO RUN:');
console.log('='.repeat(60));
console.log(migrationSQL);
console.log('='.repeat(60));
console.log('\nTo apply this migration:');
console.log('1. Copy the SQL above');
console.log('2. Run it in your Supabase SQL editor');
console.log('3. Or use: npx supabase db reset (if using local dev)');
console.log('4. Then run: node update-code.js');
console.log('='.repeat(60));
