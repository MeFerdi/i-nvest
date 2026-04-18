import React, { useState } from 'react';
import { DEFAULT_THRESHOLDS } from '../config.js';
import { Settings, Save, RotateCcw } from 'lucide-react';
import SurfaceCard from './ui/SurfaceCard.jsx';
import SectionHeader from './ui/SectionHeader.jsx';
import PrimaryButton from './ui/PrimaryButton.jsx';

const STORAGE_KEY = 'iinvest_thresholds';
const LEGACY_STORAGE_KEY = 'walletintel_thresholds';

export function loadThresholds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? { ...DEFAULT_THRESHOLDS, ...JSON.parse(raw) } : { ...DEFAULT_THRESHOLDS };
  } catch {
    return { ...DEFAULT_THRESHOLDS };
  }
}

function saveThresholds(t) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
}

export default function SettingsPanel({ thresholds, setThresholds, onClose }) {
  const [local, setLocal] = useState({ ...thresholds });

  const handleSave = () => {
    saveThresholds(local);
    setThresholds(local);
    onClose && onClose();
  };

  const handleReset = () => {
    setLocal({ ...DEFAULT_THRESHOLDS });
    saveThresholds(DEFAULT_THRESHOLDS);
    setThresholds({ ...DEFAULT_THRESHOLDS });
  };

  const field = (key, label, min, max, step, unit) => (
    <div key={key}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-brand-text text-sm font-medium">{label}</label>
        <span className="text-brand-accent text-sm font-mono">
          {local[key]}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={local[key] || 0}
        onChange={e => setLocal(prev => ({ ...prev, [key]: Number(e.target.value) }))}
        className="w-full accent-brand-accent h-1.5 rounded-full bg-brand-border cursor-pointer"
      />
      <div className="flex justify-between text-brand-muted text-xs mt-0.5">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );

  return (
    <SurfaceCard className="overflow-hidden">
      <div className="px-5 py-4 border-b border-brand-border">
        <SectionHeader
          compact
          title="Signal thresholds"
          description="Set the conditions that determine when WeSignl should surface a recommendation."
          action={<Settings className="w-4 h-4 text-brand-accent" />}
        />
      </div>

      <div className="px-5 py-4 space-y-5">
        {field('idleHours', 'Idle Detection Window', 1, 72, 1, 'h')}
        {field('priceChangePct', 'Price Alert Threshold', 1, 20, 0.5, '%')}
        {field('largeTransactionMultiplier', 'Large Inflow Multiplier', 1, 10, 0.5, 'x')}
        {field('priceDropBuyAmount', 'Auto-buy Amount on Dip', 1, 100, 1, ' USDC')}

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleReset}
            className="flex-1 min-h-[42px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-border text-brand-muted hover:text-brand-text text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <PrimaryButton
            onClick={handleSave}
            className="flex-1 py-2"
            ariaLabel="Save signal thresholds"
          >
            <Save className="w-3 h-3" /> Save
          </PrimaryButton>
        </div>
      </div>
    </SurfaceCard>
  );
}
