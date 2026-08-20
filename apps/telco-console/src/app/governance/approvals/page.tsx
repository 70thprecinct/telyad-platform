'use client';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHead,
  Kpi,
  KpiGrid,
  Modal,
  PageHeader,
  Table,
} from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { DEMO_NOTE, GOV_APPROVALS } from '@/lib/demo';

const STATUS_TONE: Record<string, 'warning' | 'success' | 'danger'> = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'danger',
};

export default function GovernanceApprovalsPage() {
  // Demonstration-only review capture. Governance decisions are recorded
  // through the existing audit seam — this modal writes nothing.
  const [active, setActive] = useState<(typeof GOV_APPROVALS)[number] | null>(null);

  const pending = GOV_APPROVALS.filter((g) => g.status === 'Pending').length;
  const approved = GOV_APPROVALS.filter((g) => g.status === 'Approved').length;
  const rejected = GOV_APPROVALS.filter((g) => g.status === 'Rejected').length;
  const total = GOV_APPROVALS.length;

  return (
    <ConsoleShell active="governance/approvals">
      <PageHeader
        eyebrow="GOVERNANCE"
        title="Approvals"
        desc="Operator and platform governance actions — advertiser approval, capability enablement, commercial configuration, content exceptions. Distinct from the campaign-approval queue."
      />

      <KpiGrid>
        <Kpi label="Pending" value={pending} />
        <Kpi label="Approved" value={approved} />
        <Kpi label="Rejected" value={rejected} />
        <Kpi label="Total" value={total} />
      </KpiGrid>

      <Card>
        <CardHead
          title="Governance approvals"
          sub="Maker / checker governance workflow — each action is raised by a maker and confirmed by a separate checker."
        />

        <div className="tly-faint" style={{ fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
          This is the maker/checker governance queue for operator and platform actions. It is not the campaign-approval
          queue — individual campaigns are reviewed under Campaign Approval (Advertisers &amp; Campaigns → Campaign Approval).
        </div>

        <Table head={['Type', 'Subject', 'Requested by', 'Maker', 'Checker', 'Status', 'Action']}>
          {GOV_APPROVALS.map((g) => (
            <tr key={g.id}>
              <td>
                <Badge tone="info">{g.type}</Badge>
              </td>
              <td style={{ fontWeight: 600 }}>{g.subject}</td>
              <td className="tly-faint">{g.requestedBy}</td>
              <td className="tly-faint">{g.maker}</td>
              <td className="tly-faint">{g.checker}</td>
              <td>
                <Badge tone={STATUS_TONE[g.status] ?? 'neutral'}>{g.status}</Badge>
              </td>
              <td>
                {g.status === 'Pending' ? (
                  <Button size="sm" variant="ghost" onClick={() => setActive(g)}>
                    Review
                  </Button>
                ) : (
                  <span className="tly-faint">—</span>
                )}
              </td>
            </tr>
          ))}
        </Table>

        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
          Review actions here are a demonstration surface. Real governance decisions are recorded via the audit seam. {DEMO_NOTE}
        </div>
      </Card>

      <Modal
        open={!!active}
        title="Review governance action"
        onClose={() => setActive(null)}
        footer={
          <>
            <Button variant="danger" onClick={() => setActive(null)}>
              Reject
            </Button>
            <Button variant="success" onClick={() => setActive(null)}>
              Approve
            </Button>
          </>
        }
      >
        {active && (
          <div style={{ fontSize: 12.5, lineHeight: 1.7 }}>
            <div>
              <span className="tly-faint">Type: </span>
              {active.type}
            </div>
            <div>
              <span className="tly-faint">Subject: </span>
              <strong>{active.subject}</strong>
            </div>
            <div>
              <span className="tly-faint">Requested by: </span>
              {active.requestedBy}
            </div>
            <div>
              <span className="tly-faint">Maker: </span>
              {active.maker}
            </div>
            <div>
              <span className="tly-faint">Checker: </span>
              {active.checker}
            </div>
            <p className="tly-dim" style={{ marginTop: 10 }}>
              As checker, approving or rejecting this action completes the maker/checker control. This is a demonstration
              surface — the decision is recorded through the audit seam.
            </p>
          </div>
        )}
      </Modal>
    </ConsoleShell>
  );
}
