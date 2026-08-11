'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { compactNumber, formatMoney, type Campaign } from '@telyad/types';
import { Button, Card, CardHead, Kpi, KpiGrid, PageHeader, StatusBadge, Table } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  function load() {
    setLoaded(false);
    setError(false);
    api
      .listCampaigns()
      .then((r) => setCampaigns(r.campaigns))
      .catch(() => setError(true))
      .finally(() => setLoaded(true));
  }
  useEffect(load, []);

  const live = campaigns.filter((c) => c.status === 'LIVE').length;
  const pending = campaigns.filter((c) => c.status === 'PENDING_TELCO_APPROVAL').length;
  const approved = campaigns.filter((c) => c.status === 'APPROVED').length;
  const totalReach = campaigns.reduce((s, c) => s + c.estimatedReach, 0);

  return (
    <PortalShell active="dashboard">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        desc="Your campaigns on MTN Nigeria. Audience figures are aggregate estimates — never individual subscriber data."
      />
      <KpiGrid>
        <Kpi label="Total campaigns" value={campaigns.length} />
        <Kpi label="Live" value={live} />
        <Kpi label="Pending MTN approval" value={pending} />
        <Kpi label="Approved" value={approved} />
        <Kpi label="Combined est. reach" value={compactNumber(totalReach)} />
      </KpiGrid>

      <Card>
        <CardHead
          title="Your campaigns"
          sub="Newest first"
          action={
            <Button size="sm" onClick={() => router.push('/campaigns/new')}>
              + New Campaign
            </Button>
          }
        />
        {error ? (
          <div className="tly-empty" data-testid="dashboard-error">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Couldn’t reach the API</div>
            <div style={{ fontSize: 12.5, marginBottom: 12 }}>Check the API is running, then retry.</div>
            <Button variant="ghost" size="sm" onClick={load}>Retry</Button>
          </div>
        ) : !loaded ? (
          <div className="tly-faint">Loading…</div>
        ) : campaigns.length === 0 ? (
          <div className="tly-empty">No campaigns yet. Create your first campaign.</div>
        ) : (
          <Table head={['Campaign', 'Format', 'Est. reach', 'Budget', 'Status', 'Approval']}>
            {campaigns.map((c) => (
              <tr
                key={c.id}
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`/campaigns/${c.id}`)}
              >
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td className="tly-faint">{c.formatId.toUpperCase()}</td>
                <td className="tly-mono">{compactNumber(c.estimatedReach)}</td>
                <td className="tly-mono">{formatMoney(c.budget.total, { compact: true })}</td>
                <td>
                  <StatusBadge status={c.status} />
                </td>
                <td className="tly-faint">
                  {c.approvedByTelcoName ? `✓ ${c.approvedByTelcoName}` : '—'}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </PortalShell>
  );
}
