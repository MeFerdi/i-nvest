import { DIALECT_PROXY, KAMINO_MAIN_MARKET, SOL_RESERVE_MAIN, USDC_RESERVE_MAIN, USDC_PRIME_VAULT } from '../config.js';
import { VersionedTransaction, Transaction } from '@solana/web3.js';

async function confirmTransactionPolling(connection, signature, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await connection.getSignatureStatus(signature);
    const status = response?.value;
    if (status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized') {
      if (status.err) throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
      return status;
    }
    await new Promise(r => setTimeout(r, 1500));
  }
  throw new Error('Transaction confirmation timeout');
}

async function executeBlink(url, walletPublicKey, wallet, connection, multiTx = false) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: multiTx ? 'transactions' : 'transaction', account: walletPublicKey }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Blink error ${res.status}: ${errText}`);
  }
  const data = await res.json();

  const txList = multiTx
    ? (data.transactions || [])
    : [data.transaction].filter(Boolean);

  if (txList.length === 0) throw new Error('No transaction returned from API');

  const signatures = [];
  for (const txBase64 of txList) {
    const txBuffer = Buffer.from(txBase64, 'base64');
    let tx;
    try { tx = VersionedTransaction.deserialize(txBuffer); }
    catch { tx = Transaction.from(txBuffer); }

    const signedTx = await wallet.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: false, maxRetries: 3 });
    await confirmTransactionPolling(connection, sig);
    signatures.push(sig);
  }
  return signatures;
}

// Deposit SOL into Kamino main market lending
export async function depositSOLToKamino(amount, walletPublicKey, wallet, connection) {
  const url = `${DIALECT_PROXY}/kamino.dial.to/api/v0/lending/reserve/${KAMINO_MAIN_MARKET}/${SOL_RESERVE_MAIN}/deposit?amount=${amount}`;
  return executeBlink(url, walletPublicKey, wallet, connection);
}

// Deposit USDC into Kamino lending
export async function depositUSDCToKamino(amount, walletPublicKey, wallet, connection) {
  const url = `${DIALECT_PROXY}/kamino.dial.to/api/v0/lending/reserve/${KAMINO_MAIN_MARKET}/${USDC_RESERVE_MAIN}/deposit?amount=${amount}`;
  return executeBlink(url, walletPublicKey, wallet, connection);
}

// Deposit USDC into Kamino Lend Prime Vault (optimized yield)
export async function depositUSDCPrimeVault(amount, walletPublicKey, wallet, connection) {
  const url = `${DIALECT_PROXY}/kamino.dial.to/api/v0/lend/${USDC_PRIME_VAULT}/deposit?amount=${amount}`;
  return executeBlink(url, walletPublicKey, wallet, connection);
}

// Get estimated APY for SOL on Kamino main market
export async function getKaminoSOLApy() {
  try {
    const res = await fetch(`${DIALECT_PROXY}/kamino.dial.to/api/v0/lending/reserve/${KAMINO_MAIN_MARKET}/${SOL_RESERVE_MAIN}/deposit`);
    if (!res.ok) return null;
    const data = await res.json();
    // Extract APY from description or links
    const desc = data?.description || '';
    const match = desc.match(/([\d.]+)%/);
    return match ? parseFloat(match[1]) : null;
  } catch {
    return null;
  }
}

export async function getKaminoUSDCApy() {
  try {
    const res = await fetch(`${DIALECT_PROXY}/kamino.dial.to/api/v0/lend/${USDC_PRIME_VAULT}/deposit`);
    if (!res.ok) return null;
    const data = await res.json();
    const desc = data?.description || '';
    const match = desc.match(/([\d.]+)%/);
    return match ? parseFloat(match[1]) : null;
  } catch {
    return null;
  }
}
