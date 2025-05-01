import { FastifyInstance } from 'fastify';
import postgres from '@fastify/postgres';
import redis from '@fastify/redis';
import { env } from './env';

export const configureDatabases = async (server: FastifyInstance) => {
  // Configure PostgreSQL
  await server.register(postgres, {
    connectionString: `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`
  });

  // Configure Redis
  await server.register(redis, {
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT)
  });
}; 