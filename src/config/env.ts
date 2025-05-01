import { config } from 'dotenv';
import { z } from 'zod';

config(); // Load environment variables from .env

const envSchema = z.object({
  // PostgreSQL Configuration
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string(),
  
  // Redis Configuration
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  
  // Server Configuration
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(10, 'JWT secret must be at least 10 characters long'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Error loading environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data; 