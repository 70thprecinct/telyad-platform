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

  useEffect(() => {
    api
      .listCampaigns()
      .then((r) => setCampaigns(r.campaigns))
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  const live = campaigns.filter((c) => c.status === 'LIVE').length;
  const pending = campaigns.filter((c) => c.status === 'PENDING_TELCO_APPROVAL').length;
  const approved = campaigns.filter((c) => c.status === 'APPROVED').length;
  const totalReach = campaigns.reduce((s, c) => s + c.estimatedReach, 0);

  return (
    <PortalShell active="dashboard">
      <PageHeader
        eyebrow="MVAS acquisition · MTN Nigeria"
        title="Dashboard"
        desc="STK-led MVAS acquisition on MTN Nigeria. Audience figures are aggregate estimates — never individual subscriber data."
      />
      <KpiGrid>
        <Kpi label="Total campaigns" value={campaigns.length} />
        <Kpi label="Live" value={live} />
        <Kpi label="Pending approval" value={pending} />
        <Kpi label="Approved" value={approved} />
        <Kpi label="Combined est. reach" value={compactNumber(totalReach)} />
      </KpiGrid>

      <Card>
        <CardHead
          title="Your acquisition campaigns"
          sub="Newest first"
          action={
            <Button size="sm" onClick={() => router.push('/campaigns/new')}>
              + New Campaign
            </Button>
          }
        />
        {!loaded ? (
          <div className="tly-faint">Loading…</div>
        ) : campaigns.length === 0 ? (
          <div className="tly-empty">No campaigns yet. Launch your first MVAS acquisition campaign.</div>
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
