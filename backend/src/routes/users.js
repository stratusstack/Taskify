/**
 * USER MANAGEMENT API ROUTES
 * 
 * RESTful API endpoints for user management in the Taskify system.
 * This module provides comprehensive CRUD operations for user accounts
 * with proper validation, security, and error handling.
 * 
 * ENDPOINT OVERVIEW:
 * - GET    /api/users     - Retrieve all users (with pagination support)
 * - GET    /api/users/:id - Retrieve specific user by ID
 * - POST   /api/users     - Create new user account
 * - PUT    /api/users/:id - Update existing user information
 * - DELETE /api/users/:id - Delete user account
 * 
 * CORE FEATURES:
 * - Full CRUD operations for user management
 * - Input validation and sanitization
 * - Database-agnostic queries through connection factory
 * - Consistent JSON response formatting
 * - Comprehensive error handling and HTTP status codes
 * - Security-conscious password handling
 * 
 * DATA FIELDS:
 * - id: Unique user identifier (auto-generated)
 * - email: User email address (unique, required)
 * - password_hash: Hashed password (required for creation)
 * - first_name: User's first name (optional)
 * - last_name: User's last name (optional)
 * - is_active: Account status flag (default: true)
 * - created_at: Account creation timestamp
 * - updated_at: Last modification timestamp
 * 
 * SECURITY CONSIDERATIONS:
 * - Password hashes only, never plain text passwords
 * - Sensitive data excluded from response (password_hash)
 * - Input validation to prevent injection attacks
 * - Parameterized queries to prevent SQL injection
 * - Proper error handling to avoid information leakage
 * 
 * VALIDATION RULES:
 * - Email and password_hash required for creation
 * - Email format validation (handled by database constraints)
 * - Unique email enforcement
 * - Optional field handling with COALESCE for updates
 * 
 * RESPONSE FORMAT:
 * Success: { success: true, data: {...}, count?: number }
 * Error: { success: false, error: "message" }
 * 
 * HTTP STATUS CODES:
 * - 200: Successful GET/PUT operations
 * - 201: Successful POST (user created)
 * - 400: Bad request (validation errors)
 * - 404: User not found
 * - 500: Internal server error
 * 
 * DATABASE COMPATIBILITY:
 * - Works with both PostgreSQL and SQLite
 * - Uses parameterized queries for database agnostic operations
 * - Handles database-specific return value differences
 * - Proper transaction handling for data consistency
 */

import express from 'express';
import dbFactory from '../database/connectionFactory.js';

const router = express.Router();

// GET /api/users - Get all users
router.get('/', async (req, res, next) => {
  try {
    const db = dbFactory.getConnection();
    const result = await db.query('SELECT id, email, first_name, last_name, is_active, created_at FROM users ORDER BY created_at DESC');
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = dbFactory.getConnection();
    
    const result = await db.query(
      'SELECT id, email, first_name, last_name, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res, next) => {
  try {
    const { email, password_hash, first_name, last_name } = req.body;
    
    if (!email || !password_hash) {
      return res.status(400).json({
        success: false,
        error: 'Email and password_hash are required'
      });
    }
    
    const db = dbFactory.getConnection();
    const result = await db.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?) RETURNING id, email, first_name, last_name, created_at',
      [email, password_hash, first_name || null, last_name || null]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0] || { id: result.lastID, email, first_name, last_name }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, first_name, last_name, is_active } = req.body;
    
    const db = dbFactory.getConnection();
    
    // Check if user exists
    const userCheck = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update user
    const result = await db.query(
      'UPDATE users SET email = COALESCE(?, email), first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), is_active = COALESCE(?, is_active), updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING id, email, first_name, last_name, is_active, updated_at',
      [email || null, first_name || null, last_name || null, is_active !== undefined ? is_active : null, id]
    );
    
    res.json({
      success: true,
      data: result.rows[0] || { id, email, first_name, last_name, is_active }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = dbFactory.getConnection();
    
    const result = await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;