import { FastifyInstance } from 'fastify';
import postgres from '@fastify/postgres';
import redis from '@fastify/redis';

export const configureDatabases = async (server: FastifyInstance) => {
  const config = (server as any).config;

  // Configure PostgreSQL
  await server.register(postgres, {
    connectionString: `postgres://${config.POSTGRES_USER}:${config.POSTGRES_PASSWORD}@${config.POSTGRES_HOST}:${config.POSTGRES_PORT}/${config.POSTGRES_DB}`
  });

  // Configure Redis
  await server.register(redis, {
    host: config.REDIS_HOST,
    port: parseInt(config.REDIS_PORT)
  });
}; 