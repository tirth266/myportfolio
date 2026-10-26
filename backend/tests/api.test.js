/**
 * Automated API Integration Tests — Practical 12: CI/CD Pipeline
 * 
 * Tests the core Express application pipeline:
 *  - Health check & route discovery endpoint (GET /)
 *  - Authentication middleware security guard on protected routes (GET /api/tasks)
 *  - Authorization header syntax and token tamper protection
 *  - Practical 9 cache statistics monitoring endpoint (GET /api/debug/cache-stats)
 *  - Global 404 Not Found handling
 *
 * Designed to execute cleanly in GitHub Actions CI without requiring
 * external databases or live socket bindings.
 */

const request = require('supertest');
const app = require('../server');

describe('Task Management REST API Endpoints', () => {
  beforeAll(() => {
    // Ensure JWT_SECRET is available in test environment
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'ci-testing-jwt-secret-key-at-least-32-chars-long';
  });

  describe('GET / — Root & Health Check Endpoint', () => {
    it('should return 200 OK with server health status and endpoint catalog', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Portfolio REST API is running');
      expect(res.body).toHaveProperty('endpoints');
      expect(res.body.endpoints).toHaveProperty('getAllTasks', 'GET /api/tasks');
      expect(res.body.endpoints).toHaveProperty('register', 'POST /api/auth/register');
    });
  });

  describe('GET /api/tasks — Authentication Middleware Security Guard', () => {
    it('should reject unauthenticated request with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toMatch(/Authentication required/i);
    });

    it('should reject malformed Authorization header with 401 Unauthorized', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'InvalidBearerFormat');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toMatch(/Malformed Authorization header/i);
    });

    it('should reject invalid or tampered JWT token with 401 Unauthorized', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tamperedpayload.invalidsig');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.message).toMatch(/Invalid token/i);
    });
  });

  describe('GET /api/debug/cache-stats — Cache Monitoring Endpoint', () => {
    it('should return 200 OK with in-memory cache statistics', async () => {
      const res = await request(app).get('/api/debug/cache-stats');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'In-memory cache statistics');
      expect(res.body).toHaveProperty('allTasksCache');
      expect(res.body.allTasksCache).toHaveProperty('hits');
      expect(res.body.allTasksCache).toHaveProperty('misses');
      expect(res.body).toHaveProperty('cacheKeys');
      expect(res.body).toHaveProperty('ttlSeconds', 60);
    });
  });

  describe('GET /api/nonexistent — 404 Not Found Middleware Handler', () => {
    it('should return 404 for undefined routes with structured JSON error', async () => {
      const res = await request(app).get('/api/non-existent-route-xyz');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});
