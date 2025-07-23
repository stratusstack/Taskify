import fs from 'fs/promises';

async function debugSplit() {
  const migrationSQL = await fs.readFile('./src/database/migrations/sqlite/003_create_tasks.sql', 'utf-8');
  
  const allSplits = migrationSQL.split(';');
  console.log('All splits (before filtering):');
  allSplits.forEach((stmt, i) => {
    console.log(`${i + 1}: "${stmt.substring(0, 100)}${stmt.length > 100 ? '...' : ''}"`);
  });
  
  console.log('\n---\n');
  
  const statements = migrationSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  
  console.log('Final statements:');
  statements.forEach((stmt, i) => {
    console.log(`${i + 1}: "${stmt.substring(0, 100)}${stmt.length > 100 ? '...' : ''}"`);
  });
}

debugSplit();