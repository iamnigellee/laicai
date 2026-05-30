import type { AssetCtx, AssetMeta, RawMarket } from './types.ts';

const API_URL = 'https://api.hyperliquid.xyz/info';

export async function fetchAllMarkets(): Promise<RawMarket[]> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) throw new Error(`Hyperliquid API ${res.status}: ${res.statusText}`);

  const [metaWrapper, ctxs] = (await res.json()) as [
    { universe: AssetMeta[] },
    AssetCtx[],
  ];

  return metaWrapper.universe.map((meta, i) => ({ meta, ctx: ctxs[i] }));
}
