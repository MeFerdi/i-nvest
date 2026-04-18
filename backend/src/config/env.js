import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8787),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('postgres://postgres:postgres@localhost:5432/wesignl'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().default('replace-me'),
  RPC_PRIMARY_URL: z.string().default('https://api.mainnet-beta.solana.com'),
  RPC_FALLBACK_URL: z.string().default('https://api.mainnet-beta.solana.com'),
  QUICKNODE_WS_URL: z.string().default(''),
  JUPITER_BASE_URL: z.string().default('https://quote-api.jup.ag'),
  DFLOW_BASE_URL: z.string().default('https://api.dflow.net'),
  KAMINO_BASE_URL: z.string().default('https://api.kamino.finance')
});

export const env = envSchema.parse(process.env);
