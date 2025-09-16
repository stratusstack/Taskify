import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dbFactory from './database/connectionFactory.js'
import { runMigrations } from './database/migrationRunner.js'
import errorHandler from './middleware/errorHandler.js'
import requestLogger, { logStartup, logError } from './middleware/logger.js'

// Import routes
import userRoutes from './routes/users.js'
import projectRoutes from './routes/projects.js'
import taskRoutes from './routes/tasks.js'
import timeEntryRoutes from './routes/timeEntries.js'
import checklistItemRoutes from './routes/checklistItems.js'

const app = express()
const PORT = process.env.PORT || 3001

logStartup('Initializing Taskify backend server...', 'info')

// Request logging middleware (before other middleware)
app.use(requestLogger)

// Security middleware
app.use(helmet())
logStartup('Security middleware (Helmet) enabled', 'info')

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
logStartup(`CORS enabled for origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`, 'info')

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)
logStartup('Rate limiting enabled (100 req/15min per IP)', 'info')

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
logStartup('Body parsing middleware enabled', 'info')

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/time-entries', timeEntryRoutes)
app.use('/api/checklist-items', checklistItemRoutes)
logStartup('API routes registered', 'info')

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found` 
  })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  logStartup('SIGTERM received, shutting down gracefully...', 'warn')
  await dbFactory.closeConnection()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logStartup('SIGINT received, shutting down gracefully...', 'warn')
  await dbFactory.closeConnection()
  process.exit(0)
})

// Start server
async function startServer() {
  try {
    logStartup('Starting server initialization...', 'info')
    
    // Initialize database connection
    await dbFactory.createConnection()
    logStartup('Database connection established', 'success')
    
    // Run migrations
    logStartup('Running database migrations...', 'info')
    await runMigrations()
    
    // Start HTTP server
    app.listen(PORT, () => {
      logStartup('='.repeat(60), 'success')
      logStartup(`🚀 Taskify backend server running on port ${PORT}`, 'success')
      logStartup(`📊 Health check: http://localhost:${PORT}/health`, 'info')
      logStartup(`🗄️  Database type: ${process.env.DB_TYPE || 'sqlite'}`, 'info')
      logStartup(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`, 'info')
      logStartup(`🔒 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`, 'info')
      logStartup('='.repeat(60), 'success')
      logStartup('Server ready to accept connections! 🎉', 'success')
    })
  } catch (error) {
    logError(error, 'Server startup failed')
    process.exit(1)
  }
}

startServer()

export default app