/**
 * DATABASE MIGRATION CLI UTILITY
 * 
 * Command-line interface for database migration management in the Taskify backend.
 * This module provides a comprehensive migration control system with support for
 * running migrations, rollbacks, and migration status management.
 * 
 * CORE FUNCTIONALITY:
 * - Command-line migration execution with argument parsing
 * - Forward migration execution (up migrations)
 * - Rollback capability for development and recovery
 * - Migration status reporting and validation
 * - Database connection management and cleanup
 * 
 * COMMAND INTERFACE:
 * - npm run db:migrate        - Execute all pending migrations
 * - npm run db:migrate up     - Execute pending migrations (explicit)
 * - npm run db:migrate rollback - Rollback the last migration
 * 
 * MIGRATION OPERATIONS:
 * - Up Migrations: Apply new schema changes and data modifications
 * - Rollback: Remove last migration from tracking (manual cleanup required)
 * - Status Check: Validate current migration state
 * - Error Recovery: Handle failed migrations gracefully
 * 
 * SAFETY FEATURES:
 * - Transaction-wrapped migration execution
 * - Automatic connection cleanup on completion
 * - Proper exit codes for script integration
 * - Comprehensive error handling and reporting
 * - Resource management and memory cleanup
 * 
 * COMMAND LINE PARSING:
 * - Flexible argument handling for different operations
 * - Help text and usage instructions
 * - Default behavior (up migrations when no command specified)
 * - Error handling for invalid commands
 * 
 * INTEGRATION FEATURES:
 * - CI/CD pipeline compatibility
 * - Development workflow integration
 * - Deployment script compatibility
 * - Manual administration support
 * 
 * ERROR HANDLING:
 * - Detailed error reporting with context
 * - Migration failure recovery procedures
 * - Connection error management
 * - Process exit code management for automation
 * 
 * USAGE PATTERNS:
 * - Development: Apply new migrations during feature development
 * - Deployment: Ensure database schema is up-to-date
 * - Recovery: Rollback problematic migrations
 * - Maintenance: Manage database schema evolution
 * 
 * BENEFITS:
 * - Consistent database schema management
 * - Version-controlled schema evolution
 * - Team collaboration on database changes
 * - Automated deployment support
 * - Development environment synchronization
 */

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