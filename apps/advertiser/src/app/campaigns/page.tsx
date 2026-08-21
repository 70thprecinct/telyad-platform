'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  compactNumber,
  formatMoney,
  CAMPAIGN_OBJECTIVES,
  type Campaign,
  type CampaignStatus,
} from '@telyad/types';
import { Button, Card, CardHead, Kpi, KpiGrid, PageHeader, Select, StatusBadge, Table } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { api } from '@/lib/api';

const ACTIVE_STATUSES: CampaignStatus[] = ['LIVE', 'APPROVED', 'SCHEDULED'];

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [objectiveFilter, setObjectiveFilter] = useState('all');

  function load() {
    setLoaded(false);
    setError(false);
    api.listCampaigns().then((r) => setCampaigns(r.campaigns)).catch(() => setError(true)).finally(() => setLoaded(true));
  }
  useEffect(load, []);

  const counts = {
    active: campaigns.filter((c) => ACTIVE_STATUSES.includes(c.status)).length,
    paused: campaigns.filter((c) => c.status === 'PAUSED').length,
    completed: campaigns.filter((c) => c.status === 'COMPLETED').length,
    drafts: campaigns.filter((c) => c.status === 'DRAFT').length,
  };

  const filtered = useMemo(
    () =>
      campaigns.filter(
        (c) =>
          (statusFilter === 'all' || c.status === statusFilter) &&
          (objectiveFilter === 'all' || c.objective === objectiveFilter),
      ),
    [campaigns, statusFilter, objectiveFilter],
  );

  const statuses = Array.from(new Set(campaigns.map((c) => c.status)));

  return (
    <PortalShell active="campaigns">
      <PageHeader eyebrow="All campaigns" title="Campaigns" desc="Every campaign you have created on MTN Nigeria." />

      <KpiGrid>
        <Kpi label="Active" value={counts.active} />
        <Kpi label="Paused" value={counts.paused} />
        <Kpi label="Completed" value={counts.completed} />
        <Kpi label="Drafts" value={counts.drafts} />
      </KpiGrid>

      <Card>
        <CardHead
          title={`${filtered.length} campaign${filtered.length === 1 ? '' : 's'}`}
          action={<Button size="sm" onClick={() => router.push('/campaigns/new')}>+ New Campaign</Button>}
        />
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 160 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              data-testid="filter-status"
              options={[
                { value: 'all', label: 'All statuses' },
                ...statuses.map((s) => ({ value: s, label: s.replace(/_/g, ' ') })),
              ]}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select
              value={objectiveFilter}
              onChange={(e) => setObjectiveFilter(e.target.value)}
              data-testid="filter-objective"
              options={[
                { value: 'all', label: 'All objectives' },
                ...CAMPAIGN_OBJECTIVES.map((o) => ({ value: o, label: o })),
              ]}
            />
          </div>
        </div>

        {error ? (
          <div className="tly-empty" data-testid="campaigns-error">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Couldn’t reach the API</div>
            <Button variant="ghost" size="sm" onClick={load}>Retry</Button>
          </div>
        ) : !loaded ? (
          <div className="tly-faint">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="tly-empty">No campaigns match these filters.</div>
        ) : (
          <Table head={['Campaign', 'Objective', 'Format', 'Est. reach', 'Budget', 'Dates', 'Status', 'Actions']}>
            {filtered.map((c) => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/campaigns/${c.id}`)}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td className="tly-faint">{c.objective}</td>
                <td className="tly-faint">{c.formatId.toUpperCase()}</td>
                <td className="tly-mono" style={{ textAlign: 'right' }}>{compactNumber(c.estimatedReach)}</td>
                <td className="tly-mono" style={{ textAlign: 'right' }}>{formatMoney(c.budget.total, { compact: true })}</td>
                <td className="tly-faint" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                  {c.budget.startDate} → {c.budget.endDate}
                </td>
                <td><StatusBadge status={c.status} /></td>
                <td>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); router.push(`/campaigns/${c.id}`); }}
                  >
                    {c.status === 'DRAFT' ? 'Edit' : 'View'}
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </PortalShell>
  );
}
