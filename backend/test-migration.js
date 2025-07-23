import fs from 'fs/promises';
import dbFactory from './src/database/connectionFactory.js';

async function testMigration() {
  try {
    console.log('Testing migration execution...');
    
    const db = await dbFactory.createConnection();
    
    // Read the tasks migration file
    const migrationSQL = await fs.readFile('./src/database/migrations/sqlite/003_create_tasks.sql', 'utf-8');
    console.log('Migration SQL:', migrationSQL);
    
    // Split and execute statements one by one
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log('Statements to execute:', statements.length);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}:`, statement.substring(0, 100) + '...');
      
      try {
        await db.query(statement);
        console.log(`✅ Statement ${i + 1} completed`);
      } catch (error) {
        console.error(`❌ Statement ${i + 1} failed:`, error.message);
        break;
      }
    }
    
    await dbFactory.closeConnection();
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMigration();