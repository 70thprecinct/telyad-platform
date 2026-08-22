'use client';
import { useState } from 'react';
import {
  Badge,
  Card,
  CardHead,
  Field,
  Kpi,
  KpiGrid,
  PageHeader,
  Progress,
  Select,
  Table,
} from '@telyad/ui';
import { compactNumber } from '@telyad/types';
import { PortalShell } from '@/components/PortalShell';
import { DEMO_NOTE } from '@/lib/demo';

const CAMPAIGNS = [
  'MTN Game Zone Q3',
  'Total Goals SMS Acq.',
  'Correct Score USSD',
  'WAP Predictor Push',
];

type FunnelPhase = 'forecast' | 'delivery' | 'verification';

interface FunnelStage {
  label: string;
  caption: string;
  value: number;
  pct: number;
  phase: FunnelPhase;
}

// Deterministic demonstration numbers. Each pct is share of the ORIGINAL
// selected audience so the bars shrink monotonically down the chain.
const FUNNEL: FunnelStage[] = [
  { label: 'Selected Audience', caption: 'Forecast · 100% base', value: 78_400_000, pct: 100, phase: 'forecast' },
  { label: 'Eligible Audience', caption: 'Forecast · 93% of selected', value: 73_100_000, pct: 93, phase: 'forecast' },
  { label: 'Targeted', caption: 'Forecast · 40% of eligible', value: 29_300_000, pct: 37, phase: 'forecast' },
  { label: 'Delivered', caption: 'Delivery · 89% of targeted', value: 26_100_000, pct: 33, phase: 'delivery' },
  { label: 'Verified / Attributed', caption: 'Verification · 70% of delivered', value: 18_300_000, pct: 23, phase: 'verification' },
];

const PHASE_TONE: Record<FunnelPhase, 'info' | 'warning' | 'success'> = {
  forecast: 'info',
  delivery: 'warning',
  verification: 'success',
};

const GEO_BREAKDOWN = [
  { label: 'Lagos', pct: 31 },
  { label: 'Oyo', pct: 15 },
  { label: 'Kano', pct: 12 },
  { label: 'Rivers', pct: 9 },
  { label: 'Abuja', pct: 8 },
  { label: 'Other', pct: 25 },
];

const DEVICE_BREAKDOWN = [
  { label: 'Smartphone', pct: 61 },
  { label: 'Feature phone', pct: 39 },
];

const NUM_STYLE: React.CSSProperties = { textAlign: 'right', whiteSpace: 'nowrap' };

export default function ReachPage() {
  const [selected, setSelected] = useState(CAMPAIGNS[0]);

  return (
    <PortalShell active="reach">
      <PageHeader
        eyebrow="TARGETING · REACH & VERIFY"
        title="Reach & Verify"
        desc="The delivery-and-verification chain — forecast, delivery and verification are distinct. Demonstration data; live carrier verification requires MTN integration."
      />

      <Card>
        <CardHead title="Campaign" sub="Select a campaign to inspect its reach chain." />
        <div style={{ maxWidth: 360 }}>
          <Field label="Campaign">
            <Select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              options={CAMPAIGNS.map((c) => ({ value: c, label: c }))}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHead
          title="Reach chain"
          sub={`Selected Audience → Eligible → Targeted → Delivered → Verified · ${selected}`}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FUNNEL.map((stage) => (
            <div key={stage.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge tone={PHASE_TONE[stage.phase]}>{stage.label}</Badge>
                  <span className="tly-faint" style={{ fontSize: 11.5 }}>
                    {stage.caption}
                  </span>
                </div>
                <span className="tly-mono" style={{ fontSize: 18, fontWeight: 700, ...NUM_STYLE }}>
                  {compactNumber(stage.value)}
                </span>
              </div>
              <Progress value={stage.pct} />
            </div>
          ))}
        </div>
        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
          Forecast ≠ Delivered ≠ Verified. Verification shown is demonstration; live carrier
          attribution requires MTN network integration.
        </div>
      </Card>

      <KpiGrid>
        <Kpi label="Coverage" value="40%" />
        <Kpi label="Frequency" value="1.4×" />
        <Kpi label="Delivered reach" value={compactNumber(26_100_000)} />
        <Kpi label="Verified reach" value={compactNumber(18_300_000)} />
      </KpiGrid>

      <Card>
        <CardHead
          title="Verification status"
          sub="How each delivery signal is confirmed along the chain."
        />
        <Table head={['Signal', 'Source', 'Status']}>
          <tr>
            <td>Impression delivery</td>
            <td className="tly-dim">Carrier delivery receipt</td>
            <td>
              <Badge tone="success">Confirmed (demo)</Badge>
            </td>
          </tr>
          <tr>
            <td>USSD dial</td>
            <td className="tly-dim">Advertiser USSD code</td>
            <td>
              <Badge tone="success">Tracked (demo)</Badge>
            </td>
          </tr>
          <tr>
            <td>Conversion postback</td>
            <td className="tly-dim">Advertiser system</td>
            <td>
              <Badge tone="warning">External integration required</Badge>
            </td>
          </tr>
        </Table>
      </Card>

      <Card>
        <CardHead
          title="Geographic & device breakdown"
          sub="Share of verified/attributed reach. Demonstration."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}
        >
          <BreakdownList title="Geography" rows={GEO_BREAKDOWN} />
          <BreakdownList title="Device" rows={DEVICE_BREAKDOWN} />
        </div>
        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
          {DEMO_NOTE}
        </div>
      </Card>
    </PortalShell>
  );
}

function BreakdownList({ title, rows }: { title: string; rows: Array<{ label: string; pct: number }> }) {
  return (
    <div>
      <div className="tly-dim" style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r) => (
          <div key={r.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: 12.5 }}>{r.label}</span>
              <span className="tly-mono" style={{ fontSize: 12.5, ...NUM_STYLE }}>
                {r.pct}%
              </span>
            </div>
            <Progress value={r.pct} />
          </div>
        ))}
      </div>
    </div>
  );
}
