import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { configureDatabases } from './config/database.config';
import { healthRoutes } from './api/v1/health/health.route';
import { printRoutes } from './utils/logger';
import { configureEnv } from './config/env.config';
import { Table } from 'console-table-printer';

interface EnvConfig {
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: string;
  REDIS_HOST: string;
  REDIS_PORT: string;
  PORT: string;
  HOST: string;
  JWT_SECRET: string;
}

const server = Fastify({
  logger: true
}).withTypeProvider<TypeBoxTypeProvider>();

// Start the server
const start = async () => {
  try {
    // Configure environment variables first
    await configureEnv(server);

    // Configure databases
    await server.register(configureDatabases);

    // Register routes
    await server.register(healthRoutes, { prefix: '/api/v1' });

    // Start listening
    const config = (server as any).config as EnvConfig;
    await server.listen({ 
      port: parseInt(config.PORT), 
      host: config.HOST 
    });
    
    // Print server information
    const serverInfo = new Table({
      columns: [
        { name: 'key', alignment: 'left', color: 'yellow' },
        { name: 'value', alignment: 'left', color: 'cyan' }
      ],
    });

    serverInfo.addRow({ key: 'Server URL', value: `http://${config.HOST}:${config.PORT}` });
    serverInfo.addRow({ key: 'Environment', value: process.env.NODE_ENV || 'development' });
    serverInfo.addRow({ key: 'PostgreSQL', value: `${config.POSTGRES_HOST}:${config.POSTGRES_PORT}` });
    serverInfo.addRow({ key: 'Redis', value: `${config.REDIS_HOST}:${config.REDIS_PORT}` });

    console.log('\n🚀 Server Information:');
    serverInfo.printTable();
    
    // Print available routes
    printRoutes(server);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
