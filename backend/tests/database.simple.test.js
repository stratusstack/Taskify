import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import dbFactory from '../src/database/connectionFactory.js';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_TYPE = 'sqlite';
process.env.SQLITE_DB = ':memory:';

describe('Database Simple Tests', () => {
  let db;

  beforeAll(async () => {
    db = await dbFactory.createConnection();
  });

  afterAll(async () => {
    if (db) {
      await db.close();
    }
  });

  test('should connect to database', async () => {
    expect(db).toBeTruthy();
  });

  test('should execute simple query', async () => {
    const result = await db.query('SELECT 1 as test');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].test).toBe(1);
  });

  test('should handle parameterized queries', async () => {
    await db.query('DROP TABLE IF EXISTS test_table');
    await db.query('CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT)');
    await db.query('INSERT INTO test_table (name) VALUES (?)', ['Test Name']);
    
    const result = await db.query('SELECT * FROM test_table WHERE name = ?', ['Test Name']);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].name).toBe('Test Name');
    
    await db.query('DROP TABLE test_table');
  });

  test('should enforce new enum values in schema', async () => {
    await db.query('DROP TABLE IF EXISTS test_tasks');
    await db.query(`
      CREATE TABLE test_tasks (
        id INTEGER PRIMARY KEY,
        status TEXT CHECK (status IN ('to_do', 'in_progress', 'on_hold', 'done')),
        priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical'))
      )
    `);

    // Valid enum values should work
    await expect(
      db.query('INSERT INTO test_tasks (status, priority) VALUES (?, ?)', ['to_do', 'high'])
    ).resolves.not.toThrow();

    const result = await db.query('SELECT * FROM test_tasks');
    expect(result.rows[0].status).toBe('to_do');
    expect(result.rows[0].priority).toBe('high');
    
    await db.query('DROP TABLE test_tasks');
  });
});