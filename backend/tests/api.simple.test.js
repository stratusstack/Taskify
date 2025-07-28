import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dbFactory from '../src/database/connectionFactory.js';
import userRoutes from '../src/routes/users.js';
import projectRoutes from '../src/routes/projects.js';
import taskRoutes from '../src/routes/tasks.js';
import errorHandler from '../src/middleware/errorHandler.js';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_TYPE = 'sqlite';
process.env.SQLITE_DB = ':memory:';

describe('API Simple Tests', () => {
  let app;
  let db;

  beforeAll(async () => {
    // Create Express app for testing
    app = express();
    app.use(cors());
    app.use(express.json());

    // Setup routes
    app.use('/api/users', userRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/tasks', taskRoutes);
    app.use(errorHandler);

    // Setup database
    db = await dbFactory.createConnection();
    
    // Create essential tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id)
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
    await db.query('DELETE FROM tasks');
    await db.query('DELETE FROM projects');
    await db.query('DELETE FROM users');
  });

  test('should create user with new API', async () => {
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
  });

  test('should create project and task with standardized enums', async () => {
    // Create user
    const userResponse = await request(app)
      .post('/api/users')
      .send({
        email: 'test@test.com',
        password_hash: 'hash'
      });
    
    const userId = userResponse.body.data.id;

    // Create project
    const projectResponse = await request(app)
      .post('/api/projects')
      .send({
        user_id: userId,
        name: 'Test Project'
      })
      .expect(201);

    const projectId = projectResponse.body.data.id;

    // Create task with new enum values
    const taskResponse = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Test Task',
        status: 'to_do',
        priority: 'high',
        project_id: projectId
      })
      .expect(201);

    expect(taskResponse.body.data.status).toBe('to_do');
    expect(taskResponse.body.data.priority).toBe('high');
  });

  test('should update task status with new enum values', async () => {
    // Setup test data
    const userResult = await db.query(`INSERT INTO users (email, password_hash) VALUES ('test@test.com', 'hash')`);
    const userId = userResult.lastID;

    const projectResult = await db.query(`INSERT INTO projects (name, user_id) VALUES ('Test Project', ${userId})`);
    const projectId = projectResult.lastID;

    const taskResult = await db.query(`INSERT INTO tasks (title, project_id, status, priority) VALUES ('Test Task', ${projectId}, 'to_do', 'medium')`);
    const taskId = taskResult.lastID;

    // Update task with new enum values
    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({
        status: 'in_progress',
        priority: 'critical'
      })
      .expect(200);

    expect(response.body.data.status).toBe('in_progress');
    expect(response.body.data.priority).toBe('critical');
  });

  test('should filter tasks by new enum values', async () => {
    // Setup test data
    const userResult = await db.query(`INSERT INTO users (email, password_hash) VALUES ('test@test.com', 'hash')`);
    const userId = userResult.lastID;

    const projectResult = await db.query(`INSERT INTO projects (name, user_id) VALUES ('Test Project', ${userId})`);
    const projectId = projectResult.lastID;

    await db.query(`INSERT INTO tasks (title, project_id, status, priority) VALUES 
      ('Task 1', ${projectId}, 'to_do', 'high'),
      ('Task 2', ${projectId}, 'in_progress', 'medium'),
      ('Task 3', ${projectId}, 'to_do', 'low')`);

    // Filter by status
    const response = await request(app)
      .get('/api/tasks?status=to_do')
      .expect(200);

    expect(response.body.data).toHaveLength(2);
    response.body.data.forEach(task => {
      expect(task.status).toBe('to_do');
    });
  });

  test('should handle errors gracefully', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('required');
  });
});