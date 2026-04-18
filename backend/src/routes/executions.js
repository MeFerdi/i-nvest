export function registerExecutionRoutes(app) {
  app.post('/executions/:executionId/confirm', async (request) => {
    const { executionId } = request.params;
    const { signature } = request.body || {};

    return {
      executionId,
      signature: signature || null,
      status: 'submitted'
    };
  });

  app.get('/executions/:executionId/status', async (request) => {
    const { executionId } = request.params;

    return {
      executionId,
      status: 'pending_confirmation',
      cluster: 'mainnet-beta',
      updatedAt: new Date().toISOString()
    };
  });
}
