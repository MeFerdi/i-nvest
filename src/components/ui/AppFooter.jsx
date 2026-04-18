import React from 'react';
import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  { to: '/legal/privacy', label: 'Privacy' },
  { to: '/legal/terms', label: 'Terms' },
  { to: '/legal/disclosures', label: 'Disclosures' },
];

export default function AppFooter({ className = '' }) {
  return (
    <footer className={`border-t border-brand-border/80 ${className}`}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-brand-muted sm:flex-row sm:items-center sm:justify-between">
        <div>WeSignl is non-custodial. Transactions require wallet approval.</div>
        <div className="flex flex-wrap items-center gap-4">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="transition-colors hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg rounded-md"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
