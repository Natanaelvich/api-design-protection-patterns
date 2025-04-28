import { FastifyInstance } from 'fastify';
import postgres from '@fastify/postgres';
import redis from '@fastify/redis';

interface EnvConfig {
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: string;
  REDIS_HOST: string;
  REDIS_PORT: string;
}

export const configureDatabases = async (server: FastifyInstance) => {
  const config = (server as any).config as EnvConfig;

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