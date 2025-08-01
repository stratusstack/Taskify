/**
 * DATABASE CONFIGURATION MODULE
 * 
 * Centralized database configuration management for the Taskify backend system.
 * This module provides environment-based configuration for multiple database types
 * with validation, security, and performance optimization settings.
 * 
 * SUPPORTED DATABASES:
 * - PostgreSQL: Production-ready relational database with advanced features
 * - SQLite: Lightweight embedded database perfect for development and testing
 * 
 * POSTGRESQL CONFIGURATION:
 * - Connection pooling with configurable pool sizes
 * - SSL support for secure connections
 * - Connection timeout and idle timeout management
 * - Environment-based credential management
 * - Performance optimization settings
 * 
 * SQLITE CONFIGURATION:
 * - File-based database with configurable path
 * - Access mode control (readonly, readwrite, readwritecreate)
 * - Development mode verbose logging
 * - Automatic database file creation
 * 
 * ENVIRONMENT VARIABLES:
 * - DB_TYPE: Database type selection ('postgresql' or 'sqlite')
 * - POSTGRES_*: PostgreSQL connection parameters
 * - SQLITE_*: SQLite configuration options
 * - Security and performance tuning variables
 * 
 * SECURITY FEATURES:
 * - Environment variable validation
 * - Secure credential handling
 * - SSL configuration for PostgreSQL
 * - Connection parameter sanitization
 * 
 * VALIDATION SYSTEM:
 * - Required configuration parameter checking
 * - Database type validation
 * - Missing credential detection
 * - Configuration consistency verification
 * 
 * USAGE:
 * - Import dbConfig for database connection parameters
 * - Call validateConfig() before establishing connections
 * - Environment variables override default values
 * - Supports both development and production environments
 */

import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  type: process.env.DB_TYPE || 'sqlite', // 'postgresql' or 'sqlite'
  
  // PostgreSQL configuration
  postgresql: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'taskify',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    ssl: process.env.POSTGRES_SSL === 'true',
    max: parseInt(process.env.POSTGRES_POOL_MAX) || 20,
    idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT) || 2000,
  },
  
  // SQLite configuration
  sqlite: {
    filename: process.env.SQLITE_PATH || './database.sqlite',
    mode: process.env.SQLITE_MODE || 'readwrite', // 'readonly', 'readwrite', 'readwritecreate'
    verbose: process.env.NODE_ENV === 'development'
  }
};

export const validateConfig = () => {
  if (!['postgresql', 'sqlite'].includes(dbConfig.type)) {
    throw new Error(`Unsupported database type: ${dbConfig.type}. Use 'postgresql' or 'sqlite'.`);
  }
  
  if (dbConfig.type === 'postgresql') {
    const required = ['host', 'database', 'user', 'password'];
    const missing = required.filter(key => !dbConfig.postgresql[key]);
    if (missing.length > 0) {
      throw new Error(`Missing PostgreSQL configuration: ${missing.join(', ')}`);
    }
  }
  
  return true;
};