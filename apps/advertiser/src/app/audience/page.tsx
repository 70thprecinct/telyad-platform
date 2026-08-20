'use client';

import { useRouter } from 'next/navigation';
import { compactNumber } from '@telyad/types';
import { Badge, Button, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { DEMO_NOTE, SEGMENTS } from '@/lib/demo';

function DemoNote() {
  return (
    <div className="tly-faint" style={{ fontSize: 11, marginTop: 8 }}>
      {DEMO_NOTE}
    </div>
  );
}

// Aggregate, privacy-safe distribution figures — never individual subscriber data.
const GEOGRAPHY: { label: string; pct: number }[] = [
  { label: 'Lagos', pct: 28 },
  { label: 'Oyo', pct: 14 },
  { label: 'Kano', pct: 12 },
  { label: 'Rivers', pct: 9 },
  { label: 'Abuja FCT', pct: 8 },
  { label: 'Other', pct: 29 },
];

const DEVICE_MIX: { label: string; pct: number }[] = [
  { label: 'Smartphone', pct: 61 },
  { label: 'Feature phone', pct: 39 },
];

const USAGE: { label: string; pct: number }[] = [
  { label: 'Data-active', pct: 44 },
  { label: 'Voice-heavy', pct: 33 },
  { label: 'USSD power users', pct: 23 },
];

function DistributionBars({ title, rows }: { title: string; rows: { label: string; pct: number }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="tly-faint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {title}
      </div>
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ flex: '0 0 120px', fontSize: 12.5 }}>{r.label}</span>
          <div
            style={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              background: 'var(--tly-border)',
              overflow: 'hidden',
            }}
          >
            <div style={{ width: `${r.pct}%`, height: '100%', background: 'var(--tly-primary)' }} />
          </div>
          <span className="tly-mono" style={{ flex: '0 0 42px', textAlign: 'right', fontWeight: 600 }}>
            {`${r.pct}%`}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AudiencePage() {
  const router = useRouter();

  return (
    <PortalShell active="audience">
      <PageHeader
        eyebrow="TARGETING · AUDIENCE"
        title="Audience"
        desc="Aggregate, privacy-safe audience intelligence for MTN Nigeria — never individual subscriber data. Extends Audience Match beyond the campaign wizard."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <Button size="sm" onClick={() => router.push('/campaigns/new')}>
          Create campaign with this audience →
        </Button>
      </div>

      <KpiGrid>
        <Kpi label="Total reachable (MTN NG)" value="18.4M" />
        <Kpi label="Saved segments" value={String(SEGMENTS.length)} />
        <Kpi label="Active audience pool" value="4.2M" />
      </KpiGrid>

      <div className="tly-grid-2">
        <Card>
          <CardHead title="Aggregate audience overview" sub="Distribution across the reachable base" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <DistributionBars title="Geography" rows={GEOGRAPHY} />
            <DistributionBars title="Device mix" rows={DEVICE_MIX} />
            <DistributionBars title="Usage" rows={USAGE} />
          </div>
          <DemoNote />
        </Card>

        <Card>
          <CardHead title="Eligibility & privacy" sub="How audiences are sized and protected" />
          <div className="tly-faint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Eligible audience (demonstration estimate)
          </div>
          <div className="tly-mono" style={{ fontSize: 34, fontWeight: 700, marginTop: 4 }}>
            73.1M
          </div>
          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: '1px solid var(--tly-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: 12.5,
            }}
          >
            <span className="tly-dim">Privacy threshold</span>
            <span className="tly-faint" style={{ textAlign: 'right' }}>
              Segments below 50,000 are masked and never sized.
            </span>
          </div>
          <div style={{ marginTop: 14 }}>
            <Badge tone="success">Aggregate only — no identities</Badge>
          </div>
          <DemoNote />
        </Card>
      </div>

      <Card>
        <CardHead title="Saved & recent audience definitions" sub="Reusable, privacy-safe segments" />
        <Table head={['Segment', 'Size', 'Signal', 'Geography', 'Channels', 'Action']}>
          {SEGMENTS.map((s) => (
            <tr key={s.id}>
              <td>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div className="tly-faint" style={{ fontSize: 11.5 }}>
                  {s.description}
                </div>
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {compactNumber(s.size)}
              </td>
              <td
                className="tly-mono"
                style={{ textAlign: 'right', color: 'var(--tly-success)', fontWeight: 600 }}
              >
                {`⭐ ${s.signalScore}/100`}
              </td>
              <td className="tly-faint">{s.geography.join(', ')}</td>
              <td className="tly-faint">{s.channels.join(' · ')}</td>
              <td>
                <Button size="sm" variant="ghost" onClick={() => router.push('/campaigns/new')}>
                  Use in campaign
                </Button>
              </td>
            </tr>
          ))}
        </Table>
        <DemoNote />
      </Card>
    </PortalShell>
  );
}
