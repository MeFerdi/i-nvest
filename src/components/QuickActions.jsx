import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { ArrowLeftRight, Landmark, Loader, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { buySOLWithUSDC, buyUSDCWithSOL } from '../services/dflow.js';
import { depositSOLToKamino, depositUSDCPrimeVault } from '../services/kamino.js';
import { TOKENS } from '../config.js';
import PrimaryButton from './ui/PrimaryButton.jsx';
import SurfaceCard from './ui/SurfaceCard.jsx';
import SectionHeader from './ui/SectionHeader.jsx';

const ACTIONS = [
  { id: 'swap_sol_usdc', label: 'Swap SOL → USDC', icon: ArrowLeftRight, category: 'swap' },
  { id: 'swap_usdc_sol', label: 'Swap USDC → SOL', icon: ArrowLeftRight, category: 'swap' },
  { id: 'kamino_sol', label: 'Lend SOL on Kamino', icon: Landmark, category: 'lend' },
  { id: 'kamino_usdc', label: 'Lend USDC on Kamino', icon: Landmark, category: 'lend' },
];

export default function QuickActions({ walletData }) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('idle');
  const [txSig, setTxSig] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { solBalance, tokenBalances, prices } = walletData;
  const usdcBal = tokenBalances.find(t => t.mint === TOKENS.USDC)?.uiAmount ?? 0;
  const solPrice = prices?.[TOKENS.SOL]?.usdPrice ?? 0;

  const getMax = (actionId) => {
    if (actionId === 'swap_sol_usdc' || actionId === 'kamino_sol') return Math.max((solBalance ?? 0) - 0.01, 0).toFixed(4);
    if (actionId === 'swap_usdc_sol' || actionId === 'kamino_usdc') return usdcBal.toFixed(2);
    return '0';
  };

  const handleSelect = (id) => {
    setSelected(id === selected ? null : id);
    setAmount('');
    setStatus('idle');
    setErrorMsg('');
    setTxSig(null);
  };

  const handleExecute = async () => {
    if (!publicKey || !signTransaction || !amount || !selected) return;
    setStatus('signing');
    setErrorMsg('');
    setTxSig(null);

    const wallet = { signTransaction, publicKey };
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setStatus('error');
      setErrorMsg('Enter a valid amount.');
      return;
    }

    try {
      let sig;
      switch (selected) {
        case 'swap_sol_usdc':
          sig = await buyUSDCWithSOL(parsedAmount, publicKey.toBase58(), wallet, connection);
          break;
        case 'swap_usdc_sol':
          sig = await buySOLWithUSDC(parsedAmount, publicKey.toBase58(), wallet, connection);
          break;
        case 'kamino_sol':
          sig = await depositSOLToKamino(parsedAmount.toString(), publicKey.toBase58(), wallet, connection);
          break;
        case 'kamino_usdc':
          sig = await depositUSDCPrimeVault(parsedAmount.toString(), publicKey.toBase58(), wallet, connection);
          break;
        default:
          return;
      }
      setTxSig(Array.isArray(sig) ? sig[0] : sig);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(parseError(err));
    }
  };

  const selectedAction = ACTIONS.find(a => a.id === selected);

  return (
    <SurfaceCard className="overflow-hidden">
      <div className="px-5 py-4 border-b border-brand-border">
        <SectionHeader
          compact
          title="Quick actions"
          description="Run a direct wallet action when you already know the move."
          action={<ArrowLeftRight className="w-4 h-4 text-brand-accent" />}
        />
      </div>

      <div className="p-3 grid grid-cols-2 gap-2">
        {ACTIONS.map(action => {
          const Icon = action.icon;
          const active = selected === action.id;
          return (
            <button
              key={action.id}
              onClick={() => handleSelect(action.id)}
              type="button"
              className={`
                min-h-[44px] flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-[background-color,color,border-color,transform] text-left
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg
                ${active
                  ? 'bg-brand-accent/20 border-brand-accent/40 text-brand-accent border'
                  : 'bg-brand-bg border-brand-border text-brand-muted hover:text-brand-text hover:bg-brand-subtle/70 border'}
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs leading-tight">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Expanded action form */}
      {selected && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-brand-border">
          <div className="flex items-center justify-between">
            <span className="text-brand-text text-sm font-medium">{selectedAction.label}</span>
          </div>
          <div className="relative">
            <label htmlFor="quick-action-amount" className="mb-2 block text-xs font-semibold text-brand-text">
              Amount
            </label>
            <input
              id="quick-action-amount"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount"
              inputMode="decimal"
              className="w-full min-h-[44px] bg-brand-bg border border-brand-border text-brand-text text-sm rounded-xl px-3 py-2.5 pr-16 focus-visible:border-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/25"
            />
            <button
              type="button"
              onClick={() => setAmount(getMax(selected))}
              className="absolute right-2 top-[calc(50%+12px)] -translate-y-1/2 min-h-[32px] rounded-lg px-2.5 text-xs text-brand-accent font-medium bg-brand-accent/10 hover:bg-brand-accent/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
            >
              MAX
            </button>
          </div>

          {/* Preview value */}
          {amount && selected.startsWith('swap') && solPrice > 0 && (
            <div className="text-brand-muted text-xs">
              ≈ ${selected === 'swap_sol_usdc'
              ? (parseFloat(amount) * solPrice).toFixed(2)
                : (parseFloat(amount)).toFixed(2)} estimated value
            </div>
          )}

          {/* Status */}
          {status === 'signing' && (
            <div className="flex items-center gap-2 text-brand-yellow text-xs">
              <Loader className="w-3 h-3 animate-spin" /> Awaiting wallet approval...
            </div>
          )}
          {status === 'success' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-brand-green text-xs">
                <CheckCircle className="w-3 h-3" /> Transaction confirmed
              </div>
              {txSig && (
                <a href={`https://solscan.io/tx/${txSig}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-brand-accent hover:underline">
                  View transaction <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-1.5 text-brand-red text-xs">
              <AlertCircle className="w-3 h-3" /> {errorMsg}
            </div>
          )}

          {status !== 'success' && (
            <PrimaryButton
              onClick={handleExecute}
              disabled={!amount || status === 'signing' || !publicKey}
              className="w-full py-2.5"
              ariaLabel="Execute selected quick action"
            >
              {status === 'signing' ? 'Processing...' : 'Execute'}
            </PrimaryButton>
          )}
        </div>
      )}
    </SurfaceCard>
  );
}

function parseError(err) {
  const msg = err?.message || String(err);
  if (msg.includes('User rejected') || msg.includes('rejected')) return 'Transaction declined in wallet.';
  if (msg.includes('Insufficient')) return 'Insufficient balance for this action.';
  if (msg.includes('No swap route')) return 'No route is available right now.';
  if (msg.includes('timeout')) return 'The request timed out. Check your wallet before retrying.';
  return 'The transaction failed. Review the action and try again.';
}
