import mysql from 'mysql2/promise'
import { dbConfig } from '../../config/database.js'
import { logDatabaseOperation, logError, logStartup } from '../../middleware/logger.js'

class MySQLConnection {
  constructor() {
    this.pool = null
    this.currentTransaction = null
  }

  async connect() {
    try {
      this.pool = mysql.createPool({
        host: dbConfig.mysql.host,
        port: dbConfig.mysql.port,
        database: dbConfig.mysql.database,
        user: dbConfig.mysql.user,
        password: dbConfig.mysql.password,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      })

      // Test connection
      const connection = await this.pool.getConnection()
      logStartup(`Connected to MySQL database: ${dbConfig.mysql.database}`, 'success')
      connection.release()
    } catch (error) {
      logError(error, 'MySQL connection failed')
      throw error
    }
  }

  async disconnect() {
    if (this.pool) {
      try {
        await this.pool.end()
        logStartup('Disconnected from MySQL database', 'info')
      } catch (error) {
        logError(error, 'MySQL disconnection failed')
        throw error
      }
    }
  }

  async query(sql, params = []) {
    const startTime = Date.now()

    try {
      const operation = sql.trim().split(' ')[0].toUpperCase()
      const tableMatch = sql.match(/(?:FROM|INTO|UPDATE|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)/i)
      const tableName = tableMatch ? tableMatch[1] : null

      // Use transaction connection if available, otherwise use pool
      const connection = this.currentTransaction || this.pool
      const [result] = await connection.execute(sql, params)
      const duration = Date.now() - startTime

      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        logDatabaseOperation(`${operation} (${result.length} rows)`, tableName, null, duration)
        return result
      } else {
        const changes = result.affectedRows || 0
        logDatabaseOperation(`${operation} (${changes} changes)`, tableName, null, duration)
        return {
          changes: changes,
          rows: result.insertId ? [{ insertId: result.insertId }] : []
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      logError(error, `MySQL query failed (${duration}ms): ${sql}`)
      throw error
    }
  }

  async beginTransaction() {
    this.currentTransaction = await this.pool.getConnection()
    await this.currentTransaction.beginTransaction()
    return this.currentTransaction
  }

  async commit(connection = null) {
    const conn = connection || this.currentTransaction
    if (conn) {
      await conn.commit()
      conn.release()
      if (!connection) this.currentTransaction = null
    }
  }

  async rollback(connection = null) {
    const conn = connection || this.currentTransaction
    if (conn) {
      await conn.rollback()
      conn.release()
      if (!connection) this.currentTransaction = null
    }
  }

  getClient() {
    return this.pool
  }
}

export default MySQLConnection