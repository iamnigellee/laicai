import { useState, useMemo } from 'react';
import type { MarketSignal, SignalLevel } from '../../shared/types.ts';
import { SignalBadge } from './SignalBadge.tsx';

type SortKey = keyof Pick<
  MarketSignal,
  'coin' | 'markPx' | 'priceChange24hPct' | 'fundingRate8h' | 'openInterestUsd' | 'dailyVolumeUsd' | 'score'
>;

function fmt(n: number, d = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtPx(n: number): string {
  if (n >= 1000) return fmt(n, 2);
  if (n >= 1) return fmt(n, 4);
  return n.toPrecision(4);
}

function ScoreBar({ score }: { score: number }) {
  const abs = Math.abs(score);
  const color =
    score >= 50 ? '#3fb950' :
    score >= 20 ? '#56d364' :
    score <= -50 ? '#da3633' :
    score <= -20 ? '#f85149' : '#8b949e';
  const left = score >= 0 ? '50%' : `${50 - abs / 2}%`;

  return (
    <div className="score-cell">
      <div className="score-bar-wrap">
        <div className="score-bar" style={{ background: color, left, width: `${abs / 2}%` }} />
      </div>
      <span className="score-num" style={{ color }}>
        {score > 0 ? '+' : ''}{score}
      </span>
    </div>
  );
}

const FILTERS: { label: string; value: SignalLevel | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '强看多', value: 'strong_bullish' },
  { label: '看多', value: 'bullish' },
  { label: '中性', value: 'neutral' },
  { label: '看空', value: 'bearish' },
  { label: '强看空', value: 'strong_bearish' },
];

interface Props {
  markets: MarketSignal[];
  loading?: boolean;
  error?: string | null;
}

export function SignalTable({ markets, loading, error }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<SignalLevel | 'all'>('all');
  const [search, setSearch] = useState('');

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  const rows = useMemo(() => {
    let list = markets;
    if (filter !== 'all') list = list.filter(m => m.signal === filter);
    if (search.trim()) list = list.filter(m => m.coin.toLowerCase().includes(search.toLowerCase()));
    return [...list].sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [markets, filter, search, sortKey, sortDir]);

  function Th({ label, col, align = 'right' }: { label: string; col: SortKey; align?: 'left' | 'right' }) {
    const cls = ['sortable', sortKey === col ? `sort-${sortDir}` : ''].join(' ');
    return <th className={cls} style={{ textAlign: align }} onClick={() => handleSort(col)}>{label}</th>;
  }

  return (
    <>
      <div className="controls">
        <input
          className="search"
          placeholder="搜索合约..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-group">
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`filter-btn${filter === f.value ? ' active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', color: '#8b949e', fontSize: 11 }}>
          {rows.length} / {markets.length} 合约
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <Th label="合约" col="coin" align="left" />
              <Th label="价格" col="markPx" />
              <Th label="24h 涨跌" col="priceChange24hPct" />
              <Th label="资金费率 /8h" col="fundingRate8h" />
              <Th label="持仓量 OI" col="openInterestUsd" />
              <Th label="24h 成交量" col="dailyVolumeUsd" />
              <th style={{ textAlign: 'center' }}>信号</th>
              <Th label="评分" col="score" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="state-row"><td colSpan={8}>加载中...</td></tr>
            )}
            {!loading && error && markets.length === 0 && (
              <tr className="state-row"><td colSpan={8} className="error-text">加载失败: {error}</td></tr>
            )}
            {!loading && rows.length === 0 && markets.length > 0 && (
              <tr className="state-row"><td colSpan={8}>无匹配合约</td></tr>
            )}
            {rows.map(m => {
              const chgCls = m.priceChange24hPct > 0 ? 'change-pos' : m.priceChange24hPct < 0 ? 'change-neg' : 'change-zero';
              const fndCls = m.fundingRate8h > 0 ? 'funding-pos' : m.fundingRate8h < 0 ? 'funding-neg' : 'funding-zero';
              return (
                <tr key={m.coin}>
                  <td>
                    <div className="coin-cell">
                      <span className="coin-name">{m.coin}</span>
                      <span className="leverage-tag">{m.maxLeverage}x</span>
                    </div>
                  </td>
                  <td className="price">{fmtPx(m.markPx)}</td>
                  <td className={chgCls}>{m.priceChange24hPct >= 0 ? '+' : ''}{fmt(m.priceChange24hPct, 2)}%</td>
                  <td className={fndCls}>{m.fundingRate8h >= 0 ? '+' : ''}{fmt(m.fundingRate8h, 4)}%</td>
                  <td className="num">{fmtUsd(m.openInterestUsd)}</td>
                  <td className="num">{fmtUsd(m.dailyVolumeUsd)}</td>
                  <td style={{ textAlign: 'center' }}><SignalBadge signal={m.signal} /></td>
                  <td><ScoreBar score={m.score} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
