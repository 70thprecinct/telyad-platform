'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { compactNumber, formatMoney, type Campaign } from '@telyad/types';
import { Button, Card, CardHead, PageHeader, StatusBadge, useToast } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { api, ApiError } from '@/lib/api';

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api
      .getCampaign(id)
      .then((r) => setCampaign(r.campaign))
      .catch(() => setCampaign(null));
  }, [id]);

  useEffect(load, [load]);

  async function submit() {
    setBusy(true);
    try {
      const r = await api.submitCampaign(id);
      setCampaign(r.campaign);
      toast('Submitted for approval', 'MTN Nigeria will review this campaign.', 'success');
    } catch (e) {
      toast('Could not submit', e instanceof ApiError ? e.message : 'Unexpected error', 'danger');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell active="campaigns">
      {!campaign ? (
        <div className="tly-faint">Loading campaign…</div>
      ) : (
        <>
          <PageHeader eyebrow={campaign.objective} title={campaign.name} />

          {campaign.status === 'APPROVED' && (
            <div
              className="tly-card"
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

          {(campaign.status === 'DRAFT' || campaign.status === 'READY_FOR_REVIEW') && (
            <Card>
              <CardHead title="Ready to submit?" sub="Send this campaign to MTN Nigeria for approval." />
              <Button onClick={submit} disabled={busy}>
                {busy ? 'Submitting…' : 'Submit for approval'}
              </Button>
            </Card>
          )}
        </>
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
