import { randomUUID } from 'node:crypto';

export function registerSignalRoutes(app) {
  app.get('/wallets/:address/signals', async (request) => {
    const { address } = request.params;

    return {
      walletAddress: address,
      source: 'backend-scaffold',
      signals: [],
      meta: {
        count: 0,
        generatedAt: new Date().toISOString()
      }
    };
  });

  app.post('/signals/:signalId/prepare-execution', async (request) => {
    const { signalId } = request.params;

    return {
      executionId: randomUUID(),
      signalId,
      status: 'prepared',
      transactionMode: 'unsigned_payload_pending',
      notes: [
        'This route should fetch quotes, simulate the route, and return an unsigned transaction to the wallet client.'
      ]
    };
  });
}
