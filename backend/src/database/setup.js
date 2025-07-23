import dbFactory from './connectionFactory.js';
import MigrationRunner from './migrationRunner.js';

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // Initialize database connection
    const dbConnection = await dbFactory.createConnection();
    console.log('✅ Database connection established');
    
    // Run migrations
    const migrationRunner = new MigrationRunner(dbConnection);
    await migrationRunner.runMigrations();
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await dbFactory.closeConnection();
  }
}

// Run setup if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  setupDatabase();
}

export default setupDatabase;