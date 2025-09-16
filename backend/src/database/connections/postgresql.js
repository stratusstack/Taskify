import pg from 'pg'
import { dbConfig } from '../../config/database.js'
import { logDatabaseOperation, logError, logStartup } from '../../middleware/logger.js'

const { Pool } = pg

class PostgreSQLConnection {
  constructor() {
    this.pool = null
  }

  async connect() {
    try {
      this.pool = new Pool({
        host: dbConfig.postgresql.host,
        port: dbConfig.postgresql.port,
        database: dbConfig.postgresql.database,
        user: dbConfig.postgresql.user,
        password: dbConfig.postgresql.password,
      })

      // Test connection
      const client = await this.pool.connect()
      logStartup(`Connected to PostgreSQL database: ${dbConfig.postgresql.database}`, 'success')
      client.release()
    } catch (error) {
      logError(error, 'PostgreSQL connection failed')
      throw error
    }
  }

  async disconnect() {
    if (this.pool) {
      try {
        await this.pool.end()
        logStartup('Disconnected from PostgreSQL database', 'info')
      } catch (error) {
        logError(error, 'PostgreSQL disconnection failed')
        throw error
      }
    }
  }

  async query(sql, params = []) {
    const startTime = Date.now()
    const client = await this.pool.connect()
    
    try {
      const operation = sql.trim().split(' ')[0].toUpperCase()
      const tableMatch = sql.match(/(?:FROM|INTO|UPDATE|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)/i)
      const tableName = tableMatch ? tableMatch[1] : null
      
      const result = await client.query(sql, params)
      const duration = Date.now() - startTime
      
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        logDatabaseOperation(`${operation} (${result.rows.length} rows)`, tableName, null, duration)
        return result.rows
      } else {
        logDatabaseOperation(`${operation} (${result.rowCount} changes)`, tableName, null, duration)
        return {
          changes: result.rowCount,
          rows: result.rows
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      logError(error, `PostgreSQL query failed (${duration}ms): ${sql}`)
      throw error
    } finally {
      client.release()
    }
  }

  async beginTransaction() {
    const client = await this.pool.connect()
    await client.query('BEGIN')
    return client
  }

  async commit(client) {
    await client.query('COMMIT')
    client.release()
  }

  async rollback(client) {
    await client.query('ROLLBACK')
    client.release()
  }

  getClient() {
    return this.pool
  }
}

export default PostgreSQLConnection