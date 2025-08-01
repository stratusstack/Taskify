/**
 * TASKIFY BACKEND SERVER
 * 
 * Main Express.js server application for the Taskify task management system.
 * This file sets up the core web server with comprehensive middleware, security,
 * database connectivity, and RESTful API routing.
 * 
 * CORE FUNCTIONALITY:
 * - Express.js web server configuration with production-ready middleware
 * - Database-agnostic connection handling (PostgreSQL/SQLite support)
 * - Automatic database migration system on server startup
 * - RESTful API endpoints for users, projects, tasks, and time tracking
 * - Security middleware including CORS, Helmet, rate limiting
 * - Comprehensive error handling and graceful shutdown procedures
 * - Health check endpoint for monitoring and load balancer integration
 * 
 * SECURITY FEATURES:
 * - Helmet.js for HTTP security headers (XSS protection, content sniffing, etc.)
 * - CORS configuration for cross-origin resource sharing
 * - Rate limiting (100 requests per 15 minutes per IP by default)
 * - Request body size limits (10MB max for file uploads)
 * - Graceful error handling with proper HTTP status codes
 * 
 * DATABASE INTEGRATION:
 * - Factory pattern for database abstraction (PostgreSQL/SQLite)
 * - Automatic connection testing and health monitoring
 * - Migration runner for database schema management
 * - Connection pooling and optimization
 * - Graceful database disconnection on server shutdown
 * 
 * API ENDPOINTS:
 * - /api/users - User management (CRUD operations)
 * - /api/projects - Project management and organization
 * - /api/tasks - Task lifecycle management with status/priority tracking
 * - /api/time-entries - Time tracking and reporting functionality
 * - /health - Server and database health status
 * 
 * ENVIRONMENT CONFIGURATION:
 * - PORT: Server port (default: 3001)
 * - DB_TYPE: Database type ('postgresql' or 'sqlite')
 * - CORS_ORIGIN: Allowed CORS origin (default: localhost:5173)
 * - RATE_LIMIT_*: Rate limiting configuration
 * - Database-specific environment variables
 * 
 * OPERATIONAL FEATURES:
 * - Graceful shutdown handling (SIGINT/SIGTERM)
 * - Unhandled promise rejection monitoring
 * - Detailed console logging with emojis for better UX
 * - Development vs production environment detection
 * - Comprehensive error reporting and debugging
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import dbFactory from './database/connectionFactory.js';
import MigrationRunner from './database/migrationRunner.js';
import errorHandler from './middleware/errorHandler.js';

// Import routes
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import timeEntryRoutes from './routes/timeEntries.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet()); // Set security headers
app.use(compression()); // Compress responses
app.use(limiter); // Apply rate limiting

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const isDbHealthy = await dbFactory.testConnection();
    
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      database: {
        type: process.env.DB_TYPE || 'sqlite',
        connected: isDbHealthy
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/time-entries', timeEntryRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

// Database initialization and server startup
async function startServer() {
  try {
    console.log('🚀 Starting Taskify Backend Server...');
    
    // Initialize database connection
    const dbConnection = await dbFactory.createConnection();
    
    // Run migrations
    const migrationRunner = new MigrationRunner(dbConnection);
    await migrationRunner.runMigrations();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📊 Database: ${process.env.DB_TYPE || 'sqlite'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  await dbFactory.closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  await dbFactory.closeConnection();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Start the server
startServer();

export default app;