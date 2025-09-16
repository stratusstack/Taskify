import sqlite3 from 'sqlite3'
import { dbConfig } from '../../config/database.js'
import { logDatabaseOperation, logError, logStartup } from '../../middleware/logger.js'

class SQLiteConnection {
  constructor() {
    this.db = null
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbConfig.sqlite.filename, (err) => {
        if (err) {
          logError(err, 'SQLite connection failed')
          reject(err)
        } else {
          logStartup(`Connected to SQLite database: ${dbConfig.sqlite.filename}`, 'success')
          // Enable foreign keys
          this.db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) {
              logError(err, 'Failed to enable foreign keys')
            } else {
              logDatabaseOperation('PRAGMA foreign_keys = ON', 'system')
            }
          })
          resolve()
        }
      })
    })
  }

  async disconnect() {
    if (this.db) {
      return new Promise((resolve, reject) => {
        this.db.close((err) => {
          if (err) {
            logError(err, 'SQLite disconnection failed')
            reject(err)
          } else {
            logStartup('Disconnected from SQLite database', 'info')
            resolve()
          }
        })
      })
    }
  }

  async query(sql, params = []) {
    const startTime = Date.now()
    
    return new Promise((resolve, reject) => {
      const operation = sql.trim().split(' ')[0].toUpperCase()
      const tableMatch = sql.match(/(?:FROM|INTO|UPDATE|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)/i)
      const tableName = tableMatch ? tableMatch[1] : null
      
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        this.db.all(sql, params, (err, rows) => {
          const duration = Date.now() - startTime
          
          if (err) {
            logError(err, `SQLite query failed: ${sql}`)
            reject(err)
          } else {
            logDatabaseOperation(`${operation} (${rows.length} rows)`, tableName, null, duration)
            resolve(rows)
          }
        })
      } else {
        this.db.run(sql, params, function(err) {
          const duration = Date.now() - startTime
          
          if (err) {
            logError(err, `SQLite query failed: ${sql}`)
            reject(err)
          } else {
            const result = {
              changes: this.changes,
              lastID: this.lastID
            }
            logDatabaseOperation(`${operation} (${this.changes} changes)`, tableName, null, duration)
            resolve(result)
          }
        })
      }
    })
  }

  async beginTransaction() {
    return this.query('BEGIN TRANSACTION')
  }

  async commit() {
    return this.query('COMMIT')
  }

  async rollback() {
    return this.query('ROLLBACK')
  }

  getClient() {
    return this.db
  }
}

export default SQLiteConnection