import { dbConfig, validateConfig } from './src/config/database.js';
import dbFactory from './src/database/connectionFactory.js';

async function debugSetup() {
  try {
    console.log('1. Testing config validation...');
    validateConfig();
    console.log('✅ Config is valid');
    
    console.log('2. Testing database connection...');
    const db = await dbFactory.createConnection();
    console.log('✅ Database connected');
    
    console.log('3. Testing simple query...');
    const result = await db.query('SELECT 1 as test');
    console.log('✅ Query successful:', result);
    
    await dbFactory.closeConnection();
    console.log('✅ Setup debug completed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugSetup();