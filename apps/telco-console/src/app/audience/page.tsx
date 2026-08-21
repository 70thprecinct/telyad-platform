'use client';
import { Badge, Card, CardHead, Kpi, KpiGrid, PageHeader } from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { AUDIENCE_MON, DEMO_NOTE } from '@/lib/demo';

function LabelBars({ data }: { data: [string, number][] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(([label, pct]) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 12.5 }}>{label}</span>
            <span
              className="tly-mono tly-dim"
              style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600 }}
            >
              {pct}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: 6,
              borderRadius: 4,
              background: 'var(--tly-border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                borderRadius: 4,
                background: 'var(--tly-primary)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AudiencePage() {
  return (
    <ConsoleShell active="audience">
      <PageHeader eyebrow="AUDIENCE & TRAFFIC" title="Audience Monitoring" />

      <KpiGrid>
        <Kpi label="Eligible audience" value={`${AUDIENCE_MON.eligibleM}M`} />
        <Kpi label="Targeted audience" value={`${AUDIENCE_MON.targetedM}M`} />
        <Kpi label="Active campaign audiences" value={AUDIENCE_MON.activeCampaignAudiences} />
        <Kpi label="Audience overlap" value={`${AUDIENCE_MON.overlapPct}%`} />
      </KpiGrid>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        <Card>
          <CardHead title="Geography" sub="Aggregate distribution by state" />
          <LabelBars data={AUDIENCE_MON.geography} />
        </Card>
        <Card>
          <CardHead title="Age bands" sub="Aggregate distribution by age" />
          <LabelBars data={AUDIENCE_MON.ageBands} />
        </Card>
        <Card>
          <CardHead title="Device mix" sub="Aggregate distribution by device" />
          <LabelBars data={AUDIENCE_MON.deviceMix} />
        </Card>
      </div>

      <Card>
        <CardHead title="Privacy threshold" sub="Aggregation guarantees" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Badge tone="success">Aggregate only — no subscriber identities</Badge>
          <div className="tly-dim" style={{ fontSize: 12.5 }}>
            Segments below 50,000 subscribers are masked and never displayed. No MSISDN, no
            subscriber-level data, and no individual identities are exposed anywhere on this
            surface.
          </div>
        </div>
      </Card>

      <div className="tly-faint" style={{ fontSize: 11.5 }}>
        {DEMO_NOTE}
      </div>
    </ConsoleShell>
  );
}
