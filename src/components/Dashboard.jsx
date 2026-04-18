import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  RefreshCw, Settings, BellOff, Shield, CircleDot,
  Sparkles, SlidersHorizontal
} from 'lucide-react';
import { useWalletMonitor } from '../hooks/useWalletMonitor.js';
import { useSignalEngine } from '../hooks/useSignalEngine.js';
import { loadThresholds } from './SettingsPanel.jsx';
import SignalCard from './SignalCard.jsx';
import SettingsPanel from './SettingsPanel.jsx';
import BrandLockup from './ui/BrandLockup.jsx';
import SectionHeader from './ui/SectionHeader.jsx';
import SurfaceCard from './ui/SurfaceCard.jsx';
import AppFooter from './ui/AppFooter.jsx';
import quicknodeIcon from '../assets/brands/Untitled.png';
import solanaIcon from '../assets/brands/solana.png';
import kaminoIcon from '../assets/brands/kamino.png';
import dflowIcon from '../assets/brands/Dflow.png';

const STACK_ITEMS = [
  { name: 'QuickNode', image: quicknodeIcon },
  { name: 'Solana', image: solanaIcon },
  { name: 'Kamino', image: kaminoIcon },
  { name: 'DFlow', image: dflowIcon },
];

export default function Dashboard() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() ?? null;

  const [thresholds, setThresholds] = useState(loadThresholds);
  const [showSettings, setShowSettings] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [mode, setMode] = useState('manual');

  const { walletData, history, refresh } = useWalletMonitor(walletAddress);
  const rawSignals = useSignalEngine(walletData, history, thresholds);
  const signals = rawSignals.filter(s => !dismissedIds.includes(s.id));

  const handleDismiss = (id) => setDismissedIds(prev => [...prev, id]);
  const handleExecuted = (id) => {
    setTimeout(() => setDismissedIds(prev => [...prev, id]), 3000);
  };

  const { isLoading, error, lastUpdated } = walletData;

  const topStats = [
    {
      label: 'Signals',
      value: signals.length,
      icon: Sparkles,
      hint: signals.length > 0 ? 'actionable now' : 'monitoring live',
      accent: signals.length > 0 ? 'text-brand-accent' : 'text-brand-muted',
    },
    {
      label: 'Network',
      value: error ? 'Degraded' : 'Live',
      icon: CircleDot,
      hint: error ? 'retrying data' : 'streaming',
      accent: error ? 'text-brand-yellow' : 'text-brand-green',
    },
  ];

  const solPrice = walletData.prices?.['So11111111111111111111111111111111111111112']?.usdPrice ?? null;
  const portfolioEstimate = walletData.solBalance && solPrice
    ? (walletData.solBalance * solPrice).toFixed(2)
    : null;

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-brand-bg/95 backdrop-blur border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLockup size="header" subtitle="" />
            {/* Live indicator */}
            <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-green/10 rounded-full border border-brand-green/20">
              <div className="w-1.5 h-1.5 bg-brand-green rounded-full pulse-dot" />
              <span className="text-brand-green text-xs font-medium">Live</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface/50 px-3 py-2">
              <span className="text-brand-muted text-xs">Wallet</span>
              <span className="text-brand-text text-xs font-mono">{shortAddress(walletAddress)}</span>
            </div>
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface/50 px-3 py-2">
              <span className="text-brand-muted text-xs">Balance</span>
              <span className="text-brand-text text-xs font-semibold">
                {walletData.solBalance !== null ? `${walletData.solBalance.toFixed(3)} SOL` : '—'}
              </span>
            </div>
            {lastUpdated && !isLoading && (
              <span className="text-brand-muted text-xs hidden sm:block">
                Updated {formatTime(lastUpdated)}
              </span>
            )}
            <button
              onClick={refresh}
              disabled={isLoading}
              className="min-h-[42px] min-w-[42px] p-1.5 text-brand-muted hover:text-brand-text transition-colors rounded-xl hover:bg-brand-subtle/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg disabled:opacity-40"
              title="Refresh"
              aria-label="Refresh wallet data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowSettings(v => !v)}
              className={`min-h-[42px] min-w-[42px] p-1.5 transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg ${showSettings ? 'text-brand-accent bg-brand-accent/10' : 'text-brand-muted hover:text-brand-text hover:bg-brand-subtle/80'}`}
              title="Settings"
              aria-label={showSettings ? 'Hide settings panel' : 'Show settings panel'}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <WalletMultiButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        <section className="glass-surface rounded-3xl p-5 lg:p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <SectionHeader
                className="mb-4"
                eyebrow="Control center"
                title="Review live signals, then approve the next move."
                description="The dashboard stays focused on what matters: current opportunities, execution controls, and wallet state."
              />
              <div className="rounded-2xl border border-brand-border bg-brand-bg/40 p-3.5 mb-4 max-w-2xl">
                <div className="text-brand-muted text-[11px] uppercase tracking-[0.12em] mb-2">Decision flow</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    ['01', 'Observe', 'Wallet and market context'],
                    ['02', 'Evaluate', 'Rule-based recommendations'],
                    ['03', 'Approve', 'User-signed execution'],
                  ].map(([step, title, desc]) => (
                    <div key={step} className="rounded-xl border border-brand-border bg-brand-surface/50 px-3 py-2.5">
                      <div className="text-brand-accent text-[11px] font-semibold mb-0.5">{step}</div>
                      <div className="text-brand-text text-xs font-semibold">{title}</div>
                      <div className="text-brand-muted text-[11px]">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                {topStats.map(({ label, value, icon: Icon, hint, accent }) => (
                  <SurfaceCard key={label} className="hero-kpi p-3.5" tone="soft">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-brand-muted text-xs">{label}</span>
                      <Icon className="w-3.5 h-3.5 text-brand-accent" />
                    </div>
                    <div className={`text-lg font-bold font-mono tabular-nums ${accent}`}>{value}</div>
                    <div className="text-brand-muted text-xs">{hint}</div>
                  </SurfaceCard>
                ))}
              </div>
            </div>

            <SurfaceCard className="hero-kpi p-4 flex flex-col justify-between" tone="soft">
              <div>
                <div className="text-brand-muted text-xs mb-2">Execution stack</div>
                <div className="grid grid-cols-2 gap-2 partner-badge">
                  {STACK_ITEMS.map((item) => (
                    <div key={item.name} className="stack-logo-chip">
                      <img src={item.image} alt={item.name} className="stack-logo-image" />
                      <span className="stack-logo-label">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <p className="text-brand-muted text-xs leading-relaxed">Signals are surfaced, explained, and only executed after approval.</p>
                <div className="flex items-center gap-1.5 text-[11px] text-brand-muted">
                  <Shield className="w-3.5 h-3.5 text-brand-green" />
                  Non-custodial, user-approved transactions only.
                </div>
              </div>
            </SurfaceCard>
          </div>
        </section>

        {/* Error banner */}
        {error && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-brand-red/10 border border-brand-red/20 rounded-2xl text-brand-red text-sm">
            <div>
              <div className="font-semibold">Couldn&apos;t refresh wallet data</div>
              <div className="text-brand-red/90 text-xs mt-1">{error}</div>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="min-h-[42px] rounded-xl border border-brand-red/25 px-4 text-xs font-semibold text-brand-red transition-colors hover:bg-brand-red/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && !walletData.lastUpdated && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1,2].map(i => (
                <div key={i} className="bg-brand-surface border border-brand-border rounded-2xl p-5 animate-pulse">
                  <div className="h-4 bg-brand-border rounded w-1/3 mb-3" />
                  <div className="h-3 bg-brand-border rounded w-full mb-2" />
                  <div className="h-3 bg-brand-border rounded w-2/3" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 h-40 animate-pulse" />
            </div>
          </div>
        )}

        {!isLoading || walletData.lastUpdated ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main: signal feed */}
            <div className="lg:col-span-2 space-y-4">
              {/* Settings panel */}
              {showSettings && (
                <SettingsPanel
                  thresholds={thresholds}
                  setThresholds={setThresholds}
                  onClose={() => setShowSettings(false)}
                />
              )}

              <SurfaceCard className="px-4 py-3">
                <SectionHeader
                  compact
                  title="Signal feed"
                  description="Current opportunities and risk alerts."
                  action={(
                    <div className="rounded-xl border border-brand-border bg-brand-bg/50 px-2.5 py-1.5 text-xs text-brand-muted">
                      {signals.length} active
                    </div>
                  )}
                />
              </SurfaceCard>

              <div className="space-y-3">
                {signals.length === 0 ? (
                  <div className="bg-brand-surface border border-brand-border rounded-[1.75rem] p-8 text-center">
                    <BellOff className="w-8 h-8 text-brand-muted mx-auto mb-3" />
                    <p className="text-brand-text font-medium mb-1">No active signals</p>
                    <p className="text-brand-muted text-sm max-w-sm mx-auto">
                      {walletAddress
                        ? 'Monitoring your wallet. New signals will appear instantly.'
                        : 'Connect your wallet to start monitoring.'}
                    </p>
                    {walletAddress && (
                      <button
                        type="button"
                        onClick={refresh}
                        className="mt-4 min-h-[42px] rounded-xl border border-brand-border px-4 text-xs font-semibold text-brand-text transition-colors hover:bg-brand-subtle/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
                      >
                        Refresh feed
                      </button>
                    )}
                  </div>
                ) : (
                  signals.map(signal => (
                    <SignalCard
                      key={signal.id}
                      signal={signal}
                      onDismiss={handleDismiss}
                      onExecuted={handleExecuted}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              <SurfaceCard className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted text-xs">Wallet</span>
                  <span className="text-brand-muted text-xs font-mono">{shortAddress(walletAddress)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted text-xs">SOL Balance</span>
                  <span className="text-brand-text text-sm font-semibold font-mono tabular-nums">
                    {walletData.solBalance !== null ? walletData.solBalance.toFixed(4) : '—'} SOL
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted text-xs">Est. Value</span>
                  <span className="text-brand-text text-sm font-semibold font-mono tabular-nums">{portfolioEstimate ? `$${portfolioEstimate}` : '—'}</span>
                </div>
              </SurfaceCard>

              <SurfaceCard className="p-4">
                <SectionHeader compact title="Execution mode" description="User approval remains the control point." className="mb-3" />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMode('manual')}
                    className={`min-h-[42px] rounded-xl py-2 text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg ${mode === 'manual' ? 'border-brand-accent bg-brand-accent/15 text-brand-accent' : 'border-brand-border text-brand-muted hover:text-brand-text hover:bg-brand-subtle/70'}`}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => setMode('auto')}
                    className={`min-h-[42px] rounded-xl py-2 text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg ${mode === 'auto' ? 'border-brand-accent bg-brand-accent/15 text-brand-accent' : 'border-brand-border text-brand-muted hover:text-brand-text hover:bg-brand-subtle/70'}`}
                  >
                    Auto (Beta)
                  </button>
                </div>
                <p className="text-brand-muted text-xs mt-2">Automation remains gated behind approval and risk checks.</p>
              </SurfaceCard>

              <SurfaceCard className="p-4">
                <div className="mb-3 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-brand-accent" />
                  <div className="text-brand-text text-sm font-semibold">Active rules</div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: `Idle funds after ${thresholds.idleHours}h`, desc: 'Review Kamino lending routes' },
                    { label: `Price move ±${thresholds.priceChangePct}%`, desc: 'Review DFlow trade routes' },
                    { label: `Large inflow x${thresholds.largeTransactionMultiplier}`, desc: 'Review allocation strategy' },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex gap-2.5 rounded-xl border border-brand-border bg-brand-bg/40 px-3 py-2.5">
                      <div className="w-5 h-5 rounded-full bg-brand-accent/20 text-brand-accent text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">•</div>
                      <div>
                        <div className="text-brand-text text-xs font-semibold">{label}</div>
                        <div className="text-brand-muted text-xs">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </SurfaceCard>
            </div>
          </div>
        ) : null}
      </div>
      <AppFooter />
    </div>
  );
}

function shortAddress(address) {
  if (!address) return '—';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  if (diff < 5_000) return 'just now';
  if (diff < 60_000) return `${Math.floor(diff / 1_000)}s ago`;
  return `${Math.floor(diff / 60_000)}m ago`;
}
