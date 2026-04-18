import React from 'react';

export default function SurfaceCard({
  children,
  className = '',
  tone = 'default',
}) {
  const toneClass = tone === 'soft'
    ? 'bg-brand-surface/90 border border-brand-border shadow-[0_12px_30px_rgba(2,6,23,0.08)]'
    : 'bg-brand-surface border border-brand-border';

  return (
    <div className={`rounded-2xl ${toneClass} ${className}`}>
      {children}
    </div>
  );
}
