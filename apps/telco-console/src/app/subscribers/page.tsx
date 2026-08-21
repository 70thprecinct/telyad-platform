'use client';
import { Badge, Card, CardHead, Kpi, KpiGrid, PageHeader } from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { DEMO_NOTE, SUBSCRIBERS } from '@/lib/demo';

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

export default function SubscribersPage() {
  return (
    <ConsoleShell active="subscribers">
      <PageHeader
        eyebrow="AUDIENCE & TRAFFIC"
        title="Subscriber Insights"
        desc="Anonymised, aggregated subscriber intelligence. No personally identifiable information is ever shown."
      />

      <KpiGrid>
        <Kpi label="Reachable subscribers" value={`${SUBSCRIBERS.reachableM}M`} />
      </KpiGrid>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Badge tone="success">Aggregate only — no MSISDN, no subscriber lookup</Badge>
          <div className="tly-dim" style={{ fontSize: 12.5 }}>
            Every figure below is an aggregate distribution. No subscriber can be identified or
            looked up from this surface.
          </div>
        </div>
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        <Card>
          <CardHead title="Geography" sub="Aggregate distribution by state" />
          <LabelBars data={SUBSCRIBERS.geography} />
        </Card>
        <Card>
          <CardHead title="Device class" sub="Aggregate distribution by device" />
          <LabelBars data={SUBSCRIBERS.device} />
        </Card>
        <Card>
          <CardHead title="Usage category" sub="Aggregate distribution by usage" />
          <LabelBars data={SUBSCRIBERS.usage} />
        </Card>
        <Card>
          <CardHead title="Recharge bands" sub="Aggregate distribution by recharge" />
          <LabelBars data={SUBSCRIBERS.rechargeBands} />
        </Card>
        <Card>
          <CardHead title="Engagement" sub="Aggregate distribution by engagement" />
          <LabelBars data={SUBSCRIBERS.engagement} />
        </Card>
      </div>

      <div className="tly-faint" style={{ fontSize: 11.5 }}>
        {DEMO_NOTE}
      </div>
    </ConsoleShell>
  );
}
