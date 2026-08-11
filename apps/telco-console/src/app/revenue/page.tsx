'use client';
import { useEffect, useState } from 'react';
import { type RevenueIntelligenceReport } from '@telyad/types';
import { Button, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { ShareBar, SliceTable, fmtMinor } from '@/components/commercial';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function RevenuePage() {
  const { user } = useAuth();
  const canView = !!user?.permissions.includes('revenue:view');

  const [report, setReport] = useState<RevenueIntelligenceReport | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!user) return;
    if (!canView) {
      setState('ready');
      return;
    }
    setState('loading');
    api
      .revenueIntelligence()
      .then((r) => {
        setReport(r.report);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [user, canView]);

  return (
    <ConsoleShell active="revenue">
      <PageHeader
        eyebrow="Commercial & Inventory"
        title="Revenue & Commercials"
        desc="Attributed advertising revenue across capability families, industries and pricing models on MTN Nigeria. Deterministic demonstration data — not production financials."
      />

      {!canView ? (
        <Card>
          <div className="tly-empty" data-testid="revenue-denied">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>You do not have revenue access</div>
            <div style={{ fontSize: 12.5 }}>
              Revenue and commercial figures require the <span className="tly-mono">revenue:view</span>{' '}
              permission. Contact a commercial administrator for access.
            </div>
          </div>
        </Card>
      ) : state === 'loading' ? (
        <div className="tly-faint" data-testid="revenue-loading">
          Loading revenue intelligence…
        </div>
      ) : state === 'error' || !report ? (
        <Card>
          <div className="tly-empty" data-testid="revenue-error">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Couldn’t load revenue report</div>
            <div style={{ fontSize: 12.5, marginBottom: 12 }}>The API may be unavailable.</div>
            <Button variant="ghost" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </Card>
      ) : (
        <div data-testid="revenue-report">
          <KpiGrid>
            <Kpi
              label="Total ad revenue"
              value={fmtMinor(report.totalRevenueMinor, report.currency, true)}
            />
            <Kpi
              label="Projected monthly revenue"
              value={fmtMinor(report.projectedMonthlyRevenueMinor, report.currency, true)}
              delta="demonstration"
              dir="up"
            />
            <Kpi label="Capability families" value={report.byFamily.length} />
            <Kpi label="Revenue opportunities" value={report.opportunities.length} />
          </KpiGrid>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 16,
            }}
          >
            <Card>
              <CardHead title="Revenue by capability family" sub="Attributed ad revenue" />
              <SliceTable label="Family" slices={report.byFamily} currency={report.currency} />
            </Card>
            <Card>
              <CardHead title="Revenue by industry" sub="Advertiser sector mix" />
              <SliceTable label="Industry" slices={report.byIndustry} currency={report.currency} />
            </Card>
            <Card>
              <CardHead title="Revenue by pricing model" sub="Commercial mechanic mix" />
              <SliceTable label="Pricing model" slices={report.byPricingModel} currency={report.currency} />
            </Card>
          </div>

          <Card>
            <CardHead
              title="Inventory utilisation"
              sub="Highest-demand capabilities by fill against available inventory"
            />
            {report.inventoryUtilisation.length === 0 ? (
              <div className="tly-empty">No utilisation data.</div>
            ) : (
              <Table head={['Capability', 'Utilisation', '']}>
                {report.inventoryUtilisation.slice(0, 10).map((u) => (
                  <tr key={u.capabilityId}>
                    <td style={{ fontWeight: 600 }}>{u.capabilityName}</td>
                    <td className="tly-mono tly-faint" style={{ whiteSpace: 'nowrap' }}>
                      {u.utilisationPct.toFixed(0)}%
                    </td>
                    <td style={{ width: '55%' }}>
                      <ShareBar pct={u.utilisationPct} />
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>

          <Card>
            <CardHead title="Commercial opportunities" sub="Deterministic demonstration recommendations" />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 12,
              }}
            >
              {report.opportunities.map((o, i) => (
                <div
                  key={i}
                  style={{
                    border: '1px solid var(--tly-border)',
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{o.title}</div>
                  <div className="tly-faint" style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 10 }}>
                    {o.detail}
                  </div>
                  <div
                    className="tly-mono"
                    style={{ fontSize: 13, color: 'var(--tly-primary)', fontWeight: 600 }}
                  >
                    +{fmtMinor(o.estimatedUpsideMinor, report.currency, true)} est. upside
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </ConsoleShell>
  );
}
