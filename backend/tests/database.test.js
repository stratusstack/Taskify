import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import dbFactory from '../src/database/connectionFactory.js';
import { dbConfig } from '../src/config/database.js';
import SQLiteConnection from '../src/database/connections/sqlite.js';
import PostgreSQLConnection from '../src/database/connections/postgresql.js';

describe('Database Connections', () => {
  let db;

  beforeAll(async () => {
    // Create database connection for tests
    db = await dbFactory.createConnection();
  });

  afterAll(async () => {
    if (db) {
      await db.close();
    }
  });

  describe('Database Factory', () => {
    test('should create SQLite connection in test environment', async () => {
      expect(db).toBeInstanceOf(SQLiteConnection);
      expect(dbConfig.type).toBe('sqlite');
    });

    test('should create connection successfully', async () => {
      const connection = dbFactory.getConnection();
      expect(connection).toBeTruthy();
      expect(connection).toBe(db);
    });

    test('should handle invalid database type', async () => {
      const originalType = dbConfig.type;
      dbConfig.type = 'invalid';
      
      await expect(dbFactory.createConnection()).rejects.toThrow('Unsupported database type: invalid');
      
      dbConfig.type = originalType;
    });
  });

  describe('SQLite Connection', () => {
    test('should connect to SQLite database', async () => {
      const sqliteConfig = { filename: ':memory:' };
      const connection = new SQLiteConnection(sqliteConfig);
      
      await expect(connection.connect()).resolves.not.toThrow();
      await connection.close();
    });

    test('should execute queries successfully', async () => {
      const result = await db.query('SELECT 1 as test');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].test).toBe(1);
    });

    test('should handle query errors', async () => {
      await expect(db.query('INVALID SQL')).rejects.toThrow();
    });

    test('should support transactions', async () => {
      await expect(db.beginTransaction()).resolves.not.toThrow();
      await expect(db.commit()).resolves.not.toThrow();
    });

    test('should handle transaction rollback', async () => {
      await db.beginTransaction();
      await expect(db.rollback()).resolves.not.toThrow();
    });
  });

  describe('Database Configuration', () => {
    test('should have valid configuration', () => {
      expect(dbConfig).toBeDefined();
      expect(dbConfig.type).toBeDefined();
      expect(['sqlite', 'postgresql']).toContain(dbConfig.type);
    });

    test('should have SQLite config for test environment', () => {
      expect(dbConfig.sqlite).toBeDefined();
      expect(dbConfig.sqlite.filename).toBe(':memory:');
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      // Create a test table
      await db.query(`
        CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          value INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    });

    test('should insert and retrieve data', async () => {
      // Insert test data
      const insertResult = await db.query(
        'INSERT INTO test_table (name, value) VALUES (?, ?)',
        ['Test Item', 42]
      );
      
      expect(insertResult.lastID).toBeDefined();

      // Retrieve data
      const selectResult = await db.query('SELECT * FROM test_table WHERE name = ?', ['Test Item']);
      expect(selectResult.rows).toHaveLength(1);
      expect(selectResult.rows[0].name).toBe('Test Item');
      expect(selectResult.rows[0].value).toBe(42);
    });

    test('should update data', async () => {
      // Insert test data
      await db.query('INSERT INTO test_table (name, value) VALUES (?, ?)', ['Update Test', 10]);
      
      // Update data
      const updateResult = await db.query(
        'UPDATE test_table SET value = ? WHERE name = ?',
        [20, 'Update Test']
      );
      
      expect(updateResult.changes).toBe(1);

      // Verify update
      const selectResult = await db.query('SELECT value FROM test_table WHERE name = ?', ['Update Test']);
      expect(selectResult.rows[0].value).toBe(20);
    });

    test('should delete data', async () => {
      // Insert test data
      await db.query('INSERT INTO test_table (name, value) VALUES (?, ?)', ['Delete Test', 5]);
      
      // Delete data
      const deleteResult = await db.query('DELETE FROM test_table WHERE name = ?', ['Delete Test']);
      expect(deleteResult.changes).toBe(1);

      // Verify deletion
      const selectResult = await db.query('SELECT * FROM test_table WHERE name = ?', ['Delete Test']);
      expect(selectResult.rows).toHaveLength(0);
    });

    test('should handle parameterized queries safely', async () => {
      // Test SQL injection protection
      const maliciousInput = "'; DROP TABLE test_table; --";
      
      await expect(
        db.query('INSERT INTO test_table (name) VALUES (?)', [maliciousInput])
      ).resolves.not.toThrow();

      // Verify table still exists and data was inserted safely
      const result = await db.query('SELECT name FROM test_table WHERE name = ?', [maliciousInput]);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].name).toBe(maliciousInput);
    });
  });
});