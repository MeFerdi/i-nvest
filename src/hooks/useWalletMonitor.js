import { useState, useEffect, useRef, useCallback } from 'react';
import { getSOLBalance, getRecentTransactions, getTokenAccounts, getTransaction } from '../services/quicknode.js';
import { getPrices } from '../services/prices.js';
import { TOKENS } from '../config.js';

const POLL_INTERVAL = 30_000; // 30 seconds
const STORAGE_KEY = 'iinvest_monitor_state';
const LEGACY_STORAGE_KEY = 'walletintel_monitor_state';

function loadStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useWalletMonitor(walletAddress) {
  const [walletData, setWalletData] = useState({
    solBalance: null,
    tokenBalances: [],
    recentTxs: [],
    prices: {},
    lastUpdated: null,
    isLoading: true,
    error: null,
  });

  const [history, setHistory] = useState(() => {
    const stored = loadStoredState();
    return stored?.history || [];
  });

  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchWalletData = useCallback(async () => {
    if (!walletAddress) return;

    try {
      const [solBalance, txSigs, tokenAccounts, prices] = await Promise.all([
        getSOLBalance(walletAddress),
        getRecentTransactions(walletAddress, 15),
        getTokenAccounts(walletAddress),
        getPrices(),
      ]);

      // Parse token balances
      const tokenBalances = tokenAccounts
        .map(acc => {
          const info = acc.account?.data?.parsed?.info;
          if (!info) return null;
          const mint = info.mint;
          const uiAmount = info.tokenAmount?.uiAmount ?? 0;
          if (uiAmount < 0.0001) return null;
          return {
            mint,
            symbol: getTokenSymbol(mint),
            uiAmount,
            rawAmount: info.tokenAmount?.amount,
            decimals: info.tokenAmount?.decimals,
          };
        })
        .filter(Boolean);

      // Parse recent transactions with direction and rough amount (SOL deltas)
      const recentTxs = await Promise.all(
        txSigs.slice(0, 10).map(async (sig) => {
          const base = {
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            err: sig.err,
            memo: sig.memo,
            type: 'unknown',
            amount: 0,
            mint: TOKENS.SOL,
          };

          try {
            const tx = await getTransaction(sig.signature);
            if (!tx?.transaction?.message || !tx?.meta) return base;

            const keys = tx.transaction.message.accountKeys || [];
            const ownerIndex = keys.findIndex((k) => {
              const value = typeof k === 'string' ? k : k?.pubkey;
              return value === walletAddress;
            });

            if (ownerIndex < 0) return base;

            const pre = tx.meta.preBalances?.[ownerIndex] ?? 0;
            const post = tx.meta.postBalances?.[ownerIndex] ?? 0;
            const deltaLamports = post - pre;
            const deltaSol = Math.abs(deltaLamports) / 1e9;

            return {
              ...base,
              type: deltaLamports >= 0 ? 'inflow' : 'outflow',
              amount: Number(deltaSol.toFixed(6)),
            };
          } catch {
            return base;
          }
        })
      );

      const newData = {
        solBalance,
        tokenBalances,
        recentTxs,
        prices,
        lastUpdated: Date.now(),
        isLoading: false,
        error: null,
      };

      if (!mountedRef.current) return;
      setWalletData(newData);

      // Store snapshot in history for idle detection
      const snapshot = {
        timestamp: Date.now(),
        solBalance,
        tokenBalances: tokenBalances.map(t => ({ mint: t.mint, uiAmount: t.uiAmount })),
        solPrice: prices[TOKENS.SOL]?.usdPrice ?? null,
        latestTx: recentTxs[0]?.signature ?? null,
      };

      setHistory(prev => {
        const updated = [...prev.slice(-144), snapshot]; // Keep ~72h snapshots at 30s polling
        saveState({ history: updated });
        return updated;
      });

    } catch (err) {
      if (!mountedRef.current) return;
      setWalletData(prev => ({
        ...prev,
        isLoading: false,
        error: err.message,
      }));
    }
  }, [walletAddress]);

  useEffect(() => {
    mountedRef.current = true;

    if (!walletAddress) {
      setWalletData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setWalletData(prev => ({ ...prev, isLoading: true }));
    fetchWalletData();
    intervalRef.current = setInterval(fetchWalletData, POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [walletAddress, fetchWalletData]);

  const refresh = useCallback(() => {
    setWalletData(prev => ({ ...prev, isLoading: true }));
    fetchWalletData();
  }, [fetchWalletData]);

  return { walletData, history, refresh };
}

function getTokenSymbol(mint) {
  const map = {
    [TOKENS.USDC]: 'USDC',
    [TOKENS.USDT]: 'USDT',
    [TOKENS.JUP]: 'JUP',
    [TOKENS.BONK]: 'BONK',
    'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': 'JitoSOL',
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'mSOL',
    'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': 'bSOL',
    '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'RAY',
  };
  return map[mint] || mint.slice(0, 4) + '...' + mint.slice(-4);
}
