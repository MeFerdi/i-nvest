import { randomUUID } from 'node:crypto';

export function registerAuthRoutes(app) {
  app.post('/auth/challenge', async (request, reply) => {
    const { walletAddress } = request.body || {};

    if (typeof walletAddress !== 'string' || !walletAddress.trim()) {
      return reply.status(400).send({
        error: 'invalid_request',
        message: 'walletAddress is required.'
      });
    }

    return {
      challengeId: randomUUID(),
      walletAddress,
      message: `Sign this message to authenticate with WeSignl.\nNonce: ${randomUUID()}`,
      expiresInSeconds: 300
    };
  });

  app.post('/auth/verify', async (request, reply) => {
    const { walletAddress, signedMessage } = request.body || {};

    if (!walletAddress || !signedMessage) {
      return reply.status(400).send({
        error: 'invalid_request',
        message: 'walletAddress and signedMessage are required.'
      });
    }

    return {
      token: 'scaffold-token',
      walletAddress,
      expiresInSeconds: 86400
    };
  });
}
