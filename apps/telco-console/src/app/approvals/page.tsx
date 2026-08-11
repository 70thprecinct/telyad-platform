'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  compactNumber,
  formatMoney,
  type Advertiser,
  type Campaign,
  type CampaignApproval,
} from '@telyad/types';
import {
  Badge,
  Button,
  Card,
  CardHead,
  Field,
  Modal,
  PageHeader,
  ExperiencePreview,
  Table,
  Textarea,
  useToast,
} from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { api, ApiError } from '@/lib/api';

const FMT_RENDERER: Record<string, 'stk' | 'sms' | 'ussd' | 'wap_push' | 'voice_call'> = {
  stk: 'stk', sms: 'sms', ussd: 'ussd', wap: 'wap_push', obd: 'voice_call',
};

export default function ApprovalsPage() {
  const { toast } = useToast();
  const [queue, setQueue] = useState<Campaign[]>([]);
  const [advertisers, setAdvertisers] = useState<Record<string, Advertiser>>({});
  const [history, setHistory] = useState<CampaignApproval[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [active, setActive] = useState<Campaign | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [comments, setComments] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    setState('loading');
    Promise.all([api.approvalQueue(), api.advertisers(), api.approvals()])
      .then(([q, adv, appr]) => {
        setQueue(q.campaigns);
        setAdvertisers(Object.fromEntries(adv.advertisers.map((a) => [a.id, a])));
        setHistory(appr.approvals);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);
  useEffect(refresh, [refresh]);

  function open(c: Campaign, d: 'APPROVED' | 'REJECTED') {
    setActive(c);
    setDecision(d);
    setComments(d === 'APPROVED' ? 'Compliant, low risk. Approved for delivery.' : '');
  }

  const rejectBlocked = decision === 'REJECTED' && comments.trim().length === 0;

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

  const advName = (id: string) => advertisers[id]?.name ?? id;

  return (
    <ConsoleShell active="approvals">
      <PageHeader
        eyebrow="Advertisers & Campaigns"
        title="Campaign Approval"
        desc="Every campaign enters this queue before it can go live on MTN Nigeria. Approve or reject with a recorded comment; each decision writes an audit event."
      />

      {state === 'error' ? (
        <Card>
          <div className="tly-empty" data-testid="approvals-error">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Couldn’t load the approval queue</div>
            <div style={{ fontSize: 12.5, marginBottom: 12 }}>The API may be unavailable.</div>
            <Button variant="ghost" onClick={refresh}>Retry</Button>
          </div>
        </Card>
      ) : state === 'loading' ? (
        <div className="tly-faint" data-testid="approvals-loading">Loading queue…</div>
      ) : queue.length === 0 ? (
        <Card>
          <div className="tly-empty" data-testid="approvals-empty">No campaigns awaiting approval.</div>
        </Card>
      ) : (
        <div data-testid="approval-queue">
          {queue.map((c) => (
            <Card key={c.id} data-testid="approval-card">
              <CardHead
                title={c.name}
                sub={`${advName(c.advertiserId)} · ${c.objective} · ${c.formatId.toUpperCase()}`}
                action={<Badge tone="warning">Pending approval</Badge>}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 18 }}>
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <Metric label="Advertiser" value={advName(c.advertiserId)} />
                    <Metric label="Budget" value={formatMoney(c.budget.total, { compact: true })} />
                    <Metric label="Estimated eligible audience" value={compactNumber(c.estimatedReach)} />
                    <Metric label="Pricing / dates" value={`${c.budget.pricingModel} · ${c.budget.startDate}→${c.budget.endDate}`} />
                    <Metric
                      label="Compliance score"
                      value={`${c.complianceScore}/100`}
                      tone={c.complianceScore > 80 ? 'success' : 'warning'}
                    />
                    <Metric label="Risk score" value={`${c.riskScore}/100`} tone={c.riskScore < 20 ? 'success' : 'danger'} />
                  </div>
                  <div className="tly-card-sub" style={{ marginBottom: 6 }}>Audience definition (aggregate — no subscriber identities)</div>
                  <div className="tly-faint" style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
                    {[
                      c.audience.geographies.join(', ') || 'All Nigeria',
                      c.audience.ageBands.join(', '),
                      c.audience.interests.join(', '),
                      c.audience.subscriberTiers.join(', '),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    <Badge tone={c.audience.exclusions.includes('dnd') ? 'success' : 'warning'}>
                      {c.audience.exclusions.includes('dnd') ? 'DND suppression applied' : 'DND suppression NOT set'}
                    </Badge>
                    <Badge tone="info">Consent-gated delivery</Badge>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="success" data-testid="approve-button" onClick={() => open(c, 'APPROVED')}>
                      Approve
                    </Button>
                    <Button variant="danger" data-testid="reject-button" onClick={() => open(c, 'REJECTED')}>
                      Reject
                    </Button>
                  </div>
                </div>
                <ExperiencePreview renderer={FMT_RENDERER[c.formatId] ?? 'sms'} content={{ brand: advName(c.advertiserId), title: c.name, body: 'Subscriber sees this campaign creative on delivery.', cta: 'Learn more' }} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <Card>
          <CardHead title="Recent approval history" sub="Most recent first" />
          <Table head={['Decision', 'Approver', 'Comment', 'When']}>
            {history
              .slice()
              .reverse()
              .slice(0, 8)
              .map((h) => (
                <tr key={h.id}>
                  <td>
                    <Badge tone={h.decision === 'APPROVED' ? 'success' : 'danger'}>{h.decision}</Badge>
                  </td>
                  <td>{h.approverName}</td>
                  <td className="tly-faint">{h.comments || '—'}</td>
                  <td className="tly-mono tly-faint">{new Date(h.decidedAt).toLocaleString()}</td>
                </tr>
              ))}
          </Table>
        </Card>
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
            <Button
              variant={decision === 'APPROVED' ? 'success' : 'danger'}
              onClick={confirm}
              disabled={busy || rejectBlocked}
              data-testid="confirm-decision"
            >
              {busy ? 'Recording…' : decision === 'APPROVED' ? 'Confirm approval' : 'Confirm rejection'}
            </Button>
          </>
        }
      >
        <p className="tly-dim" style={{ fontSize: 12.5 }}>
          {active?.name} — your name, the timestamp, this comment and the decision are recorded as an audit event.
        </p>
        <Field label="Comment" error={rejectBlocked ? 'A comment is required to reject.' : undefined}>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Reason / notes"
            data-testid="decision-comment"
          />
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
