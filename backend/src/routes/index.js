import { registerHealthRoutes } from './health.js';
import { registerAuthRoutes } from './auth.js';
import { registerWalletRoutes } from './wallets.js';
import { registerSignalRoutes } from './signals.js';
import { registerExecutionRoutes } from './executions.js';

export function registerRoutes(app) {
  registerHealthRoutes(app);
  registerAuthRoutes(app);
  registerWalletRoutes(app);
  registerSignalRoutes(app);
  registerExecutionRoutes(app);
}
