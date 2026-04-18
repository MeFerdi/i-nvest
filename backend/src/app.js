import Fastify from 'fastify';
import { env } from './config/env.js';
import { registerRoutes } from './routes/index.js';

export function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test'
  });

  app.addHook('onRequest', async (request, reply) => {
    reply.header('access-control-allow-origin', env.APP_ORIGIN);
    reply.header('access-control-allow-methods', 'GET,POST,OPTIONS');
    reply.header('access-control-allow-headers', 'content-type,authorization');

    if (request.method === 'OPTIONS') {
      return reply.status(204).send();
    }
  });

  app.decorate('services', {
    signalEngine: {
      version: 'v1',
      mode: 'scaffold'
    }
  });

  registerRoutes(app);

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    reply.status(500).send({
      error: 'internal_error',
      message: 'The backend encountered an unexpected error.'
    });
  });

  return app;
}
