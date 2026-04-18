import React from 'react';
import { TOKENS, TOKEN_ICONS } from '../config.js';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import SurfaceCard from './ui/SurfaceCard.jsx';
import SectionHeader from './ui/SectionHeader.jsx';

function PriceChange({ pct }) {
  if (pct === null || pct === undefined || isNaN(pct)) {
    return <span className="text-brand-muted text-xs flex items-center gap-0.5"><Minus className="w-3 h-3" />—</span>;
  }
  if (pct > 0) {
    return (
      <span className="text-brand-green text-xs flex items-center gap-0.5">
        <TrendingUp className="w-3 h-3" />+{pct.toFixed(2)}%
      </span>
    );
  }
  return (
    <span className="text-brand-red text-xs flex items-center gap-0.5">
      <TrendingDown className="w-3 h-3" />{pct.toFixed(2)}%
    </span>
  );
}

function TokenRow({ symbol, mint, uiAmount, prices }) {
  const price = prices?.[mint]?.usdPrice ?? null;
  const change = prices?.[mint]?.priceChange24h ?? null;
  const usdValue = price !== null ? uiAmount * price : null;

  const icon = TOKEN_ICONS[symbol];

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-brand-border last:border-0">
      <div className="flex items-center gap-2.5">
        {icon ? (
          <img src={icon} alt={symbol} className="w-7 h-7 rounded-full bg-brand-surface" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-brand-subtle flex items-center justify-center text-xs font-bold text-brand-accent">
            {symbol.slice(0, 2)}
          </div>
        )}
        <div>
          <div className="text-brand-text text-sm font-medium">{symbol}</div>
          {price !== null && (
            <div className="flex items-center gap-1.5">
              <span className="text-brand-muted text-xs">${price.toFixed(price > 1 ? 2 : 6)}</span>
              <PriceChange pct={change} />
            </div>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="text-brand-text text-sm font-medium font-mono tabular-nums">
          {uiAmount < 0.001 ? '<0.001' : uiAmount.toFixed(4)}
        </div>
        {usdValue !== null && (
          <div className="text-brand-muted text-xs font-mono tabular-nums">${usdValue.toFixed(2)}</div>
        )}
      </div>
    </div>
  );
}

export default function PortfolioBar({ walletData }) {
  const { solBalance, tokenBalances, prices } = walletData;

  const solPrice = prices?.[TOKENS.SOL]?.usdPrice ?? null;
  const solChange = prices?.[TOKENS.SOL]?.priceChange24h ?? null;
  const solUSD = solPrice !== null && solBalance !== null ? solBalance * solPrice : null;

  // Calculate total portfolio value
  let totalUSD = solUSD ?? 0;
  tokenBalances.forEach(t => {
    const price = prices?.[t.mint]?.usdPrice ?? null;
    if (price !== null) totalUSD += t.uiAmount * price;
  });

  return (
    <SurfaceCard className="overflow-hidden">
      {/* Total */}
      <div className="px-5 py-4 border-b border-brand-border">
        <SectionHeader compact title="Portfolio value" description="Estimated value across tracked wallet assets." className="mb-3" />
        <div className="text-2xl font-bold font-mono tabular-nums text-brand-text">
          ${totalUSD.toFixed(2)}
        </div>
        {solPrice !== null && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-brand-muted text-xs">SOL/USD ${solPrice.toFixed(2)}</span>
            <PriceChange pct={solChange} />
          </div>
        )}
      </div>

      {/* Assets */}
      <div className="px-5 py-1">
        {solBalance !== null && (
          <TokenRow
            symbol="SOL"
            mint={TOKENS.SOL}
            uiAmount={solBalance}
            prices={prices}
          />
        )}
        {tokenBalances.slice(0, 8).map(t => (
          <TokenRow
            key={t.mint}
            symbol={t.symbol}
            mint={t.mint}
            uiAmount={t.uiAmount}
            prices={prices}
          />
        ))}
        {tokenBalances.length === 0 && solBalance === null && (
          <div className="py-4 text-brand-muted text-sm text-center">
            No assets found
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}
