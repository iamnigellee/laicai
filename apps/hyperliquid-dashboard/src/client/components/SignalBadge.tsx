import type { SignalLevel } from '../../shared/types.ts';

const LABELS: Record<SignalLevel, string> = {
  strong_bullish: '强看多',
  bullish: '看多',
  neutral: '中性',
  bearish: '看空',
  strong_bearish: '强看空',
};

export function SignalBadge({ signal }: { signal: SignalLevel }) {
  return <span className={`badge badge-${signal}`}>{LABELS[signal]}</span>;
}
