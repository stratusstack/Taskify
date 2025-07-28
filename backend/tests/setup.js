import { jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_TYPE = 'sqlite';
process.env.SQLITE_DB = ':memory:'; // Use in-memory database for tests
process.env.PORT = '3001';

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock console.log for cleaner test output
const originalConsoleLog = console.log;
console.log = (...args) => {
  // Only log errors and important info during tests
  if (args[0]?.includes('❌') || args[0]?.includes('Error')) {
    originalConsoleLog(...args);
  }
};

export { jest };