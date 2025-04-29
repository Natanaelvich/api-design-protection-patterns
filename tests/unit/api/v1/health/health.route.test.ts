import { FastifyInstance } from 'fastify';
import request from 'supertest';
import { build } from '../../../../helpers/test.helper';

describe('Health Route', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await build();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/v1/health', () => {
    it('should return health status with correct structure', async () => {
      const response = await request(app.server)
        .get('/api/v1/health')
        .expect('Content-Type', /json/)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('postgres');
      expect(response.body).toHaveProperty('redis');

      // Verify types
      expect(typeof response.body.status).toBe('string');
      expect(typeof response.body.postgres).toBe('boolean');
      expect(typeof response.body.redis).toBe('boolean');
    });
  });
}); 