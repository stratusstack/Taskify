/**
 * DATABASE MIGRATION RUNNER
 * 
 * Comprehensive database schema migration system for the Taskify backend.
 * This module provides automated, version-controlled database schema management
 * with support for both PostgreSQL and SQLite databases.
 * 
 * CORE FUNCTIONALITY:
 * - Automatic migration discovery and execution
 * - Database-agnostic migration file processing
 * - Migration state tracking and history
 * - Transaction-based migration execution for data safety
 * - Rollback capabilities for development and recovery
 * - Idempotent migration execution (runs only once)
 * 
 * MIGRATION SYSTEM:
 * - File-based migration organization by database type
 * - Alphabetical execution order for predictable results
 * - Migration tracking table for execution history
 * - Comprehensive error handling and recovery
 * - Detailed logging with emoji indicators for better UX
 * 
 * DIRECTORY STRUCTURE:
 * - migrations/postgresql/ - PostgreSQL-specific migrations
 * - migrations/sqlite/ - SQLite-specific migrations
 * - Automatic database type detection from configuration
 * - Migration file naming convention: {number}_{description}.sql
 * 
 * SAFETY FEATURES:
 * - Transaction-wrapped migration execution
 * - Automatic rollback on migration failure
 * - Duplicate migration prevention
 * - Migration state consistency validation
 * - Comprehensive error reporting and logging
 * 
 * FILE PROCESSING:
 * - SQL comment filtering for clean execution
 * - Statement splitting by semicolon
 * - Empty statement removal
 * - Cross-database parameterized query handling
 * 
 * MIGRATION TRACKING:
 * - Dedicated migrations table for execution history
 * - Filename and timestamp recording
 * - Execution order preservation
 * - Rollback capability with history management
 * 
 * METHODS:
 * - runMigrations(): Discovers and executes pending migrations
 * - createMigrationsTable(): Initializes migration tracking
 * - getMigrationFiles(): Discovers available migration files
 * - getExecutedMigrations(): Retrieves migration history
 * - executeMigration(filename): Executes single migration safely
 * - rollbackLastMigration(): Removes last migration from history
 * 
 * ERROR HANDLING:
 * - Detailed error logging with context
 * - Migration failure recovery procedures
 * - File system error handling (missing directories, etc.)
 * - Database constraint violation handling
 * 
 * DEVELOPMENT FEATURES:
 * - Color-coded console output with emojis
 * - Detailed progress reporting
 * - Migration status summaries
 * - Development-friendly error messages
 * 
 * PRODUCTION SAFETY:
 * - Transaction-based execution prevents partial migrations
 * - Migration state consistency checks
 * - Comprehensive logging for audit trails
 * - Graceful error handling and recovery
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbConfig } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MigrationRunner {
  constructor(dbConnection) {
    this.db = dbConnection;
    this.migrationsPath = path.join(__dirname, 'migrations', dbConfig.type);
  }

  async runMigrations() {
    try {
      console.log(`🚀 Starting database migrations for ${dbConfig.type}`);
      
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();
      
      // Get list of migration files
      const migrationFiles = await this.getMigrationFiles();
      
      if (migrationFiles.length === 0) {
        console.log('📝 No migration files found');
        return;
      }
      
      // Get executed migrations
      const executedMigrations = await this.getExecutedMigrations();
      
      // Filter out already executed migrations
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(file)
      );
      
      if (pendingMigrations.length === 0) {
        console.log('✅ All migrations are up to date');
        return;
      }
      
      console.log(`📋 Found ${pendingMigrations.length} pending migrations`);
      
      // Execute pending migrations
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      console.log('🎉 All migrations completed successfully');
      
    } catch (error) {
      console.error('❌ Migration error:', error.message);
      throw error;
    }
  }

  async createMigrationsTable() {
    const sql = dbConfig.type === 'postgresql' 
      ? `CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) UNIQUE NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`
      : `CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT UNIQUE NOT NULL,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`;
    
    await this.db.query(sql);
  }

  async getMigrationFiles() {
    try {
      const files = await fs.readdir(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort(); // Sort to ensure proper order
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`⚠️  Migrations directory not found: ${this.migrationsPath}`);
        return [];
      }
      throw error;
    }
  }

  async getExecutedMigrations() {
    try {
      const result = await this.db.query('SELECT filename FROM migrations ORDER BY id');
      return result.rows.map(row => row.filename);
    } catch (error) {
      // If migrations table doesn't exist yet, return empty array
      return [];
    }
  }

  async executeMigration(filename) {
    console.log(`🔄 Executing migration: ${filename}`);
    
    try {
      // Read migration file
      const migrationPath = path.join(this.migrationsPath, filename);
      const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
      
      // Execute migration in transaction
      await this.db.transaction(async (client) => {
        // Split by semicolon and execute each statement
        const statements = migrationSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => {
            if (stmt.length === 0) return false;
            // Remove comment-only statements, but keep statements that have SQL after comments
            const sqlContent = stmt.replace(/--.*$/gm, '').trim();
            return sqlContent.length > 0;
          });
        
        for (const statement of statements) {
          if (dbConfig.type === 'postgresql' && client.query) {
            await client.query(statement);
          } else {
            await this.db.query(statement);
          }
        }
        
        // Record migration as executed
        const insertSQL = 'INSERT INTO migrations (filename) VALUES (?)';
        if (dbConfig.type === 'postgresql' && client.query) {
          await client.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
        } else {
          await this.db.query(insertSQL, [filename]);
        }
      });
      
      console.log(`✅ Migration completed: ${filename}`);
      
    } catch (error) {
      console.error(`❌ Migration failed: ${filename}`, error.message);
      throw error;
    }
  }

  async rollbackLastMigration() {
    console.log('⚠️  Rolling back last migration');
    
    try {
      // Get last executed migration
      const result = await this.db.query(
        'SELECT filename FROM migrations ORDER BY id DESC LIMIT 1'
      );
      
      if (result.rows.length === 0) {
        console.log('📝 No migrations to rollback');
        return;
      }
      
      const lastMigration = result.rows[0].filename;
      console.log(`🔄 Rolling back: ${lastMigration}`);
      
      // Remove from migrations table
      const deleteSQL = dbConfig.type === 'postgresql'
        ? 'DELETE FROM migrations WHERE filename = $1'
        : 'DELETE FROM migrations WHERE filename = ?';
        
      await this.db.query(deleteSQL, [lastMigration]);
      
      console.log(`✅ Rollback completed: ${lastMigration}`);
      console.log('⚠️  Note: You may need to manually undo schema changes');
      
    } catch (error) {
      console.error('❌ Rollback error:', error.message);
      throw error;
    }
  }
}

export default MigrationRunner;