import { logError } from './logger.js'

const errorHandler = (err, req, res, next) => {
  logError(err, `${req.method} ${req.originalUrl} - ${req.ip}`)

  // Default error
  let error = {
    status: err.status || 500,
    message: err.message || 'Internal Server Error'
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.status = 400
    error.message = 'Validation Error'
    error.details = Object.values(err.errors).map(val => val.message)
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401
    error.message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401
    error.message = 'Token expired'
  }

  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT' || err.code === '23505') {
    error.status = 409
    error.message = 'Resource already exists'
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || err.code === '23503') {
    error.status = 400
    error.message = 'Invalid reference to related resource'
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && error.status >= 500) {
    error.message = 'Internal Server Error'
    delete error.details
  }

  res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export default errorHandler