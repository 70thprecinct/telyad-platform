'use client';
import { Badge, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { COMPLIANCE, DEMO_NOTE, EXT_NOTE } from '@/lib/demo';

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const STATUS_TONE: Record<(typeof COMPLIANCE)[number]['status'], BadgeTone> = {
  Pass: 'success',
  Warn: 'warning',
  Fail: 'danger',
};

function scoreColour(score: number): string {
  if (score >= 75) return 'var(--tly-success)';
  if (score >= 50) return 'var(--tly-warning)';
  return 'var(--tly-danger)';
}

export default function CompliancePage() {
  const count = COMPLIANCE.length || 1;
  const avgScore = Math.round(COMPLIANCE.reduce((s, c) => s + c.score, 0) / count);
  const flagged = COMPLIANCE.filter((c) => c.flags > 0).length;
  const dndApplied = COMPLIANCE.filter((c) => c.dnd === 'Applied').length;
  const failing = COMPLIANCE.filter((c) => c.status === 'Fail').length;

  return (
    <ConsoleShell active="compliance">
      <PageHeader
        eyebrow="GOVERNANCE"
        title="Compliance"
        desc="NDPA, NCC, and DND compliance status across every advertiser and campaign."
      />

      <Card>
        <div className="tly-faint" style={{ fontSize: 12 }} data-testid="compliance-note">
          Compliance scoring is demonstration / deterministic — this screen does not claim live NCC or
          ARCON integration. {DEMO_NOTE} Live regulatory checks: {EXT_NOTE}
        </div>
      </Card>

      <KpiGrid>
        <Kpi label="Avg compliance score" value={`${avgScore}/100`} />
        <Kpi label="Flagged campaigns" value={String(flagged)} />
        <Kpi label="DND applied" value={String(dndApplied)} />
        <Kpi label="Failing" value={String(failing)} />
      </KpiGrid>

      <Card>
        <CardHead title="Advertiser & campaign compliance" sub="Scoring, DND enforcement and consent gating" />
        <Table head={['Advertiser', 'Campaign', 'Score', 'Risk', 'DND', 'Consent', 'Flags', 'Status']}>
          {COMPLIANCE.map((c) => (
            <tr key={`${c.advertiser}-${c.campaign}`}>
              <td style={{ fontWeight: 600 }}>{c.advertiser}</td>
              <td>{c.campaign}</td>
              <td
                className="tly-mono"
                style={{ textAlign: 'right', color: scoreColour(c.score), fontWeight: 600 }}
              >
                {c.score}/100
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>{c.risk}/100</td>
              <td>
                <Badge tone={c.dnd === 'Applied' ? 'success' : 'danger'}>{c.dnd}</Badge>
              </td>
              <td>
                <Badge tone={c.consent === 'Gated' ? 'success' : 'warning'}>{c.consent}</Badge>
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>{c.flags}</td>
              <td>
                <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </ConsoleShell>
  );
}
