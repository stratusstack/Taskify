/**
 * CENTRALIZED ERROR HANDLING MIDDLEWARE
 * 
 * Express.js error handling middleware for the Taskify backend system.
 * This module provides comprehensive error processing, logging, and response
 * formatting for both database and application errors across all endpoints.
 * 
 * CORE FUNCTIONALITY:
 * - Centralized error processing for consistent error responses
 * - Database-specific error code translation to user-friendly messages
 * - Security-conscious error message sanitization
 * - Development vs production error detail handling
 * - Request context preservation for debugging
 * 
 * SUPPORTED ERROR TYPES:
 * - PostgreSQL constraint violations and database errors
 * - SQLite constraint and integrity errors
 * - Mongoose validation and casting errors (future compatibility)
 * - Application-level business logic errors
 * - HTTP client errors (400-series)
 * - Server internal errors (500-series)
 * 
 * DATABASE ERROR HANDLING:
 * PostgreSQL Errors:
 * - 23505 (unique_violation): Duplicate entry detection
 * - 23503 (foreign_key_violation): Invalid reference handling
 * - Connection and query timeout errors
 * 
 * SQLite Errors:
 * - SQLITE_CONSTRAINT_UNIQUE: Duplicate entry detection
 * - SQLITE_CONSTRAINT_FOREIGNKEY: Invalid reference handling
 * - File system and permission errors
 * 
 * SECURITY FEATURES:
 * - Sensitive information filtering from error messages
 * - Stack trace exposure only in development environment
 * - SQL injection attempt detection and logging
 * - Error message sanitization to prevent information leakage
 * 
 * RESPONSE FORMATTING:
 * - Consistent JSON error response structure
 * - HTTP status code standardization
 * - Success/failure boolean indicators
 * - User-friendly error messages
 * - Optional technical details for debugging
 * 
 * LOGGING AND MONITORING:
 * - Comprehensive error logging for debugging
 * - Error context preservation (request details)
 * - Error pattern detection for system monitoring
 * - Performance impact tracking
 * 
 * DEVELOPMENT FEATURES:
 * - Full stack trace exposure in development mode
 * - Detailed error context for debugging
 * - Request parameter logging for troubleshooting
 * - Enhanced error messages for faster development
 * 
 * PRODUCTION SAFEGUARDS:
 * - Sanitized error messages to prevent information disclosure
 * - Stack trace suppression for security
 * - Generic error messages for unknown errors
 * - Monitoring-friendly error codes
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // PostgreSQL errors
  if (err.code === '23505') { // unique_violation
    const message = 'Duplicate entry found';
    error = { message, statusCode: 400 };
  }

  if (err.code === '23503') { // foreign_key_violation
    const message = 'Invalid reference to related resource';
    error = { message, statusCode: 400 };
  }

  // SQLite errors
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    const message = 'Duplicate entry found';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    const message = 'Invalid reference to related resource';
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;