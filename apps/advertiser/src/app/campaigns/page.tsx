'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { compactNumber, formatMoney, type Campaign } from '@telyad/types';
import { Button, Card, CardHead, PageHeader, StatusBadge, Table } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { api } from '@/lib/api';

export default function CampaignsPage() {
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

  return (
    <PortalShell active="campaigns">
      <PageHeader eyebrow="All campaigns" title="Campaigns" desc="Every campaign you have created on MTN Nigeria." />
      <Card>
        <CardHead
          title={`${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'}`}
          action={
            <Button size="sm" onClick={() => router.push('/campaigns/new')}>
              + New Campaign
            </Button>
          }
        />
        {error ? (
          <div className="tly-empty" data-testid="campaigns-error">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Couldn’t reach the API</div>
            <Button variant="ghost" size="sm" onClick={load}>Retry</Button>
          </div>
        ) : !loaded ? (
          <div className="tly-faint">Loading…</div>
        ) : (
          <Table head={['Campaign', 'Objective', 'Format', 'Est. reach', 'Budget', 'Status', 'Approval']}>
            {campaigns.map((c) => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/campaigns/${c.id}`)}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td className="tly-faint">{c.objective}</td>
                <td className="tly-faint">{c.formatId.toUpperCase()}</td>
                <td className="tly-mono">{compactNumber(c.estimatedReach)}</td>
                <td className="tly-mono">{formatMoney(c.budget.total, { compact: true })}</td>
                <td>
                  <StatusBadge status={c.status} />
                </td>
                <td className="tly-faint">{c.approvedByTelcoName ? `✓ ${c.approvedByTelcoName}` : '—'}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </PortalShell>
  );
}
