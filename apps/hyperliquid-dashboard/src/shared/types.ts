export interface AssetMeta {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  onlyIsolated?: boolean;
}

export interface AssetCtx {
  funding: string;
  openInterest: string;
  prevDayPx: string;
  dayNtlVlm: string;
  premium: string;
  oraclePx: string;
  markPx: string;
  midPx: string | null;
  impactPxs: [string, string] | null;
}

export interface RawMarket {
  meta: AssetMeta;
  ctx: AssetCtx;
}

export type SignalLevel = 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish';

export interface MarketSignal {
  coin: string;
  markPx: number;
  priceChange24hPct: number;
  fundingRate8h: number;
  openInterestUsd: number;
  dailyVolumeUsd: number;
  signal: SignalLevel;
  score: number;
  maxLeverage: number;
}
