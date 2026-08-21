'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  compactNumber,
  formatMoney,
  type Campaign,
  type RevenueIntelligenceReport,
} from '@telyad/types';
import { Badge, Button, Card, CardHead, Kpi, KpiGrid, PageHeader, StatusBadge, Table } from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { SliceTable, fmtMinor } from '@/components/commercial';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { DEMO_NOTE, MONITORING, TRAFFIC } from '@/lib/demo';

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

        {/* Operational density — DETERMINISTIC DEMONSTRATION DATA. */}
        <div className="tly-grid-2">
          <Card>
            <CardHead title="Network & channel status" sub="Delivery channels · demonstration" />
            <Table head={['Channel', 'Throughput', 'Success', 'p95', 'Backlog']}>
              {TRAFFIC.channels.map((c) => (
                <tr key={c.channel}>
                  <td><Badge tone="info">{c.channel}</Badge></td>
                  <td className="tly-mono" style={{ textAlign: 'right' }}>{c.throughput}</td>
                  <td className="tly-mono" style={{ textAlign: 'right', color: c.success >= 98 ? 'var(--tly-success)' : 'var(--tly-warning)' }}>{c.success}%</td>
                  <td className="tly-mono" style={{ textAlign: 'right' }}>{c.latencyMs}ms</td>
                  <td className="tly-mono" style={{ textAlign: 'right' }}>{compactNumber(c.backlog)}</td>
                </tr>
              ))}
            </Table>
            <div className="tly-faint" style={{ fontSize: 11, marginTop: 8 }}>{DEMO_NOTE}</div>
          </Card>

          <Card>
            <CardHead title="Operational alerts" sub="Anomalies & risk signals · demonstration" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MONITORING.filter((m) => m.anomaly).map((m) => (
                <div key={m.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Badge tone="warning">⚠</Badge>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.campaign}</div>
                    <div className="tly-faint" style={{ fontSize: 12 }}>{m.anomaly}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Badge tone="danger">●</Badge>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Compliance: QuickCash NG flagged</div>
                  <div className="tly-faint" style={{ fontSize: 12 }}>DND missing, consent none — 3 content flags. Review required.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Badge tone="warning">₦</Badge>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Low wallet: FairMoney</div>
                  <div className="tly-faint" style={{ fontSize: 12 }}>Reserved exceeds balance — funding required before launch.</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <CardHead title="Commercial opportunities" sub="Demonstration recommendations" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { t: 'Grow USSD inventory', d: 'USSD utilisation at 69%. Packaging for FMCG/Banking may unlock demand.', up: '+₦9.4M' },
              { t: 'Enable RCS Rich Message', d: 'Network approval pending — richer creative for premium advertisers.', up: '+₦6.0M' },
              { t: 'Retarget lapsed advertisers', d: '3 advertisers inactive 30d+. Re-engagement campaign opportunity.', up: '+₦4.6M' },
            ].map((o) => (
              <div key={o.t} style={{ border: '1px solid var(--tly-border)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{o.t}</div>
                <div className="tly-faint" style={{ fontSize: 12, lineHeight: 1.45, marginBottom: 8 }}>{o.d}</div>
                <div className="tly-mono" style={{ color: 'var(--tly-accent-ink)', fontWeight: 700 }}>{o.up} est. upside</div>
              </div>
            ))}
          </div>
          <div className="tly-faint" style={{ fontSize: 11, marginTop: 8 }}>{DEMO_NOTE}</div>
        </Card>
      </div>
    </ConsoleShell>
  );
}
