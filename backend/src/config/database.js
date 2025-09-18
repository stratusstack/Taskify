import dotenv from 'dotenv'

dotenv.config()

export const dbConfig = {
  type: process.env.DB_TYPE || 'sqlite',
  postgresql: {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    database: process.env.PG_DATABASE || 'taskify',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    database: process.env.MYSQL_DATABASE || 'taskify',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD
  },
  sqlite: {
    filename: (() => {
      if (process.env.SQLITE_DB) {
        return process.env.SQLITE_DB;
      }

      if (typeof window !== 'undefined' && window.electronAPI) {
        const { app } = require('electron');
        const path = require('path');
        return path.join(app.getPath('userData'), 'taskify.sqlite');
      }

      return './database.sqlite';
    })(),
    verbose: process.env.NODE_ENV === 'development'
  },
  jwt: {
    secret: (() => {
      const secret = process.env.JWT_SECRET
      if (!secret) {
        console.error('CRITICAL ERROR: JWT_SECRET environment variable is not set!')
        console.error('Please set JWT_SECRET to a secure random string in your environment.')
        process.exit(1)
      }
      return secret
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
}