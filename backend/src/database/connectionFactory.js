import { dbConfig, validateConfig } from '../config/database.js';
import PostgreSQLConnection from './connections/postgresql.js';
import SQLiteConnection from './connections/sqlite.js';

class DatabaseConnectionFactory {
  constructor() {
    this.connection = null;
  }

  async createConnection() {
    validateConfig();
    
    const { type } = dbConfig;
    
    switch (type) {
      case 'postgresql':
        this.connection = new PostgreSQLConnection(dbConfig.postgresql);
        break;
      case 'sqlite':
        this.connection = new SQLiteConnection(dbConfig.sqlite);
        break;
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
    
    await this.connection.connect();
    return this.connection;
  }

  getConnection() {
    if (!this.connection) {
      throw new Error('Database connection not initialized. Call createConnection() first.');
    }
    return this.connection;
  }

  async closeConnection() {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  async testConnection() {
    if (!this.connection) {
      return false;
    }
    return await this.connection.testConnection();
  }
}

// Singleton instance
const dbFactory = new DatabaseConnectionFactory();

export default dbFactory;