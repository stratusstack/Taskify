import dbFactory from './connectionFactory.js';
import MigrationRunner from './migrationRunner.js';

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Initialize database connection
    const dbConnection = await dbFactory.createConnection();
    
    // Create migration runner
    const migrationRunner = new MigrationRunner(dbConnection);
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'up':
      case undefined:
        await migrationRunner.runMigrations();
        break;
        
      case 'rollback':
        await migrationRunner.rollbackLastMigration();
        break;
        
      default:
        console.log('Usage:');
        console.log('  npm run db:migrate        # Run pending migrations');
        console.log('  npm run db:migrate up     # Run pending migrations');
        console.log('  npm run db:migrate rollback # Rollback last migration');
        process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await dbFactory.closeConnection();
  }
}

// Run migrations if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runMigrations();
}

export default runMigrations;