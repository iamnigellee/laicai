import type { MarketSignal, RawMarket, SignalLevel } from './types.ts';

function n(s: string | null | undefined): number {
  if (!s) return 0;
  const v = parseFloat(s);
  return isFinite(v) ? v : 0;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

export function calculateSignals(markets: RawMarket[]): MarketSignal[] {
  const parsed = markets.map(({ meta, ctx }) => ({
    meta,
    markPx: n(ctx.markPx),
    prevDayPx: n(ctx.prevDayPx),
    funding: n(ctx.funding),
    oi: n(ctx.openInterest),
    vol: n(ctx.dayNtlVlm),
  }));

  // Cross-sectional stats for funding rates
  const rates = parsed.map((m) => m.funding * 100);
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  const std = Math.sqrt(
    rates.reduce((sum, r) => sum + (r - mean) ** 2, 0) / rates.length,
  );

  const signals: MarketSignal[] = [];

  for (const { meta, markPx, prevDayPx, funding, oi, vol } of parsed) {
    if (markPx <= 0) continue;

    const fundingRate8h = funding * 100; // e.g. 0.0103 means 0.0103% per 8h
    const priceChange24hPct = prevDayPx > 0 ? ((markPx - prevDayPx) / prevDayPx) * 100 : 0;
    const openInterestUsd = oi * markPx;

    // Cross-sectional z-score: high funding vs peers → crowded longs → bearish signal
    const zScore = std > 0 ? (fundingRate8h - mean) / std : 0;
    let score = clamp(-zScore * 35, -70, 70);

    // Absolute funding extremes override
    if (fundingRate8h > 0.1) score = clamp(score - 25, -100, 100);   // extreme longs
    else if (fundingRate8h < -0.05) score = clamp(score + 20, -100, 100); // extreme shorts

    score = Math.round(score);

    let signal: SignalLevel;
    if (score >= 50) signal = 'strong_bullish';
    else if (score >= 20) signal = 'bullish';
    else if (score <= -50) signal = 'strong_bearish';
    else if (score <= -20) signal = 'bearish';
    else signal = 'neutral';

    signals.push({
      coin: meta.name,
      markPx,
      priceChange24hPct,
      fundingRate8h,
      openInterestUsd,
      dailyVolumeUsd: vol,
      signal,
      score,
      maxLeverage: meta.maxLeverage,
    });
  }

  // Sort by absolute score descending (most extreme signals first)
  signals.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

  return signals;
}
