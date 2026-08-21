'use client';
import { Badge, Button, Card, CardHead, Kpi, KpiGrid, PageHeader, Progress, Table } from '@telyad/ui';
import { formatMoney } from '@telyad/types';
import { PortalShell } from '@/components/PortalShell';
import { BILLING, DEMO_NOTE } from '@/lib/demo';

// Tone for a ledger entry type: money in → success, spend → neutral, other → info.
function ledgerTone(type: string): 'success' | 'neutral' | 'info' {
  if (type === 'TOPUP' || type === 'CREDIT') return 'success';
  if (type === 'SPEND') return 'neutral';
  return 'info';
}

const BUDGET_ALERTS: Array<{ tone: 'warning' | 'success' | 'info'; text: string }> = [
  { tone: 'warning', text: 'Total Goals SMS Acq. at 78% of budget — projected to exhaust before period end.' },
  { tone: 'success', text: 'Wallet balance healthy — 2.1× committed spend still available.' },
  { tone: 'info', text: 'WAP Predictor Push fully spent against its allocation.' },
];

export default function BillingPage() {
  const utilisation = Math.round((BILLING.spentMtdMinor / BILLING.committedMinor) * 100);

  return (
    <PortalShell active="billing">
      <PageHeader
        eyebrow="ACCOUNT · BILLING"
        title="Billing & Budget"
        desc="Budget, allocations and settlement — demonstration financial data; no real payment processing."
      />

      <div className="tly-faint" style={{ marginBottom: 16, fontSize: 12.5 }}>
        {DEMO_NOTE} All figures on this page are illustrative — no funds move and no payment method is charged.
      </div>

      <KpiGrid>
        <Kpi label="Available budget" value={formatMoney({ minor: BILLING.availableMinor, currency: 'NGN' }, { compact: true })} />
        <Kpi label="Committed (active campaigns)" value={formatMoney({ minor: BILLING.committedMinor, currency: 'NGN' }, { compact: true })} />
        <Kpi label="Spent (MTD)" value={formatMoney({ minor: BILLING.spentMtdMinor, currency: 'NGN' }, { compact: true })} />
        <Kpi label="Utilisation" value={`${utilisation}%`} />
      </KpiGrid>

      <div style={{ marginTop: 20 }}>
        <Card>
          <CardHead title="Campaign allocations" sub="Budget committed and consumed per active campaign." />
          <Table head={['Campaign', 'Budget', 'Spent', 'Used']}>
            {BILLING.allocations.map((a) => {
              const pct = Math.round((a.spentMinor / a.budgetMinor) * 100);
              return (
                <tr key={a.campaign}>
                  <td style={{ fontWeight: 600 }}>{a.campaign}</td>
                  <td className="tly-mono" style={{ textAlign: 'right' }}>
                    {formatMoney({ minor: a.budgetMinor, currency: 'NGN' }, { compact: true })}
                  </td>
                  <td className="tly-mono" style={{ textAlign: 'right' }}>
                    {formatMoney({ minor: a.spentMinor, currency: 'NGN' }, { compact: true })}
                  </td>
                  <td style={{ minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <Progress value={pct} />
                      </div>
                      <span className="tly-mono tly-faint" style={{ fontSize: 12 }}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        </Card>
      </div>

      <div style={{ marginTop: 20 }}>
        <Card>
          <CardHead title="Transactions" sub="Recent wallet and settlement movements." />
          <Table head={['Date', 'Type', 'Reference', 'Description', 'Amount']}>
            {BILLING.ledger.map((l) => {
              const credit = l.amountMinor >= 0;
              return (
                <tr key={l.id}>
                  <td className="tly-faint">{l.date}</td>
                  <td>
                    <Badge tone={ledgerTone(l.type)}>{l.type}</Badge>
                  </td>
                  <td className="tly-mono">{l.ref}</td>
                  <td className="tly-faint">{l.desc}</td>
                  <td
                    className="tly-mono"
                    style={{ textAlign: 'right', color: credit ? 'var(--tly-success)' : 'var(--tly-text)' }}
                  >
                    {credit ? '+' : '−'}
                    {formatMoney({ minor: Math.abs(l.amountMinor), currency: 'NGN' })}
                  </td>
                </tr>
              );
            })}
          </Table>
        </Card>
      </div>

      <div style={{ marginTop: 20 }}>
        <Card>
          <CardHead title="Invoices" sub="Monthly settlement statements." />
          <Table head={['Invoice', 'Period', 'Amount', 'Status', '']}>
            {BILLING.invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="tly-mono">{inv.id}</td>
                <td className="tly-faint">{inv.period}</td>
                <td className="tly-mono" style={{ textAlign: 'right' }}>
                  {formatMoney({ minor: inv.amountMinor, currency: 'NGN' }, { compact: true })}
                </td>
                <td>
                  <Badge tone={inv.status === 'Paid' ? 'success' : 'neutral'}>{inv.status}</Badge>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {/* Demo only — download is a no-op in the prototype. */}
                  <Button variant="ghost" size="sm" disabled>
                    Download
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      <div style={{ marginTop: 20 }}>
        <Card>
          <CardHead title="Budget alerts" sub="Automated thresholds against active allocations." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BUDGET_ALERTS.map((al, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Badge tone={al.tone}>{al.tone === 'warning' ? 'Alert' : al.tone === 'success' ? 'OK' : 'Info'}</Badge>
                <span style={{ fontSize: 13 }}>{al.text}</span>
              </div>
            ))}
          </div>
          <div className="tly-faint" style={{ marginTop: 12, fontSize: 12 }}>{DEMO_NOTE}</div>
        </Card>
      </div>
    </PortalShell>
  );
}
