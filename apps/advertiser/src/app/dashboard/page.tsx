'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  compactNumber,
  formatMoney,
  type Campaign,
  type CampaignStatus,
  type CurrencyCode,
} from '@telyad/types';
import { Button, Card, CardHead, Kpi, KpiGrid, PageHeader, StatusBadge, Table } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { api } from '@/lib/api';

// Order used for the pipeline breakdown: operationally most urgent first.
const PIPELINE_ORDER: CampaignStatus[] = [
  'LIVE',
  'PENDING_TELCO_APPROVAL',
  'APPROVED',
  'SCHEDULED',
  'READY_FOR_REVIEW',
  'SUBMITTED',
  'PAUSED',
  'DRAFT',
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
];

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

  // Committed media spend — sum of campaign budgets, kept in integer minor units.
  const currency: CurrencyCode = campaigns[0]?.budget.total.currency ?? 'NGN';
  const spendMinor = campaigns.reduce((s, c) => s + c.budget.total.minor, 0);
  const spend = { minor: spendMinor, currency };

  // Portfolio breakdown by status (derived from the fetched campaigns).
  const byStatus = campaigns.reduce<Partial<Record<CampaignStatus, number>>>((m, c) => {
    m[c.status] = (m[c.status] ?? 0) + 1;
    return m;
  }, {});
  const pipeline = PIPELINE_ORDER.filter((s) => byStatus[s]);

  return (
    <PortalShell active="dashboard">
      <PageHeader
        eyebrow="Overview"
        title="Advertiser dashboard"
        desc="Your campaigns on MTN Nigeria. Audience figures are aggregate estimates — never individual subscriber data. Demonstration data."
      />

      <KpiGrid>
        <Kpi label="Active campaigns" value={live} />
        <Kpi label="Total est. reach" value={compactNumber(totalReach)} />
        <Kpi label="Committed media spend" value={formatMoney(spend, { compact: true })} />
        <Kpi
          label="Pending MTN approval"
          value={pending}
          delta={pending > 0 ? 'action needed' : 'all clear'}
          dir="up"
        />
        <Kpi label="Approved" value={approved} />
      </KpiGrid>

      <div className="tly-grid-2">
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
                  <td className="tly-mono" style={{ textAlign: 'right' }}>
                    {compactNumber(c.estimatedReach)}
                  </td>
                  <td className="tly-mono" style={{ textAlign: 'right' }}>
                    {formatMoney(c.budget.total, { compact: true })}
                  </td>
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

        <Card>
          <CardHead title="Pipeline" sub="Portfolio by status" />
          {!loaded ? (
            <div className="tly-faint">Loading…</div>
          ) : campaigns.length === 0 ? (
            <div className="tly-faint" style={{ fontSize: 12.5 }}>
              No campaigns yet — your portfolio breakdown appears here once you launch one.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {pipeline.map((s) => (
                  <div
                    key={s}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <StatusBadge status={s} />
                    <span className="tly-mono" style={{ fontWeight: 600 }}>{byStatus[s]}</span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid var(--tly-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="tly-faint">Combined reach</span>
                  <span className="tly-mono tly-dim">{compactNumber(totalReach)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="tly-faint">Committed spend</span>
                  <span className="tly-mono tly-dim">{formatMoney(spend, { compact: true })}</span>
                </div>
              </div>
              {pending > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  block
                  onClick={() => router.push('/campaigns')}
                  style={{ marginTop: 14 }}
                >
                  Review {pending} awaiting MTN →
                </Button>
              )}
            </>
          )}
        </Card>
      </div>
    </PortalShell>
  );
}
