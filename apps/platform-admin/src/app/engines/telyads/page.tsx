'use client';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { AdminShell } from '@/components/AdminShell';
import { BarChart } from '@/components/Charts';
import { ENGINES, ENGINE_DETAIL, DEMO_NOTE } from '@/lib/demo';

const ENGINE = ENGINES.find((e) => e.id === 'telyads')!;
const DETAIL = ENGINE_DETAIL.telyads;

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const s = status.toLowerCase();
  if (s.includes('operational') || s.includes('healthy')) return 'success';
  if (s.includes('degraded') || s.includes('backlog')) return 'warning';
  if (s.includes('down') || s.includes('fail')) return 'danger';
  return 'neutral';
}

// Normalise mixed units (e.g. "2.1M/h", "640k/h") to a common k/h scale so the
// bars are comparable — otherwise SMS (2.1M/h) would plot below STK Push (640k/h).
function toThousandsPerHour(raw: string): number {
  const n = Number(String(raw).replace(/[^0-9.]/g, '')) || 0;
  if (/m\/h/i.test(raw)) return n * 1000;
  return n; // already k/h
}

const THROUGHPUT = DETAIL.rows.map((r) => ({
  label: r[0] ?? '',
  value: toThousandsPerHour(String(r[2] ?? '')),
}));

export default function TelyAdsPage() {
  const router = useRouter();

  return (
    <AdminShell active="engines">
      <div style={{ marginBottom: 12 }}>
        <Button size="sm" variant="ghost" onClick={() => router.push('/engines')}>
          ← Back to engines
        </Button>
      </div>

      <PageHeader eyebrow="INTERNAL ONLY · TELYADS" title={ENGINE.name} desc={ENGINE.purpose} />

      <KpiGrid>
        {DETAIL.kpis.map((k, i) => (
          <Kpi key={i} label={k[0]} value={k[1]} />
        ))}
      </KpiGrid>

      <Card>
        <CardHead title="Channel status" sub="Multi-channel execution — deterministic demonstration." />
        <Table head={['Channel', 'Status', 'Throughput']}>
          {DETAIL.rows.map((r, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 600 }}>{r[0]}</td>
              <td>
                <Badge tone={statusTone(r[1] ?? '')}>{r[1]}</Badge>
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>{r[2]}</td>
            </tr>
          ))}
        </Table>
        <div className="tly-dim" style={{ fontSize: 12.5, marginTop: 10 }}>
          Channels map to the same 48-capability registry — single source of truth (no second capability system).
        </div>
      </Card>

      <Card>
        <CardHead title="Throughput by channel" sub="Thousands of deliveries per hour (k/h, aggregate)." />
        <BarChart data={THROUGHPUT} />
      </Card>

      <div className="tly-faint" style={{ fontSize: 12, marginTop: 14 }}>
        {DEMO_NOTE}
      </div>
    </AdminShell>
  );
}
