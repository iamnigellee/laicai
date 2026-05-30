import { useState, useEffect, useCallback } from 'react';
import { fetchAllMarkets } from '../shared/hl-client.ts';
import { calculateSignals } from '../shared/signals.ts';
import { SignalTable } from './components/SignalTable.tsx';
import type { MarketSignal } from '../shared/types.ts';

export default function App() {
  const [markets, setMarkets] = useState<MarketSignal[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await fetchAllMarkets();
      setMarkets(calculateSignals(raw));
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  const statusClass = error ? 'error' : loading && !markets.length ? 'loading' : 'ok';

  return (
    <div className="app">
      <div className="header">
        <h1>Hyperliquid 信号面板</h1>
        <div className="header-meta">
          <span className={`status-dot ${statusClass}`} />
          {markets.length > 0 && (
            <><span>{markets.length} 合约</span><span className="dot">·</span></>
          )}
          {lastUpdated && (
            <span>更新 {lastUpdated.toLocaleTimeString('zh-CN')}</span>
          )}
          {loading && markets.length === 0 && <span>加载中...</span>}
          {error && <span style={{ color: '#f85149' }}>{error}</span>}
        </div>
      </div>

      <SignalTable markets={markets} loading={loading && !markets.length} error={error} />
    </div>
  );
}
