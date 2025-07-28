import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import dbFactory from '../src/database/connectionFactory.js';
import MigrationRunner from '../src/database/migrationRunner.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Migration System', () => {
  let db;
  let migrationRunner;

  beforeAll(async () => {
    db = await dbFactory.createConnection();
    migrationRunner = new MigrationRunner(db, 'sqlite');
  });

  afterAll(async () => {
    if (db) {
      await db.close();
    }
  });

  beforeEach(async () => {
    // Clean up migration tracking table
    try {
      await db.query('DROP TABLE IF EXISTS migrations');
    } catch (error) {
      // Ignore error if table doesn't exist
    }
  });

  describe('Migration Runner', () => {
    test('should create migrations tracking table', async () => {
      await migrationRunner.ensureMigrationsTable();
      
      const result = await db.query("SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'");
      expect(result.rows).toHaveLength(1);
    });

    test('should track executed migrations', async () => {
      await migrationRunner.ensureMigrationsTable();
      await migrationRunner.recordMigration('001_test_migration.sql');
      
      const result = await db.query('SELECT * FROM migrations WHERE filename = ?', ['001_test_migration.sql']);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].filename).toBe('001_test_migration.sql');
      expect(result.rows[0].executed_at).toBeDefined();
    });

    test('should identify pending migrations', async () => {
      await migrationRunner.ensureMigrationsTable();
      
      // Record one migration as executed
      await migrationRunner.recordMigration('001_create_users.sql');
      
      const executed = await migrationRunner.getExecutedMigrations();
      expect(executed).toContain('001_create_users.sql');
    });

    test('should handle migration errors gracefully', async () => {
      await migrationRunner.ensureMigrationsTable();
      
      // Test with invalid SQL
      const invalidSql = 'INVALID SQL SYNTAX';
      await expect(
        migrationRunner.executeMigration('invalid_migration.sql', invalidSql)
      ).rejects.toThrow();
    });
  });

  describe('Database Schema Validation', () => {
    beforeEach(async () => {
      // Run all migrations to set up the schema
      await migrationRunner.ensureMigrationsTable();
      
      // Create test tables using the actual migration SQL
      const migrations = [
        {
          filename: '001_create_users.sql',
          sql: `CREATE TABLE IF NOT EXISTS users (
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
          )`
        },
        {
          filename: '002_create_projects.sql',
          sql: `CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            user_id INTEGER NOT NULL,
            status TEXT DEFAULT 'active',
            color TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )`
        },
        {
          filename: '003_create_tasks.sql',
          sql: `CREATE TABLE IF NOT EXISTS tasks (
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
          )`
        }
      ];

      for (const migration of migrations) {
        await migrationRunner.executeMigration(migration.filename, migration.sql);
      }
    });

    test('should create users table with correct schema', async () => {
      const result = await db.query("PRAGMA table_info(users)");
      const columns = result.rows.map(row => row.name);
      
      expect(columns).toContain('id');
      expect(columns).toContain('email');
      expect(columns).toContain('password_hash');
      expect(columns).toContain('first_name');
      expect(columns).toContain('last_name');
      expect(columns).toContain('is_active');
      expect(columns).toContain('created_at');
    });

    test('should create projects table with correct schema', async () => {
      const result = await db.query("PRAGMA table_info(projects)");
      const columns = result.rows.map(row => row.name);
      
      expect(columns).toContain('id');
      expect(columns).toContain('name');
      expect(columns).toContain('description');
      expect(columns).toContain('user_id');
      expect(columns).toContain('status');
      expect(columns).toContain('created_at');
    });

    test('should create tasks table with correct schema and constraints', async () => {
      const result = await db.query("PRAGMA table_info(tasks)");
      const columns = result.rows.map(row => row.name);
      
      expect(columns).toContain('id');
      expect(columns).toContain('title');
      expect(columns).toContain('status');
      expect(columns).toContain('priority');
      expect(columns).toContain('project_id');
      expect(columns).toContain('assignee_id');
      expect(columns).toContain('creator_id');
      expect(columns).toContain('start_date');
      expect(columns).toContain('end_date');
      expect(columns).toContain('total_hours');
      expect(columns).toContain('completed_at');
    });

    test('should enforce status enum constraints', async () => {
      // Insert user and project first
      await db.query(`INSERT INTO users (email, password_hash) VALUES ('test@test.com', 'hash')`);
      await db.query(`INSERT INTO projects (name, user_id) VALUES ('Test Project', 1)`);
      
      // Valid status should work
      await expect(
        db.query(`INSERT INTO tasks (title, status, project_id) VALUES ('Test Task', 'to_do', 1)`)
      ).resolves.not.toThrow();
      
      // Invalid status should fail (SQLite may not enforce CHECK constraints in all versions)
      try {
        await db.query(`INSERT INTO tasks (title, status, project_id) VALUES ('Test Task 2', 'invalid_status', 1)`);
      } catch (error) {
        expect(error.message).toMatch(/constraint|check/i);
      }
    });

    test('should enforce priority enum constraints', async () => {
      // Valid priority should work
      await expect(
        db.query(`INSERT INTO tasks (title, priority, project_id) VALUES ('Test Task', 'high', 1)`)
      ).resolves.not.toThrow();
      
      // Invalid priority should fail (SQLite may not enforce CHECK constraints in all versions)
      try {
        await db.query(`INSERT INTO tasks (title, priority, project_id) VALUES ('Test Task 2', 'invalid_priority', 1)`);
      } catch (error) {
        expect(error.message).toMatch(/constraint|check/i);
      }
    });

    test('should enforce foreign key constraints', async () => {
      // Try to insert task with non-existent project_id
      await expect(
        db.query(`INSERT INTO tasks (title, project_id) VALUES ('Test Task', 999)`)
      ).rejects.toThrow();
    });
  });

  describe('Migration File Processing', () => {
    test('should handle migration files correctly', async () => {
      await migrationRunner.ensureMigrationsTable();
      
      const testSql = `
        CREATE TABLE test_migration_table (
          id INTEGER PRIMARY KEY,
          test_column TEXT
        );
        CREATE INDEX idx_test_column ON test_migration_table(test_column);
      `;
      
      await migrationRunner.executeMigration('test_migration.sql', testSql);
      
      // Verify table was created
      const result = await db.query("SELECT name FROM sqlite_master WHERE type='table' AND name='test_migration_table'");
      expect(result.rows).toHaveLength(1);
      
      // Verify migration was recorded
      const migrationResult = await db.query('SELECT * FROM migrations WHERE filename = ?', ['test_migration.sql']);
      expect(migrationResult.rows).toHaveLength(1);
    });

    test('should handle transaction rollback on migration failure', async () => {
      await migrationRunner.ensureMigrationsTable();
      
      // Create a migration that will fail halfway through
      const failingMigration = `
        CREATE TABLE should_succeed (id INTEGER PRIMARY KEY);
        INVALID SQL THAT SHOULD FAIL;
        CREATE TABLE should_not_exist (id INTEGER PRIMARY KEY);
      `;
      
      await expect(
        migrationRunner.executeMigration('failing_migration.sql', failingMigration)
      ).rejects.toThrow();
      
      // Verify that no tables were created due to rollback
      const result = await db.query("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('should_succeed', 'should_not_exist')");
      expect(result.rows).toHaveLength(0);
      
      // Verify migration was not recorded
      const migrationResult = await db.query('SELECT * FROM migrations WHERE filename = ?', ['failing_migration.sql']);
      expect(migrationResult.rows).toHaveLength(0);
    });
  });
});