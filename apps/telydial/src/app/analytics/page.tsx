'use client';
import {
  Badge,
  Card,
  CardHead,
  Kpi,
  KpiGrid,
  PageHeader,
  Table,
} from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { BarChart, DoughnutChart, LineChart } from '@/components/Charts';
import {
  ANALYTICS_KPIS,
  DEMO_NOTE,
  EXT_NOTE,
  FUNNEL,
  MODEL_PERFORMANCE,
  PRODUCT_PERFORMANCE,
  PUSH_TREND,
  SPEND_TREND,
  STATE_SPLIT,
  type Kpi as KpiKind,
} from '@/lib/demo';

const KIND_DELTA: Record<KpiKind['kind'], string> = {
  REAL: 'Real',
  DEMO: 'Demo',
  EXT: 'Ext · carrier',
};

export default function AnalyticsPage() {
  const optinsByDay = PUSH_TREND.labels.map((label, i) => ({
    label,
    value: PUSH_TREND.optins[i] ?? 0,
  }));
  const productData = PRODUCT_PERFORMANCE.map((p) => ({
    label: p.name,
    value: p.acquisition,
  }));

  return (
    <PortalShell active="analytics">
      <PageHeader
        eyebrow="Intelligence"
        title="Analytics"
        desc="STK push, opt-in, spend and CPA analytics across your acquisition campaigns."
      />

      <KpiGrid>
        {ANALYTICS_KPIS.map((k) => (
          <Kpi
            key={k.label}
            label={k.label}
            value={k.value}
            delta={KIND_DELTA[k.kind]}
          />
        ))}
      </KpiGrid>

      <Card>
        <CardHead
          title="Subscriber acquisition by day"
          sub="Demonstration · opt-ins vs STK pushes (scaled)"
        />
        <BarChart data={optinsByDay} height={240} />
      </Card>

      <div
        className="chart-row"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        <Card>
          <CardHead title="Conversion funnel" sub="Sent → confirmed" />
          <BarChart data={FUNNEL} horizontal height={220} />
        </Card>
        <Card>
          <CardHead title="CPA trend" sub="Last 7 days" />
          <LineChart
            labels={SPEND_TREND.labels}
            series={[
              {
                label: 'CPA (₦)',
                data: SPEND_TREND.cpa,
                color: 'var(--tly-warning)',
              },
            ]}
            height={220}
          />
        </Card>
      </div>

      <Card>
        <CardHead
          title="Acquisition by state"
          sub="Demonstration · share of opt-ins"
        />
        <div
          style={{
            display: 'flex',
            gap: 24,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <DoughnutChart data={STATE_SPLIT} size={200} />
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              minWidth: 180,
            }}
          >
            {STATE_SPLIT.map((s) => (
              <li
                key={s.label}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: s.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontSize: 13 }}>{s.label}</span>
                <span
                  className="tly-mono"
                  style={{ fontSize: 13, fontWeight: 600 }}
                >
                  {s.value}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card>
        <CardHead
          title="Product performance"
          sub="Demonstration · acquisition by product"
        />
        <BarChart data={productData} height={240} />
      </Card>

      <Card>
        <CardHead title="Commercial-model performance" sub="Demonstration" />
        <div style={{ overflowX: 'auto' }}>
          <Table head={['Model', 'Spend', 'Opt-ins', 'CPA']}>
            {MODEL_PERFORMANCE.map((m) => (
              <tr key={m.model}>
                <td>
                  <Badge tone={m.model === 'CPA' ? 'info' : 'neutral'}>
                    {m.model}
                  </Badge>
                </td>
                <td className="tly-mono">₦{m.spend.toLocaleString()}</td>
                <td className="tly-mono">{m.optins.toLocaleString()}</td>
                <td className="tly-mono">₦{m.cpa}</td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      <div className="tly-faint" style={{ fontSize: 11, marginTop: 14 }}>
        {DEMO_NOTE} {EXT_NOTE} Push, delivery and display volumes require carrier
        (STK · SMS gateway) integration — external integration required.
      </div>
    </PortalShell>
  );
}
