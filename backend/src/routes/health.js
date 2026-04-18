export function registerHealthRoutes(app) {
  app.get('/health', async () => {
    return {
      ok: true,
      service: 'wesignl-backend',
      signalEngine: app.services.signalEngine.version,
      timestamp: new Date().toISOString()
    };
  });
}
