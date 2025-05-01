import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { configureDatabases } from './config/database.config';
import { healthRoutes } from './api/v1/health/health.route';
import { printRoutes } from './utils/logger';
import { env } from './config/env';
import { Table } from 'console-table-printer';

const server = Fastify({
  logger: true
}).withTypeProvider<TypeBoxTypeProvider>();

// Start the server
const start = async () => {
  try {
    // Configure databases
    await server.register(configureDatabases);

    // Register routes
    await server.register(healthRoutes, { prefix: '/api/v1' });

    // Start listening
    await server.listen({ 
      port: parseInt(env.PORT), 
      host: env.HOST 
    });
    
    // Print server information
    const serverInfo = new Table({
      columns: [
        { name: 'key', alignment: 'left', color: 'yellow' },
        { name: 'value', alignment: 'left', color: 'cyan' }
      ],
    });

    serverInfo.addRow({ key: 'Server URL', value: `http://${env.HOST}:${env.PORT}` });
    serverInfo.addRow({ key: 'Environment', value: env.NODE_ENV });
    serverInfo.addRow({ key: 'PostgreSQL', value: `${env.POSTGRES_HOST}:${env.POSTGRES_PORT}` });
    serverInfo.addRow({ key: 'Redis', value: `${env.REDIS_HOST}:${env.REDIS_PORT}` });

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
