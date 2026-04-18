import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8787),
  HOST: z.string().trim().min(1).default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ORIGIN: z.string().trim().min(1).default('http://localhost:5173'),
  DATABASE_URL: z.string().default('postgres://postgres:postgres@localhost:5432/wesignl'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().optional(),
  RPC_PRIMARY_URL: z.string().default('https://api.mainnet-beta.solana.com'),
  RPC_FALLBACK_URL: z.string().default('https://api.mainnet-beta.solana.com'),
  QUICKNODE_WS_URL: z.string().default(''),
  JUPITER_BASE_URL: z.string().default('https://quote-api.jup.ag'),
  DFLOW_BASE_URL: z.string().default('https://api.dflow.net'),
  KAMINO_BASE_URL: z.string().default('https://api.kamino.finance')
}).superRefine((env, ctx) => {
  const jwtSecret = env.JWT_SECRET?.trim();

  if (env.NODE_ENV === 'production' && !jwtSecret) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['JWT_SECRET'],
      message: 'JWT_SECRET is required in production'
    });
    return;
  }

  if (!jwtSecret) {
    return;
  }

  if (jwtSecret === 'replace-me') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['JWT_SECRET'],
      message: 'JWT_SECRET must not use the placeholder value "replace-me"'
    });
  }

  if (jwtSecret.length < 32) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['JWT_SECRET'],
      message: 'JWT_SECRET must be at least 32 characters long'
    });
  }
});

export const env = envSchema.parse(process.env);
