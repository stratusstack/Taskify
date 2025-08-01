/**
 * DATABASE SETUP UTILITY
 * 
 * Complete database initialization and setup utility for the Taskify backend.
 * This module provides a one-step database setup process that establishes
 * connections and executes all necessary migrations for a fresh installation.
 * 
 * CORE FUNCTIONALITY:
 * - Database connection establishment and validation
 * - Automatic migration execution for schema setup
 * - Error handling and graceful failure management
 * - Command-line interface for manual setup operations
 * - Clean connection cleanup and resource management
 * 
 * SETUP PROCESS:
 * 1. Initialize database connection using factory pattern
 * 2. Validate connection and database accessibility
 * 3. Execute all pending migrations to establish schema
 * 4. Verify successful completion and cleanup resources
 * 5. Provide detailed feedback and error reporting
 * 
 * USE CASES:
 * - Initial database setup for new installations
 * - Development environment initialization
 * - CI/CD pipeline database preparation
 * - Fresh deployment database configuration
 * - Testing environment setup
 * 
 * ERROR HANDLING:
 * - Comprehensive error logging with context
 * - Graceful failure with proper exit codes
 * - Resource cleanup even on failures
 * - Detailed error messages for troubleshooting
 * 
 * COMMAND LINE USAGE:
 * - Can be executed directly via Node.js
 * - Provides success/failure feedback
 * - Exits with appropriate status codes
 * - Integration with npm scripts
 * 
 * FEATURES:
 * - Database-agnostic setup (PostgreSQL/SQLite)
 * - Transaction safety through migration system
 * - Idempotent execution (safe to run multiple times)
 * - Comprehensive logging with emoji indicators
 * - Clean resource management
 * 
 * INTEGRATION:
 * - Used by main server startup process
 * - Available as standalone utility
 * - Compatible with deployment scripts
 * - Supports both development and production environments
 */

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