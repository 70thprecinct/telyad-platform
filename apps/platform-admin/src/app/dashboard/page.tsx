'use client';
import { useEffect, useState } from 'react';
import type { Telco, TelcoStatus } from '@telyad/types';
import { Badge, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { AdminShell } from '@/components/AdminShell';
import { api } from '@/lib/api';

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

  const active = telcos.filter((t) => t.status === 'Active').length;

  return (
    <AdminShell active="dashboard">
      <PageHeader
        eyebrow="ALL TELCOS · AGGREGATED"
        title="Global Dashboard"
        desc="Cross-telco overview for Tely staff. No individual subscriber data ever appears here — aggregates only. Each telco operates a fully isolated environment."
      />
      <KpiGrid>
        <Kpi label="Telcos onboarded" value={`${active} / ${telcos.length}`} delta="Active vs total" />
        <Kpi label="Aggregate subscriber reach" value="182M" delta="illustrative" />
        <Kpi label="Advertisers on platform" value="240" delta="illustrative" />
      </KpiGrid>

      <Card>
        <CardHead title="Active Telco Summary" sub="Aggregated partnership view — no subscriber-level data." />
        {!loaded ? (
          <div className="tly-faint">Loading…</div>
        ) : (
          <Table head={['Telco', 'Country', 'Status', 'Revenue share']}>
            {telcos.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 600 }}>{t.name}</td>
                <td className="tly-faint">{t.country}</td>
                <td>
                  <Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge>
                </td>
                <td className="tly-mono">{t.revenueShareBps / 100}%</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </AdminShell>
  );
}
