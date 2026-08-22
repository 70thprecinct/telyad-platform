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
import { Badge, Button, Card, CardHead, Kpi, KpiGrid, PageHeader, StatusBadge, Table } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { api } from '@/lib/api';
import { LineChart, DoughnutChart } from '@/components/Charts';
import { CHANNEL_PERF, DASHBOARD_ALERTS, DEMO_NOTE, HEADLINE, SPEND_TREND } from '@/lib/demo';

const PIPELINE_ORDER: CampaignStatus[] = [
  'LIVE', 'PENDING_TELCO_APPROVAL', 'APPROVED', 'SCHEDULED', 'READY_FOR_REVIEW',
  'SUBMITTED', 'PAUSED', 'DRAFT', 'REJECTED', 'COMPLETED', 'CANCELLED',
];
const ALERT_TONE = { warning: 'warning', success: 'success', info: 'info' } as const;

export default function DashboardPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  function load() {
    setLoaded(false);
    setError(false);
    api.listCampaigns().then((r) => setCampaigns(r.campaigns)).catch(() => setError(true)).finally(() => setLoaded(true));
  }
  useEffect(load, []);

  const live = campaigns.filter((c) => c.status === 'LIVE').length;
  const pending = campaigns.filter((c) => c.status === 'PENDING_TELCO_APPROVAL').length;
  const approved = campaigns.filter((c) => c.status === 'APPROVED').length;
  const totalReach = campaigns.reduce((s, c) => s + c.estimatedReach, 0);
  const currency: CurrencyCode = campaigns[0]?.budget.total.currency ?? 'NGN';
  const spend = { minor: campaigns.reduce((s, c) => s + c.budget.total.minor, 0), currency };
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
        desc="Your campaigns on MTN Nigeria. Audience figures are aggregate estimates — never individual subscriber data. Performance figures below are demonstration data, not live MTN statistics."
      />

      {/* Portfolio KPIs — REAL application data (your persisted campaigns). */}
      <KpiGrid>
        <Kpi label="Active campaigns" value={live} />
        <Kpi label="Total est. reach" value={compactNumber(totalReach)} />
        <Kpi label="Committed media spend" value={formatMoney(spend, { compact: true })} />
        <Kpi label="Pending MTN approval" value={pending} delta={pending > 0 ? 'action needed' : 'all clear'} dir="up" />
        <Kpi label="Approved" value={approved} />
      </KpiGrid>

      {/* Performance strip — DETERMINISTIC DEMONSTRATION DATA. */}
      <KpiGrid>
        <Kpi label="Total spend (MTD)" value={formatMoney({ minor: HEADLINE.spendMinor, currency: 'NGN' }, { compact: true })} delta="18.4%" dir="up" />
        <Kpi label="Total impressions" value={compactNumber(HEADLINE.impressions)} delta="22.1%" dir="up" />
        <Kpi label="Conversions" value={compactNumber(HEADLINE.conversions)} delta="31.7%" dir="up" />
        <Kpi label="Avg interaction rate" value={`${HEADLINE.interactionRate}%`} delta="0.8pp" dir="up" />
      </KpiGrid>
      <div className="tly-faint" style={{ fontSize: 11, margin: '-8px 0 16px' }}>{DEMO_NOTE}</div>

      <div className="tly-grid-2">
        <Card>
          <CardHead title="Daily spend" sub="Last 14 days · demonstration" />
          <LineChart data={SPEND_TREND.data} labels={SPEND_TREND.labels} />
        </Card>
        <Card>
          <CardHead title="Channel mix" sub="By impressions · demonstration" />
          <DoughnutChart data={CHANNEL_PERF.map((c) => ({ label: c.channel, value: c.impressions, color: c.color }))} />
        </Card>
      </div>

      <div className="tly-grid-2">
        <Card>
          <CardHead
            title="Your campaigns"
            sub="Newest first"
            action={<Button size="sm" onClick={() => router.push('/campaigns/new')}>+ New Campaign</Button>}
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
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/campaigns/${c.id}`)}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td className="tly-faint">{c.formatId.toUpperCase()}</td>
                  <td className="tly-mono" style={{ textAlign: 'right' }}>{compactNumber(c.estimatedReach)}</td>
                  <td className="tly-mono" style={{ textAlign: 'right' }}>{formatMoney(c.budget.total, { compact: true })}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="tly-faint">{c.approvedByTelcoName ? `✓ ${c.approvedByTelcoName}` : '—'}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <div>
          <Card>
            <CardHead title="Quick actions" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <Button block onClick={() => router.push('/campaigns/new')}>🚀 Launch new campaign</Button>
              <Button variant="ghost" block onClick={() => router.push('/audience')}>Build new audience</Button>
              <Button variant="ghost" block onClick={() => router.push('/ai')}>AI campaign generator</Button>
              <Button variant="ghost" block onClick={() => router.push('/analytics')}>View full analytics</Button>
            </div>
          </Card>
          <Card>
            <CardHead title="Pipeline" sub="Portfolio by status" />
            {loaded && campaigns.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {pipeline.map((s) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <StatusBadge status={s} />
                    <span className="tly-mono" style={{ fontWeight: 600 }}>{byStatus[s]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tly-faint" style={{ fontSize: 12.5 }}>Your portfolio breakdown appears here.</div>
            )}
          </Card>
        </div>
      </div>

      <Card>
        <CardHead title="Recent alerts" sub="Demonstration activity" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DASHBOARD_ALERTS.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 10, borderBottom: i < DASHBOARD_ALERTS.length - 1 ? '1px solid var(--tly-border-soft)' : 'none' }}>
              <Badge tone={ALERT_TONE[a.tone]}>{a.icon}</Badge>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                <div className="tly-faint" style={{ fontSize: 12 }}>{a.desc}</div>
              </div>
              <div className="tly-faint" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{a.time}</div>
            </div>
          ))}
        </div>
      </Card>
    </PortalShell>
  );
}
