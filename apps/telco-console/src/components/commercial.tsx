'use client';
import {
  CAPABILITY_STATUS_LABELS,
  formatMoney,
  type CapabilityStatus,
  type CurrencyCode,
  type RevenueSlice,
} from '@telyad/types';
import { Badge, Table } from '@telyad/ui';

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** Map a network-capability lifecycle status to a Badge tone. */
export const CAPABILITY_TONE: Record<CapabilityStatus, BadgeTone> = {
  LIVE: 'success',
  PILOT: 'info',
  NETWORK_APPROVAL_REQUIRED: 'warning',
  INTEGRATION_REQUIRED: 'warning',
  DISABLED: 'danger',
  TELYAD_SUPPORTED: 'neutral',
  FUTURE_CAPABILITY: 'neutral',
};

export function CapabilityStatusBadge({ status }: { status: CapabilityStatus }) {
  return <Badge tone={CAPABILITY_TONE[status]}>{CAPABILITY_STATUS_LABELS[status]}</Badge>;
}

/** Format an integer minor-unit amount with a currency code string from a report. */
export function fmtMinor(minor: number, currency: string, compact = false): string {
  return formatMoney({ minor, currency: currency as CurrencyCode }, { compact });
}

/** A thin MTN-yellow share bar (0..100%). */
export function ShareBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      style={{
        height: 6,
        borderRadius: 4,
        background: 'var(--tly-border)',
        overflow: 'hidden',
        minWidth: 90,
      }}
    >
      <span
        style={{
          display: 'block',
          height: '100%',
          width: `${clamped}%`,
          background: 'var(--tly-primary)',
          borderRadius: 4,
        }}
      />
    </div>
  );
}

/** Render a RevenueSlice[] as a compact table with amount + share bar. */
export function SliceTable({
  label,
  slices,
  currency,
}: {
  label: string;
  slices: RevenueSlice[];
  currency: string;
}) {
  return (
    <Table head={[label, 'Revenue', 'Share', '']}>
      {slices.map((s) => (
        <tr key={s.label}>
          <td style={{ fontWeight: 600 }}>{s.label}</td>
          <td className="tly-mono">{fmtMinor(s.amountMinor, currency, true)}</td>
          <td className="tly-mono tly-faint" style={{ whiteSpace: 'nowrap' }}>
            {s.sharePct.toFixed(1)}%
          </td>
          <td style={{ width: '30%' }}>
            <ShareBar pct={s.sharePct} />
          </td>
        </tr>
      ))}
    </Table>
  );
}
