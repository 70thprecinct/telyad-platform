'use client';
import { Badge, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { compactNumber } from '@telyad/types';
import { ConsoleShell } from '@/components/ConsoleShell';
import { LineChart } from '@/components/Charts';
import { DEMO_NOTE, EXT_NOTE, TRAFFIC } from '@/lib/demo';

export default function TrafficPage() {
  const peakReq = Math.max(...TRAFFIC.requests);
  const avgSuccess =
    TRAFFIC.channels.reduce((sum, c) => sum + c.success, 0) / TRAFFIC.channels.length;
  const totalBacklog = TRAFFIC.channels.reduce((sum, c) => sum + c.backlog, 0);

  return (
    <ConsoleShell active="traffic">
      <PageHeader eyebrow="AUDIENCE & TRAFFIC" title="Traffic Monitoring" />

      <KpiGrid>
        <Kpi label="Peak req/slot" value={`${peakReq}k`} />
        <Kpi label="Avg success" value={`${avgSuccess.toFixed(1)}%`} />
        <Kpi label="Total backlog" value={compactNumber(totalBacklog)} />
        <Kpi label="Channels" value={TRAFFIC.channels.length} />
      </KpiGrid>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 16,
        }}
      >
        <Card>
          <CardHead title="Requests — last 24h" sub="Inbound request volume per slot" />
          <LineChart data={TRAFFIC.requests} labels={TRAFFIC.labels} />
        </Card>
        <Card>
          <CardHead title="Deliveries — last 24h" sub="Successful deliveries per slot" />
          <LineChart
            data={TRAFFIC.deliveries}
            labels={TRAFFIC.labels}
            stroke="#0a9d5e"
            fill="rgba(10,157,94,0.12)"
          />
        </Card>
      </div>

      <Card>
        <CardHead title="Channel throughput" sub="Per-channel delivery health" />
        <Table head={['Channel', 'Throughput', 'Success', 'p95 latency', 'Backlog']}>
          {TRAFFIC.channels.map((c) => (
            <tr key={c.channel}>
              <td>
                <Badge tone="info">{c.channel}</Badge>
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {c.throughput}
              </td>
              <td style={{ textAlign: 'right' }}>
                <Badge tone={c.success >= 98 ? 'success' : 'warning'}>{c.success}%</Badge>
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {c.latencyMs}ms
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {compactNumber(c.backlog)}
              </td>
            </tr>
          ))}
        </Table>

        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
          Real request/health seams exist at <span className="tly-mono">/health</span>; live carrier
          throughput is {EXT_NOTE}
        </div>
        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 6 }}>
          {DEMO_NOTE}
        </div>
      </Card>
    </ConsoleShell>
  );
}
