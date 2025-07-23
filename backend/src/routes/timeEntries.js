import express from 'express';
import dbFactory from '../database/connectionFactory.js';

const router = express.Router();

// GET /api/time-entries - Get all time entries
router.get('/', async (req, res, next) => {
  try {
    const { task_id, user_id, is_active } = req.query;
    const db = dbFactory.getConnection();
    
    let query = `
      SELECT te.*, t.title as task_title, p.name as project_name, u.email as user_email
      FROM time_entries te
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON te.user_id = u.id
    `;
    const params = [];
    const conditions = [];
    
    if (task_id) {
      conditions.push('te.task_id = ?');
      params.push(task_id);
    }
    
    if (user_id) {
      conditions.push('te.user_id = ?');
      params.push(user_id);
    }
    
    if (is_active !== undefined) {
      conditions.push('te.is_active = ?');
      params.push(is_active === 'true' ? 1 : 0);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY te.start_time DESC';
    
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

// GET /api/time-entries/:id - Get time entry by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = dbFactory.getConnection();
    
    const result = await db.query(
      `SELECT te.*, t.title as task_title, p.name as project_name, u.email as user_email
       FROM time_entries te
       LEFT JOIN tasks t ON te.task_id = t.id
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u ON te.user_id = u.id
       WHERE te.id = ?`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Time entry not found'
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

// POST /api/time-entries - Create new time entry (start timer)
router.post('/', async (req, res, next) => {
  try {
    const { task_id, user_id, description } = req.body;
    
    if (!task_id || !user_id) {
      return res.status(400).json({
        success: false,
        error: 'task_id and user_id are required'
      });
    }
    
    const db = dbFactory.getConnection();
    
    // Check if task exists
    const taskCheck = await db.query('SELECT id FROM tasks WHERE id = ?', [task_id]);
    if (taskCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // Check if user exists
    const userCheck = await db.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Stop any currently active timers for this user
    await db.query(
      'UPDATE time_entries SET is_active = 0, end_time = CURRENT_TIMESTAMP, duration_minutes = (JULIANDAY(CURRENT_TIMESTAMP) - JULIANDAY(start_time)) * 24 * 60 WHERE user_id = ? AND is_active = 1',
      [user_id]
    );
    
    // Create new time entry
    const result = await db.query(
      'INSERT INTO time_entries (task_id, user_id, start_time, description, is_active) VALUES (?, ?, CURRENT_TIMESTAMP, ?, 1) RETURNING *',
      [task_id, user_id, description || null]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0] || { 
        id: result.lastID, 
        task_id, 
        user_id, 
        description, 
        is_active: true,
        start_time: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/time-entries/:id/stop - Stop time entry
router.put('/:id/stop', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = dbFactory.getConnection();
    
    // Check if time entry exists and is active
    const timeEntryCheck = await db.query(
      'SELECT id, start_time FROM time_entries WHERE id = ? AND is_active = 1',
      [id]
    );
    
    if (timeEntryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Active time entry not found'
      });
    }
    
    // Stop the timer and calculate duration
    const result = await db.query(
      'UPDATE time_entries SET is_active = 0, end_time = CURRENT_TIMESTAMP, duration_minutes = (JULIANDAY(CURRENT_TIMESTAMP) - JULIANDAY(start_time)) * 24 * 60, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *',
      [id]
    );
    
    res.json({
      success: true,
      data: result.rows[0] || { id, is_active: false, end_time: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/time-entries/:id - Update time entry
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, duration_minutes } = req.body;
    
    const db = dbFactory.getConnection();
    
    // Check if time entry exists
    const timeEntryCheck = await db.query('SELECT id FROM time_entries WHERE id = ?', [id]);
    if (timeEntryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Time entry not found'
      });
    }
    
    const result = await db.query(
      'UPDATE time_entries SET description = COALESCE(?, description), duration_minutes = COALESCE(?, duration_minutes), updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *',
      [description || null, duration_minutes || null, id]
    );
    
    res.json({
      success: true,
      data: result.rows[0] || { id, description, duration_minutes }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/time-entries/:id - Delete time entry
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = dbFactory.getConnection();
    
    const result = await db.query('DELETE FROM time_entries WHERE id = ?', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Time entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Time entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;