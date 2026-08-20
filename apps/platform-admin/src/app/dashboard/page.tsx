'use client';
import { useEffect, useState } from 'react';
import type { Telco, TelcoStatus } from '@telyad/types';
import { Badge, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { AdminShell } from '@/components/AdminShell';
import { BarChart, LineChart } from '@/components/Charts';
import { api } from '@/lib/api';
import { GLOBAL, TELCOS, DEMO_NOTE } from '@/lib/demo';

const STATUS_TONE: Record<TelcoStatus, 'success' | 'warning' | 'info'> = {
  Active: 'success',
  Pipeline: 'warning',
  Prospect: 'info',
};

export default function DashboardPage() {
  const [telcos, setTelcos] = useState<Telco[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .listTelcos()
      .then((r) => setTelcos(r.telcos))
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  const activeReal = telcos.filter((t) => t.status === 'Active').length;
  const pipeline = TELCOS.filter((t) => t.status !== 'Active').length;
  const revBars = TELCOS.filter((t) => t.revenueMinorM > 0).map((t) => ({ label: t.name.split(' ')[0] ?? t.name, value: t.revenueMinorM }));

  return (
    <AdminShell active="dashboard">
      <PageHeader
        eyebrow="All telcos · aggregated"
        title="Global Dashboard"
        desc="Cross-telco control plane for Tely staff. No individual subscriber data ever appears here — aggregates only. Each telco operates a fully isolated environment."
      />

      <KpiGrid>
        <Kpi label="Telcos live" value={loaded ? `${activeReal || 1}` : '—'} delta="REAL · /telcos" />
        <Kpi label="Pipeline & prospect" value={`${pipeline}`} delta="Airtel · Glo · Vodacom" />
        <Kpi label="Subscriber reach" value={`${GLOBAL.subscriberReachM}M`} delta="Demo · aggregate" />
        <Kpi label="Advertisers on platform" value={`${GLOBAL.totalAdvertisers}`} delta="Demo" />
      </KpiGrid>
      <KpiGrid>
        <Kpi label="Platform revenue (Tely, MTD)" value={`₦${GLOBAL.platformRevenueMinorM}M`} delta="Demo · commission" />
        <Kpi label="Combined telco payout (MTD)" value={`₦${GLOBAL.combinedPayoutMinorM}M`} delta="Demo · revenue share" />
        <Kpi label="Active environments" value={`${activeReal || 1}`} delta="Isolated per telco" />
        <Kpi label="Data classification" value="REAL + DEMO" delta="See notes below" />
      </KpiGrid>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 4 }}>
        <Card>
          <CardHead title="Platform revenue by telco (MTD)" sub="Demonstration · ₦M revenue share" />
          <BarChart data={revBars} />
        </Card>
        <Card>
          <CardHead title="Platform revenue growth" sub="Demonstration · Tely commission ₦M" />
          <LineChart labels={GLOBAL.revenueTrend.labels} data={GLOBAL.revenueTrend.data} />
        </Card>
      </div>

      <Card>
        <CardHead title="Active Telco Summary" sub="Aggregated partnership view — no subscriber-level data. Telco list is REAL (/telcos); reach & revenue are demonstration." />
        {!loaded ? (
          <div className="tly-faint">Loading…</div>
        ) : (
          <Table head={['Telco', 'Country', 'Status', 'Revenue share', 'Subscriber reach', 'Advertisers']}>
            {(telcos.length ? telcos : []).map((t) => {
              const d = TELCOS.find((x) => x.name === t.name);
              return (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td className="tly-faint">{t.country}</td>
                  <td><Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge></td>
                  <td className="tly-mono">{t.revenueShareBps / 100}%</td>
                  <td className="tly-mono">{d && d.subsM > 0 ? `${d.subsM}M` : '—'}</td>
                  <td className="tly-mono">{d && d.advertisers > 0 ? d.advertisers : '—'}</td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>
      <div className="tly-faint" style={{ fontSize: 11 }}>{DEMO_NOTE} Telco records and status are REAL (persisted via the API).</div>
    </AdminShell>
  );
}
