import express from 'express'
import dbFactory from '../database/connectionFactory.js'
import { authenticateToken } from './users.js'

const router = express.Router()

// Apply authentication to all time entry routes
router.use(authenticateToken)

// Get time entries for a task
router.get('/task/:taskId', async (req, res, next) => {
  try {
    const db = await dbFactory.getConnection()
    
    // Verify task belongs to user
    const tasks = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.taskId, req.user.userId]
    )

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const timeEntries = await db.query(
      'SELECT * FROM time_entries WHERE task_id = ? ORDER BY start_time DESC',
      [req.params.taskId]
    )

    res.json(timeEntries)

  } catch (error) {
    next(error)
  }
})

// Start time tracking for a task
router.post('/start', async (req, res, next) => {
  try {
    const { task_id, description } = req.body

    if (!task_id) {
      return res.status(400).json({ error: 'Task ID is required' })
    }

    const db = await dbFactory.getConnection()
    
    // Verify task belongs to user and is in progress
    const tasks = await db.query(
      'SELECT id, status FROM tasks WHERE id = ? AND user_id = ?',
      [task_id, req.user.userId]
    )

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    if (tasks[0].status !== 'In Progress') {
      return res.status(400).json({ 
        error: 'Can only track time for tasks in progress. Update task status first.' 
      })
    }

    // Check if there's already an active time entry
    const activeEntries = await db.query(
      'SELECT id FROM time_entries WHERE task_id = ? AND end_time IS NULL',
      [task_id]
    )

    if (activeEntries.length > 0) {
      return res.status(400).json({ 
        error: 'Time tracking is already active for this task' 
      })
    }

    // Create new time entry
    const result = await db.query(
      'INSERT INTO time_entries (task_id, start_time, description) VALUES (?, ?, ?)',
      [task_id, new Date().toISOString(), description || '']
    )

    const entryId = result.lastID || result.rows[0]?.id

    const entries = await db.query(
      'SELECT * FROM time_entries WHERE id = ?',
      [entryId]
    )

    res.status(201).json(entries[0])

  } catch (error) {
    next(error)
  }
})

// Stop time tracking for a task
router.post('/stop', async (req, res, next) => {
  try {
    const { task_id } = req.body

    if (!task_id) {
      return res.status(400).json({ error: 'Task ID is required' })
    }

    const db = await dbFactory.getConnection()
    
    // Verify task belongs to user
    const tasks = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [task_id, req.user.userId]
    )

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Find active time entry
    const activeEntries = await db.query(
      'SELECT id, start_time FROM time_entries WHERE task_id = ? AND end_time IS NULL',
      [task_id]
    )

    if (activeEntries.length === 0) {
      return res.status(400).json({ 
        error: 'No active time tracking found for this task' 
      })
    }

    const entry = activeEntries[0]
    const now = new Date().toISOString()
    const startTime = new Date(entry.start_time)
    const endTime = new Date(now)
    const durationMinutes = Math.round((endTime - startTime) / (1000 * 60))

    // Update time entry with end time and duration
    await db.query(
      'UPDATE time_entries SET end_time = ?, duration_minutes = ? WHERE id = ?',
      [now, durationMinutes, entry.id]
    )

    // Fetch updated entry
    const updatedEntries = await db.query(
      'SELECT * FROM time_entries WHERE id = ?',
      [entry.id]
    )

    res.json(updatedEntries[0])

  } catch (error) {
    next(error)
  }
})

// Get active time entry for a task
router.get('/active/:taskId', async (req, res, next) => {
  try {
    const db = await dbFactory.getConnection()
    
    // Verify task belongs to user
    const tasks = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.taskId, req.user.userId]
    )

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const activeEntries = await db.query(
      'SELECT * FROM time_entries WHERE task_id = ? AND end_time IS NULL',
      [req.params.taskId]
    )

    if (activeEntries.length === 0) {
      return res.json(null)
    }

    res.json(activeEntries[0])

  } catch (error) {
    next(error)
  }
})

// Update time entry
router.put('/:id', async (req, res, next) => {
  try {
    const { start_time, end_time, description } = req.body
    const entryId = req.params.id

    const db = await dbFactory.getConnection()
    
    // Verify entry exists and belongs to user's task
    const entries = await db.query(
      `SELECT te.*, t.user_id 
       FROM time_entries te 
       JOIN tasks t ON te.task_id = t.id 
       WHERE te.id = ? AND t.user_id = ?`,
      [entryId, req.user.userId]
    )

    if (entries.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' })
    }

    // Calculate duration if both times provided
    let durationMinutes = entries[0].duration_minutes
    if (start_time && end_time) {
      const start = new Date(start_time)
      const end = new Date(end_time)
      durationMinutes = Math.round((end - start) / (1000 * 60))
    }

    // Update entry
    await db.query(
      `UPDATE time_entries 
       SET start_time = ?, end_time = ?, duration_minutes = ?, description = ? 
       WHERE id = ?`,
      [
        start_time || entries[0].start_time,
        end_time || entries[0].end_time,
        durationMinutes,
        description !== undefined ? description : entries[0].description,
        entryId
      ]
    )

    // Fetch updated entry
    const updatedEntries = await db.query(
      'SELECT * FROM time_entries WHERE id = ?',
      [entryId]
    )

    res.json(updatedEntries[0])

  } catch (error) {
    next(error)
  }
})

// Delete time entry
router.delete('/:id', async (req, res, next) => {
  try {
    const db = await dbFactory.getConnection()

    // Verify entry exists and belongs to user's task
    const entries = await db.query(
      `SELECT te.id
       FROM time_entries te
       JOIN tasks t ON te.task_id = t.id
       WHERE te.id = ? AND t.user_id = ?`,
      [req.params.id, req.user.userId]
    )

    if (entries.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' })
    }

    await db.query('DELETE FROM time_entries WHERE id = ?', [req.params.id])

    res.json({ message: 'Time entry deleted successfully' })

  } catch (error) {
    next(error)
  }
})

// Add manual time entry
router.post('/manual', async (req, res, next) => {
  try {
    const { task_id, duration_minutes, date } = req.body

    if (!task_id) {
      return res.status(400).json({ error: 'Task ID is required' })
    }

    if (!duration_minutes || duration_minutes <= 0) {
      return res.status(400).json({ error: 'Duration must be a positive number' })
    }

    if (duration_minutes > 1440) {
      return res.status(400).json({ error: 'Duration cannot exceed 24 hours (1440 minutes)' })
    }

    const db = await dbFactory.getConnection()

    // Verify task belongs to user
    const tasks = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [task_id, req.user.userId]
    )

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Create manual time entry with calculated start and end times
    const entryDate = date ? new Date(date) : new Date()
    const endTime = new Date(entryDate)
    const startTime = new Date(endTime.getTime() - (duration_minutes * 60000))

    const result = await db.query(
      'INSERT INTO time_entries (task_id, start_time, end_time, duration_minutes, description) VALUES (?, ?, ?, ?, ?)',
      [
        task_id,
        startTime.toISOString(),
        endTime.toISOString(),
        duration_minutes,
        `Manual entry: ${duration_minutes} minutes`
      ]
    )

    const entryId = result.lastID || result.rows[0]?.id

    const entries = await db.query(
      'SELECT * FROM time_entries WHERE id = ?',
      [entryId]
    )

    res.status(201).json(entries[0])

  } catch (error) {
    next(error)
  }
})

export default router