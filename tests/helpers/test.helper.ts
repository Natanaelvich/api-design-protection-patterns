import { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import { PostgresDb } from '@fastify/postgres';
import { FastifyRedis } from '@fastify/redis';
import { healthRoutes } from '../../src/api/v1/health/health.route';

export async function build(): Promise<FastifyInstance> {
  const app = fastify({
    logger: false
  });

  // Mock PostgreSQL client
  const pgMock = {
    query: jest.fn(),
    pool: {} as PostgresDb['pool'],
    Client: {} as PostgresDb['Client'],
    connect: jest.fn(),
    transact: jest.fn()
  };

  // Mock Redis client
  const redisMock = {
    ping: jest.fn(),
    options: {},
    status: 'ready',
    stream: {} as any,
    isCluster: false
  };

  // Use type assertion to satisfy TypeScript
  (app as any).pg = pgMock;
  (app as any).redis = redisMock;

  // Register routes with the correct prefix
  await app.register(healthRoutes, { prefix: '/api/v1' });

  // Ensure server is ready before returning
  await app.ready();
  
  return app;
} 