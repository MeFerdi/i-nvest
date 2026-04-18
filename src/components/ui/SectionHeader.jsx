import React from 'react';

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  compact = false,
  className = '',
}) {
  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      <div>
        {eyebrow ? (
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-muted">
            {eyebrow}
          </div>
        ) : null}
        <div className={compact ? 'text-brand-text text-sm font-semibold' : 'text-brand-text text-xl lg:text-2xl font-semibold tracking-[-0.03em]'}>
          {title}
        </div>
        {description ? (
          <div className={`${compact ? 'mt-1 text-xs' : 'mt-2 text-sm'} max-w-2xl leading-relaxed text-brand-muted`}>
            {description}
          </div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
