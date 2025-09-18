import request from 'supertest'
import app from '../../src/server.js'
import dbFactory from '../../src/database/connectionFactory.js'
import { runMigrations } from '../../src/database/migrationRunner.js'

describe('Hit Lists API', () => {
  let db
  let authToken
  let userId
  let testUser

  beforeAll(async () => {
    db = await dbFactory.createConnection()
    await runMigrations()
  })

  afterAll(async () => {
    await dbFactory.closeConnection()
  })

  beforeEach(async () => {
    // Clean up tables before each test
    await db.query('DELETE FROM todo_items')
    await db.query('DELETE FROM hit_lists')
    await db.query('DELETE FROM users')

    // Create a test user and get auth token
    testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123'
    }

    const registerResponse = await request(app)
      .post('/api/users/register')
      .send(testUser)

    authToken = registerResponse.body.token
    userId = registerResponse.body.user.id

    // Note: Hit list is now auto-created during user registration
  })

  describe('GET /api/hit-lists', () => {
    it('should return hit list auto-created during registration', async () => {
      const response = await request(app)
        .get('/api/hit-lists')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', 'My Daily Todo')
      expect(response.body).toHaveProperty('user_id', userId)
      expect(response.body).toHaveProperty('items', [])
    })

    it('should return hit list with items when they exist', async () => {
      // Add some todo items using the new endpoint
      await request(app)
        .post('/api/hit-lists/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'First todo item' })

      await request(app)
        .post('/api/hit-lists/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Second todo item' })

      // Get the hit list
      const response = await request(app)
        .get('/api/hit-lists')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('name', 'My Daily Todo')
      expect(response.body).toHaveProperty('user_id', userId)
      expect(response.body).toHaveProperty('items')
      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0]).toHaveProperty('text', 'First todo item')
      expect(response.body.items[1]).toHaveProperty('text', 'Second todo item')
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/hit-lists')
        .expect(401)
    })

    it('should reject invalid token', async () => {
      await request(app)
        .get('/api/hit-lists')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403)
    })
  })


  describe('POST /api/hit-lists/items', () => {
    it('should add todo item to user\'s hit list', async () => {
      const response = await request(app)
        .post('/api/hit-lists/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'New todo item' })
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('text', 'New todo item')
      expect(response.body).toHaveProperty('hit_list_id')
      expect(response.body).toHaveProperty('is_completed', 0)
      expect(response.body).toHaveProperty('sort_order', 1)
    })

    it('should assign proper sort order to multiple items', async () => {
      // Add first item
      const first = await request(app)
        .post('/api/hit-lists/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'First item' })

      // Add second item
      const second = await request(app)
        .post('/api/hit-lists/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Second item' })

      expect(first.body.sort_order).toBe(1)
      expect(second.body.sort_order).toBe(2)
    })

    it('should reject empty text', async () => {
      const response = await request(app)
        .post('/api/hit-lists/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: '' })
        .expect(400)

      expect(response.body.error).toContain('non-empty string')
    })

    it('should reject text longer than 500 characters', async () => {
      const longText = 'a'.repeat(501)
      const response = await request(app)
        .post('/api/hit-lists/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: longText })
        .expect(400)

      expect(response.body.error).toContain('500 characters or less')
    })

    it('should require authentication', async () => {
      await request(app)
        .post('/api/hit-lists/items')
        .send({ text: 'Test item' })
        .expect(401)
    })
  })

  describe('PUT /api/hit-lists/items/:itemId', () => {
    let todoItemId

    beforeEach(async () => {
      const itemResponse = await request(app)
        .post('/api/hit-lists/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Test item' })

      todoItemId = itemResponse.body.id
    })

    it('should update todo item text', async () => {
      const response = await request(app)
        .put(`/api/hit-lists/items/${todoItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Updated text' })
        .expect(200)

      expect(response.body).toHaveProperty('text', 'Updated text')
      expect(response.body).toHaveProperty('id', todoItemId)
    })

    it('should update todo item completion status', async () => {
      const response = await request(app)
        .put(`/api/hit-lists/items/${todoItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ is_completed: true })
        .expect(200)

      expect(response.body).toHaveProperty('is_completed', 1)
    })

    it('should update both text and completion status', async () => {
      const response = await request(app)
        .put(`/api/hit-lists/items/${todoItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Completed item', is_completed: true })
        .expect(200)

      expect(response.body).toHaveProperty('text', 'Completed item')
      expect(response.body).toHaveProperty('is_completed', 1)
    })

    it('should reject empty text', async () => {
      const response = await request(app)
        .put(`/api/hit-lists/items/${todoItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: '' })
        .expect(400)

      expect(response.body.error).toContain('non-empty string')
    })

    it('should reject invalid completion status', async () => {
      const response = await request(app)
        .put(`/api/hit-lists/items/${todoItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ is_completed: 'invalid' })
        .expect(400)

      expect(response.body.error).toContain('boolean')
    })

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .put('/api/hit-lists/items/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Updated text' })
        .expect(404)

      expect(response.body.error).toBe('Todo item not found')
    })

    it('should not allow updating items from another user\'s hit list', async () => {
      // Create another user
      const otherUser = await request(app)
        .post('/api/users/register')
        .send({
          username: 'otheruser',
          email: 'other@example.com',
          password: 'Password123'
        })

      await request(app)
        .put(`/api/hit-lists/items/${todoItemId}`)
        .set('Authorization', `Bearer ${otherUser.body.token}`)
        .send({ text: 'Updated text' })
        .expect(404)
    })
  })

  describe('DELETE /api/hit-lists/items/:itemId', () => {
    let todoItemId

    beforeEach(async () => {
      const itemResponse = await request(app)
        .post('/api/hit-lists/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Item to delete' })

      todoItemId = itemResponse.body.id
    })

    it('should delete todo item', async () => {
      const response = await request(app)
        .delete(`/api/hit-lists/items/${todoItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.message).toBe('Todo item deleted successfully')

      // Verify item is deleted
      const items = await db.query('SELECT * FROM todo_items WHERE id = ?', [todoItemId])
      expect(items).toHaveLength(0)
    })

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .delete('/api/hit-lists/items/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('Todo item not found')
    })

    it('should not allow deleting items from another user\'s hit list', async () => {
      // Create another user
      const otherUser = await request(app)
        .post('/api/users/register')
        .send({
          username: 'otheruser',
          email: 'other@example.com',
          password: 'Password123'
        })

      await request(app)
        .delete(`/api/hit-lists/items/${todoItemId}`)
        .set('Authorization', `Bearer ${otherUser.body.token}`)
        .expect(404)
    })

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/hit-lists/items/${todoItemId}`)
        .expect(401)
    })
  })

  describe('Edge Cases and Security', () => {
    it('should prevent SQL injection in text fields', async () => {
      const maliciousText = "'; DROP TABLE todo_items; --"

      const response = await request(app)
        .post('/api/hit-lists/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: maliciousText })
        .expect(201)

      expect(response.body.text).toBe(maliciousText) // Should be stored as plain text

      // Verify table still exists by fetching items
      const getResponse = await request(app)
        .get('/api/hit-lists')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(getResponse.body.items).toHaveLength(1)
    })

    it('should verify hit list is auto-created during user registration', async () => {
      // Create a new user
      const newUser = await request(app)
        .post('/api/users/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'Password123'
        })

      // Immediately check that they have a hit list
      const response = await request(app)
        .get('/api/hit-lists')
        .set('Authorization', `Bearer ${newUser.body.token}`)
        .expect(200)

      expect(response.body).toHaveProperty('name', 'My Daily Todo')
      expect(response.body).toHaveProperty('user_id', newUser.body.user.id)
      expect(response.body).toHaveProperty('items', [])
    })
  })
})