import { FastifyInstance } from 'fastify';
import env from '@fastify/env';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const schema = {
  type: 'object',
  required: [
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'REDIS_HOST',
    'REDIS_PORT',
    'PORT',
    'HOST',
    'JWT_SECRET'
  ],
  properties: {
    POSTGRES_USER: { type: 'string' },
    POSTGRES_PASSWORD: { type: 'string' },
    POSTGRES_DB: { type: 'string' },
    POSTGRES_HOST: { type: 'string' },
    POSTGRES_PORT: { type: 'string' },
    REDIS_HOST: { type: 'string' },
    REDIS_PORT: { type: 'string' },
    PORT: { type: 'string' },
    HOST: { type: 'string' },
    JWT_SECRET: { type: 'string' }
  }
};

const options = {
  schema,
  dotenv: true,
  data: process.env,
  confKey: 'config' // This is the key that will be used to access the config
};

export const configureEnv = async (server: FastifyInstance) => {
  return server.register(env, options);
}; 