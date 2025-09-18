import express from 'express'
import dbFactory from '../database/connectionFactory.js'
import { authenticateToken } from './users.js'

const router = express.Router()

// Apply authentication to all hit list routes
router.use(authenticateToken)

// Validation middleware for hit list operations
const validateTodoItem = (req, res, next) => {
  const { text } = req.body

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({
      error: 'Text is required and must be a non-empty string'
    })
  }

  if (text.trim().length > 500) {
    return res.status(400).json({
      error: 'Text must be 500 characters or less'
    })
  }

  next()
}

const validateItemUpdate = (req, res, next) => {
  const { text, is_completed } = req.body

  if (text !== undefined) {
    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Text must be a non-empty string'
      })
    }

    if (text.trim().length > 500) {
      return res.status(400).json({
        error: 'Text must be 500 characters or less'
      })
    }
  }

  if (is_completed !== undefined && typeof is_completed !== 'boolean') {
    return res.status(400).json({
      error: 'is_completed must be a boolean'
    })
  }

  next()
}

// Get user's hit list with items
router.get('/', async (req, res, next) => {
  try {
    const db = await dbFactory.getConnection()

    // Get user's hit list
    let hitLists = await db.query(
      'SELECT * FROM hit_lists WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.user.userId]
    )

    // If no hit list exists, create one automatically
    if (hitLists.length === 0) {
      const result = await db.query(
        'INSERT INTO hit_lists (name, user_id) VALUES (?, ?)',
        ['My Hit List', req.user.userId]
      )

      const hitListId = result.lastID || result.rows[0]?.id || result.rows[0]?.insertId

      hitLists = await db.query(
        'SELECT * FROM hit_lists WHERE id = ?',
        [hitListId]
      )
    }

    const hitList = hitLists[0]

    // Get todo items for this hit list
    const todoItems = await db.query(
      'SELECT * FROM todo_items WHERE hit_list_id = ? ORDER BY sort_order ASC, created_at ASC',
      [hitList.id]
    )

    hitList.items = todoItems
    res.json(hitList)

  } catch (error) {
    next(error)
  }
})


// Add todo item to user's hit list
router.post('/items', validateTodoItem, async (req, res, next) => {
  try {
    const { text } = req.body
    const db = await dbFactory.getConnection()

    // Get user's hit list (guaranteed to exist due to auto-creation)
    const hitLists = await db.query(
      'SELECT id FROM hit_lists WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.user.userId]
    )

    if (hitLists.length === 0) {
      return res.status(500).json({ error: 'Hit list not found - this should not happen' })
    }

    const hitListId = hitLists[0].id

    // Get next sort order
    const sortOrders = await db.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM todo_items WHERE hit_list_id = ?',
      [hitListId]
    )

    const nextOrder = sortOrders[0].next_order

    // Create todo item
    const result = await db.query(
      'INSERT INTO todo_items (hit_list_id, text, sort_order) VALUES (?, ?, ?)',
      [hitListId, text.trim(), nextOrder]
    )

    const itemId = result.lastID || result.rows[0]?.id || result.rows[0]?.insertId

    // Fetch created item
    const items = await db.query(
      'SELECT * FROM todo_items WHERE id = ?',
      [itemId]
    )

    res.status(201).json(items[0])

  } catch (error) {
    next(error)
  }
})

// Update todo item (text or completion status)
router.put('/items/:itemId', validateItemUpdate, async (req, res, next) => {
  try {
    const { text, is_completed } = req.body
    const db = await dbFactory.getConnection()

    // Check if todo item exists and belongs to user's hit list
    const items = await db.query(
      `SELECT ti.id FROM todo_items ti
       JOIN hit_lists hl ON ti.hit_list_id = hl.id
       WHERE ti.id = ? AND hl.user_id = ?`,
      [req.params.itemId, req.user.userId]
    )

    if (items.length === 0) {
      return res.status(404).json({ error: 'Todo item not found' })
    }

    // Build update query dynamically
    const updates = []
    const values = []

    if (text !== undefined) {
      updates.push('text = ?')
      values.push(text.trim())
    }

    if (is_completed !== undefined) {
      updates.push('is_completed = ?')
      values.push(is_completed)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(req.params.itemId)

    // Update todo item
    await db.query(
      `UPDATE todo_items SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    // Fetch updated item
    const updatedItems = await db.query(
      'SELECT * FROM todo_items WHERE id = ?',
      [req.params.itemId]
    )

    res.json(updatedItems[0])

  } catch (error) {
    next(error)
  }
})

// Delete todo item
router.delete('/items/:itemId', async (req, res, next) => {
  try {
    const db = await dbFactory.getConnection()

    // Check if todo item exists and belongs to user's hit list
    const items = await db.query(
      `SELECT ti.id FROM todo_items ti
       JOIN hit_lists hl ON ti.hit_list_id = hl.id
       WHERE ti.id = ? AND hl.user_id = ?`,
      [req.params.itemId, req.user.userId]
    )

    if (items.length === 0) {
      return res.status(404).json({ error: 'Todo item not found' })
    }

    // Delete todo item
    await db.query('DELETE FROM todo_items WHERE id = ?', [req.params.itemId])

    res.json({ message: 'Todo item deleted successfully' })

  } catch (error) {
    next(error)
  }
})

export default router