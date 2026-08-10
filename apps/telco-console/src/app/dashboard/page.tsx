'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { compactNumber, formatMoney, type Campaign } from '@telyad/types';
import { Button, Card, CardHead, Kpi, KpiGrid, PageHeader, StatusBadge, Table } from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .listCampaigns()
      .then((r) => setCampaigns(r.campaigns))
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  const pending = campaigns.filter((c) => c.status === 'PENDING_TELCO_APPROVAL').length;
  const live = campaigns.filter((c) => c.status === 'LIVE').length;
  const reach = campaigns.reduce((s, c) => s + c.estimatedReach, 0);

  return (
    <ConsoleShell active="dashboard">
      <PageHeader
        eyebrow="MTN Nigeria Network"
        title="Dashboard"
        desc="Executive overview of advertiser campaigns on MTN Nigeria's network. Aggregated metrics only — no subscriber PII."
      />
      <KpiGrid>
        <Kpi label="Campaigns on network" value={campaigns.length} />
        <Kpi label="Pending approval" value={pending} delta={pending > 0 ? 'action needed' : 'clear'} dir="up" />
        <Kpi label="Live campaigns" value={live} />
        <Kpi label="Subscriber reach" value="78.4M" delta="1.2%" dir="up" />
        <Kpi label="Combined est. campaign reach" value={compactNumber(reach)} />
      </KpiGrid>

      <Card>
        <CardHead
          title="Campaigns on MTN Nigeria"
          action={
            pending > 0 ? (
              <Button size="sm" onClick={() => router.push('/approvals')}>
                Review {pending} pending →
              </Button>
            ) : undefined
          }
        />
        {!loaded ? (
          <div className="tly-faint">Loading…</div>
        ) : (
          <Table head={['Campaign', 'Format', 'Est. reach', 'Budget', 'Status']}>
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td className="tly-faint">{c.formatId.toUpperCase()}</td>
                <td className="tly-mono">{compactNumber(c.estimatedReach)}</td>
                <td className="tly-mono">{formatMoney(c.budget.total, { compact: true })}</td>
                <td>
                  <StatusBadge status={c.status} />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </ConsoleShell>
  );
}
