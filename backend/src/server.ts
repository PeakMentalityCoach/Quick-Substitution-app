import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from 'dotenv';
import playersRoutes from './routes/players.js';
import lineupsRoutes from './routes/lineups.js';
import setPiecesRoutes from './routes/set-pieces.js';
import notesRoutes from './routes/notes.js';

// Load environment variables
config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Register CORS
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Vite default port
  credentials: true,
});

// Register Swagger
await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Football Optimizer API',
      description: 'API for managing football squad, lineups, set pieces, and notes',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'players', description: 'Player management endpoints' },
      { name: 'lineups', description: 'Lineup management and optimization endpoints' },
      { name: 'set-pieces', description: 'Set piece layout endpoints' },
      { name: 'notes', description: 'Player notes endpoints' },
    ],
  },
});

// Register Swagger UI
await fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  staticCSP: true,
});

// Register routes
await fastify.register(playersRoutes, { prefix: '/api/players' });
await fastify.register(lineupsRoutes, { prefix: '/api/lineups' });
await fastify.register(setPiecesRoutes, { prefix: '/api/set-pieces' });
await fastify.register(notesRoutes, { prefix: '/api/notes' });

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Root endpoint
fastify.get('/', async (request, reply) => {
  return {
    name: 'Football Optimizer API',
    version: '1.0.0',
    documentation: '/docs',
  };
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`
🚀 Server is running!

📍 API: http://localhost:${PORT}
📚 Swagger Docs: http://localhost:${PORT}/docs
💚 Health: http://localhost:${PORT}/health
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
