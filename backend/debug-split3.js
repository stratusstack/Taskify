import fs from 'fs/promises';

async function debugSplit() {
  const migrationSQL = await fs.readFile('./src/database/migrations/sqlite/003_create_tasks.sql', 'utf-8');
  
  const allSplits = migrationSQL.split(';');
  
  console.log('First split (trimmed):');
  const firstSplit = allSplits[0].trim();
  console.log(`"${firstSplit}"`);
  console.log('Starts with --:', firstSplit.startsWith('--'));
  console.log('Length:', firstSplit.length);
  
  // Test if first split contains CREATE TABLE
  console.log('Contains CREATE TABLE:', firstSplit.includes('CREATE TABLE'));
}

debugSplit();