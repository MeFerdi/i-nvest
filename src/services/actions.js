/**
 * services/actions.js
 * Unified action execution service for all signal-triggered actions
 */

import { depositSOLToKamino, depositUSDCToKamino, depositUSDCPrimeVault, getKaminoSOLApy, getKaminoUSDCApy } from './kamino.js';
import { buySOLWithUSDC, buyUSDCWithSOL, getSwapQuote } from './dflow.js';
import { TOKENS } from '../config.js';

/**
 * Execute a signal action
 */
export async function executeSignalAction(signal, walletPublicKey, wallet, connection) {
  if (!signal.action) {
    throw new Error('No action defined for signal');
  }

  const { type, amount } = signal.action;
  const pubKeyStr = walletPublicKey.toBase58?.() || walletPublicKey;

  switch (type) {
    case 'kamino_deposit_sol':
      return depositSOLToKamino(amount, pubKeyStr, wallet, connection);
    
    case 'kamino_deposit_usdc':
      return depositUSDCToKamino(amount, pubKeyStr, wallet, connection);
    
    case 'kamino_deposit_usdc_prime':
      return depositUSDCPrimeVault(amount, pubKeyStr, wallet, connection);
    
    case 'buy_sol_dip':
      return buySOLWithUSDC(parseFloat(amount), pubKeyStr, wallet, connection);
    
    case 'sell_sol_pump':
      return buyUSDCWithSOL(parseFloat(amount), pubKeyStr, wallet, connection);
    
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
}

/**
 * Get expected yield for a deposit action
 */
export async function getExpectedYield(tokenMint, depositAmount) {
  try {
    let apy = null;
    
    if (tokenMint === TOKENS.SOL) {
      apy = await getKaminoSOLApy();
    } else if (tokenMint === TOKENS.USDC) {
      apy = await getKaminoUSDCApy();
    }

    if (!apy) return null;

    const monthlyYield = (depositAmount * (apy / 100)) / 12;
    const annualYield = depositAmount * (apy / 100);

    return {
      apy: apy.toFixed(2),
      monthlyYield: monthlyYield.toFixed(2),
      annualYield: annualYield.toFixed(2),
    };
  } catch {
    return null;
  }
}

/**
 * Get swap quote for buy actions
 */
export async function getBuyActionQuote(fromMint, toMint, amount) {
  try {
    // Convert amount to raw amount based on decimals
    let rawAmount = amount;
    
    if (fromMint === TOKENS.USDC) {
      rawAmount = Math.floor(amount * 1_000_000); // 6 decimals
    } else if (fromMint === TOKENS.SOL) {
      rawAmount = Math.floor(amount * 1_000_000_000); // 9 decimals
    }

    const quote = await getSwapQuote(fromMint, toMint, rawAmount);
    
    if (!quote) return null;

    // Extract output amount
    let outputAmount = quote.outAmount || 0;
    if (toMint === TOKENS.SOL) {
      outputAmount = outputAmount / 1_000_000_000;
    } else if (toMint === TOKENS.USDC) {
      outputAmount = outputAmount / 1_000_000;
    }

    return {
      inputAmount: amount,
      outputAmount: outputAmount.toFixed(4),
      priceImpact: quote.priceImpactPct ? quote.priceImpactPct.toFixed(2) : '0.5',
      fee: quote.platformFee ? (quote.platformFee / 1_000_000).toFixed(2) : '0',
    };
  } catch {
    return null;
  }
}

/**
 * Format action outcome message
 */
export function formatActionOutcome(signal, quote) {
  const { type, amount } = signal.action;

  if (type.includes('kamino')) {
    const apy = signal.metadata?.estimatedAPY || '8.5';
    const monthly = signal.metadata?.expectedMonthlyYield || '—';
    return `Earn ~${apy}% APY (~$${monthly}/month)`;
  }

  if (type === 'buy_sol_dip' && quote) {
    return `Swap ${amount} USDC → ~${quote.outputAmount} SOL`;
  }

  if (type === 'sell_sol_pump' && quote) {
    return `Swap ${amount} SOL → ~${quote.outputAmount} USDC`;
  }

  return 'Execute action';
}

/**
 * Validation before action execution
 */
export function validateAction(signal, walletData) {
  const { type, amount } = signal.action;
  const { solBalance, tokenBalances, prices } = walletData;

  if (type === 'kamino_deposit_sol') {
    if (!solBalance || solBalance < parseFloat(amount) + 0.01) {
      return 'Insufficient SOL balance';
    }
  }

  if (type === 'kamino_deposit_usdc' || type === 'kamino_deposit_usdc_prime') {
    const usdcBal = tokenBalances.find(t => t.mint === TOKENS.USDC)?.uiAmount ?? 0;
    if (usdcBal < parseFloat(amount)) {
      return 'Insufficient USDC balance';
    }
  }

  if (type === 'buy_sol_dip') {
    const usdcBal = tokenBalances.find(t => t.mint === TOKENS.USDC)?.uiAmount ?? 0;
    if (usdcBal < parseFloat(amount)) {
      return 'Insufficient USDC balance';
    }
  }

  if (type === 'sell_sol_pump') {
    if (!solBalance || solBalance < parseFloat(amount) + 0.01) {
      return 'Insufficient SOL balance';
    }
  }

  return null;
}
