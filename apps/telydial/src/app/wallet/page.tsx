'use client';
import { useMemo, useState } from 'react';
import { Badge, Button, Card, CardHead, PageHeader, Table } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { WALLET, LEDGER, PAYMENT_METHODS, DEMO_NOTE } from '@/lib/demo';

type LedgerFilter = 'All' | 'TelyDial' | 'Ads Manager';
const FILTERS: LedgerFilter[] = ['All', 'TelyDial', 'Ads Manager'];

export default function WalletPage() {
  const [filter, setFilter] = useState<LedgerFilter>('All');

  const rows = useMemo(
    () => (filter === 'All' ? LEDGER : LEDGER.filter((r) => r.platform === filter)),
    [filter],
  );

  return (
    <PortalShell active="wallet">
      <PageHeader
        eyebrow="Finance"
        title="Wallet"
        desc="Fund your account and track acquisition spend. No real payment is processed in this demonstration."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 18,
        }}
      >
        <Card style={{ background: 'var(--tly-primary)', color: '#ffffff' }}>
          <div style={{ fontSize: 12.5, opacity: 0.85 }}>Wallet balance</div>
          <div style={{ fontSize: 30, fontWeight: 700, margin: '6px 0 2px' }}>{WALLET.balance}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Available to spend</div>
        </Card>

        <Card>
          <div className="tly-kpi-label">Reserved spend</div>
          <div className="tly-kpi-val">{WALLET.reserved}</div>
        </Card>
        <Card>
          <div className="tly-kpi-label">Today&apos;s spend</div>
          <div className="tly-kpi-val">{WALLET.today}</div>
        </Card>
        <Card>
          <div className="tly-kpi-label">Total spend</div>
          <div className="tly-kpi-val">{WALLET.totalSpend}</div>
        </Card>
        <Card>
          <div className="tly-kpi-label">Total funded</div>
          <div className="tly-kpi-val">{WALLET.totalFunded}</div>
        </Card>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <CardHead title="Add funds" sub="Demonstration — no real payment processing" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PAYMENT_METHODS.map((m) => (
            <Button key={m} variant="ghost" size="sm">
              {m}
            </Button>
          ))}
        </div>
        <div className="tly-faint" style={{ fontSize: 12, fontStyle: 'italic', marginTop: 10 }}>
          Payment processing is not implemented — funding is illustrative only.
        </div>
      </Card>

      <Card>
        <CardHead title="Transaction ledger" sub="Wallet top-ups and campaign spend across platforms." />
        <div
          data-testid="ledger-filters"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}
        >
          {FILTERS.map((f) => {
            const on = filter === f;
            return (
              <Button
                key={f}
                variant="ghost"
                size="sm"
                onClick={() => setFilter(f)}
                style={
                  on
                    ? { background: 'var(--tly-primary)', color: '#ffffff', borderColor: 'var(--tly-primary)' }
                    : undefined
                }
              >
                {f}
              </Button>
            );
          })}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table head={['Date', 'Reference', 'Type', 'Method/source', 'Platform', 'Amount', 'Balance']}>
            {rows.map((r) => (
              <tr key={r.ref}>
                <td className="tly-faint">{r.date}</td>
                <td className="tly-mono">{r.ref}</td>
                <td style={{ fontWeight: 600 }}>{r.type}</td>
                <td>{r.method}</td>
                <td>
                  <Badge tone={r.platform === 'TelyDial' ? 'info' : 'neutral'}>{r.platform}</Badge>
                </td>
                <td style={{ color: r.amount > 0 ? 'var(--tly-success)' : 'var(--tly-danger)', fontWeight: 600 }}>
                  {r.amount > 0 ? '+' : ''}₦{Math.abs(r.amount).toLocaleString()}
                </td>
                <td>₦{r.balance.toLocaleString()}</td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      <div className="tly-faint" style={{ fontSize: 11, marginTop: 16 }}>
        {DEMO_NOTE}
      </div>
    </PortalShell>
  );
}
