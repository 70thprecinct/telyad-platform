'use client';
import { useEffect, useState } from 'react';
import { Badge, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { AdminShell } from '@/components/AdminShell';
import { LineChart } from '@/components/Charts';
import { api } from '@/lib/api';
import { TELCOS, PLATFORM_SERVICES, INFRA_LOAD, DEMO_NOTE, EXT_NOTE } from '@/lib/demo';

type Probe = { label: string; ok: boolean | null; detail: string };
const kindTone = (k: 'REAL' | 'DEMO' | 'EXT') => (k === 'REAL' ? 'success' : k === 'DEMO' ? 'info' : 'warning');
const kindLabel = (k: 'REAL' | 'DEMO' | 'EXT') => (k === 'REAL' ? 'REAL' : k === 'DEMO' ? 'DEMO' : 'EXT INTEGRATION');

export default function PlatformHealthPage() {
  const [health, setHealth] = useState<Probe>({ label: 'API /health', ok: null, detail: 'probing…' });
  const [ready, setReady] = useState<Probe>({ label: 'API /ready', ok: null, detail: 'probing…' });

  useEffect(() => {
    api.health()
      .then((r) => setHealth({ label: 'API /health', ok: r.ok, detail: `env: ${r.env}` }))
      .catch(() => setHealth({ label: 'API /health', ok: false, detail: 'unreachable' }));
    api.ready()
      .then((r) => setReady({ label: 'API /ready', ok: r.ready, detail: `store: ${r.store} · db: ${r.db}` }))
      .catch(() => setReady({ label: 'API /ready', ok: false, detail: 'unreachable' }));
  }, []);

  const probeBadge = (ok: boolean | null) =>
    ok === null ? <Badge tone="neutral">Probing…</Badge> : ok ? <Badge tone="success">Operational</Badge> : <Badge tone="danger">Down</Badge>;

  const activeTelcos = TELCOS.filter((t) => t.status === 'Active');

  return (
    <AdminShell active="platform-health">
      <PageHeader
        eyebrow="Platform · cross-telco"
        title="Platform Health"
        desc="Live status of the platform's own services plus per-app, per-telco and per-engine health. API probes are REAL; app/telco/engine rows are demonstration; carrier gateways require external integration."
      />

      <KpiGrid>
        <Kpi label="API health" value={health.ok === null ? '—' : health.ok ? 'OK' : 'DOWN'} delta={`REAL · ${health.detail}`} />
        <Kpi label="API readiness" value={ready.ok === null ? '—' : ready.ok ? 'READY' : 'NOT READY'} delta={`REAL · ${ready.detail}`} />
        <Kpi label="Active environments" value={`${activeTelcos.length}`} delta="Isolated per telco" />
        <Kpi label="Carrier gateways" value="EXT" delta="Integration required" />
      </KpiGrid>

      <Card>
        <CardHead title="Platform services" sub="API & database probes are REAL (live /health + /ready); other rows are demonstration or require external integration." />
        <Table head={['Service', 'Classification', 'Probe', 'Status']}>
          {[
            { service: health.label, kind: 'REAL' as const, probe: health.detail, node: probeBadge(health.ok) },
            { service: ready.label, kind: 'REAL' as const, probe: ready.detail, node: probeBadge(ready.ok) },
            ...PLATFORM_SERVICES.map((s) => ({ service: s.service, kind: s.kind, probe: s.probe, node: <Badge tone={s.kind === 'EXT' ? 'warning' : 'success'}>{s.status}</Badge> })),
          ].map((r) => (
            <tr key={r.service}>
              <td style={{ fontWeight: 600 }}>{r.service}</td>
              <td><Badge tone={kindTone(r.kind)}>{kindLabel(r.kind)}</Badge></td>
              <td className="tly-faint">{r.probe}</td>
              <td>{r.node}</td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card>
        <CardHead title="Per-telco environment health" sub="Demonstration · each telco environment is isolated" />
        <Table head={['Telco', 'Status', 'Environment', 'Health']}>
          {TELCOS.map((t) => (
            <tr key={t.name}>
              <td style={{ fontWeight: 600 }}>{t.name}</td>
              <td><Badge tone={t.status === 'Active' ? 'success' : t.status === 'Pipeline' ? 'info' : 'neutral'}>{t.status}</Badge></td>
              <td className="tly-faint">{t.status === 'Active' ? 'Provisioned · isolated' : 'Not provisioned'}</td>
              <td className="tly-mono">{t.health ? `${t.health}%` : '—'}</td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card>
        <CardHead title="Infrastructure load (24h)" sub="Demonstration · % utilisation" />
        <LineChart labels={INFRA_LOAD.labels} data={INFRA_LOAD.data} />
      </Card>

      <div className="tly-faint" style={{ fontSize: 11 }}>{DEMO_NOTE} {EXT_NOTE}</div>
    </AdminShell>
  );
}
