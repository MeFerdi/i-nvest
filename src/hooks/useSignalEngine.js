import { useMemo } from 'react';
import { TOKENS, DEFAULT_THRESHOLDS } from '../config.js';

const SIGNAL_STORAGE_KEY = 'iinvest_dismissed_signals';
const LEGACY_SIGNAL_STORAGE_KEY = 'walletintel_dismissed_signals';

function getDismissed() {
  try {
    const raw = localStorage.getItem(SIGNAL_STORAGE_KEY) || localStorage.getItem(LEGACY_SIGNAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function dismissSignal(signalId) {
  const dismissed = getDismissed();
  const updated = [...dismissed, { id: signalId, at: Date.now() }];
  // Only keep last 100 dismissals, expire after 6 hours
  const fresh = updated.filter(d => Date.now() - d.at < 6 * 3600_000).slice(-100);
  localStorage.setItem(SIGNAL_STORAGE_KEY, JSON.stringify(fresh));
}

export function useSignalEngine(walletData, history, thresholds = DEFAULT_THRESHOLDS) {
  const signals = useMemo(() => {
    if (!walletData || walletData.isLoading) return [];

    const {
      solBalance,
      tokenBalances,
      recentTxs,
      prices,
    } = walletData;

    const dismissed = getDismissed().map(d => d.id);
    const detected = [];
    const now = Date.now();

    // ─── Signal 1: IDLE SOL ───────────────────────────────────────────
    if (solBalance !== null && solBalance > 0.5) {
      const idleMs = (thresholds.idleHours || 24) * 3_600_000;
      const cutoff = now - idleMs;

      // Check if latest tx is older than idleHours
      const latestTxTime = recentTxs[0]?.blockTime
        ? recentTxs[0].blockTime * 1000
        : null;

      const isIdle = !latestTxTime || latestTxTime < cutoff;

      // Also check history: was balance stable?
      const balanceStable = history.length >= 2 &&
        history.slice(-3).every(s => Math.abs((s.solBalance || 0) - solBalance) < 0.05);

      if (isIdle || balanceStable) {
        const solPrice = prices[TOKENS.SOL]?.usdPrice ?? 0;
        const idleUSD = (solBalance * solPrice).toFixed(2);
        const sigId = `idle_sol_${Math.floor(solBalance * 10)}`;

        if (!dismissed.includes(sigId)) {
          detected.push({
            id: sigId,
            type: 'idle',
            severity: 'info',
            token: 'SOL',
            title: 'Idle SOL Detected',
            insight: `Your ${solBalance.toFixed(3)} SOL (~$${idleUSD}) has been sitting unused. Depositing into Kamino lending currently earns yield while keeping funds accessible.`,
            action: {
              label: 'Deposit to Kamino',
              type: 'kamino_deposit_sol',
              amount: Math.max(solBalance - 0.05, 0).toFixed(4),
              description: `Deposit ${Math.max(solBalance - 0.05, 0).toFixed(4)} SOL into Kamino lending pool`,
              expectedOutcome: 'Earn yield while maintaining instant withdrawal',
            },
            detectedAt: now,
          });
        }
      }
    }

    // ─── Signal 2: IDLE USDC ─────────────────────────────────────────
    const usdcToken = tokenBalances.find(t => t.mint === TOKENS.USDC);
    if (usdcToken && usdcToken.uiAmount > 10) {
      const cutoff = now - (thresholds.idleHours || 24) * 3_600_000;
      const latestTxTime = recentTxs[0]?.blockTime ? recentTxs[0].blockTime * 1000 : null;
      const isIdle = !latestTxTime || latestTxTime < cutoff;

      if (isIdle) {
        const sigId = `idle_usdc_${Math.floor(usdcToken.uiAmount)}`;
        if (!dismissed.includes(sigId)) {
          detected.push({
            id: sigId,
            type: 'idle',
            severity: 'info',
            token: 'USDC',
            title: 'Idle USDC Detected',
            insight: `Your $${usdcToken.uiAmount.toFixed(2)} USDC is sitting idle. The Kamino USDC Prime vault provides optimized yield on stablecoins.`,
            action: {
              label: 'Deposit to Kamino Prime',
              type: 'kamino_deposit_usdc_prime',
              amount: (usdcToken.uiAmount * 0.9).toFixed(2),
              description: `Deposit $${(usdcToken.uiAmount * 0.9).toFixed(2)} USDC into Kamino Prime vault`,
              expectedOutcome: 'Earn optimized stablecoin yield',
            },
            detectedAt: now,
          });
        }
      }
    }

    // ─── Signal 3: SOL PRICE DROP ────────────────────────────────────
    if (history.length >= 6 && prices[TOKENS.SOL]?.usdPrice) {
      const currentPrice = prices[TOKENS.SOL].usdPrice;
      const lookbackSteps = Math.min(60, history.length - 1); // up to 30m lookback at 30s polling
      const oldSnap = history[history.length - (lookbackSteps + 1)];
      const oldPrice = oldSnap?.solPrice;

      if (oldPrice && oldPrice > 0) {
        const changePct = ((currentPrice - oldPrice) / oldPrice) * 100;
        const threshold = thresholds.priceChangePct || 5;

        if (changePct <= -threshold) {
          const sigId = `price_drop_${Math.floor(currentPrice)}_${Math.floor(Math.abs(changePct))}`;
          if (!dismissed.includes(sigId)) {
            const hasBuyingPower = (usdcToken?.uiAmount || 0) > 5 || solBalance > 0.1;
            detected.push({
              id: sigId,
              type: 'price_drop',
              severity: 'opportunity',
              token: 'SOL',
              title: `SOL Down ${Math.abs(changePct).toFixed(1)}%`,
              insight: `SOL dropped from $${oldPrice.toFixed(2)} to $${currentPrice.toFixed(2)} — a ${Math.abs(changePct).toFixed(1)}% move. ${hasBuyingPower ? 'You have buying power available.' : 'Consider accumulating more SOL.'}`,
              action: hasBuyingPower ? {
                label: 'Buy SOL via Jupiter',
                type: 'buy_sol_dip',
                amount: Math.min(usdcToken?.uiAmount || 0, thresholds.priceDropBuyAmount || 10).toFixed(2),
                description: `Swap ~$${Math.min(usdcToken?.uiAmount || 0, thresholds.priceDropBuyAmount || 10).toFixed(2)} USDC → SOL at market rate`,
                expectedOutcome: `Buy near $${currentPrice.toFixed(2)} with smart routing`,
              } : {
                label: 'View Signal',
                type: 'info',
                amount: '0',
                description: 'Price signal only — not enough buying power',
                expectedOutcome: 'Informational',
              },
              changePct,
              detectedAt: now,
            });
          }
        }

        // Price pump signal
        if (changePct >= threshold) {
          const sigId = `price_pump_${Math.floor(currentPrice)}_${Math.floor(changePct)}`;
          if (!dismissed.includes(sigId) && solBalance > 0.1) {
            detected.push({
              id: sigId,
              type: 'price_pump',
              severity: 'caution',
              token: 'SOL',
              title: `SOL Up ${changePct.toFixed(1)}%`,
              insight: `SOL surged from $${oldPrice.toFixed(2)} to $${currentPrice.toFixed(2)} (+${changePct.toFixed(1)}%). This might be a good moment to lock in gains or rebalance into stablecoins.`,
              action: {
                label: 'Swap SOL → USDC',
                type: 'sell_sol_pump',
                amount: (solBalance * 0.25).toFixed(4),
                description: `Swap ${(solBalance * 0.25).toFixed(4)} SOL → USDC at $${currentPrice.toFixed(2)}`,
                expectedOutcome: `Secure ~$${(solBalance * 0.25 * currentPrice).toFixed(2)} in stablecoins`,
              },
              changePct,
              detectedAt: now,
            });
          }
        }
      }
    }

    // ─── Signal 4: LARGE INFLOW ──────────────────────────────────────
    if (recentTxs.length >= 3) {
      const nonZero = recentTxs.filter((tx) => tx.amount > 0 && tx.type !== 'unknown');
      const inflows = nonZero.filter((tx) => tx.type === 'inflow');
      const avgInflow = inflows.length > 0
        ? inflows.reduce((sum, tx) => sum + tx.amount, 0) / inflows.length
        : 0;
      const multiplier = thresholds.largeTransactionMultiplier || 3;

      const largeTx = inflows.find((tx) => tx.amount > Math.max(1, avgInflow * multiplier));
      if (largeTx) {
        const solPrice = prices[TOKENS.SOL]?.usdPrice ?? 0;
        const diff = largeTx.amount;
        const sigId = `inflow_${largeTx.signature.slice(0, 10)}`;
        if (!dismissed.includes(sigId)) {
          detected.push({
            id: sigId,
            type: 'large_inflow',
            severity: 'opportunity',
            token: 'SOL',
            title: `Large Inflow: +${diff.toFixed(3)} SOL`,
            insight: `You received ~${diff.toFixed(3)} SOL (~$${(diff * solPrice).toFixed(2)}). New funds sitting idle is a missed yield opportunity.`,
            action: {
              label: 'Deploy to Kamino',
              type: 'kamino_deposit_sol',
              amount: (diff * 0.8).toFixed(4),
              description: `Deposit ${(diff * 0.8).toFixed(4)} SOL into Kamino lending for yield`,
              expectedOutcome: 'Start earning yield immediately on new funds',
            },
            detectedAt: now,
          });
        }
      }
    }

    // Sort: opportunities first, then info, caution
    const priority = { opportunity: 0, caution: 1, info: 2 };
    return detected.sort((a, b) => (priority[a.severity] ?? 2) - (priority[b.severity] ?? 2));
  }, [walletData, history, thresholds]);

  return signals;
}
