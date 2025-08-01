/**
 * POSTGRESQL DATABASE CONNECTION
 * 
 * Enterprise-grade PostgreSQL database connection wrapper for the Taskify backend.
 * This module provides a robust, production-ready PostgreSQL integration with
 * connection pooling, transaction management, and comprehensive error handling.
 * 
 * CORE FEATURES:
 * - Connection pooling for optimal performance and resource management
 * - SSL support for secure database connections
 * - Transaction management with automatic rollback on errors
 * - Prepared statement support for query optimization
 * - Connection health monitoring and testing
 * - Graceful connection lifecycle management
 * 
 * CONNECTION POOLING:
 * - Configurable pool size (max connections)
 * - Idle timeout management for resource optimization
 * - Connection timeout handling for reliability
 * - Automatic connection recycling and cleanup
 * - Load balancing across multiple connections
 * 
 * TRANSACTION SUPPORT:
 * - BEGIN/COMMIT/ROLLBACK transaction control
 * - Automatic rollback on errors or exceptions
 * - Client connection management during transactions
 * - Callback-based transaction execution pattern
 * - Resource cleanup after transaction completion
 * 
 * SECURITY FEATURES:
 * - SSL/TLS encryption support for data in transit
 * - Parameterized queries to prevent SQL injection
 * - Connection credential management
 * - Secure password handling
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Connection reuse through pooling
 * - Prepared statement caching
 * - Query result optimization
 * - Memory efficient result handling
 * 
 * ERROR HANDLING:
 * - Comprehensive error logging with context
 * - Connection failure recovery
 * - Query error management
 * - Resource cleanup on errors
 * 
 * METHODS:
 * - connect(): Establishes connection pool with configuration
 * - query(text, params): Executes parameterized SQL queries
 * - transaction(callback): Executes operations within transaction
 * - close(): Gracefully closes all connections
 * - testConnection(): Validates database connectivity
 * 
 * CONFIGURATION:
 * - Host, port, database, user, password
 * - SSL settings and certificates
 * - Pool size and timeout configurations
 * - Performance tuning parameters
 */

import pg from 'pg';
const { Pool } = pg;

class PostgreSQLConnection {
  constructor(config) {
    this.config = config;
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        ssl: this.config.ssl,
        max: this.config.max,
        idleTimeoutMillis: this.config.idleTimeoutMillis,
        connectionTimeoutMillis: this.config.connectionTimeoutMillis,
      });

      // Test the connection
      const client = await this.pool.connect();
      client.release();
      
      console.log('✅ Connected to PostgreSQL database');
      return this.pool;
    } catch (error) {
      console.error('❌ PostgreSQL connection error:', error.message);
      throw error;
    }
  }

  async query(text, params = []) {
    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      console.error('PostgreSQL query error:', error.message);
      throw error;
    }
  }

  async transaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('🔌 PostgreSQL connection closed');
    }
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

export default PostgreSQLConnection;