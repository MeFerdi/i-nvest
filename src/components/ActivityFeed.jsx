import React from 'react';
import { ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import SurfaceCard from './ui/SurfaceCard.jsx';
import SectionHeader from './ui/SectionHeader.jsx';

function shortSig(sig) {
  if (!sig) return '—';
  return sig.slice(0, 6) + '...' + sig.slice(-6);
}

function formatTime(blockTime) {
  if (!blockTime) return 'Pending';
  const date = new Date(blockTime * 1000);
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return date.toLocaleDateString();
}

export default function ActivityFeed({ recentTxs, walletAddress }) {
  if (!recentTxs || recentTxs.length === 0) {
    return (
      <SurfaceCard className="p-5">
        <SectionHeader compact title="Recent activity" description="Signed transfers and executions appear here." className="mb-3" />
        <div className="text-center py-5">
          <Clock className="w-8 h-8 mx-auto mb-3 text-brand-muted" aria-hidden="true" />
          <div className="text-brand-text text-sm font-medium">No transactions yet</div>
          <div className="text-brand-muted text-sm mt-1">
            Wallet activity appears here after the first signed transfer or execution.
          </div>
        </div>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className="overflow-hidden">
      <div className="px-5 py-4 border-b border-brand-border">
        <SectionHeader
          compact
          title="Recent activity"
          description="Latest signed transactions and execution history."
          action={walletAddress && (
            <a
              href={`https://solscan.io/account/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-brand-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg rounded-md"
            >
              View all <ExternalLink className="w-3 h-3" />
            </a>
          )}
        />
      </div>
      <div className="divide-y divide-brand-border">
        {recentTxs.map(tx => (
          <div key={tx.signature} className="flex items-center justify-between px-5 py-3 hover:bg-white/2 transition-colors">
            <div className="flex items-center gap-2.5">
              {tx.err
                ? <XCircle className="w-4 h-4 text-brand-red flex-shrink-0" />
                : <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />}
              <div>
                <div className="text-brand-text text-xs font-mono">{shortSig(tx.signature)}</div>
                <div className="text-brand-muted text-xs">{tx.memo || (tx.err ? 'Failed' : 'Transaction')}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-muted text-xs">{formatTime(tx.blockTime)}</span>
              <a
                href={`https://solscan.io/tx/${tx.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md text-brand-muted hover:text-brand-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
                aria-label={`View transaction ${shortSig(tx.signature)} on Solscan`}
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
