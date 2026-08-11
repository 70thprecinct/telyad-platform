'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  compactNumber,
  formatMoney,
  type Campaign,
  type RevenueIntelligenceReport,
} from '@telyad/types';
import { Button, Card, CardHead, Kpi, KpiGrid, PageHeader, StatusBadge, Table } from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { SliceTable, fmtMinor } from '@/components/commercial';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const canSeeRevenue = !!user?.permissions.includes('revenue:view');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [report, setReport] = useState<RevenueIntelligenceReport | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoaded(false);
    const tasks: Promise<unknown>[] = [
      api
        .listCampaigns()
        .then((r) => setCampaigns(r.campaigns))
        .catch(() => undefined),
    ];
    if (canSeeRevenue) {
      tasks.push(
        api
          .revenueIntelligence()
          .then((r) => setReport(r.report))
          .catch(() => undefined),
      );
    }
    Promise.all(tasks).finally(() => setLoaded(true));
  }, [user, canSeeRevenue]);

  const pending = campaigns.filter((c) => c.status === 'PENDING_TELCO_APPROVAL').length;
  const live = campaigns.filter((c) => c.status === 'LIVE').length;
  const reach = campaigns.reduce((s, c) => s + c.estimatedReach, 0);
  const showRevenue = canSeeRevenue && !!report;

  return (
    <ConsoleShell active="dashboard">
      <div data-testid="exec-overview">
        <PageHeader
          eyebrow="MTN Nigeria Network"
          title="Executive Overview"
          desc="Commercial and operational health of advertiser activity on MTN Nigeria's network. Aggregated metrics only — no subscriber PII. Demonstration data."
        />

        <KpiGrid>
          {showRevenue && report ? (
            <>
              <Kpi
                label="Total ad revenue"
                value={fmtMinor(report.totalRevenueMinor, report.currency, true)}
              />
              <Kpi
                label="Projected monthly"
                value={fmtMinor(report.projectedMonthlyRevenueMinor, report.currency, true)}
              />
            </>
          ) : (
            <Kpi label="Combined est. campaign reach" value={compactNumber(reach)} />
          )}
          <Kpi label="Subscriber reach" value="78.4M" delta="1.2%" dir="up" />
          <Kpi label="Campaigns on network" value={campaigns.length} />
          <Kpi label="Live campaigns" value={live} />
          <Kpi
            label="Pending approval"
            value={pending}
            delta={pending > 0 ? 'action needed' : 'clear'}
            dir="up"
          />
        </KpiGrid>

        {pending > 0 && (
          <Card>
            <CardHead
              title={`${pending} campaign${pending === 1 ? '' : 's'} awaiting network approval`}
              sub="Nothing goes live on MTN Nigeria without an operator decision."
              action={
                <Button size="sm" onClick={() => router.push('/approvals')}>
                  Review pending →
                </Button>
              }
            />
          </Card>
        )}

        {showRevenue && report && (
          <div className="tly-grid-2">
            <Card>
              <CardHead
                title="Revenue by capability family"
                sub={`Total ${fmtMinor(report.totalRevenueMinor, report.currency, true)} · demonstration data`}
              />
              <SliceTable label="Family" slices={report.byFamily} currency={report.currency} />
            </Card>
            <Card>
              <CardHead title="Top industries" sub="By attributed ad revenue" />
              <SliceTable
                label="Industry"
                slices={report.byIndustry.slice(0, 8)}
                currency={report.currency}
              />
            </Card>
          </div>
        )}

        <Card>
          <CardHead
            title="Campaigns on MTN Nigeria"
            sub="Live advertiser activity across the network"
            action={
              pending > 0 ? (
                <Button size="sm" variant="ghost" onClick={() => router.push('/approvals')}>
                  Review {pending} pending →
                </Button>
              ) : undefined
            }
          />
          {!loaded ? (
            <div className="tly-faint">Loading…</div>
          ) : campaigns.length === 0 ? (
            <div className="tly-empty">No campaigns on the network yet.</div>
          ) : (
            <Table head={['Campaign', 'Format', 'Est. reach', 'Budget', 'Status']}>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td className="tly-faint">{c.formatId.toUpperCase()}</td>
                  <td className="tly-mono" style={{ textAlign: 'right' }}>
                    {compactNumber(c.estimatedReach)}
                  </td>
                  <td className="tly-mono" style={{ textAlign: 'right' }}>
                    {formatMoney(c.budget.total, { compact: true })}
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </ConsoleShell>
  );
}
