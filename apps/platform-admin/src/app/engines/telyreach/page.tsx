'use client';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { AdminShell } from '@/components/AdminShell';
import { ENGINES, ENGINE_DETAIL, DEMO_NOTE, EXT_NOTE } from '@/lib/demo';

const ENGINE = ENGINES.find((e) => e.id === 'telyreach')!;
const DETAIL = ENGINE_DETAIL.telyreach;

export default function TelyReachPage() {
  const router = useRouter();

  return (
    <AdminShell active="engines">
      <div style={{ marginBottom: 12 }}>
        <Button size="sm" variant="ghost" onClick={() => router.push('/engines')}>
          ← Back to engines
        </Button>
      </div>

      <PageHeader eyebrow="INTERNAL ONLY · TELYREACH" title={ENGINE.name} desc={ENGINE.purpose} />

      <KpiGrid>
        {DETAIL.kpis.map((k, i) => (
          <Kpi key={i} label={k[0]} value={k[1]} />
        ))}
      </KpiGrid>

      <Card>
        <CardHead title="Reach & attribution funnel" sub="Conversion matching and verification — deterministic demonstration." />
        <Table head={['Stage', 'Value', 'Note']}>
          {DETAIL.rows.map((r, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 600 }}>{r[0]}</td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>{r[1]}</td>
              <td className="tly-dim">{r[2]}</td>
            </tr>
          ))}
        </Table>
        <div className="tly-dim" style={{ fontSize: 12.5, marginTop: 10 }}>
          Attribution via advertiser postback — live attribution requires external integration.
        </div>
      </Card>

      <div className="tly-faint" style={{ fontSize: 12, marginTop: 14 }}>
        {DEMO_NOTE}
      </div>
      <div className="tly-faint" style={{ fontSize: 12, marginTop: 4 }}>
        {EXT_NOTE}
      </div>
    </AdminShell>
  );
}
