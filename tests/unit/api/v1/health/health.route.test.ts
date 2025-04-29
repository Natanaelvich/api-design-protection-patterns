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
    it('should return health status when all services are up', async () => {
      // Mock successful database and redis connections
      app.pg.query = jest.fn().mockResolvedValue({ rows: [{ column1: 1 }] });
      app.redis.ping = jest.fn().mockResolvedValue('PONG');

      const response = await request(app.server)
        .get('/api/v1/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        postgres: true,
        redis: true
      });
    });

    it('should return error status when database connection fails', async () => {
      // Mock database failure
      app.pg.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      app.redis.ping = jest.fn().mockResolvedValue('PONG');

      const response = await request(app.server)
        .get('/api/v1/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        status: 'error',
        postgres: false,
        redis: true
      });
    });

    it('should return error status when redis connection fails', async () => {
      // Mock redis failure
      app.pg.query = jest.fn().mockResolvedValue({ rows: [{ column1: 1 }] });
      app.redis.ping = jest.fn().mockRejectedValue(new Error('Redis connection failed'));

      const response = await request(app.server)
        .get('/api/v1/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        status: 'error',
        postgres: true,
        redis: false
      });
    });

    it('should return error status when both services fail', async () => {
      // Mock both services failing
      app.pg.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      app.redis.ping = jest.fn().mockRejectedValue(new Error('Redis connection failed'));

      const response = await request(app.server)
        .get('/api/v1/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        status: 'error',
        postgres: false,
        redis: false
      });
    });
  });
}); 