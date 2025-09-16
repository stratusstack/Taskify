import request from 'supertest'
import app from '../../src/server.js'
import dbFactory from '../../src/database/connectionFactory.js'
import { runMigrations } from '../../src/database/migrationRunner.js'

describe('Projects API', () => {
  let db
  let authToken
  let userId

  beforeAll(async () => {
    db = await dbFactory.createConnection()
    await runMigrations()
  })

  afterAll(async () => {
    await dbFactory.closeConnection()
  })

  beforeEach(async () => {
    // Clean up tables
    await db.query('DELETE FROM projects')
    await db.query('DELETE FROM users')

    // Create and login test user
    const userResponse = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })

    authToken = userResponse.body.token
    userId = userResponse.body.user.id
  })

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'A test project description'
      }

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(201)

      expect(response.body.name).toBe(projectData.name)
      expect(response.body.description).toBe(projectData.description)
      expect(response.body.user_id).toBe(userId)
      expect(response.body.archived).toBeFalsy()
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('created_at')
    })

    it('should create project without description', async () => {
      const projectData = {
        name: 'Test Project'
      }

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(201)

      expect(response.body.name).toBe(projectData.name)
      expect(response.body.description).toBe('')
    })

    it('should reject project creation without name', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)

      expect(response.body.error).toBe('Project name is required')
    })

    it('should reject project creation without authentication', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'Test Project' })
        .expect(401)

      expect(response.body.error).toBe('Access token required')
    })
  })

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      // Create test projects
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Project 1', description: 'First project' })

      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Project 2', description: 'Second project' })
    })

    it('should get all projects for authenticated user', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toHaveProperty('task_count')
      expect(response.body[0]).toHaveProperty('completed_tasks')
      
      // Should be ordered by created_at DESC
      expect(response.body[0].name).toBe('Project 2')
      expect(response.body[1].name).toBe('Project 1')
    })

    it('should return empty array if no projects', async () => {
      // Clean up projects
      await db.query('DELETE FROM projects')

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(0)
    })

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(401)

      expect(response.body.error).toBe('Access token required')
    })
  })

  describe('GET /api/projects/:id', () => {
    let projectId

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Project', description: 'Test description' })

      projectId = response.body.id
    })

    it('should get single project', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.name).toBe('Test Project')
      expect(response.body.description).toBe('Test description')
      expect(response.body).toHaveProperty('task_count')
      expect(response.body).toHaveProperty('completed_tasks')
    })

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('Project not found')
    })

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .expect(401)

      expect(response.body.error).toBe('Access token required')
    })
  })

  describe('PUT /api/projects/:id', () => {
    let projectId

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Original Project', description: 'Original description' })

      projectId = response.body.id
    })

    it('should update project', async () => {
      const updateData = {
        name: 'Updated Project',
        description: 'Updated description',
        archived: true
      }

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.name).toBe(updateData.name)
      expect(response.body.description).toBe(updateData.description)
      expect(response.body.archived).toBeTruthy()
    })

    it('should reject update without name', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated description' })
        .expect(400)

      expect(response.body.error).toBe('Project name is required')
    })

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .put('/api/projects/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Project' })
        .expect(404)

      expect(response.body.error).toBe('Project not found')
    })
  })

  describe('DELETE /api/projects/:id', () => {
    let projectId

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Project', description: 'Test description' })

      projectId = response.body.id
    })

    it('should delete project', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.message).toBe('Project deleted successfully')

      // Verify project was deleted
      await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .delete('/api/projects/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('Project not found')
    })

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .expect(401)

      expect(response.body.error).toBe('Access token required')
    })
  })
})