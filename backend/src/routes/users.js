import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import dbFactory from '../database/connectionFactory.js'
import { dbConfig } from '../config/database.js'
import { logAuth } from '../middleware/logger.js'
import { userValidation } from '../middleware/validation.js'

const router = express.Router()

// Register new user
router.post('/register', userValidation.register, async (req, res, next) => {
  try {
    const { username, email, password } = req.body

    const db = await dbFactory.getConnection()
    
    // Check if user already exists
    const existingUsers = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    )

    if (existingUsers.length > 0) {
      logAuth('REGISTRATION', null, false, `Username/email already exists: ${username}`)
      return res.status(409).json({ 
        error: 'User with this username or email already exists' 
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    )

    // Generate JWT token
    const userId = result.lastID || result.rows[0]?.insertId || result.rows[0]?.id

    // Automatically create a hit list for the new user
    await db.query(
      'INSERT INTO hit_lists (name, user_id) VALUES (?, ?)',
      ['My Daily Todo', userId]
    )
    const token = jwt.sign(
      { userId, username, email },
      dbConfig.jwt.secret,
      { expiresIn: dbConfig.jwt.expiresIn }
    )

    logAuth('REGISTRATION', userId, true, `New user: ${username}`)
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, username, email }
    })

  } catch (error) {
    next(error)
  }
})

// Login user
router.post('/login', userValidation.login, async (req, res, next) => {
  try {
    const { username, password } = req.body

    const db = await dbFactory.getConnection()
    
    // Find user
    const users = await db.query(
      'SELECT id, username, email, password_hash FROM users WHERE username = ? OR email = ?',
      [username, username]
    )

    if (users.length === 0) {
      logAuth('LOGIN', null, false, `User not found: ${username}`)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = users[0]

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      logAuth('LOGIN', user.id, false, `Invalid password for: ${username}`)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      dbConfig.jwt.secret,
      { expiresIn: dbConfig.jwt.expiresIn }
    )

    logAuth('LOGIN', user.id, true, `Successful login: ${username}`)
    
    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      }
    })

  } catch (error) {
    next(error)
  }
})

// Get user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const db = await dbFactory.getConnection()
    
    const users = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.user.userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(users[0])

  } catch (error) {
    next(error)
  }
})

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    logAuth('TOKEN_VALIDATION', null, false, 'Missing access token')
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, dbConfig.jwt.secret, (err, user) => {
    if (err) {
      logAuth('TOKEN_VALIDATION', null, false, `Token validation failed: ${err.message}`)
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    logAuth('TOKEN_VALIDATION', user.userId, true, `Valid token for: ${user.username}`)
    req.user = user
    next()
  })
}

export { authenticateToken }
export default router