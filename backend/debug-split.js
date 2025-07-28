/**
 * ============================================================================
 * debug-split.js
 *
 * This script reads a SQL migration file and splits its contents into
 * individual SQL statements for debugging purposes. It prints the raw SQL,
 * then prints each parsed statement (excluding comments and empty lines).
 *
 * Usage:
 *   node debug-split.js
 *
 * Intended for debugging SQL migration parsing and statement splitting logic.
 * ============================================================================
 */

import fs from 'fs/promises';

async function debugSplit() {
  const migrationSQL = await fs.readFile('./src/database/migrations/sqlite/003_create_tasks.sql', 'utf-8');
  
  console.log('Raw SQL:');
  console.log(migrationSQL);
  console.log('\n---\n');
  
  const statements = migrationSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  
  console.log('Split statements:');
  statements.forEach((stmt, i) => {
    console.log(`${i + 1}:`, stmt.substring(0, 100) + (stmt.length > 100 ? '...' : ''));
  });
}

debugSplit();