'use client';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHead,
  EmptyState,
  Kpi,
  KpiGrid,
  Modal,
  PageHeader,
  Select,
  Table,
  Textarea,
} from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { DEMO_NOTE, MODERATION } from '@/lib/demo';

type ModStatus = 'All' | 'Pending' | 'Flagged' | 'Approved';

const RISK_TONE: Record<string, 'danger' | 'warning' | 'neutral'> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'neutral',
};
const STATUS_TONE: Record<string, 'success' | 'danger' | 'warning'> = {
  Approved: 'success',
  Flagged: 'danger',
  Pending: 'warning',
};

export default function ModerationPage() {
  const [filter, setFilter] = useState<ModStatus>('All');
  // Demonstration-only decision capture. Real moderation decisions flow through
  // the existing campaign approval / audit seam — this modal records nothing.
  const [active, setActive] = useState<{ id: string; campaign: string; decision: 'Approve' | 'Reject' } | null>(null);
  const [reason, setReason] = useState('');

  const rows = MODERATION.filter((m) => filter === 'All' || m.status === filter);

  const pending = MODERATION.filter((m) => m.status === 'Pending').length;
  const flagged = MODERATION.filter((m) => m.status === 'Flagged').length;
  const approved = MODERATION.filter((m) => m.status === 'Approved').length;
  const highRisk = MODERATION.filter((m) => m.risk === 'High').length;

  function open(m: (typeof MODERATION)[number], decision: 'Approve' | 'Reject') {
    setActive({ id: m.id, campaign: m.campaign, decision });
    setReason(decision === 'Approve' ? 'Reviewed — no policy violation found.' : '');
  }

  return (
    <ConsoleShell active="moderation">
      <PageHeader
        eyebrow="GOVERNANCE"
        title="Content Moderation"
        desc="Automated scanning of every campaign for spam, fraud, and policy violations."
      />

      <KpiGrid>
        <Kpi label="Pending" value={pending} />
        <Kpi label="Flagged" value={flagged} />
        <Kpi label="Approved" value={approved} />
        <Kpi label="High risk" value={highRisk} />
      </KpiGrid>

      <Card>
        <CardHead
          title="Moderation queue"
          sub="Scanning surfaces suspected spam, fraud and policy violations for operator review."
          action={
            <div style={{ minWidth: 180 }}>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value as ModStatus)}
                options={[
                  { value: 'All', label: 'All statuses' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Flagged', label: 'Flagged' },
                  { value: 'Approved', label: 'Approved' },
                ]}
              />
            </div>
          }
        />

        {rows.length === 0 ? (
          <EmptyState title="No campaigns match this filter" desc="Adjust the status filter to see more." />
        ) : (
          <Table
            head={['Campaign', 'Advertiser', 'Capability', 'Language', 'Risk', 'Status', 'Reviewer', 'Action']}
          >
            {rows.map((m) => (
              <tr key={m.id}>
                <td style={{ fontWeight: 600 }}>{m.campaign}</td>
                <td className="tly-faint">{m.advertiser}</td>
                <td className="tly-faint">{m.capability}</td>
                <td className="tly-faint">{m.language}</td>
                <td>
                  <Badge tone={RISK_TONE[m.risk] ?? 'neutral'}>{m.risk}</Badge>
                </td>
                <td>
                  <Badge tone={STATUS_TONE[m.status] ?? 'neutral'}>{m.status}</Badge>
                </td>
                <td className="tly-faint">{m.reviewer}</td>
                <td>
                  {m.status === 'Pending' || m.status === 'Flagged' ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button size="sm" variant="ghost" onClick={() => open(m, 'Approve')}>
                        Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => open(m, 'Reject')}>
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="tly-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}

        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
          Automated scanning shown here is a demonstration surface — it does not run live against MTN traffic.
          Real moderation decisions are recorded through the campaign approval and audit seam. {DEMO_NOTE}
        </div>
      </Card>

      <Modal
        open={!!active}
        title={active?.decision === 'Approve' ? 'Approve content' : 'Reject content'}
        onClose={() => setActive(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setActive(null)}>
              Cancel
            </Button>
            <Button
              variant={active?.decision === 'Approve' ? 'success' : 'danger'}
              onClick={() => setActive(null)}
            >
              {active?.decision === 'Approve' ? 'Record approval' : 'Record rejection'}
            </Button>
          </>
        }
      >
        <p className="tly-dim" style={{ fontSize: 12.5 }}>
          {active?.campaign} — capture a reason for this decision. This is a demonstration surface; the real decision
          is written through the existing approval / audit seam.
        </p>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason / reviewer notes"
          rows={4}
        />
      </Modal>
    </ConsoleShell>
  );
}
