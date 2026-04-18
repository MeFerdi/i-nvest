import { DIALECT_PROXY, TOKENS } from '../config.js';

let priceCache = {};
let lastFetch = 0;
const CACHE_TTL = 20_000; // 20 seconds

export async function getPrices(mints = null) {
  const now = Date.now();
  if (now - lastFetch < CACHE_TTL && Object.keys(priceCache).length > 0 && !mints) {
    return priceCache;
  }

  const ids = mints
    ? mints.join(',')
    : Object.values(TOKENS).join(',');

  try {
    const res = await fetch(`${DIALECT_PROXY}/api.jup.ag/price/v3?ids=${ids}`);
    if (!res.ok) throw new Error('Price fetch failed');
    const data = await res.json();

    if (!mints) {
      priceCache = data;
      lastFetch = now;
    }
    return data;
  } catch {
    return priceCache;
  }
}

export async function getSOLPrice() {
  const prices = await getPrices();
  return prices?.[TOKENS.SOL]?.usdPrice ?? null;
}

export async function getTokenPrices(mintAddresses) {
  if (!mintAddresses || mintAddresses.length === 0) return {};
  const chunks = [];
  for (let i = 0; i < mintAddresses.length; i += 50) {
    chunks.push(mintAddresses.slice(i, i + 50));
  }
  const results = {};
  for (const chunk of chunks) {
    const data = await getPrices(chunk);
    Object.assign(results, data);
  }
  return results;
}

export async function searchToken(query) {
  try {
    const res = await fetch(`${DIALECT_PROXY}/api.jup.ag/ultra/v1/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
