import express from 'express'
import dbFactory from '../database/connectionFactory.js'
import { dbConfig } from '../config/database.js'
import { authenticateToken } from './users.js'
import { taskValidation, paramValidation } from '../middleware/validation.js'

const router = express.Router()

// Apply authentication to all task routes
router.use(authenticateToken)

// Get all tasks for authenticated user (with optional project filter)
router.get('/', async (req, res, next) => {
  try {
    const { project_id, status, priority } = req.query
    const db = await dbFactory.getConnection()
    
    let query = `
      SELECT t.*, p.name as project_name,
      COALESCE(SUM(te.duration_minutes), 0) as total_time_minutes,
      CASE t.priority
        WHEN 'Critical' THEN 1
        WHEN 'High' THEN 2
        WHEN 'Medium' THEN 3
        WHEN 'Low' THEN 4
        ELSE 5
      END as priority_order
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN time_entries te ON t.id = te.task_id
      WHERE t.user_id = ?
    `
    const params = [req.user.userId]

    if (project_id) {
      query += ' AND t.project_id = ?'
      params.push(project_id)
    }

    if (status) {
      query += ' AND t.status = ?'
      params.push(status)
    }

    if (priority) {
      query += ' AND t.priority = ?'
      params.push(priority)
    }

    query += ' GROUP BY t.id ORDER BY priority_order ASC, t.created_at DESC'

    const tasks = await db.query(query, params)
    
    // Batch load notes for all tasks (more efficient than N+1)
    if (tasks.length > 0) {
      const taskIds = tasks.map(t => t.id)
      const placeholders = taskIds.map(() => '?').join(',')
      
      const allNotes = await db.query(
        `SELECT * FROM task_notes WHERE task_id IN (${placeholders}) ORDER BY created_at DESC`,
        taskIds
      )
      
      // Group notes by task_id
      const notesByTaskId = {}
      for (const note of allNotes) {
        if (!notesByTaskId[note.task_id]) {
          notesByTaskId[note.task_id] = []
        }
        notesByTaskId[note.task_id].push(note)
      }
      
      // Assign notes to each task
      for (const task of tasks) {
        task.notes = notesByTaskId[task.id] || []
      }
    } else {
      // No tasks, just return empty array
      for (const task of tasks) {
        task.notes = []
      }
    }
    
    res.json(tasks)

  } catch (error) {
    next(error)
  }
})

// Get single task with notes
router.get('/:id', paramValidation.id, async (req, res, next) => {
  try {
    const db = await dbFactory.getConnection()
    
    // Get task details
    const tasks = await db.query(
      `SELECT t.*, p.name as project_name,
       COALESCE(SUM(te.duration_minutes), 0) as total_time_minutes
       FROM tasks t 
       JOIN projects p ON t.project_id = p.id 
       LEFT JOIN time_entries te ON t.id = te.task_id
       WHERE t.id = ? AND t.user_id = ? 
       GROUP BY t.id`,
      [req.params.id, req.user.userId]
    )

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Get task notes
    const notes = await db.query(
      'SELECT * FROM task_notes WHERE task_id = ? ORDER BY created_at DESC',
      [req.params.id]
    )

    // Get checklist items
    const checklistItems = await db.query(
      'SELECT * FROM checklist_items WHERE task_id = ? ORDER BY sort_order ASC, created_at ASC',
      [req.params.id]
    )

    const task = tasks[0]
    task.notes = notes
    task.checklist_items = checklistItems

    res.json(task)

  } catch (error) {
    next(error)
  }
})

