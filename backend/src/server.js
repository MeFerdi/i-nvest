import { buildApp } from './app.js';
import { env } from './config/env.js';

const app = buildApp();

try {
  await app.listen({
    port: env.PORT,
    host: env.HOST
  });

  const bindUrl = `http://${env.HOST}:${env.PORT}`;
  const localHost = env.HOST === '0.0.0.0' ? 'localhost' : env.HOST;
  const localUrl = `http://${localHost}:${env.PORT}`;

  app.log.info(`WeSignl backend listening on ${bindUrl} (open ${localUrl} locally)`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
