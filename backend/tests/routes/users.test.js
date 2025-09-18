import request from 'supertest'
import app from '../../src/server.js'
import dbFactory from '../../src/database/connectionFactory.js'
import { runMigrations } from '../../src/database/migrationRunner.js'

describe('Users API', () => {
  let db

  beforeAll(async () => {
    db = await dbFactory.createConnection()
    await runMigrations()
  })

  afterAll(async () => {
    await dbFactory.closeConnection()
  })

  beforeEach(async () => {
    // Clean up users table before each test
    await db.query('DELETE FROM users')
  })

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
      }

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.username).toBe(userData.username)
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user).not.toHaveProperty('password_hash')
      expect(response.body.message).toBe('User created successfully')
    })

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser'
          // missing email and password
        })
        .expect(400)

      expect(response.body.error).toBe('Username, email, and password are required')
    })

    it('should reject registration with duplicate username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test1@example.com',
        password: 'Password123'
      }

      // Create first user
      await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201)

      // Try to create second user with same username
      const duplicateUser = {
        username: 'testuser',
        email: 'test2@example.com',
        password: 'Password123'
      }

      const response = await request(app)
        .post('/api/users/register')
        .send(duplicateUser)
        .expect(409)

      expect(response.body.error).toBe('User with this username or email already exists')
    })

    it('should reject registration with duplicate email', async () => {
      const userData = {
        username: 'testuser1',
        email: 'test@example.com',
        password: 'Password123'
      }

      // Create first user
      await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201)

      // Try to create second user with same email
      const duplicateUser = {
        username: 'testuser2',
        email: 'test@example.com',
        password: 'Password123'
      }

      const response = await request(app)
        .post('/api/users/register')
        .send(duplicateUser)
        .expect(409)

      expect(response.body.error).toBe('User with this username or email already exists')
    })
  })

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123'
        })
    })

    it('should login with valid credentials (username)', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testuser',
          password: 'Password123'
        })
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.username).toBe('testuser')
      expect(response.body.message).toBe('Login successful')
    })

    it('should login with valid credentials (email)', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          username: 'test@example.com',
          password: 'Password123'
        })
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe('test@example.com')
    })

    it('should reject login with invalid username', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          username: 'nonexistent',
          password: 'Password123'
        })
        .expect(401)

      expect(response.body.error).toBe('Invalid credentials')
    })

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        })
        .expect(401)

      expect(response.body.error).toBe('Invalid credentials')
    })

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testuser'
          // missing password
        })
        .expect(400)

      expect(response.body.error).toBe('Username and password are required')
    })
  })

  describe('GET /api/users/profile', () => {
    let authToken

    beforeEach(async () => {
      // Create and login a test user
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123'
        })

      authToken = response.body.token
    })

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.username).toBe('testuser')
      expect(response.body.email).toBe('test@example.com')
      expect(response.body).toHaveProperty('created_at')
      expect(response.body).not.toHaveProperty('password_hash')
    })

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401)

      expect(response.body.error).toBe('Access token required')
    })

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403)

      expect(response.body.error).toBe('Invalid or expired token')
    })
  })
})