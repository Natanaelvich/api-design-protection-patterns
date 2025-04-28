import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';

const server = Fastify({
  logger: true
}).withTypeProvider<TypeBoxTypeProvider>();

// Define a route with TypeBox schema
server.get('/', {
  schema: {
    response: {
      200: Type.Object({
        message: Type.String()
      })
    }
  }
}, async (request, reply) => {
  return { message: 'Hello from Fastify!' };
});

// Start the server
const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
