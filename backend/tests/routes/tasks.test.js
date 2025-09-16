import request from 'supertest'
import app from '../../src/server.js'
import dbFactory from '../../src/database/connectionFactory.js'
import { runMigrations } from '../../src/database/migrationRunner.js'

describe('Tasks API', () => {
  let db
  let authToken
  let userId
  let projectId

  beforeAll(async () => {
    db = await dbFactory.createConnection()
    await runMigrations()
  })

  afterAll(async () => {
    await dbFactory.closeConnection()
  })

  beforeEach(async () => {
    // Clean up tables
    await db.query('DELETE FROM tasks')
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

    // Create test project
    const projectResponse = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Project',
        description: 'A test project'
      })

    projectId = projectResponse.body.id
  })

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        name: 'Test Task',
        description: 'A test task description',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-10T00:00:00Z',
        status: 'To Do',
        priority: 'High',
        project_id: projectId
      }

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201)

      expect(response.body.name).toBe(taskData.name)
      expect(response.body.description).toBe(taskData.description)
      expect(response.body.status).toBe(taskData.status)
      expect(response.body.priority).toBe(taskData.priority)
      expect(response.body.project_id).toBe(projectId)
      expect(response.body.user_id).toBe(userId)
      expect(response.body).toHaveProperty('project_name')
    })

    it('should create task with defaults', async () => {
      const taskData = {
        name: 'Simple Task',
        start_date: '2024-01-01T00:00:00Z',
        project_id: projectId
      }

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201)

      expect(response.body.status).toBe('To Do')
      expect(response.body.priority).toBe('Medium')
      expect(response.body.description).toBe('')
    })

    it('should reject task creation without required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)

      expect(response.body.error).toBe('Task name is required')
    })

    it('should reject task creation with non-existent project', async () => {
      const taskData = {
        name: 'Test Task',
        start_date: '2024-01-01T00:00:00Z',
        project_id: 99999
      }

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(404)

      expect(response.body.error).toBe('Project not found')
    })
  })

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Task 1',
          start_date: '2024-01-01T00:00:00Z',
          status: 'To Do',
          priority: 'High',
          project_id: projectId
        })

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Task 2',
          start_date: '2024-01-02T00:00:00Z',
          status: 'In Progress',
          priority: 'Medium',
          project_id: projectId
        })
    })

    it('should get all tasks for authenticated user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toHaveProperty('project_name')
      expect(response.body[0]).toHaveProperty('total_time_minutes')
      
      // Should be ordered by created_at DESC
      expect(response.body[0].name).toBe('Task 2')
      expect(response.body[1].name).toBe('Task 1')
    })

    it('should filter tasks by project', async () => {
      const response = await request(app)
        .get(`/api/tasks?project_id=${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      response.body.forEach(task => {
        expect(task.project_id).toBe(projectId)
      })
    })

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=To Do')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].name).toBe('Task 1')
      expect(response.body[0].status).toBe('To Do')
    })

    it('should filter tasks by priority', async () => {
      const response = await request(app)
        .get('/api/tasks?priority=High')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].name).toBe('Task 1')
      expect(response.body[0].priority).toBe('High')
    })
  })

  describe('GET /api/tasks/:id', () => {
    let taskId

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Task',
          description: 'Test description',
          start_date: '2024-01-01T00:00:00Z',
          project_id: projectId
        })

      taskId = response.body.id
    })

    it('should get single task with notes', async () => {
      // Add a note first
      await request(app)
        .post(`/api/tasks/${taskId}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Test note' })

      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.name).toBe('Test Task')
      expect(response.body.description).toBe('Test description')
      expect(response.body).toHaveProperty('notes')
      expect(response.body.notes).toHaveLength(1)
      expect(response.body.notes[0].content).toBe('Test note')
    })

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('Task not found')
    })
  })

  describe('PUT /api/tasks/:id', () => {
    let taskId

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Original Task',
          description: 'Original description',
          start_date: '2024-01-01T00:00:00Z',
          status: 'To Do',
          priority: 'Medium',
          project_id: projectId
        })

      taskId = response.body.id
    })

    it('should update task', async () => {
      const updateData = {
        name: 'Updated Task',
        description: 'Updated description',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-10T00:00:00Z',
        status: 'In Progress',
        priority: 'High'
      }

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.name).toBe(updateData.name)
      expect(response.body.description).toBe(updateData.description)
      expect(response.body.status).toBe(updateData.status)
      expect(response.body.priority).toBe(updateData.priority)
    })

    it('should reject update without name', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated description' })
        .expect(400)

      expect(response.body.error).toBe('Task name is required')
    })

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Task', start_date: '2024-01-01T00:00:00Z' })
        .expect(404)

      expect(response.body.error).toBe('Task not found')
    })
  })

  describe('DELETE /api/tasks/:id', () => {
    let taskId

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Task',
          start_date: '2024-01-01T00:00:00Z',
          project_id: projectId
        })

      taskId = response.body.id
    })

    it('should delete task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.message).toBe('Task deleted successfully')

      // Verify task was deleted
      await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('Task not found')
    })
  })

  describe('POST /api/tasks/:id/notes', () => {
    let taskId

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Task',
          start_date: '2024-01-01T00:00:00Z',
          project_id: projectId
        })

      taskId = response.body.id
    })

    it('should add note to task', async () => {
      const noteData = { content: 'This is a test note' }

      const response = await request(app)
        .post(`/api/tasks/${taskId}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData)
        .expect(201)

      expect(response.body.content).toBe(noteData.content)
      expect(response.body.task_id).toBe(taskId)
      expect(response.body).toHaveProperty('created_at')
    })

    it('should reject empty note content', async () => {
      const response = await request(app)
        .post(`/api/tasks/${taskId}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: '' })
        .expect(400)

      expect(response.body.error).toBe('Note content is required')
    })

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .post('/api/tasks/99999/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Test note' })
        .expect(404)

      expect(response.body.error).toBe('Task not found')
    })
  })
})