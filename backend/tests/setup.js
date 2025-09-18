import dbFactory from '../src/database/connectionFactory.js'

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.DB_TYPE = 'mysql'
process.env.MYSQL_HOST = 'localhost'
process.env.MYSQL_PORT = '3306'
process.env.MYSQL_DATABASE = 'taskify_test'
process.env.MYSQL_USER = 'root'
process.env.MYSQL_PASSWORD = 'administrator'
process.env.JWT_SECRET = 'test-secret-key'

// Global test teardown
afterAll(async () => {
  await dbFactory.closeConnection()
})