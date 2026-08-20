'use client';
import { useState } from 'react';
import {
  Badge,
  Card,
  CardHead,
  Kpi,
  KpiGrid,
  PageHeader,
  Progress,
  Select,
  Table,
} from '@telyad/ui';
import { compactNumber, formatMoney } from '@telyad/types';
import { ConsoleShell } from '@/components/ConsoleShell';
import { DEMO_NOTE, MONITORING } from '@/lib/demo';

type StatusFilter = 'ALL' | 'Live' | 'Pending approval';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'Live', label: 'Live' },
  { value: 'Pending approval', label: 'Pending approval' },
];

function statusTone(status: string): 'success' | 'warning' | 'neutral' {
  if (status === 'Live') return 'success';
  if (status === 'Pending approval') return 'warning';
  return 'neutral';
}

export default function MonitoringPage() {
  const [status, setStatus] = useState<StatusFilter>('ALL');

  const rows = MONITORING.filter((c) => status === 'ALL' || c.status === status);

  const liveCount = MONITORING.filter((c) => c.status === 'Live').length;
  const pendingCount = MONITORING.filter((c) => c.status === 'Pending approval').length;
  const totalDelivered = MONITORING.reduce(
    (sum, c) => sum + (c.target * c.deliveredPct) / 100,
    0,
  );
  const warnings = MONITORING.filter((c) => c.anomaly).length;

  return (
    <ConsoleShell active="monitoring">
      <PageHeader
        eyebrow="ADVERTISERS & CAMPAIGNS"
        title="Campaign Monitoring"
        desc="Live performance of every active campaign on MTN Nigeria's network."
      />

      <KpiGrid>
        <Kpi label="Live campaigns" value={liveCount} />
        <Kpi label="Pending approval" value={pendingCount} />
        <Kpi label="Total delivered" value={compactNumber(totalDelivered)} />
        <Kpi label="Warnings" value={warnings} />
      </KpiGrid>

      <Card>
        <CardHead
          title="Active campaigns"
          sub="Delivery telemetry across every campaign on the network"
          action={
            <div style={{ width: 220 }}>
              <Select
                options={STATUS_OPTIONS}
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
                data-testid="monitoring-status-filter"
              />
            </div>
          }
        />

        <Table
          head={[
            'Campaign',
            'Advertiser',
            'Channel',
            'Status',
            'Delivery',
            'Target',
            'Forecast',
            'Budget',
            'Spent',
            'Anomaly',
          ]}
        >
          {rows.map((c) => (
            <tr key={c.id}>
              <td style={{ fontWeight: 600 }}>{c.campaign}</td>
              <td className="tly-faint">{c.advertiser}</td>
              <td>
                <Badge tone="info">{c.channel}</Badge>
              </td>
              <td>
                <Badge tone={statusTone(c.status)}>{c.status}</Badge>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 130 }}>
                  <div style={{ flex: 1 }}>
                    <Progress value={c.deliveredPct} />
                  </div>
                  <span className="tly-mono tly-dim" style={{ fontSize: 11 }}>
                    {c.deliveredPct}%
                  </span>
                </div>
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {compactNumber(c.target)}
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {compactNumber(c.forecast)}
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {formatMoney({ minor: c.budgetMinor, currency: 'NGN' }, { compact: true })}
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {formatMoney({ minor: c.spentMinor, currency: 'NGN' }, { compact: true })}
              </td>
              <td>
                {c.anomaly ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Badge tone="warning">Anomaly</Badge>
                    <span className="tly-faint" style={{ fontSize: 11 }}>
                      {c.anomaly}
                    </span>
                  </div>
                ) : (
                  <span className="tly-faint">—</span>
                )}
              </td>
            </tr>
          ))}
        </Table>

        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
          {DEMO_NOTE}
        </div>
      </Card>
    </ConsoleShell>
  );
}
