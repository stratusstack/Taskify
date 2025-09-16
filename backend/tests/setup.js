import dbFactory from '../src/database/connectionFactory.js'

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.DB_TYPE = 'sqlite'
process.env.SQLITE_DB = ':memory:'
process.env.JWT_SECRET = 'test-secret-key'

// Global test teardown
afterAll(async () => {
  await dbFactory.closeConnection()
})