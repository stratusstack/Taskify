import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  type: process.env.DB_TYPE || 'sqlite', // 'postgresql' or 'sqlite'
  
  // PostgreSQL configuration
  postgresql: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'taskify',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    ssl: process.env.POSTGRES_SSL === 'true',
    max: parseInt(process.env.POSTGRES_POOL_MAX) || 20,
    idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT) || 2000,
  },
  
  // SQLite configuration
  sqlite: {
    filename: process.env.SQLITE_PATH || './database.sqlite',
    mode: process.env.SQLITE_MODE || 'readwrite', // 'readonly', 'readwrite', 'readwritecreate'
    verbose: process.env.NODE_ENV === 'development'
  }
};

export const validateConfig = () => {
  if (!['postgresql', 'sqlite'].includes(dbConfig.type)) {
    throw new Error(`Unsupported database type: ${dbConfig.type}. Use 'postgresql' or 'sqlite'.`);
  }
  
  if (dbConfig.type === 'postgresql') {
    const required = ['host', 'database', 'user', 'password'];
    const missing = required.filter(key => !dbConfig.postgresql[key]);
    if (missing.length > 0) {
      throw new Error(`Missing PostgreSQL configuration: ${missing.join(', ')}`);
    }
  }
  
  return true;
};