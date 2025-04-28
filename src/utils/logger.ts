import { FastifyInstance, RouteOptions, FastifySchema } from 'fastify';
import { Table } from 'console-table-printer';

interface RouteInfo extends Omit<RouteOptions, 'schema'> {
  method: string | string[];
  url: string;
  schema?: FastifySchema;
}

export const printRoutes = (server: FastifyInstance) => {
  const p = new Table({
    columns: [
      { name: 'method', alignment: 'left', color: 'green' },
      { name: 'url', alignment: 'left', color: 'cyan' },
      { name: 'schema', alignment: 'left' }
    ],
  });

  // Get routes using Fastify's plugin system
  const routes = server.printRoutes();
  
  // Parse the routes string
  const routeLines = routes.split('\n');
  routeLines.forEach(line => {
    // Look for lines that contain route information
    if (line.includes('(') && line.includes(')')) {
      // Extract the URL and methods
      const urlMatch = line.match(/└──\s+([^\s(]+)/);
      const methodsMatch = line.match(/\(([^)]+)\)/);
      
      if (urlMatch && methodsMatch) {
        const url = urlMatch[1];
        const methods = methodsMatch[1].split(', ');
        
        methods.forEach(method => {
          p.addRow({
            method: method.toUpperCase(),
            url: `/${url}`,
            schema: '✓' // Since we're using TypeBox, all our routes have schemas
          });
        });
      }
    }
  });

  console.log('\n🛣️  Available Routes:');
  p.printTable();
}; 