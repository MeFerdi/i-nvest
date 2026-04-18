import React from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Shield, ArrowRight, Lock, Radar, Sparkles, Activity } from 'lucide-react';
import quicknodeIcon from '../assets/brands/Untitled.png';
import solanaIcon from '../assets/brands/solana.png';
import kaminoIcon from '../assets/brands/kamino.png';
import dflowIcon from '../assets/brands/Dflow.png';
import investigationIcon from '../assets/brands/investigation.png';
import declineIcon from '../assets/brands/financial-decline.png';
import cashFlowIcon from '../assets/brands/cash-flow.png';
import PrimaryButton from './ui/PrimaryButton.jsx';
import BrandLockup from './ui/BrandLockup.jsx';
import SectionHeader from './ui/SectionHeader.jsx';
import SurfaceCard from './ui/SurfaceCard.jsx';
import AppFooter from './ui/AppFooter.jsx';

const STACK_ITEMS = [
  { name: 'QuickNode', image: quicknodeIcon },
  { name: 'Solana', image: solanaIcon },
  { name: 'Kamino', image: kaminoIcon },
  { name: 'DFlow', image: dflowIcon },
];

const SIGNAL_EXAMPLES = [
  {
    title: 'Idle funds detected',
    detail: 'Earn yield',
    image: investigationIcon,
    tone: 'border-l-brand-blue',
  },
  {
    title: 'Price drop detected',
    detail: 'Buy opportunity',
    image: declineIcon,
    tone: 'border-l-brand-yellow',
  },
  {
    title: 'Large inflow',
    detail: 'Allocate efficiently',
    image: cashFlowIcon,
    tone: 'border-l-brand-green',
  },
];

const VALUE_POINTS = [
  {
    icon: Radar,
    title: 'Realtime signal detection',
    detail: 'Wallet movement, price shifts, and idle capital monitored continuously.',
  },
  {
    icon: Sparkles,
    title: 'Actionable recommendations',
    detail: 'Every alert is tied to a clear next step and expected outcome.',
  },
  {
    icon: Activity,
    title: 'Controlled execution',
    detail: 'Nothing happens without your Solflare signature and visible risk checks.',
  },
];

export default function WalletConnect() {
  const { setVisible } = useWalletModal();

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <div className="flex-1 px-4 py-8 lg:px-6 lg:py-10 flex items-center justify-center">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 lg:gap-8 items-stretch animate-fade-in">
          <section className="glass-surface rounded-[2rem] p-7 lg:p-10 relative overflow-hidden">
            <div className="relative z-10">
              <BrandLockup className="mb-8" size="hero" />

              <SectionHeader
                className="mb-8"
                eyebrow="Solana wallet operations"
                title="Turn wallet activity into clear, high-confidence decisions."
                description="WeSignl monitors wallet behavior in real time, filters out noise, and presents the next action worth reviewing while execution stays fully user-approved."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                {VALUE_POINTS.map(({ icon: Icon, title, detail }) => (
                  <SurfaceCard key={title} className="hero-kpi p-4" tone="soft">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-accent/12 text-brand-accent">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="text-brand-text text-sm font-semibold mb-1.5">{title}</div>
                    <div className="text-brand-muted text-xs leading-relaxed">{detail}</div>
                  </SurfaceCard>
                ))}
              </div>

              <div className="space-y-3 mb-8">
                {SIGNAL_EXAMPLES.map(({ title, detail, image, tone }) => (
                  <div key={title} className={`hero-kpi rounded-2xl px-4 py-4 flex items-center justify-between gap-4 signal-card-enter border-l-2 ${tone}`}>
                    <div>
                      <div className="text-brand-text text-sm font-semibold">{title}</div>
                      <div className="text-brand-muted text-xs mt-1">→ {detail}</div>
                    </div>
                    <img
                      src={image}
                      alt={title}
                      className="w-6 h-6 object-contain signal-example-icon"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-brand-muted text-xs rounded-2xl border border-brand-border bg-brand-subtle/60 px-4 py-3 w-fit">
                <Shield className="w-3.5 h-3.5 text-brand-green" aria-hidden="true" />
                Real-time monitoring. Explicit approvals. No hidden automation.
              </div>
            </div>
          </section>

          <section className="glass-surface rounded-[2rem] p-7 lg:p-9 flex flex-col justify-between">
            <div>
              <SectionHeader
                className="mb-8"
                eyebrow="Wallet connection"
                title="Connect once to start monitoring."
                description="Preview the live signal feed, inspect recommended actions, and review every execution step before funds move."
              />

              <div className="border border-brand-border rounded-[1.5rem] bg-brand-subtle/55 p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-brand-accent" aria-hidden="true" />
                  <span className="text-brand-text text-sm font-semibold">Wallet Connection</span>
                </div>
                <PrimaryButton onClick={() => setVisible(true)} className="w-full py-3.5 mb-3" ariaLabel="Connect your Solflare wallet">
                  Connect with Solflare <ArrowRight className="w-4 h-4" />
                </PrimaryButton>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    ['Non-custodial', 'Your keys stay in your wallet'],
                    ['User-signed actions', 'Every execution step is approved'],
                    ['Built on Solana', 'Fast settlement and low fees'],
                  ].map(([title, detail]) => (
                    <div key={title} className="rounded-xl border border-brand-border bg-brand-surface/50 px-3 py-3">
                      <div className="text-brand-text text-xs font-semibold">{title}</div>
                      <div className="text-brand-muted text-[11px] mt-1 leading-relaxed">{detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-brand-border bg-brand-subtle/55 px-4 py-4 mb-6">
                <div className="text-brand-text text-sm font-semibold mb-3">How it works</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    ['01', 'Observe', 'Track wallet activity and market movement.'],
                    ['02', 'Evaluate', 'Filter for high-signal opportunities only.'],
                    ['03', 'Approve', 'Execute securely with your signature.'],
                  ].map(([step, title, detail]) => (
                    <div key={step} className="rounded-xl border border-brand-border bg-brand-surface/50 px-3 py-3">
                      <div className="text-brand-accent text-[11px] font-semibold mb-1">{step}</div>
                      <div className="text-brand-text text-xs font-semibold">{title}</div>
                      <div className="text-brand-muted text-[11px] mt-1 leading-relaxed">{detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-brand-muted text-xs mb-2">Infrastructure & execution stack</div>
              <div className="grid grid-cols-2 gap-2 partner-badge">
                {STACK_ITEMS.map((item) => (
                  <div key={item.name} className="stack-logo-chip">
                    <img src={item.image} alt={item.name} className="stack-logo-image" />
                    <span className="stack-logo-label">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
