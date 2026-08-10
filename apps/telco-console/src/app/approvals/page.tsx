'use client';
import { useEffect, useState } from 'react';
import { compactNumber, formatMoney, type Campaign } from '@telyad/types';
import {
  Badge,
  Button,
  Card,
  CardHead,
  Field,
  Modal,
  PageHeader,
  PhonePreview,
  Textarea,
  useToast,
} from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { api, ApiError } from '@/lib/api';

export default function ApprovalsPage() {
  const { toast } = useToast();
  const [queue, setQueue] = useState<Campaign[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<Campaign | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [comments, setComments] = useState('');
  const [busy, setBusy] = useState(false);

  function refresh() {
    api
      .approvalQueue()
      .then((r) => setQueue(r.campaigns))
      .catch(() => setQueue([]))
      .finally(() => setLoaded(true));
  }
  useEffect(refresh, []);

  function open(c: Campaign, d: 'APPROVED' | 'REJECTED') {
    setActive(c);
    setDecision(d);
    setComments(d === 'APPROVED' ? 'Compliant, low risk. Approved for delivery.' : '');
  }

  async function confirm() {
    if (!active || !decision) return;
    setBusy(true);
    try {
      await api.decide(active.id, decision, comments);
      toast(
        decision === 'APPROVED' ? 'Campaign approved' : 'Campaign rejected',
        `${active.name} — recorded with your comment and an audit event.`,
        decision === 'APPROVED' ? 'success' : 'danger',
      );
      setActive(null);
      setDecision(null);
      refresh();
    } catch (e) {
      toast('Decision failed', e instanceof ApiError ? e.message : 'Unexpected error', 'danger');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ConsoleShell active="approvals">
      <PageHeader
        eyebrow="Advertisers & Campaigns"
        title="Campaign Approval"
        desc="Every campaign enters this queue before it can go live on MTN Nigeria. Approve or reject with a recorded comment; each decision writes an audit event."
      />

      {!loaded ? (
        <div className="tly-faint">Loading queue…</div>
      ) : queue.length === 0 ? (
        <Card>
          <div className="tly-empty">No campaigns awaiting approval.</div>
        </Card>
      ) : (
        queue.map((c) => (
          <Card key={c.id}>
            <CardHead
              title={c.name}
              sub={`${c.objective} · ${c.formatId.toUpperCase()}`}
              action={<Badge tone="warning">Pending approval</Badge>}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 18 }}>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <Metric label="Budget" value={formatMoney(c.budget.total, { compact: true })} />
                  <Metric label="Estimated reach" value={compactNumber(c.estimatedReach)} />
                  <Metric label="Scheduled" value={`${c.budget.startDate} → ${c.budget.endDate}`} />
                  <Metric label="Pricing" value={c.budget.pricingModel} />
                  <Metric
                    label="Compliance score"
                    value={`${c.complianceScore}/100`}
                    tone={c.complianceScore > 80 ? 'success' : 'warning'}
                  />
                  <Metric
                    label="Risk score"
                    value={`${c.riskScore}/100`}
                    tone={c.riskScore < 20 ? 'success' : 'danger'}
                  />
                </div>
                <div className="tly-card-sub" style={{ marginBottom: 6 }}>Audience (aggregate — no subscriber identities)</div>
                <div className="tly-faint" style={{ fontSize: 12, lineHeight: 1.6 }}>
                  {[
                    c.audience.geographies.join(', ') || 'All Nigeria',
                    c.audience.ageBands.join(', '),
                    c.audience.interests.join(', '),
                    `Excludes: ${c.audience.exclusions.join(', ') || 'none'}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <Button variant="success" onClick={() => open(c, 'APPROVED')}>
                    Approve
                  </Button>
                  <Button variant="danger" onClick={() => open(c, 'REJECTED')}>
                    Reject
                  </Button>
                </div>
              </div>
              <PhonePreview formatId={c.formatId} fields={{}} />
            </div>
          </Card>
        ))
      )}

      <Modal
        open={!!active}
        title={decision === 'APPROVED' ? 'Approve campaign' : 'Reject campaign'}
        onClose={() => setActive(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setActive(null)}>
              Cancel
            </Button>
            <Button variant={decision === 'APPROVED' ? 'success' : 'danger'} onClick={confirm} disabled={busy}>
              {busy ? 'Recording…' : decision === 'APPROVED' ? 'Confirm approval' : 'Confirm rejection'}
            </Button>
          </>
        }
      >
        <p className="tly-dim" style={{ fontSize: 12.5 }}>
          {active?.name} — your name, the timestamp, this comment and the decision are recorded as an audit event.
        </p>
        <Field label="Comment">
          <Textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Reason / notes" />
        </Field>
      </Modal>
    </ConsoleShell>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warning' | 'danger' }) {
  const color = tone ? `var(--tly-${tone})` : 'var(--tly-text)';
  return (
    <div>
      <div className="tly-faint" style={{ fontSize: 10.5 }}>{label}</div>
      <div className="tly-mono" style={{ fontSize: 13, color }}>{value}</div>
    </div>
  );
}
