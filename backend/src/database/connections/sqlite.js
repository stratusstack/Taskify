import sqlite3 from 'sqlite3';
import { promisify } from 'util';

class SQLiteConnection {
  constructor(config) {
    this.config = config;
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const { filename, verbose } = this.config;
      
      // Enable verbose mode for development
      const Database = verbose ? sqlite3.verbose().Database : sqlite3.Database;
      
      // Use default mode (OPEN_READWRITE | OPEN_CREATE)
      this.db = new Database(filename, (err) => {
        if (err) {
          console.error('❌ SQLite connection error:', err.message);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          
          // Enable foreign key constraints
          this.db.run('PRAGMA foreign_keys = ON;');
          
          resolve(this.db);
        }
      });
    });
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (sql.trim().toLowerCase().startsWith('select')) {
        this.db.all(sql, params, (err, rows) => {
          if (err) {
            console.error('SQLite query error:', err.message);
            reject(err);
          } else {
            resolve({ rows, rowCount: rows.length });
          }
        });
      } else {
        this.db.run(sql, params, function(err) {
          if (err) {
            console.error('SQLite query error:', err.message);
            reject(err);
          } else {
            resolve({ 
              rows: [], 
              rowCount: this.changes,
              lastID: this.lastID 
            });
          }
        });
      }
    });
  }

  async transaction(callback) {
    try {
      await this.query('BEGIN TRANSACTION');
      const result = await callback(this);
      await this.query('COMMIT');
      return result;
    } catch (error) {
      await this.query('ROLLBACK');
      throw error;
    }
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing SQLite database:', err.message);
          } else {
            console.log('🔌 SQLite connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async testConnection() {
    try {
      const result = await this.query('SELECT 1 as test');
      return result.rows[0].test === 1;
    } catch (error) {
      return false;
    }
  }
}

export default SQLiteConnection;