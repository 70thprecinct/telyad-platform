'use client';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { AdminShell } from '@/components/AdminShell';
import { LineChart } from '@/components/Charts';
import { ENGINES, ENGINE_DETAIL, INFRA_LOAD, DEMO_NOTE } from '@/lib/demo';

const ENGINE = ENGINES.find((e) => e.id === 'telysignal')!;
const DETAIL = ENGINE_DETAIL.telysignal;

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const s = status.toLowerCase();
  if (s.includes('operational') || s.includes('healthy')) return 'success';
  if (s.includes('degraded') || s.includes('backlog')) return 'warning';
  if (s.includes('down') || s.includes('fail')) return 'danger';
  return 'neutral';
}

export default function TelySignalPage() {
  const router = useRouter();

  return (
    <AdminShell active="engines">
      <div style={{ marginBottom: 12 }}>
        <Button size="sm" variant="ghost" onClick={() => router.push('/engines')}>
          ← Back to engines
        </Button>
      </div>

      <PageHeader eyebrow="INTERNAL ONLY · TELYSIGNAL" title={ENGINE.name} desc={ENGINE.purpose} />

      <KpiGrid>
        {DETAIL.kpis.map((k, i) => (
          <Kpi key={i} label={k[0]} value={k[1]} />
        ))}
      </KpiGrid>

      <Card>
        <CardHead title="Component status" sub="Carrier audience intelligence pipeline — deterministic demonstration." />
        <Table head={['Component', 'Status', 'Detail']}>
          {DETAIL.rows.map((r, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 600 }}>{r[0]}</td>
              <td>
                <Badge tone={statusTone(r[1] ?? '')}>{r[1]}</Badge>
              </td>
              <td className="tly-dim">{r[2]}</td>
            </tr>
          ))}
        </Table>
        <div className="tly-dim" style={{ fontSize: 12.5, marginTop: 10 }}>
          No subscriber PII — pseudonymisation gateway ensures no raw MSISDN downstream.
        </div>
      </Card>

      <Card>
        <CardHead title="Ingestion load — last 24h" sub="Aggregate signal-event throughput (%)." />
        <LineChart data={INFRA_LOAD.data} labels={INFRA_LOAD.labels} />
      </Card>

      <div className="tly-faint" style={{ fontSize: 12, marginTop: 14 }}>
        {DEMO_NOTE}
      </div>
    </AdminShell>
  );
}
