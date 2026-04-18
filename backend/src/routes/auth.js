import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';

const AUTH_TOKEN_EXPIRES_IN_SECONDS = 86400;

function getJwtSecret() {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    return null;
  }

  return JWT_SECRET;
}

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

    const jwtSecret = getJwtSecret();

    if (!jwtSecret) {
      return reply.status(501).send({
        error: 'not_implemented',
        message: 'JWT issuance is not configured.'
      });
    }

    const token = jwt.sign(
      {
        walletAddress
      },
      jwtSecret,
      {
        subject: walletAddress,
        expiresIn: AUTH_TOKEN_EXPIRES_IN_SECONDS
      }
    );

    return {
      token,
      walletAddress,
      expiresInSeconds: AUTH_TOKEN_EXPIRES_IN_SECONDS
    };
  });
}
