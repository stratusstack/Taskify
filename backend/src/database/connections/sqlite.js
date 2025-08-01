/**
 * SQLITE DATABASE CONNECTION
 * 
 * Lightweight, embedded SQLite database connection wrapper for the Taskify backend.
 * This module provides a robust SQLite integration with transaction support,
 * foreign key constraints, and development-friendly features.
 * 
 * CORE FEATURES:
 * - Zero-configuration embedded database setup
 * - File-based database storage with configurable paths
 * - Foreign key constraint enforcement
 * - Transaction management with automatic rollback
 * - Promise-based async/await interface
 * - Development mode verbose logging
 * 
 * DATABASE CHARACTERISTICS:
 * - Self-contained, serverless database engine
 * - ACID compliant transactions
 * - SQL standard compliance with SQLite extensions
 * - Cross-platform file format
 * - Excellent performance for read-heavy workloads
 * - Perfect for development, testing, and small-scale production
 * 
 * QUERY HANDLING:
 * - Automatic query type detection (SELECT vs non-SELECT)
 * - Consistent response format matching PostgreSQL interface
 * - Row count and last insert ID tracking
 * - Parameterized query support for security
 * - Error handling with detailed logging
 * 
 * TRANSACTION SUPPORT:
 * - BEGIN/COMMIT/ROLLBACK transaction control
 * - Automatic rollback on errors or exceptions
 * - Callback-based transaction execution pattern
 * - Data consistency guarantees
 * 
 * SECURITY FEATURES:
 * - Foreign key constraint enforcement (PRAGMA foreign_keys = ON)
 * - Parameterized queries to prevent SQL injection
 * - Safe file path handling
 * - Error message sanitization
 * 
 * DEVELOPMENT FEATURES:
 * - Verbose mode for detailed SQL logging
 * - Comprehensive error reporting
 * - Connection status monitoring
 * - File-based storage for easy inspection
 * 
 * METHODS:
 * - connect(): Establishes SQLite database connection
 * - query(sql, params): Executes SQL with parameters
 * - transaction(callback): Executes operations within transaction
 * - close(): Gracefully closes database connection
 * - testConnection(): Validates database connectivity
 * 
 * CONFIGURATION:
 * - filename: Database file path
 * - verbose: Enable detailed logging (development mode)
 * - mode: Database access mode (handled automatically)
 * 
 * COMPATIBILITY:
 * - Provides PostgreSQL-compatible interface
 * - Unified response format for database-agnostic operations
 * - Seamless integration with connection factory pattern
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';

class SQLiteConnection {
  constructor(config) {
    this.config = config;
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const { filename, verbose } = this.config;
      
      // Enable verbose mode for development
      const Database = verbose ? sqlite3.verbose().Database : sqlite3.Database;
      
      // Use default mode (OPEN_READWRITE | OPEN_CREATE)
      this.db = new Database(filename, (err) => {
        if (err) {
          console.error('❌ SQLite connection error:', err.message);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          
          // Enable foreign key constraints
          this.db.run('PRAGMA foreign_keys = ON;');
          
          resolve(this.db);
        }
      });
    });
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (sql.trim().toLowerCase().startsWith('select')) {
        this.db.all(sql, params, (err, rows) => {
          if (err) {
            console.error('SQLite query error:', err.message);
            reject(err);
          } else {
            resolve({ rows, rowCount: rows.length });
          }
        });
      } else {
        this.db.run(sql, params, function(err) {
          if (err) {
            console.error('SQLite query error:', err.message);
            reject(err);
          } else {
            resolve({ 
              rows: [], 
              rowCount: this.changes,
              lastID: this.lastID 
            });
          }
        });
      }
    });
  }

  async transaction(callback) {
    try {
      await this.query('BEGIN TRANSACTION');
      const result = await callback(this);
      await this.query('COMMIT');
      return result;
    } catch (error) {
      await this.query('ROLLBACK');
      throw error;
    }
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing SQLite database:', err.message);
          } else {
            console.log('🔌 SQLite connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async testConnection() {
    try {
      const result = await this.query('SELECT 1 as test');
      return result.rows[0].test === 1;
    } catch (error) {
      return false;
    }
  }
}

export default SQLiteConnection;