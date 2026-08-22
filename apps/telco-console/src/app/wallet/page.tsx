'use client';
import { Badge, Card, CardHead, EmptyState, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { formatMoney, type Money } from '@telyad/types';
import { ConsoleShell } from '@/components/ConsoleShell';
import { WALLET, DEMO_NOTE } from '@/lib/demo';

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const ngn = (minor: number): Money => ({ minor, currency: 'NGN' });
const compact = (minor: number): string => formatMoney(ngn(minor), { compact: true });

const STATUS_TONE: Record<(typeof WALLET)[number]['status'], BadgeTone> = {
  Healthy: 'success',
  Low: 'warning',
  Exposed: 'danger',
};

export default function WalletPage() {
  const totalBalance = WALLET.reduce((s, w) => s + w.balanceMinor, 0);
  const totalReserved = WALLET.reduce((s, w) => s + w.reservedMinor, 0);
  const atRisk = WALLET.filter((w) => w.status !== 'Healthy');

  return (
    <ConsoleShell active="wallet">
      <PageHeader eyebrow="FINANCE" title="Wallet Monitoring" />

      <Card>
        <div className="tly-faint" style={{ fontSize: 12 }} data-testid="wallet-demo-note">
          Demonstration financial data — no real payment processing. {DEMO_NOTE}
        </div>
      </Card>

      <KpiGrid>
        <Kpi label="Total balances" value={compact(totalBalance)} />
        <Kpi label="Reserved" value={compact(totalReserved)} />
        <Kpi label="Advertisers" value={String(WALLET.length)} />
        <Kpi label="Low / Exposed" value={String(atRisk.length)} />
      </KpiGrid>

      <Card>
        <CardHead title="Advertiser wallets" sub="Balance, reserved and available across advertisers" />
        <Table head={['Advertiser', 'Balance', 'Reserved', 'Available', 'Status']}>
          {WALLET.map((w) => {
            const available = w.balanceMinor - w.reservedMinor;
            return (
              <tr key={w.advertiser}>
                <td style={{ fontWeight: 600 }}>{w.advertiser}</td>
                <td className="tly-mono" style={{ textAlign: 'right' }}>{compact(w.balanceMinor)}</td>
                <td className="tly-mono" style={{ textAlign: 'right' }}>{compact(w.reservedMinor)}</td>
                <td className="tly-mono" style={{ textAlign: 'right' }}>{compact(available)}</td>
                <td>
                  <Badge tone={STATUS_TONE[w.status]}>{w.status}</Badge>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <Card>
        <CardHead title="Low-balance alerts" sub={`${atRisk.length} advertiser(s) below healthy threshold`} />
        {atRisk.length === 0 ? (
          <EmptyState title="All wallets healthy" desc="No advertisers require attention." />
        ) : (
          <Table head={['Advertiser', 'Available', 'Status']}>
            {atRisk.map((w) => (
              <tr key={w.advertiser}>
                <td style={{ fontWeight: 600 }}>{w.advertiser}</td>
                <td className="tly-mono" style={{ textAlign: 'right' }}>
                  {compact(w.balanceMinor - w.reservedMinor)}
                </td>
                <td>
                  <Badge tone={STATUS_TONE[w.status]}>{w.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </ConsoleShell>
  );
}
