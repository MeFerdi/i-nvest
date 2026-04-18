import React from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';
import PrimaryButton from './PrimaryButton.jsx';
import SectionHeader from './SectionHeader.jsx';

export default function ConfirmModal({
  open,
  title,
  description,
  expectedOutcome,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirm & Continue',
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-2xl animate-fade-in">
        <button
          onClick={onCancel}
          className="absolute right-3 top-3 rounded-lg p-1 text-brand-muted hover:bg-brand-subtle/80 hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-surface"
          aria-label="Close confirmation dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 text-brand-yellow flex items-center justify-center mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <SectionHeader compact title={title} description={description} />
        </div>

        {expectedOutcome ? (
          <div className="rounded-xl border border-brand-border bg-brand-bg/50 px-3 py-2.5 mb-4">
            <div className="text-brand-muted text-xs mb-1">Estimated outcome</div>
            <div className="text-brand-accent text-sm font-medium">{expectedOutcome}</div>
          </div>
        ) : null}

        <div className="flex items-center gap-1.5 text-xs text-brand-muted mb-4">
          <Shield className="w-3.5 h-3.5 text-brand-green" />
          You approve every transaction in Solflare.
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 min-h-[42px] rounded-xl border border-brand-border py-2.5 text-sm text-brand-muted hover:text-brand-text hover:bg-brand-subtle/80 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-surface"
          >
            Cancel
          </button>
          <PrimaryButton onClick={onConfirm} disabled={loading} className="flex-1 py-2.5">
            {loading ? 'Submitting...' : confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
