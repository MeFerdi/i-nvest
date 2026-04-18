import React from 'react';
import productMark from '../../assets/brands/wesignl.png';

const SIZE_MAP = {
  hero: {
    wrapper: 'gap-4',
    badge: 'h-16 w-16 lg:h-20 lg:w-20 rounded-2xl',
    image: 'h-11 lg:h-14',
    title: 'text-[2rem] lg:text-[2.5rem] tracking-[-0.05em]',
    subtitle: 'text-sm lg:text-base mt-1',
  },
  header: {
    wrapper: 'gap-3',
    badge: 'h-11 w-11 rounded-2xl',
    image: 'h-8',
    title: 'text-lg tracking-[-0.04em]',
    subtitle: 'text-[11px] mt-0.5',
  },
};

export default function BrandLockup({
  size = 'hero',
  subtitle = 'Solana wallet intelligence',
  className = '',
}) {
  const config = SIZE_MAP[size] || SIZE_MAP.hero;

  return (
    <div className={`flex items-center ${config.wrapper} ${className}`}>
      <div className={`flex shrink-0 items-center justify-center border border-white/80 bg-white shadow-[0_12px_28px_rgba(17,24,39,0.12)] ${config.badge}`}>
        <img src={productMark} alt="" className={`${config.image} w-auto logo-bright`} />
      </div>
      <div>
        <div className={`font-semibold leading-none text-brand-text ${config.title}`}>
          WeSignl
        </div>
        {subtitle ? (
          <div className={`text-brand-muted ${config.subtitle}`}>
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}
