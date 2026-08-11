'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { compactNumber, formatMoney, type Campaign, type CampaignMetrics } from '@telyad/types';
import { Button, Card, CardHead, Kpi, KpiGrid, PageHeader, StatusBadge, useToast } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { api, ApiError } from '@/lib/api';

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError(false);
    api
      .getCampaign(id)
      .then((r) => {
        setCampaign(r.campaign);
        return api.campaignMetrics(id).then((m) => setMetrics(m.metrics)).catch(() => setMetrics(null));
      })
      .catch(() => setError(true));
  }, [id]);

  useEffect(load, [load]);

  async function submit() {
    setBusy(true);
    try {
      const r = await api.submitCampaign(id);
      setCampaign(r.campaign);
      api.campaignMetrics(id).then((m) => setMetrics(m.metrics)).catch(() => undefined);
      toast('Submitted for approval', 'MTN Nigeria will review this campaign.', 'success');
    } catch (e) {
      toast('Could not submit', e instanceof ApiError ? e.message : 'Unexpected error', 'danger');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell active="campaigns">
      {error ? (
        <Card>
          <div className="tly-empty" data-testid="campaign-error">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Couldn’t load this campaign</div>
            <div style={{ fontSize: 12.5, marginBottom: 12 }}>The API may be unavailable. Your work is safe.</div>
            <Button variant="ghost" onClick={load}>Retry</Button>
          </div>
        </Card>
      ) : !campaign ? (
        <div className="tly-faint" data-testid="campaign-loading">Loading campaign…</div>
      ) : (
        <div data-testid="campaign-detail" data-status={campaign.status}>
          <PageHeader eyebrow={campaign.objective} title={campaign.name} />

          {campaign.status === 'APPROVED' && (
            <div
              className="tly-card"
              data-testid="approval-banner"
              style={{
                borderColor: 'var(--tly-success)',
                background: 'var(--tly-success-dim)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 22 }}>✓</span>
              <div>
                <div style={{ fontWeight: 700 }}>Approved by {campaign.approvedByTelcoName}</div>
                <div className="tly-dim" style={{ fontSize: 12 }}>
                  This campaign has been approved and can be scheduled or launched in demo mode.
                </div>
              </div>
            </div>
          )}
          {campaign.status === 'REJECTED' && (
            <div className="tly-card" style={{ borderColor: 'var(--tly-danger)', background: 'var(--tly-danger-dim)' }}>
              <strong>Rejected by MTN Nigeria.</strong> Revise the campaign and resubmit.
            </div>
          )}

          <div className="tly-grid-2">
            <Card>
              <CardHead title="Campaign summary" />
              <Row k="Status" v={<StatusBadge status={campaign.status} />} />
              <Row k="Objective" v={campaign.objective} />
              <Row k="Format" v={campaign.formatId.toUpperCase()} />
              <Row k="Estimated reach" v={`${compactNumber(campaign.estimatedReach)} subscribers`} />
              <Row k="Budget (total)" v={formatMoney(campaign.budget.total)} />
              <Row k="Daily cap" v={formatMoney(campaign.budget.dailyCap)} />
              <Row k="Pricing" v={campaign.budget.pricingModel} />
              <Row k="Schedule" v={`${campaign.budget.startDate} → ${campaign.budget.endDate}`} />
            </Card>
            <Card>
              <CardHead title="Audience (aggregate)" sub="No individual subscriber data" />
              <Row k="Geographies" v={campaign.audience.geographies.join(', ') || 'All Nigeria'} />
              <Row k="Age bands" v={campaign.audience.ageBands.join(', ') || 'All'} />
              <Row k="Interests" v={campaign.audience.interests.join(', ') || '—'} />
              <Row k="Tiers" v={campaign.audience.subscriberTiers.join(', ') || 'All'} />
              <Row k="Exclusions" v={campaign.audience.exclusions.join(', ') || 'None'} />
              <Row k="Compliance score" v={`${campaign.complianceScore}/100`} />
              <Row k="Risk score" v={`${campaign.riskScore}/100`} />
            </Card>
          </div>

          {metrics?.hasData && (
            <Card>
              <CardHead title="Campaign analytics" sub="Demonstration data — deterministic, aggregate" />
              <KpiGrid>
                <Kpi label="Impressions" value={compactNumber(metrics.impressions)} />
                <Kpi label="Clicks / actions" value={compactNumber(metrics.clicks)} />
                <Kpi label="Conversions" value={compactNumber(metrics.conversions)} />
                <Kpi label="CTR" value={`${metrics.ctr}%`} />
                <Kpi label="Spend" value={formatMoney({ minor: metrics.spendMinor, currency: 'NGN' }, { compact: true })} />
                <Kpi label="Remaining budget" value={formatMoney({ minor: metrics.remainingBudgetMinor, currency: 'NGN' }, { compact: true })} />
              </KpiGrid>
            </Card>
          )}

          {(campaign.status === 'DRAFT' || campaign.status === 'READY_FOR_REVIEW') && (
            <Card>
              <CardHead title="Ready to submit?" sub="Send this campaign to MTN Nigeria for approval." />
              <Button onClick={submit} disabled={busy} data-testid="submit-campaign">
                {busy ? 'Submitting…' : 'Submit for approval'}
              </Button>
            </Card>
          )}
        </div>
      )}
    </PortalShell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid var(--tly-border-soft)',
        fontSize: 12.5,
      }}
    >
      <span className="tly-faint">{k}</span>
      <span style={{ textAlign: 'right' }}>{v}</span>
    </div>
  );
}
