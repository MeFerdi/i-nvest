import { DIALECT_PROXY, DFLOW_PROXY, TOKENS, SOLANA_RPC_PROXY } from '../config.js';
import { VersionedTransaction } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';

async function swapViaDFlow(inputMint, outputMint, amount, walletPublicKey, wallet) {
  try {
    const quoteRes = await fetch(`${DFLOW_PROXY}/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputMint, outputMint, amount, taker: walletPublicKey }),
    });
    if (!quoteRes.ok) return null;

    const quote = await quoteRes.json();
    if (!quote?.transaction) return null;

    const tx = VersionedTransaction.deserialize(Buffer.from(quote.transaction, 'base64'));
    const signedTx = await wallet.signTransaction(tx);

    const execRes = await fetch(`${DFLOW_PROXY}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteId: quote.quoteId,
        signedTransaction: Buffer.from(signedTx.serialize()).toString('base64'),
      }),
    });

    if (!execRes.ok) return null;
    const exec = await execRes.json();
    return exec?.signature || null;
  } catch {
    return null;
  }
}

async function confirmPolling(connection, sig, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    const res = await connection.getSignatureStatus(sig);
    const status = res?.value;
    if (status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized') {
      if (status.err) throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
      return status;
    }
    await new Promise(r => setTimeout(r, 1500));
  }
  throw new Error('Transaction confirmation timeout');
}

// Swap using Jupiter Ultra API (via Dialect proxy)
export async function swapViaJupiter(inputMint, outputMint, amount, walletPublicKey, wallet, connection) {
  // Try DFlow first; if unavailable, fallback to Jupiter routes.
  const dflowSig = await swapViaDFlow(inputMint, outputMint, amount, walletPublicKey, wallet);
  if (dflowSig) return dflowSig;

  // Step 1: Get order
  const orderRes = await fetch(
    `${DIALECT_PROXY}/api.jup.ag/ultra/v1/order?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&taker=${walletPublicKey}`
  );
  if (!orderRes.ok) {
    const err = await orderRes.text();
    throw new Error(`Jupiter order failed: ${err}`);
  }
  const orderData = await orderRes.json();
  if (!orderData.transaction) throw new Error('No transaction in Jupiter response');

  // Step 2: Sign
  const tx = VersionedTransaction.deserialize(Buffer.from(orderData.transaction, 'base64'));
  const signedTx = await wallet.signTransaction(tx);

  // Step 3: Execute via Jupiter (NOT sendRawTransaction)
  const execRes = await fetch(`${DIALECT_PROXY}/api.jup.ag/ultra/v1/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestId: orderData.requestId,
      signedTransaction: Buffer.from(signedTx.serialize()).toString('base64'),
    }),
  });
  const execData = await execRes.json();
  if (execData.status !== 'Success') {
    // Fallback to Metis
    return swapViaMetis(inputMint, outputMint, amount, walletPublicKey, wallet, connection);
  }
  return execData.signature;
}

// Fallback swap via Jupiter Metis
async function swapViaMetis(inputMint, outputMint, amount, walletPublicKey, wallet, connection) {
  const quoteRes = await fetch(
    `${DIALECT_PROXY}/api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=100`
  );
  if (!quoteRes.ok) throw new Error('No swap route available');
  const quote = await quoteRes.json();

  const swapRes = await fetch(`${DIALECT_PROXY}/api.jup.ag/swap/v1/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quoteResponse: quote, userPublicKey: walletPublicKey, wrapAndUnwrapSol: true }),
  });
  const { swapTransaction } = await swapRes.json();

  const tx = VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'));
  const signedTx = await wallet.signTransaction(tx);
  const rpcConnection = new Connection(SOLANA_RPC_PROXY, 'confirmed');
  const sig = await rpcConnection.sendRawTransaction(signedTx.serialize(), { skipPreflight: true });
  await confirmPolling(rpcConnection, sig);
  return sig;
}

// Buy SOL with USDC
export async function buySOLWithUSDC(usdcAmount, walletPublicKey, wallet, connection) {
  const rawAmount = Math.floor(usdcAmount * 1_000_000); // USDC has 6 decimals
  return swapViaJupiter(TOKENS.USDC, TOKENS.SOL, rawAmount, walletPublicKey, wallet, connection);
}

// Buy USDC with SOL
export async function buyUSDCWithSOL(solAmount, walletPublicKey, wallet, connection) {
  const rawAmount = Math.floor(solAmount * 1_000_000_000); // SOL has 9 decimals
  return swapViaJupiter(TOKENS.SOL, TOKENS.USDC, rawAmount, walletPublicKey, wallet, connection);
}

// Get swap quote (no execution)
export async function getSwapQuote(inputMint, outputMint, amount) {
  try {
    const res = await fetch(
      `${DIALECT_PROXY}/api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}
