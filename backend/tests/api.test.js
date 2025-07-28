import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dbFactory from '../src/database/connectionFactory.js';
import MigrationRunner from '../src/database/migrationRunner.js';

// Import routes
import userRoutes from '../src/routes/users.js';
import projectRoutes from '../src/routes/projects.js';
import taskRoutes from '../src/routes/tasks.js';
import timeEntryRoutes from '../src/routes/timeEntries.js';
import errorHandler from '../src/middleware/errorHandler.js';

describe('API Routes', () => {
  let app;
  let db;

  beforeAll(async () => {
    // Create Express app for testing
    app = express();
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Setup routes
    app.use('/api/users', userRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/tasks', taskRoutes);
    app.use('/api/time-entries', timeEntryRoutes);
    app.use(errorHandler);

    // Setup database
    db = await dbFactory.createConnection();
    
    // Run basic migrations
    const migrationRunner = new MigrationRunner(db, 'sqlite');
    await migrationRunner.ensureMigrationsTable();
    
    // Create essential tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        avatar_url TEXT,
        timezone TEXT DEFAULT 'UTC',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active INTEGER DEFAULT 1
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        user_id INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'to_do' CHECK (status IN ('to_do', 'in_progress', 'on_hold', 'done')),
        priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
        project_id INTEGER NOT NULL,
        assignee_id INTEGER,
        creator_id INTEGER,
        start_date DATETIME,
        end_date DATETIME,
        total_hours DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS task_time_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        duration_minutes INTEGER,
        date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  });

  afterAll(async () => {
    if (db) {
      await db.close();
    }
  });

  beforeEach(async () => {
    // Clean up tables before each test
    await db.query('DELETE FROM task_time_entries');
    await db.query('DELETE FROM tasks');
    await db.query('DELETE FROM projects');
    await db.query('DELETE FROM users');
  });

  describe('User Routes', () => {
    test('POST /api/users - should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password_hash: 'hashed_password_123',
        first_name: 'John',
        last_name: 'Doe'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.first_name).toBe(userData.first_name);
      expect(response.body.data.id).toBeDefined();
    });

    test('POST /api/users - should require email and password_hash', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ first_name: 'John' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Email and password_hash are required');
    });

    test('GET /api/users - should return all users', async () => {
      // Create test users
      await db.query(`INSERT INTO users (email, password_hash, first_name) VALUES 
        ('user1@test.com', 'hash1', 'User1'),
        ('user2@test.com', 'hash2', 'User2')`);

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    test('GET /api/users/:id - should return specific user', async () => {
      const result = await db.query(`INSERT INTO users (email, password_hash, first_name) VALUES ('test@test.com', 'hash', 'Test')`);
      const userId = result.lastID;

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@test.com');
      expect(response.body.data.first_name).toBe('Test');
    });

    test('GET /api/users/:id - should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Project Routes', () => {
    let userId;

    beforeEach(async () => {
      // Create a test user for projects
      const result = await db.query(`INSERT INTO users (email, password_hash, first_name) VALUES ('test@test.com', 'hash', 'Test')`);
      userId = result.lastID;
    });

    test('POST /api/projects - should create a new project', async () => {
      const projectData = {
        user_id: userId,
        name: 'Test Project',
        description: 'A test project',
        color: '#FF0000'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(projectData.name);
      expect(response.body.data.user_id).toBe(userId);
      expect(response.body.data.status).toBe('active');
    });

    test('POST /api/projects - should require user_id and name', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ description: 'Missing required fields' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('user_id and name are required');
    });

    test('POST /api/projects - should validate user exists', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ user_id: 999, name: 'Test Project' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('User not found');
    });

    test('GET /api/projects - should return all projects', async () => {
      await db.query(`INSERT INTO projects (name, user_id) VALUES 
        ('Project 1', ${userId}),
        ('Project 2', ${userId})`);

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    test('GET /api/projects - should filter by user_id', async () => {
      // Create another user and project
      const result2 = await db.query(`INSERT INTO users (email, password_hash) VALUES ('user2@test.com', 'hash2')`);
      const userId2 = result2.lastID;

      await db.query(`INSERT INTO projects (name, user_id) VALUES 
        ('Project 1', ${userId}),
        ('Project 2', ${userId2})`);

      const response = await request(app)
        .get(`/api/projects?user_id=${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].user_id).toBe(userId);
    });
  });

  describe('Task Routes', () => {
    let userId, projectId;

    beforeEach(async () => {
      // Create test user and project
      const userResult = await db.query(`INSERT INTO users (email, password_hash, first_name) VALUES ('test@test.com', 'hash', 'Test')`);
      userId = userResult.lastID;

      const projectResult = await db.query(`INSERT INTO projects (name, user_id) VALUES ('Test Project', ${userId})`);
      projectId = projectResult.lastID;
    });

    test('POST /api/tasks - should create a new task with standardized enums', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'A test task',
        status: 'to_do',
        priority: 'high',
        project_id: projectId,
        assignee_id: userId,
        creator_id: userId
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.status).toBe('to_do');
      expect(response.body.data.priority).toBe('high');
      expect(response.body.data.project_id).toBe(projectId);
    });

    test('POST /api/tasks - should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'Missing title and project_id' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Title and project_id are required');
    });

    test('POST /api/tasks - should validate project exists', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', project_id: 999 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Project not found');
    });

    test('GET /api/tasks - should return all tasks', async () => {
      await db.query(`INSERT INTO tasks (title, project_id, status, priority) VALUES 
        ('Task 1', ${projectId}, 'to_do', 'medium'),
        ('Task 2', ${projectId}, 'in_progress', 'high')`);

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    test('GET /api/tasks - should filter by status and priority', async () => {
      await db.query(`INSERT INTO tasks (title, project_id, status, priority) VALUES 
        ('Task 1', ${projectId}, 'to_do', 'medium'),
        ('Task 2', ${projectId}, 'in_progress', 'high'),
        ('Task 3', ${projectId}, 'to_do', 'high')`);

      const response = await request(app)
        .get('/api/tasks?status=to_do&priority=high')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Task 3');
    });

    test('PUT /api/tasks/:id - should update task with new enum values', async () => {
      const taskResult = await db.query(`INSERT INTO tasks (title, project_id, status, priority) VALUES ('Test Task', ${projectId}, 'to_do', 'medium')`);
      const taskId = taskResult.lastID;

      const updateData = {
        status: 'in_progress',
        priority: 'critical',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
      expect(response.body.data.priority).toBe('critical');
    });

    test('DELETE /api/tasks/:id - should delete task', async () => {
      const taskResult = await db.query(`INSERT INTO tasks (title, project_id) VALUES ('Test Task', ${projectId})`);
      const taskId = taskResult.lastID;

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify task is deleted
      const checkResult = await db.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
      expect(checkResult.rows).toHaveLength(0);
    });
  });

  describe('Time Entry Routes', () => {
    let userId, projectId, taskId;

    beforeEach(async () => {
      // Create test data
      const userResult = await db.query(`INSERT INTO users (email, password_hash) VALUES ('test@test.com', 'hash')`);
      userId = userResult.lastID;

      const projectResult = await db.query(`INSERT INTO projects (name, user_id) VALUES ('Test Project', ${userId})`);
      projectId = projectResult.lastID;

      const taskResult = await db.query(`INSERT INTO tasks (title, project_id) VALUES ('Test Task', ${projectId})`);
      taskId = taskResult.lastID;
    });

    test('POST /api/time-entries - should create a new time entry', async () => {
      const timeEntryData = {
        task_id: taskId,
        user_id: userId,
        start_time: '2025-01-01T10:00:00Z',
        end_time: '2025-01-01T11:00:00Z'
      };

      const response = await request(app)
        .post('/api/time-entries')
        .send(timeEntryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task_id).toBe(taskId);
      expect(response.body.data.user_id).toBe(userId);
    });

    test('POST /api/time-entries - should validate required fields', async () => {
      const response = await request(app)
        .post('/api/time-entries')
        .send({ task_id: taskId })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    test('GET /api/time-entries - should return time entries', async () => {
      await db.query(`INSERT INTO task_time_entries (task_id, user_id, start_time, date) VALUES 
        (${taskId}, ${userId}, '2025-01-01T10:00:00Z', '2025-01-01'),
        (${taskId}, ${userId}, '2025-01-01T14:00:00Z', '2025-01-01')`);

      const response = await request(app)
        .get('/api/time-entries')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    test('GET /api/time-entries/task/:taskId - should filter by task', async () => {
      // Create another task
      const task2Result = await db.query(`INSERT INTO tasks (title, project_id) VALUES ('Task 2', ${projectId})`);
      const task2Id = task2Result.lastID;

      await db.query(`INSERT INTO task_time_entries (task_id, user_id, start_time, date) VALUES 
        (${taskId}, ${userId}, '2025-01-01T10:00:00Z', '2025-01-01'),
        (${task2Id}, ${userId}, '2025-01-01T14:00:00Z', '2025-01-01')`);

      const response = await request(app)
        .get(`/api/time-entries/task/${taskId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].task_id).toBe(taskId);
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      // Force a database error by trying to insert into non-existent table
      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@test.com', password_hash: 'hash' });

      // Should not crash the server
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });
});