export function registerWalletRoutes(app) {
  app.get('/wallets/:address/overview', async (request) => {
    const { address } = request.params;

    return {
      walletAddress: address,
      source: 'backend-scaffold',
      overview: {
        solBalance: null,
        portfolioValueUsd: null,
        signalsActive: 0,
        lastUpdatedAt: null
      },
      notes: [
        'This endpoint will replace browser polling for balances, transactions, and derived state.'
      ]
    };
  });

  app.post('/wallets/:address/settings', async (request) => {
    const { address } = request.params;
    const settings = request.body || {};

    return {
      walletAddress: address,
      settings,
      saved: true
    };
  });
}
