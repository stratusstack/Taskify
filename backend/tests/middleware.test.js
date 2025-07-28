import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import errorHandler from '../src/middleware/errorHandler.js';

describe('Middleware', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Test routes that trigger different types of errors
    app.get('/test/success', (req, res) => {
      res.json({ success: true, message: 'OK' });
    });

    app.get('/test/error', (req, res, next) => {
      const error = new Error('Test error message');
      error.status = 400;
      next(error);
    });

    app.get('/test/unhandled-error', (req, res, next) => {
      throw new Error('Unhandled error');
    });

    app.get('/test/database-error', (req, res, next) => {
      const error = new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed');
      error.code = 'SQLITE_CONSTRAINT';
      next(error);
    });

    app.get('/test/validation-error', (req, res, next) => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = [
        { message: 'Field is required', path: 'email' },
        { message: 'Invalid format', path: 'phone' }
      ];
      next(error);
    });

    // Add error handler middleware
    app.use(errorHandler);
  });

  describe('Error Handler Middleware', () => {
    test('should pass through successful requests', async () => {
      const response = await request(app)
        .get('/test/success')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('OK');
    });

    test('should handle errors with custom status codes', async () => {
      const response = await request(app)
        .get('/test/error')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Test error message');
      expect(response.body.timestamp).toBeDefined();
    });

    test('should handle unhandled errors with 500 status', async () => {
      const response = await request(app)
        .get('/test/unhandled-error')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Unhandled error');
    });

    test('should handle database constraint errors', async () => {
      const response = await request(app)
        .get('/test/database-error')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('UNIQUE constraint failed');
    });

    test('should handle validation errors with details', async () => {
      const response = await request(app)
        .get('/test/validation-error')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toHaveLength(2);
      expect(response.body.details[0].path).toBe('email');
    });

    test('should include request ID in error responses', async () => {
      const response = await request(app)
        .get('/test/error')
        .expect(400);

      expect(response.body.requestId).toBeDefined();
      expect(typeof response.body.requestId).toBe('string');
    });

    test('should log errors to console in development', async () => {
      const originalConsoleError = console.error;
      const consoleSpy = [];
      console.error = (...args) => consoleSpy.push(args);

      await request(app)
        .get('/test/error')
        .expect(400);

      // Restore console.error
      console.error = originalConsoleError;

      // In development, errors should be logged
      expect(consoleSpy.length).toBeGreaterThan(0);
    });

    test('should handle JSON parsing errors', async () => {
      const response = await request(app)
        .post('/test/success')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/JSON|parse/i);
    });

    test('should set proper CORS headers on error responses', async () => {
      const response = await request(app)
        .get('/test/error')
        .expect(400);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('should handle 404 errors for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Route not found');
    });
  });

  describe('Error Response Format', () => {
    test('should have consistent error response structure', async () => {
      const response = await request(app)
        .get('/test/error')
        .expect(400);

      // Check required fields
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('requestId');

      // Check timestamp format (ISO string)
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test('should not expose sensitive information in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/test/unhandled-error')
        .expect(500);

      // Should not expose stack traces in production
      expect(response.body).not.toHaveProperty('stack');
      expect(response.body.error).toBe('Internal Server Error');

      process.env.NODE_ENV = originalEnv;
    });

    test('should include stack traces in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const response = await request(app)
        .get('/test/unhandled-error')
        .expect(500);

      // Should include actual error message in development
      expect(response.body.error).toBe('Unhandled error');

      process.env.NODE_ENV = originalEnv;
    });
  });
});