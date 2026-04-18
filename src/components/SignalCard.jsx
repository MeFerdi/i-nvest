import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  TrendingDown, TrendingUp, Clock, ArrowDownUp, X,
  CheckCircle, AlertCircle, Loader, ExternalLink, ChevronDown, ChevronUp, Shield
} from 'lucide-react';
import { executeSignalAction } from '../services/actions.js';
import { dismissSignal } from '../hooks/useSignalEngine.js';
import ConfirmModal from './ui/ConfirmModal.jsx';
import PrimaryButton from './ui/PrimaryButton.jsx';

const SEVERITY_CONFIG = {
  opportunity: {
    bg: 'border-brand-green/30 bg-brand-green/5',
    badge: 'bg-brand-green/20 text-brand-green',
    label: 'Opportunity',
    dot: 'bg-brand-green',
  },
  caution: {
    bg: 'border-brand-yellow/30 bg-brand-yellow/5',
    badge: 'bg-brand-yellow/20 text-brand-yellow',
    label: 'Caution',
    dot: 'bg-brand-yellow',
  },
  info: {
    bg: 'border-brand-blue/30 bg-brand-blue/5',
    badge: 'bg-brand-blue/20 text-brand-blue',
    label: 'Insight',
    dot: 'bg-brand-blue',
  },
};

const TYPE_ICON = {
  idle: Clock,
  price_drop: TrendingDown,
  price_pump: TrendingUp,
  large_inflow: ArrowDownUp,
};

export default function SignalCard({ signal, onDismiss, onExecuted }) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [status, setStatus] = useState('idle'); // idle | signing | confirming | success | error
  const [txSig, setTxSig] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const config = SEVERITY_CONFIG[signal.severity] || SEVERITY_CONFIG.info;
  const Icon = TYPE_ICON[signal.type] || Clock;

  const handleDismiss = () => {
    dismissSignal(signal.id);
    onDismiss(signal.id);
  };

  const handleExecute = async () => {
    if (!publicKey || !signTransaction) return;

    setConfirmOpen(false);
    setStatus('signing');
    setErrorMsg('');

    try {
      const wallet = { signTransaction, publicKey };
      const needsNetworkConfirm = signal.action.type === 'buy_sol_dip' || signal.action.type === 'sell_sol_pump';
      if (needsNetworkConfirm) setStatus('confirming');
      const sig = await executeSignalAction(signal, publicKey, wallet, connection);

      setTxSig(Array.isArray(sig) ? sig[0] : sig);
      setStatus('success');
      setTimeout(() => onExecuted && onExecuted(signal.id), 3000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(parseError(err));
    }
  };

  return (
    <>
    <div className={`border rounded-2xl p-5 animate-slide-up transition-all hover:-translate-y-0.5 shadow-[0_0_0_1px_rgba(30,33,48,0.4),0_8px_30px_rgba(0,0,0,0.25)] ${config.bg}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.badge}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-brand-text font-semibold text-sm">{signal.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
                {config.label}
              </span>
            </div>
            <span className="text-brand-muted text-xs">
              {formatTime(signal.detectedAt)}
            </span>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          type="button"
          className="text-brand-muted hover:text-brand-text transition-colors p-1 rounded-lg hover:bg-brand-subtle/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
          aria-label={`Dismiss signal ${signal.title}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Insight */}
      <p className="text-brand-muted text-sm leading-relaxed mb-4 pr-3">
        {signal.insight}
      </p>

      {/* Action card */}
      {signal.action.type !== 'info' && (
        <div className="bg-brand-bg/60 rounded-xl border border-brand-border p-3 mb-4">
          <button
            type="button"
            className="w-full flex items-center justify-between text-xs text-brand-muted hover:text-brand-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg rounded-lg"
            onClick={() => setExpanded(v => !v)}
            aria-expanded={expanded}
          >
            <span className="font-medium text-brand-text">Suggested Action</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {expanded && (
            <div className="mt-2 space-y-1.5">
              <p className="text-brand-text text-xs">{signal.action.description}</p>
              <p className="text-brand-muted text-xs">
                Expected: <span className="text-brand-accent">{signal.action.expectedOutcome}</span>
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[11px] text-brand-muted mb-3">
        <Shield className="w-3.5 h-3.5 text-brand-green" />
        Actions require your explicit Solflare signature.
      </div>

      {/* Status messages */}
      {status === 'signing' && (
        <div className="flex items-center gap-2 text-brand-yellow text-xs mb-3">
          <Loader className="w-3 h-3 animate-spin" />
          Waiting for wallet confirmation...
        </div>
      )}
      {status === 'confirming' && (
        <div className="flex items-center gap-2 text-brand-blue text-xs mb-3">
          <Loader className="w-3 h-3 animate-spin" />
          Confirming on Solana...
        </div>
      )}
      {status === 'success' && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-brand-green text-xs">
            <CheckCircle className="w-3 h-3" />
            Transaction confirmed
          </div>
          {txSig && (
            <a
              href={`https://solscan.io/tx/${txSig}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-brand-accent hover:underline"
            >
              View <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-brand-red text-xs mb-3">
          <AlertCircle className="w-3 h-3" />
          {errorMsg}
        </div>
      )}

      {/* Execute button */}
      {signal.action.type !== 'info' && status !== 'success' && (
        <PrimaryButton
          onClick={() => setConfirmOpen(true)}
          disabled={status === 'signing' || status === 'confirming' || !publicKey}
          className="w-full py-2.5"
        >
          {status === 'signing' || status === 'confirming'
            ? 'Processing...'
            : signal.action.label}
        </PrimaryButton>
      )}
    </div>

    <ConfirmModal
      open={confirmOpen}
      title={`Confirm: ${signal.action?.label || 'Execute action'}`}
      description={signal.action?.description || 'Review this action before signing in wallet.'}
      expectedOutcome={signal.action?.expectedOutcome}
      onCancel={() => setConfirmOpen(false)}
      onConfirm={handleExecute}
      confirmLabel="Sign in Solflare"
      loading={status === 'signing' || status === 'confirming'}
    />
    </>
  );
}

function formatTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

function parseError(err) {
  const msg = err?.message || String(err);
  if (msg.includes('User rejected') || msg.includes('rejected')) return 'Transaction cancelled in wallet.';
  if (msg.includes('Insufficient') || msg.includes('insufficient')) return 'Insufficient balance for this action.';
  if (msg.includes('slippage')) return 'Price moved. Try again.';
  if (msg.includes('timeout')) return 'Timed out. Check your wallet — may have succeeded.';
  if (msg.includes('No swap route') || msg.includes('NO_ROUTES')) return 'No swap route available right now.';
  if (msg.includes('simulation failed') || msg.includes('SimulateTransaction')) return 'Simulation failed. Check your balance.';
  return 'Transaction failed. Try again.';
}
