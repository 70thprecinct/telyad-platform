'use client';
import {
  Card,
  CardHead,
  Kpi,
  KpiGrid,
  PageHeader,
} from '@telyad/ui';
import { formatMoney } from '@telyad/types';
import { ConsoleShell } from '@/components/ConsoleShell';
import { BarChart, DoughnutChart, LineChart } from '@/components/Charts';
import { DASH, DEMO_NOTE, MONITORING, REVENUE_TREND } from '@/lib/demo';

export default function AnalyticsPage() {
  return (
    <ConsoleShell active="analytics">
      <PageHeader
        eyebrow="INTELLIGENCE"
        title="Analytics"
        desc="Campaign, advertiser, revenue and capability trends for MTN Nigeria's network."
      />

      <KpiGrid>
        <Kpi
          label="Revenue (MTD)"
          value={formatMoney({ minor: DASH.revenueMtdMinor, currency: 'NGN' }, { compact: true })}
        />
        <Kpi label="Campaigns on network" value={DASH.campaignsOnNetwork} />
        <Kpi label="Combined reach" value={`${DASH.combinedReachM}M`} />
        <Kpi label="Live" value={DASH.liveCampaigns} />
      </KpiGrid>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <Card>
          <CardHead title="Revenue trend" sub="Net advertising revenue (₦M), last six months." />
          <LineChart data={REVENUE_TREND.data} labels={REVENUE_TREND.labels} />
        </Card>

        <Card>
          <CardHead title="Capability mix" sub="Share of delivery by messaging capability." />
          <DoughnutChart
            data={[
              { label: 'SMS', value: 39, color: '#0a9d5e' },
              { label: 'USSD', value: 28, color: '#3b5bdb' },
              { label: 'STK Push', value: 18, color: '#7c3aed' },
              { label: 'WAP', value: 10, color: '#0891b2' },
              { label: 'OBD', value: 5, color: '#b26a00' },
            ]}
          />
        </Card>
      </div>

      <Card>
        <CardHead title="Campaigns by delivery" sub="Delivered % for campaigns currently live on the network." />
        <BarChart data={MONITORING.filter((m) => m.status === 'Live').map((m) => ({ label: m.advertiser, value: m.deliveredPct }))} />
      </Card>

      <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 4 }}>
        This is the deterministic analytics surface — descriptive campaign, revenue and capability trends. It is distinct
        from AI Intelligence (predictive / model-driven insights). {DEMO_NOTE}
      </div>
    </ConsoleShell>
  );
}
