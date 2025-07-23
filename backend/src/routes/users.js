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