import express from 'express'
import dbFactory from '../database/connectionFactory.js'
import { authenticateToken } from './users.js'

const router = express.Router()

// Apply authentication to all checklist routes
router.use(authenticateToken)

// Get all checklist items for a task
router.get('/task/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params
    const db = await dbFactory.getConnection()

    // Verify task belongs to user
    const tasks = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, req.user.userId]
    )

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Get checklist items ordered by sort_order
    const items = await db.query(
      'SELECT * FROM checklist_items WHERE task_id = ? ORDER BY sort_order ASC, created_at ASC',
      [taskId]
    )

    res.json(items)

  } catch (error) {
    next(error)
  }
})

// Create new checklist item
router.post('/task/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params
    const { text } = req.body

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' })
    }

    const db = await dbFactory.getConnection()

    // Verify task belongs to user
    const tasks = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, req.user.userId]
    )

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Get the next sort order (max + 1)
    const sortOrderResult = await db.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM checklist_items WHERE task_id = ?',
      [taskId]
    )
    const sortOrder = sortOrderResult[0].next_order

    // Create checklist item
    const result = await db.query(
      'INSERT INTO checklist_items (task_id, text, sort_order) VALUES (?, ?, ?)',
      [taskId, text.trim(), sortOrder]
    )

    const itemId = result.lastID || result.rows[0]?.id

    // Fetch created item
    const items = await db.query(
      'SELECT * FROM checklist_items WHERE id = ?',
      [itemId]
    )

    res.status(201).json(items[0])

  } catch (error) {
    next(error)
  }
})

// Update checklist item
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { text, is_completed } = req.body

    const db = await dbFactory.getConnection()

    // Verify checklist item belongs to user's task
    const items = await db.query(
      `SELECT ci.* FROM checklist_items ci
       JOIN tasks t ON ci.task_id = t.id
       WHERE ci.id = ? AND t.user_id = ?`,
      [id, req.user.userId]
    )

    if (items.length === 0) {
      return res.status(404).json({ error: 'Checklist item not found' })
    }

    const updates = []
    const values = []

    if (text !== undefined) {
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'Text cannot be empty' })
      }
      updates.push('text = ?')
      values.push(text.trim())
    }

    if (is_completed !== undefined) {
      updates.push('is_completed = ?')
      values.push(is_completed ? 1 : 0)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    // Update checklist item
    await db.query(
      `UPDATE checklist_items SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    // Fetch updated item
    const updatedItems = await db.query(
      'SELECT * FROM checklist_items WHERE id = ?',
      [id]
    )

    res.json(updatedItems[0])

  } catch (error) {
    next(error)
  }
})

// Delete checklist item
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const db = await dbFactory.getConnection()

    // Verify checklist item belongs to user's task
    const items = await db.query(
      `SELECT ci.* FROM checklist_items ci
       JOIN tasks t ON ci.task_id = t.id
       WHERE ci.id = ? AND t.user_id = ?`,
      [id, req.user.userId]
    )

    if (items.length === 0) {
      return res.status(404).json({ error: 'Checklist item not found' })
    }

    // Delete checklist item
    await db.query('DELETE FROM checklist_items WHERE id = ?', [id])

    res.json({ message: 'Checklist item deleted successfully' })

  } catch (error) {
    next(error)
  }
})

// Reorder checklist items
router.put('/task/:taskId/reorder', async (req, res, next) => {
  try {
    const { taskId } = req.params
    const { itemIds } = req.body // Array of item IDs in new order

    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ error: 'itemIds must be an array' })
    }

    const db = await dbFactory.getConnection()

    // Verify task belongs to user
    const tasks = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, req.user.userId]
    )

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Update sort order for each item
    for (let i = 0; i < itemIds.length; i++) {
      await db.query(
        'UPDATE checklist_items SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND task_id = ?',
        [i, itemIds[i], taskId]
      )
    }

    // Return updated items
    const items = await db.query(
      'SELECT * FROM checklist_items WHERE task_id = ? ORDER BY sort_order ASC, created_at ASC',
      [taskId]
    )

    res.json(items)

  } catch (error) {
    next(error)
  }
})

export default router