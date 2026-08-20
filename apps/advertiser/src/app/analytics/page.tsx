'use client';

import { compactNumber, formatMoney } from '@telyad/types';
import { Badge, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { BarChart, DoughnutChart, LineChart } from '@/components/Charts';
import { CHANNEL_PERF, DEMO_NOTE, HEADLINE, SPEND_TREND } from '@/lib/demo';

function DemoNote() {
  return (
    <div className="tly-faint" style={{ fontSize: 11, marginTop: 8 }}>
      {DEMO_NOTE}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <PortalShell active="analytics">
      <PageHeader
        eyebrow="OVERVIEW · PERFORMANCE"
        title="Analytics"
        desc="Campaign performance across MTN network surfaces — STK Push, SMS, USSD, WAP Push and OBD Voice. These are demonstration analytics, not live MTN production statistics."
      />
      <DemoNote />

      <KpiGrid>
        <Kpi
          label="Total Spend (MTD)"
          value={formatMoney({ minor: HEADLINE.spendMinor, currency: 'NGN' }, { compact: true })}
          delta="18.4%"
          dir="up"
        />
        <Kpi
          label="Total Impressions"
          value={compactNumber(HEADLINE.impressions)}
          delta="22%"
          dir="up"
        />
        <Kpi
          label="Avg Interaction Rate"
          value={`${HEADLINE.interactionRate}%`}
          delta="0.8pp"
          dir="up"
        />
        <Kpi
          label="Avg CPA"
          value={formatMoney({ minor: HEADLINE.avgCpaMinor, currency: 'NGN' })}
          delta="12% better"
          dir="down"
        />
      </KpiGrid>

      <div className="tly-grid-2">
        <Card>
          <CardHead title="Daily spend — last 14 days" sub="Media spend, WAT" />
          <LineChart data={SPEND_TREND.data} labels={SPEND_TREND.labels} />
          <DemoNote />
        </Card>

        <Card>
          <CardHead title="Channel mix by conversions" sub="Share of converted actions" />
          <DoughnutChart
            data={CHANNEL_PERF.map((c) => ({ label: c.channel, value: c.conversions, color: c.color }))}
          />
          <DemoNote />
        </Card>
      </div>

      <Card>
        <CardHead title="Channel performance breakdown" sub="Delivery channels mapped to the capability registry" />
        <Table
          head={['Channel', 'Impressions', 'Interactions', 'Rate', 'Conversions', 'CPA', 'Spend']}
        >
          {CHANNEL_PERF.map((c) => (
            <tr key={c.channel}>
              <td>
                <Badge tone="info">{c.channel}</Badge>
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {compactNumber(c.impressions)}
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {compactNumber(c.interactions)}
              </td>
              <td
                className="tly-mono"
                style={{
                  textAlign: 'right',
                  color: c.rate >= 3.5 ? 'var(--tly-success)' : 'var(--tly-warning)',
                  fontWeight: 600,
                }}
              >
                {`${c.rate}%`}
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {compactNumber(c.conversions)}
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {formatMoney({ minor: c.cpaMinor, currency: 'NGN' })}
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {formatMoney({ minor: c.spendMinor, currency: 'NGN' }, { compact: true })}
              </td>
            </tr>
          ))}
        </Table>
        <DemoNote />
      </Card>

      <Card>
        <CardHead title="Conversions by channel" sub="Converted actions per delivery channel" />
        <BarChart
          data={CHANNEL_PERF.map((c) => ({ label: c.channel, value: c.conversions }))}
          colors={CHANNEL_PERF.map((c) => c.color)}
        />
        <DemoNote />
      </Card>
    </PortalShell>
  );
}
