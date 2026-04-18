import { QUICKNODE_RPC, SOLANA_RPC_PROXY } from '../config.js';

async function rpcCall(method, params = [], useQuickNode = true) {
  const endpoint = useQuickNode ? QUICKNODE_RPC : SOLANA_RPC_PROXY;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  if (!response.ok) throw new Error(`RPC failed: ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'RPC error');
  return data.result;
}

export async function getSOLBalance(address) {
  try {
    const result = await rpcCall('getBalance', [address, { commitment: 'confirmed' }]);
    return (result?.value ?? 0) / 1e9;
  } catch {
    // Fallback to SOLANA_RPC_PROXY
    const result = await rpcCall('getBalance', [address, { commitment: 'confirmed' }], false);
    return (result?.value ?? 0) / 1e9;
  }
}

export async function getRecentTransactions(address, limit = 20) {
  try {
    const signatures = await rpcCall('getSignaturesForAddress', [
      address,
      { limit, commitment: 'confirmed' },
    ]);
    return signatures || [];
  } catch {
    try {
      const signatures = await rpcCall('getSignaturesForAddress', [
        address,
        { limit, commitment: 'confirmed' },
      ], false);
      return signatures || [];
    } catch {
      return [];
    }
  }
}

export async function getTokenAccounts(address) {
  try {
    const result = await rpcCall('getTokenAccountsByOwner', [
      address,
      { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
      { encoding: 'jsonParsed', commitment: 'confirmed' },
    ]);
    return result?.value || [];
  } catch {
    try {
      const result = await rpcCall('getTokenAccountsByOwner', [
        address,
        { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { encoding: 'jsonParsed', commitment: 'confirmed' },
      ], false);
      return result?.value || [];
    } catch {
      return [];
    }
  }
}

export async function getTransaction(signature) {
  try {
    const result = await rpcCall('getTransaction', [
      signature,
      { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 },
    ]);
    return result;
  } catch {
    return null;
  }
}

export async function getSlot() {
  try {
    return await rpcCall('getSlot', [], true);
  } catch {
    return 0;
  }
}

export async function getAccountInfo(address) {
  try {
    const result = await rpcCall('getAccountInfo', [address, { encoding: 'jsonParsed' }]);
    return result?.value || null;
  } catch {
    return null;
  }
}
