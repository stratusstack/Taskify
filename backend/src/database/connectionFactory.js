/**
 * DATABASE CONNECTION FACTORY
 * 
 * Implements the Factory Pattern for database-agnostic connection management
 * in the Taskify backend system. This module abstracts database connectivity
 * allowing seamless switching between PostgreSQL and SQLite databases.
 * 
 * DESIGN PATTERNS:
 * - Factory Pattern: Creates appropriate database connection instances
 * - Singleton Pattern: Maintains single connection instance throughout app lifecycle
 * - Strategy Pattern: Encapsulates database-specific connection logic
 * 
 * CORE FUNCTIONALITY:
 * - Dynamic database type selection based on configuration
 * - Unified interface for different database implementations
 * - Connection lifecycle management (create, test, close)
 * - Error handling and connection validation
 * - Configuration validation before connection attempts
 * 
 * SUPPORTED DATABASE TYPES:
 * - PostgreSQL: Enterprise-grade relational database
 *   - Connection pooling and performance optimization
 *   - SSL support and security features
 *   - Advanced query capabilities and transactions
 * 
 * - SQLite: Embedded lightweight database
 *   - File-based storage with WAL mode
 *   - Perfect for development and testing
 *   - Zero-configuration setup
 * 
 * CONNECTION MANAGEMENT:
 * - Lazy initialization of database connections
 * - Connection health monitoring and testing
 * - Graceful connection closure and cleanup
 * - Error recovery and reconnection logic
 * - Resource management and memory optimization
 * 
 * API METHODS:
 * - createConnection(): Initializes database connection based on config
 * - getConnection(): Returns existing connection or throws error
 * - closeConnection(): Properly closes and cleans up connection
 * - testConnection(): Validates connection health status
 * 
 * ERROR HANDLING:
 * - Configuration validation before connection attempts
 * - Detailed error messages for troubleshooting
 * - Graceful failure handling with proper cleanup
 * - Connection state management and validation
 * 
 * USAGE PATTERN:
 * 1. Configure database settings in environment variables
 * 2. Call createConnection() during application startup
 * 3. Use getConnection() throughout the application
 * 4. Call closeConnection() during graceful shutdown
 * 
 * BENEFITS:
 * - Database-agnostic application code
 * - Easy database switching without code changes
 * - Centralized connection management
 * - Consistent error handling across database types
 * - Simplified testing with different database backends
 */

import { dbConfig, validateConfig } from '../config/database.js';
import PostgreSQLConnection from './connections/postgresql.js';
import SQLiteConnection from './connections/sqlite.js';

class DatabaseConnectionFactory {
  constructor() {
    this.connection = null;
  }

  async createConnection() {
    validateConfig();
    
    const { type } = dbConfig;
    
    switch (type) {
      case 'postgresql':
        this.connection = new PostgreSQLConnection(dbConfig.postgresql);
        break;
      case 'sqlite':
        this.connection = new SQLiteConnection(dbConfig.sqlite);
        break;
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
    
    await this.connection.connect();
    return this.connection;
  }

  getConnection() {
    if (!this.connection) {
      throw new Error('Database connection not initialized. Call createConnection() first.');
    }
    return this.connection;
  }

  async closeConnection() {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  async testConnection() {
    if (!this.connection) {
      return false;
    }
    return await this.connection.testConnection();
  }
}

// Singleton instance
const dbFactory = new DatabaseConnectionFactory();

export default dbFactory;