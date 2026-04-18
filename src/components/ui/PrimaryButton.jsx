import React from 'react';

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  ariaLabel,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        inline-flex min-h-[44px] items-center justify-center gap-2
        rounded-xl px-4 py-3 text-sm font-semibold
        bg-brand-accent text-brand-inverse shadow-[0_18px_36px_rgba(53,94,204,0.22)]
        transition-[background-color,transform,box-shadow] duration-150
        hover:bg-brand-accentHover hover:-translate-y-0.5
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg
        active:translate-y-px
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0
        ${className}
      `}
    >
      {children}
    </button>
  );
}
