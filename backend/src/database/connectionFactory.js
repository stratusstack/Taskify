import { dbConfig } from '../config/database.js'
import SQLiteConnection from './connections/sqlite.js'
import PostgreSQLConnection from './connections/postgresql.js'
import MySQLConnection from './connections/mysql.js'

class DatabaseFactory {
  constructor() {
    this.connection = null
  }

  async createConnection() {
    if (this.connection) {
      return this.connection
    }

    switch (dbConfig.type.toLowerCase()) {
      case 'sqlite':
        this.connection = new SQLiteConnection()
        break
      case 'postgresql':
      case 'postgres':
        this.connection = new PostgreSQLConnection()
        break
      case 'mysql':
        this.connection = new MySQLConnection()
        break
      default:
        throw new Error(`Unsupported database type: ${dbConfig.type}`)
    }

    await this.connection.connect()
    return this.connection
  }

  async getConnection() {
    if (!this.connection) {
      await this.createConnection()
    }
    return this.connection
  }

  async closeConnection() {
    if (this.connection) {
      await this.connection.disconnect()
      this.connection = null
    }
  }
}

// Singleton instance
const dbFactory = new DatabaseFactory()

export default dbFactory