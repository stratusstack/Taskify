import express from 'express';
import dbFactory from '../database/connectionFactory.js';

const router = express.Router();

// GET /api/projects - Get all projects
router.get('/', async (req, res, next) => {
  try {
    const { user_id, status } = req.query;
    const db = dbFactory.getConnection();
    
    let query = 'SELECT p.*, u.email as user_email FROM projects p LEFT JOIN users u ON p.user_id = u.id';
    const params = [];
    const conditions = [];
    
    if (user_id) {
      conditions.push('p.user_id = ?');
      params.push(user_id);
    }
    
    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = dbFactory.getConnection();
    
    const result = await db.query(
      'SELECT p.*, u.email as user_email FROM projects p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ?',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
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

// POST /api/projects - Create new project
router.post('/', async (req, res, next) => {
  try {
    const { user_id, name, description, color, status } = req.body;
    
    if (!user_id || !name) {
      return res.status(400).json({
        success: false,
        error: 'user_id and name are required'
      });
    }
    
    const db = dbFactory.getConnection();
    
    // Check if user exists
    const userCheck = await db.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const result = await db.query(
      'INSERT INTO projects (user_id, name, description, color, status) VALUES (?, ?, ?, ?, ?) RETURNING *',
      [user_id, name, description || null, color || null, status || 'active']
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0] || { id: result.lastID, user_id, name, description, color, status: status || 'active' }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, color, status } = req.body;
    
    const db = dbFactory.getConnection();
    
    // Check if project exists
    const projectCheck = await db.query('SELECT id FROM projects WHERE id = ?', [id]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    const result = await db.query(
      'UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description), color = COALESCE(?, color), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *',
      [name || null, description || null, color || null, status || null, id]
    );
    
    res.json({
      success: true,
      data: result.rows[0] || { id, name, description, color, status }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = dbFactory.getConnection();
    
    const result = await db.query('DELETE FROM projects WHERE id = ?', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;