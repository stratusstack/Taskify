import express from 'express'
import dbFactory from '../database/connectionFactory.js'
import { authenticateToken } from './users.js'
import { projectValidation, paramValidation } from '../middleware/validation.js'

const router = express.Router()

// Apply authentication to all project routes
router.use(authenticateToken)

// Get all projects for authenticated user
router.get('/', async (req, res, next) => {
  try {
    const db = await dbFactory.getConnection()
    
    const projects = await db.query(
      `SELECT p.*, 
       COUNT(t.id) as task_count,
       COUNT(CASE WHEN t.status = 'Done' THEN 1 END) as completed_tasks
       FROM projects p 
       LEFT JOIN tasks t ON p.id = t.project_id 
       WHERE p.user_id = ? 
       GROUP BY p.id 
       ORDER BY p.created_at DESC`,
      [req.user.userId]
    )

    res.json(projects)

  } catch (error) {
    next(error)
  }
})

// Get single project
router.get('/:id', paramValidation.id, async (req, res, next) => {
  try {
    const db = await dbFactory.getConnection()
    
    const projects = await db.query(
      `SELECT p.*, 
       COUNT(t.id) as task_count,
       COUNT(CASE WHEN t.status = 'Done' THEN 1 END) as completed_tasks
       FROM projects p 
       LEFT JOIN tasks t ON p.id = t.project_id 
       WHERE p.id = ? AND p.user_id = ? 
       GROUP BY p.id`,
      [req.params.id, req.user.userId]
    )

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    res.json(projects[0])

  } catch (error) {
    next(error)
  }
})

// Create new project
router.post('/', projectValidation.create, async (req, res, next) => {
  try {
    const { name, description } = req.body

    const db = await dbFactory.getConnection()
    
    const result = await db.query(
      'INSERT INTO projects (name, description, user_id) VALUES (?, ?, ?)',
      [name.trim(), description || '', req.user.userId]
    )

    const projectId = result.lastID || result.rows[0]?.insertId || result.rows[0]?.id
    
    // Fetch the created project
    const projects = await db.query(
      'SELECT * FROM projects WHERE id = ?',
      [projectId]
    )

    res.status(201).json(projects[0])

  } catch (error) {
    next(error)
  }
})

// Update project
router.put('/:id', paramValidation.id, projectValidation.update, async (req, res, next) => {
  try {
    const { name, description, archived } = req.body
    const projectId = req.params.id


    const db = await dbFactory.getConnection()
    
    // Check if project exists and belongs to user
    const existingProjects = await db.query(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [projectId, req.user.userId]
    )

    if (existingProjects.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Update project
    await db.query(
      'UPDATE projects SET name = ?, description = ?, archived = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name.trim(), description || '', archived ? 1 : 0, projectId]
    )

    // Fetch updated project
    const projects = await db.query(
      'SELECT * FROM projects WHERE id = ?',
      [projectId]
    )

    res.json(projects[0])

  } catch (error) {
    next(error)
  }
})

// Delete project
router.delete('/:id', async (req, res, next) => {
  try {
    const db = await dbFactory.getConnection()
    
    // Check if project exists and belongs to user
    const existingProjects = await db.query(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    )

    if (existingProjects.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Delete project (cascade will delete associated tasks)
    await db.query('DELETE FROM projects WHERE id = ?', [req.params.id])

    res.json({ message: 'Project deleted successfully' })

  } catch (error) {
    next(error)
  }
})

export default router