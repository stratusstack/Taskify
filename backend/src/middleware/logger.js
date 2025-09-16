/**
 * HTTP Request Logging Middleware
 * Logs all incoming HTTP requests with timestamp, method, URL, IP, and response details
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
}

const getStatusColor = (status) => {
  if (status >= 500) return colors.red
  if (status >= 400) return colors.yellow
  if (status >= 300) return colors.cyan
  if (status >= 200) return colors.green
  return colors.white
}

const getMethodColor = (method) => {
  switch (method) {
    case 'GET': return colors.green
    case 'POST': return colors.blue
    case 'PUT': return colors.yellow
    case 'DELETE': return colors.red
    case 'PATCH': return colors.magenta
    default: return colors.white
  }
}

const formatTime = () => {
  const now = new Date()
  return `${colors.gray}[${now.toISOString()}]${colors.reset}`
}

const requestLogger = (req, res, next) => {
  const startTime = Date.now()
  
  // Log incoming request
  console.log(`${formatTime()} ${getMethodColor(req.method)}${req.method}${colors.reset} ${colors.white}${req.originalUrl}${colors.reset} ${colors.gray}from ${req.ip}${colors.reset}`)
  
  // Log query parameters if present
  if (Object.keys(req.query).length > 0) {
    console.log(`${colors.gray}  └─ Query:${colors.reset} ${JSON.stringify(req.query)}`)
  }
  
  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const sanitizedBody = { ...req.body }
    // Remove sensitive fields
    delete sanitizedBody.password
    delete sanitizedBody.token
    delete sanitizedBody.authorization
    
    if (Object.keys(sanitizedBody).length > 0) {
      console.log(`${colors.gray}  └─ Body:${colors.reset} ${JSON.stringify(sanitizedBody)}`)
    }
  }
  
  // Override res.end to capture response
  const originalEnd = res.end
  res.end = function(...args) {
    const duration = Date.now() - startTime
    const statusColor = getStatusColor(res.statusCode)
    
    // Log response
    console.log(`${formatTime()} ${statusColor}${res.statusCode}${colors.reset} ${getMethodColor(req.method)}${req.method}${colors.reset} ${colors.white}${req.originalUrl}${colors.reset} ${colors.gray}${duration}ms${colors.reset}`)
    
    originalEnd.apply(this, args)
  }
  
  next()
}

// Database operation logger
const logDatabaseOperation = (operation, table, data = null, duration = null) => {
  const timestamp = formatTime()
  const operationColor = operation.startsWith('SELECT') ? colors.green : 
                        operation.startsWith('INSERT') ? colors.blue :
                        operation.startsWith('UPDATE') ? colors.yellow :
                        operation.startsWith('DELETE') ? colors.red : colors.white
  
  let logMessage = `${timestamp} ${colors.cyan}[DB]${colors.reset} ${operationColor}${operation}${colors.reset}`
  
  if (table) {
    logMessage += ` ${colors.gray}on${colors.reset} ${colors.white}${table}${colors.reset}`
  }
  
  if (duration !== null) {
    logMessage += ` ${colors.gray}(${duration}ms)${colors.reset}`
  }
  
  console.log(logMessage)
  
  if (data && process.env.NODE_ENV === 'development') {
    console.log(`${colors.gray}  └─ Data:${colors.reset} ${JSON.stringify(data)}`)
  }
}

// Authentication logger
const logAuth = (action, userId = null, success = true, details = null) => {
  const timestamp = formatTime()
  const statusColor = success ? colors.green : colors.red
  const status = success ? 'SUCCESS' : 'FAILED'
  
  let logMessage = `${timestamp} ${colors.magenta}[AUTH]${colors.reset} ${statusColor}${status}${colors.reset} ${colors.white}${action}${colors.reset}`
  
  if (userId) {
    logMessage += ` ${colors.gray}for user ${userId}${colors.reset}`
  }
  
  console.log(logMessage)
  
  if (details) {
    console.log(`${colors.gray}  └─ ${details}${colors.reset}`)
  }
}

// Error logger (enhanced version)
const logError = (error, context = null) => {
  const timestamp = formatTime()
  console.error(`${timestamp} ${colors.red}[ERROR]${colors.reset} ${colors.bright}${error.message}${colors.reset}`)
  
  if (context) {
    console.error(`${colors.gray}  └─ Context: ${context}${colors.reset}`)
  }
  
  if (error.stack && process.env.NODE_ENV === 'development') {
    console.error(`${colors.gray}  └─ Stack:${colors.reset}`)
    error.stack.split('\n').forEach(line => {
      if (line.trim()) {
        console.error(`${colors.gray}     ${line.trim()}${colors.reset}`)
      }
    })
  }
}

// Migration logger
const logMigration = (filename, success = true, error = null) => {
  const timestamp = formatTime()
  const statusColor = success ? colors.green : colors.red
  const status = success ? 'APPLIED' : 'FAILED'
  
  console.log(`${timestamp} ${colors.blue}[MIGRATION]${colors.reset} ${statusColor}${status}${colors.reset} ${colors.white}${filename}${colors.reset}`)
  
  if (error) {
    console.error(`${colors.gray}  └─ Error: ${error.message}${colors.reset}`)
  }
}

// Startup logger
const logStartup = (message, level = 'info') => {
  const timestamp = formatTime()
  const levelColor = level === 'error' ? colors.red : 
                    level === 'warn' ? colors.yellow : 
                    level === 'success' ? colors.green : colors.blue
  
  console.log(`${timestamp} ${levelColor}[STARTUP]${colors.reset} ${colors.white}${message}${colors.reset}`)
}

export {
  requestLogger,
  logDatabaseOperation,
  logAuth,
  logError,
  logMigration,
  logStartup
}

export default requestLogger