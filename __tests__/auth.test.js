/**
 * Example Unit Tests for Authentication
 * Tests user registration and login logic
 */

import request from 'supertest';
import app from '../app.js';

describe('Auth Routes - Example Tests', () => {
  
  // Test successful user registration
  describe('POST /api/v1/auth/register - Register User', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'testuser@example.com',
        password: 'SecurePassword123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201); // Expecting 201 Created status

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('User registered successfully');
    });

    test('should fail if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'SecurePassword123'
      };

      // Try to register same email twice
      await request(app).post('/api/v1/auth/register').send(userData);
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400); // Expecting 400 Bad Request

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/already exists|already registered/i);
    });

    test('should fail with invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecurePassword123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('should fail with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123' // Too weak
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  // Test user login
  describe('POST /api/v1/auth/login - User Login', () => {
    test('should login user with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'SecurePassword123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    test('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'WrongPassword'
        })
        .expect(401); // Unauthorized

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/incorrect|invalid|wrong/i);
    });

    test('should fail if user does not exist', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'AnyPassword123'
        })
        .expect(404); // Not Found

      expect(response.body).toHaveProperty('message');
    });

    test('should fail if email is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'SomePassword123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  // Test logout
  describe('POST /api/v1/auth/logout - User Logout', () => {
    test('should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('should fail if no token provided', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401); // Unauthorized

      expect(response.body).toHaveProperty('message');
    });
  });
});