// Create new task
router.post('/', taskValidation.create, async (req, res, next) => {
  try {
    const { name, description, start_date, end_date, status, priority, project_id } = req.body

    const db = await dbFactory.getConnection()
    
    // Verify project exists and belongs to user
    const projects = await db.query(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [project_id, req.user.userId]
    )

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Format dates for MySQL if needed
    const formatDateForDB = (dateStr) => {
      if (!dateStr) return null
      if (dbConfig.type.toLowerCase() === 'mysql') {
        return new Date(dateStr).toISOString().slice(0, 19).replace('T', ' ')
      }
      return dateStr
    }

    // Create task
    const result = await db.query(
      `INSERT INTO tasks (name, description, start_date, end_date, status, priority, project_id, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        description || '',
        formatDateForDB(start_date),
        formatDateForDB(end_date),
        status || 'To Do',
        priority || 'Medium',
        project_id,
        req.user.userId
      ]
    )

    const taskId = result.lastID || result.rows[0]?.insertId || result.rows[0]?.id
    
    // Fetch created task
    const tasks = await db.query(
      `SELECT t.*, p.name as project_name 
       FROM tasks t 
       JOIN projects p ON t.project_id = p.id 
       WHERE t.id = ?`,
      [taskId]
    )

    res.status(201).json(tasks[0])

  } catch (error) {
    next(error)
  }
})

// Update task
router.put('/:id', paramValidation.id, taskValidation.update, async (req, res, next) => {
  try {
    const { name, description, start_date, end_date, status, priority } = req.body
    const taskId = req.params.id


    const db = await dbFactory.getConnection()
    
    // Check if task exists and belongs to user
    const existingTasks = await db.query(
      'SELECT id, status FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, req.user.userId]
    )

    if (existingTasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const oldStatus = existingTasks[0].status

    // Format dates for MySQL if needed
    const formatDateForDB = (dateStr) => {
      if (!dateStr) return null
      if (dbConfig.type.toLowerCase() === 'mysql') {
        return new Date(dateStr).toISOString().slice(0, 19).replace('T', ' ')
      }
      return dateStr
    }

    // Update task
    await db.query(
      `UPDATE tasks
       SET name = ?, description = ?, start_date = ?, end_date = ?, status = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name.trim(), description || '', formatDateForDB(start_date), formatDateForDB(end_date), status || 'To Do', priority || 'Medium', taskId]
    )

    // Handle automatic timer management for status changes
    if (oldStatus !== 'In Progress' && status === 'In Progress') {
      // Starting work: check if there's already an active entry, if not create one
      const activeEntries = await db.query(
        'SELECT id FROM time_entries WHERE task_id = ? AND end_time IS NULL',
        [taskId]
      )

      if (activeEntries.length === 0) {
        await db.query(
          'INSERT INTO time_entries (task_id, start_time) VALUES (?, ?)',
          [taskId, formatDateForDB(new Date().toISOString())]
        )
      }
    }

    // If status changed from "In Progress", stop time tracking
    if (oldStatus === 'In Progress' && status !== 'In Progress') {
      const now = new Date().toISOString()
      const activeEntries = await db.query(
        'SELECT id, start_time FROM time_entries WHERE task_id = ? AND end_time IS NULL',
        [taskId]
      )

      for (const entry of activeEntries) {
        const startTime = new Date(entry.start_time)
        const endTime = new Date(now)
        const durationMinutes = Math.round((endTime - startTime) / (1000 * 60))

        await db.query(
          'UPDATE time_entries SET end_time = ?, duration_minutes = ? WHERE id = ?',
          [formatDateForDB(now), durationMinutes, entry.id]
        )
      }
    }

    // Fetch updated task with total time
    const tasks = await db.query(
      `SELECT t.*, p.name as project_name,
       COALESCE(SUM(te.duration_minutes), 0) as total_time_minutes
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN time_entries te ON t.id = te.task_id
       WHERE t.id = ?
       GROUP BY t.id`,
      [taskId]
    )

    res.json(tasks[0])

  } catch (error) {
    next(error)
  }
})

// Delete task
router.delete('/:id', paramValidation.id, async (req, res, next) => {
  try {
    const db = await dbFactory.getConnection()
    
    // Check if task exists and belongs to user
    const existingTasks = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    )

    if (existingTasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Delete task (cascade will delete notes, time entries, reminders)
    await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id])

    res.json({ message: 'Task deleted successfully' })

  } catch (error) {
    next(error)
  }
})

// Add note to task
router.post('/:id/notes', paramValidation.id, taskValidation.addNote, async (req, res, next) => {
  try {
    const { content } = req.body


    const db = await dbFactory.getConnection()
    
    // Check if task exists and belongs to user
    const tasks = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    )

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Create note
    const result = await db.query(
      'INSERT INTO task_notes (task_id, content) VALUES (?, ?)',
      [req.params.id, content.trim()]
    )

    const noteId = result.lastID || result.rows[0]?.insertId || result.rows[0]?.id

    // Fetch created note
    const notes = await db.query(
      'SELECT * FROM task_notes WHERE id = ?',
      [noteId]
    )

    res.status(201).json(notes[0])

  } catch (error) {
    next(error)
  }
})

export default router