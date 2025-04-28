import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';

const healthSchema = {
  response: {
    200: Type.Object({
      status: Type.String(),
      postgres: Type.Boolean(),
      redis: Type.Boolean()
    })
  }
};

export async function healthRoutes(server: FastifyInstance) {
  server.get('/health', {
    schema: healthSchema
  }, async (request, reply) => {
    try {
      // Check PostgreSQL connection
      const pgResult = await server.pg.query('SELECT 1');
      const pgStatus = pgResult.rows[0]?.column1 === 1;

      // Check Redis connection
      await server.redis.ping();
      const redisStatus = true;

      return {
        status: 'ok',
        postgres: pgStatus,
        redis: redisStatus
      };
    } catch (error) {
      server.log.error(error);
      return {
        status: 'error',
        postgres: false,
        redis: false
      };
    }
  });
} 