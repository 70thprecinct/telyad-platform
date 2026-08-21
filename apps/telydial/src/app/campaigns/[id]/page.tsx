'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { compactNumber, formatMoney, type Campaign } from '@telyad/types';
import {
  Badge,
  Button,
  Card,
  CardHead,
  Kpi,
  KpiGrid,
  PageHeader,
  StatusBadge,
  useToast,
} from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { api, ApiError } from '@/lib/api';
import { DEMO_NOTE, verifyProductId } from '@/lib/demo';

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
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

  if (!campaign) {
    return (
      <PortalShell active="campaigns">
        <div className="tly-faint">Loading campaign…</div>
      </PortalShell>
    );
  }

  // Persisted campaigns don't guarantee a creativeFields map on the entity; read
  // it defensively so we never assert a field the API may omit.
  const creative = (campaign as { creativeFields?: Record<string, string> }).creativeFields ?? {};
  const productId = creative.productId ?? '';
  const registryProduct = productId ? verifyProductId(productId) : null;
  const currency = campaign.budget.total.currency;

  // Deterministic DEMONSTRATION acquisition metrics — derived from the campaign's
  // own aggregate reach. Not live MTN results (no random, no clock).
  const demoConv = 8.7;
  const demoOptins = Math.round(campaign.estimatedReach * (demoConv / 100));
  const demoCpaMinor = 3605; // ₦36.05 CPA average (demonstration)

  const serviceName = creative.serviceName ?? creative.name ?? campaign.name;
  const creativeBody = creative.body ?? creative.message ?? '';
  const creativeCta = creative.cta ?? creative.accept ?? creative.acceptLabel ?? '';
  const smsFallback = creative.smsFallback ?? '';

  return (
    <PortalShell active="campaigns">
      <Button variant="ghost" size="sm" onClick={() => router.push('/campaigns')}>
        ← Back to campaigns
      </Button>

      <PageHeader
        eyebrow="Campaign"
        title={campaign.name}
        desc={`Status: ${campaign.status.replace(/_/g, ' ').toLowerCase()} · ${campaign.objective}`}
      />

      <div style={{ marginBottom: 12 }}>
        <StatusBadge status={campaign.status} />
      </div>

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
            <div style={{ fontWeight: 700 }}>Approved by {campaign.approvedByTelcoName ?? 'MTN Nigeria'}</div>
            <div className="tly-dim" style={{ fontSize: 12 }}>
              This MVAS acquisition campaign has been approved and can be scheduled or launched in demo mode.
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
        {/* ── Product ─────────────────────────────────────────────────────── */}
        <Card>
          <CardHead title="Product" sub="Service details are demonstration registry data." />
          <Row k="Product ID" v={<span className="tly-mono">{productId || '—'}</span>} />
          <Row k="Service name" v={registryProduct?.name ?? serviceName} />
          <Row k="Category" v={registryProduct?.category ?? '—'} />
          <Row
            k="Product status"
            v={
              registryProduct ? (
                <Badge tone={registryProduct.status === 'Active' ? 'success' : 'warning'}>
                  {registryProduct.status}
                </Badge>
              ) : (
                '—'
              )
            }
          />
          <Row k="Existing-subscriber suppression" v={<Badge tone="info">By Product ID</Badge>} />
        </Card>

        {/* ── Creative ────────────────────────────────────────────────────── */}
        <Card>
          <CardHead title="Creative" sub="Persisted campaign creative fields." />
          <Row k="Service name" v={serviceName || '—'} />
          <Row k="Format" v={campaign.formatId.toUpperCase()} />
          <Row k="Message body" v={creativeBody || '—'} />
          <Row k="CTA / accept" v={creativeCta || '—'} />
          {smsFallback && <Row k="SMS fallback" v={smsFallback} />}
        </Card>

        {/* ── Audience (aggregate) ────────────────────────────────────────── */}
        <Card>
          <CardHead title="Audience" sub="Aggregate estimate only — no subscriber data." />
          <Row k="Geographies" v={campaign.audience.geographies.join(', ') || 'All Nigeria'} />
          <Row k="Age bands" v={campaign.audience.ageBands.join(', ') || 'All'} />
          <Row k="Interests" v={campaign.audience.interests.join(', ') || '—'} />
          <Row k="Exclusions" v={campaign.audience.exclusions.join(', ') || 'None'} />
          <Row
            k="Estimated reach (aggregate)"
            v={`${compactNumber(campaign.estimatedReach)} subscribers`}
          />
        </Card>

        {/* ── Commercial & budget ─────────────────────────────────────────── */}
        <Card>
          <CardHead title="Commercial & budget" sub="Persisted commercial terms." />
          <Row k="Pricing model" v={campaign.budget.pricingModel} />
          <Row k="Daily cap" v={formatMoney(campaign.budget.dailyCap)} />
          <Row k="Total budget" v={formatMoney(campaign.budget.total)} />
          <Row k="Schedule" v={`${campaign.budget.startDate} → ${campaign.budget.endDate}`} />
        </Card>
      </div>

      {/* ── Acquisition (DEMONSTRATION) ───────────────────────────────────── */}
      <Card>
        <CardHead
          title="Acquisition"
          sub="Demonstration metrics — deterministic, not live MTN results."
        />
        <KpiGrid>
          <Kpi label="Opt-ins (demo)" value={demoOptins.toLocaleString()} />
          <Kpi label="CPA (demo)" value={formatMoney({ minor: demoCpaMinor, currency })} />
          <Kpi label="Conversion (demo)" value={`${demoConv}%`} />
        </KpiGrid>
      </Card>

      {/* ── Status history ───────────────────────────────────────────────── */}
      <Card>
        <CardHead title="Status history" sub="Platform timestamps where available." />
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
          <TimelineStep label="Created" when={campaign.createdAt} />
          <TimelineStep
            label="Submitted"
            when={campaign.submittedAt}
            fallback="Not yet submitted"
          />
          <TimelineStep
            label={campaign.approvedByTelcoName ? `Approved by ${campaign.approvedByTelcoName}` : 'Approval'}
            when={campaign.approvedAt}
            fallback="Awaiting telco decision"
          />
        </ol>
      </Card>

      {(campaign.status === 'DRAFT' || campaign.status === 'READY_FOR_REVIEW') && (
        <Card>
          <CardHead title="Ready to submit?" sub="Send this campaign to MTN Nigeria for approval." />
          <Button onClick={submit} disabled={busy}>
            {busy ? 'Submitting…' : 'Submit for approval'}
          </Button>
        </Card>
      )}

      <div className="tly-faint" style={{ fontSize: 11 }}>
        {DEMO_NOTE}
      </div>
    </PortalShell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
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

function TimelineStep({ label, when, fallback }: { label: string; when?: string | null; fallback?: string }) {
  const done = Boolean(when);
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span
        aria-hidden
        style={{
          marginTop: 4,
          width: 10,
          height: 10,
          borderRadius: '50%',
          flex: '0 0 auto',
          background: done ? 'var(--tly-primary)' : 'var(--tly-border)',
        }}
      />
      <div>
        <div style={{ fontWeight: 600, fontSize: 12.5 }}>{label}</div>
        <div className="tly-faint" style={{ fontSize: 11.5 }}>
          {when ?? fallback ?? 'Demonstration step'}
        </div>
      </div>
    </li>
  );
}
