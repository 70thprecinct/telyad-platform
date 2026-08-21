'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Campaign } from '@telyad/types';
import { Badge, Button, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { DoughnutChart, LineChart } from '@/components/Charts';
import { api } from '@/lib/api';
import { DASHBOARD_KPIS, DEMO_CAMPAIGNS, PUSH_TREND, SPEND_TREND, STATE_SPLIT, DEMO_NOTE, EXT_NOTE } from '@/lib/demo';

const kindDelta = (k: 'REAL' | 'DEMO' | 'EXT') => (k === 'REAL' ? 'Real' : k === 'DEMO' ? 'Demo' : 'Ext · carrier');
const statusTone = (s: string) =>
  s === 'Active' ? 'success' : s === 'Pending approval' ? 'warning' : s === 'Rejected' ? 'danger' : 'neutral';

export default function DashboardPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.listCampaigns().then((r) => setCampaigns(r.campaigns)).catch(() => undefined).finally(() => setLoaded(true));
  }, []);

  const liveCount = campaigns.filter((c) => c.status === 'LIVE' || c.status === 'APPROVED').length;

  return (
    <PortalShell active="dashboard">
      <PageHeader
        eyebrow="MVAS acquisition · MTN Nigeria"
        title="Dashboard"
        desc="STK-led MVAS subscriber acquisition on MTN Nigeria. Audience and delivery figures are aggregate — never individual subscriber data."
      />

      <KpiGrid>
        {DASHBOARD_KPIS.map((k) => (
          <Kpi key={k.label} label={k.label} value={k.value} delta={`${kindDelta(k.kind)} · ${k.sub}`} />
        ))}
      </KpiGrid>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 4 }} className="tly-dash-row">
        <Card>
          <CardHead title="STK pushes & opt-ins" sub="Demonstration · last 7 days. Live delivery requires carrier integration." />
          <LineChart
            labels={PUSH_TREND.labels}
            series={[
              { label: 'STK pushes', data: PUSH_TREND.pushes, color: 'var(--tly-primary)' },
              { label: 'Opt-ins', data: PUSH_TREND.optins, color: 'var(--tly-success)' },
            ]}
          />
          <Legend items={[['STK pushes', 'var(--tly-primary)'], ['Opt-ins', 'var(--tly-success)']]} />
        </Card>
        <Card>
          <CardHead title="Acquisition by state" sub="Demonstration" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <DoughnutChart data={STATE_SPLIT} size={150} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {STATE_SPLIT.map((s) => (
                <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: s.color, display: 'inline-block' }} />
                  {s.label} <span className="tly-faint">{s.value}%</span>
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHead title="Spend & CPA trend" sub="Demonstration · daily spend (₦) and cost-per-acquisition (₦)" />
        <LineChart
          labels={SPEND_TREND.labels}
          series={[
            { label: 'Spend', data: SPEND_TREND.spend, color: 'var(--tly-primary)' },
            { label: 'CPA', data: SPEND_TREND.cpa, color: 'var(--tly-warning)', dashed: true },
          ]}
        />
        <Legend items={[['Spend (₦)', 'var(--tly-primary)'], ['CPA (₦)', 'var(--tly-warning)']]} />
      </Card>

      <Card>
        <CardHead
          title="Recent campaign activity"
          sub={loaded ? `${liveCount} live/approved on the platform (real) · demonstration table below` : 'Loading…'}
          action={<Button size="sm" onClick={() => router.push('/campaigns/new')}>+ New Campaign</Button>}
        />
        <div style={{ overflowX: 'auto' }}>
          <Table head={['Campaign', 'Status', 'Product', 'Model', 'Opt-ins', 'CPA', 'Conv %']}>
            {DEMO_CAMPAIGNS.map((c) => (
              <tr key={c.id}>
                <td><div style={{ fontWeight: 600 }}>{c.name}</div><div className="tly-mono" style={{ fontSize: 10 }}>{c.id}</div></td>
                <td><Badge tone={statusTone(c.status)}>{c.status}</Badge></td>
                <td>{c.product}</td>
                <td><Badge tone={c.pricing === 'CPA' ? 'info' : 'neutral'}>{c.pricing}</Badge></td>
                <td className="tly-mono" style={{ color: c.optins ? 'var(--tly-success)' : undefined }}>{c.optins ? c.optins.toLocaleString() : '—'}</td>
                <td className="tly-mono">{c.cpa ? `₦${c.cpa}` : '—'}</td>
                <td className="tly-mono">{c.conv ? `${c.conv}%` : '—'}</td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      <div className="tly-faint" style={{ fontSize: 11 }}>
        {DEMO_NOTE} Campaign records you create are REAL (persisted via the platform API). {EXT_NOTE}
      </div>
    </PortalShell>
  );
}

function Legend({ items }: { items: [string, string][] }) {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
      {items.map(([l, c]) => (
        <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: 'var(--tly-text-dim)' }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: c, display: 'inline-block' }} />
          {l}
        </span>
      ))}
    </div>
  );
}
