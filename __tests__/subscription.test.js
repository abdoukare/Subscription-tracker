/**
 * Example Unit Tests for Subscription
 * Tests subscription CRUD operations
 */

import request from 'supertest';
import app from '../app.js';

describe('Subscription Routes - Example Tests', () => {
  let authToken = 'valid-jwt-token'; // Replace with actual token in real tests

  describe('POST /api/v1/subscription - Create Subscription', () => {
    test('should create a new subscription successfully', async () => {
      const subscriptionData = {
        name: 'Netflix',
        cost: 15.99,
        renewalDate: '2026-02-17',
        category: 'Entertainment'
      };

      const response = await request(app)
        .post('/api/v1/subscription')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subscriptionData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('Netflix');
      expect(response.body.cost).toBe(15.99);
    });

    test('should fail if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/subscription')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Netflix' }) // Missing cost and renewalDate
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('should fail if user is not authenticated', async () => {
      const response = await request(app)
        .post('/api/v1/subscription')
        .send({
          name: 'Netflix',
          cost: 15.99,
          renewalDate: '2026-02-17'
        })
        .expect(401); // Unauthorized

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/subscription - Get All Subscriptions', () => {
    test('should fetch all subscriptions for authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/subscription')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should fail if not authenticated', async () => {
      const response = await request(app)
        .get('/api/v1/subscription')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/subscription/:id - Get Single Subscription', () => {
    test('should fetch a specific subscription', async () => {
      const subscriptionId = '60d5ec49c1234567890abcde'; // Example ID

      const response = await request(app)
        .get(`/api/v1/subscription/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
    });

    test('should fail if subscription ID is invalid', async () => {
      const response = await request(app)
        .get('/api/v1/subscription/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('should return 404 if subscription not found', async () => {
      const response = await request(app)
        .get('/api/v1/subscription/60d5ec49c1234567890abcdf')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/v1/subscription/:id - Update Subscription', () => {
    test('should update subscription successfully', async () => {
      const subscriptionId = '60d5ec49c1234567890abcde';
      const updateData = {
        cost: 19.99,
        renewalDate: '2026-03-17'
      };

      const response = await request(app)
        .put(`/api/v1/subscription/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.cost).toBe(19.99);
    });

    test('should fail if subscription does not exist', async () => {
      const response = await request(app)
        .put('/api/v1/subscription/60d5ec49c1234567890abcdf')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ cost: 20 })
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /api/v1/subscription/:id - Delete Subscription', () => {
    test('should delete subscription successfully', async () => {
      const subscriptionId = '60d5ec49c1234567890abcde';

      const response = await request(app)
        .delete(`/api/v1/subscription/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/deleted|removed/i);
    });

    test('should fail if subscription not found', async () => {
      const response = await request(app)
        .delete('/api/v1/subscription/60d5ec49c1234567890abcdf')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });
});
