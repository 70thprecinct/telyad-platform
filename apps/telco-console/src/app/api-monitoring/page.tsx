'use client';
import { useEffect, useState } from 'react';
import { Badge, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { compactNumber } from '@telyad/types';
import { ConsoleShell } from '@/components/ConsoleShell';
import { LineChart } from '@/components/Charts';
import { api } from '@/lib/api';
import { API_ENDPOINTS, DEMO_NOTE, TRAFFIC } from '@/lib/demo';

interface HealthState {
  health: { ok: boolean; env: string } | null;
  ready: { ready: boolean; store: string; db: string } | null;
}

export default function ApiMonitoringPage() {
  const [live, setLive] = useState<HealthState>({ health: null, ready: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([api.health(), api.ready()])
      .then(([health, ready]) => {
        if (active) setLive({ health, ready });
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const totalCalls = API_ENDPOINTS.reduce((s, e) => s + e.calls24h, 0);
  const avgP95 = Math.round(
    API_ENDPOINTS.reduce((s, e) => s + e.p95, 0) / (API_ENDPOINTS.length || 1),
  );
  const avgErr = API_ENDPOINTS.reduce((s, e) => s + e.errRate, 0) / (API_ENDPOINTS.length || 1);

  const { health, ready } = live;

  return (
    <ConsoleShell active="api-monitoring">
      <PageHeader
        eyebrow="ACCESS & SYSTEM"
        title="API Monitoring"
        desc="Live platform API status and demonstration request telemetry."
      />

      <Card>
        <CardHead
          title="Live API status"
          sub="REAL — live /health + /ready"
          action={<Badge tone="info">REAL</Badge>}
        />
        {loading ? (
          <div className="tly-faint">Loading live status…</div>
        ) : (
          <>
            {error && (
              <div className="tly-empty" style={{ marginBottom: 12 }}>
                Live status probe failed — API unreachable. Demonstration telemetry below still renders.
              </div>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 14,
              }}
            >
              <div>
                <div className="tly-kpi-label">API</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge tone={health?.ok ? 'success' : 'danger'}>
                    {health?.ok ? 'Healthy' : 'Unavailable'}
                  </Badge>
                  <span className="tly-mono tly-faint" style={{ fontSize: 12 }}>
                    {health?.env ?? '—'}
                  </span>
                </div>
              </div>
              <div>
                <div className="tly-kpi-label">Store</div>
                <div className="tly-mono" style={{ marginTop: 6, fontWeight: 600 }}>
                  {ready?.store ?? '—'}
                </div>
              </div>
              <div>
                <div className="tly-kpi-label">Database</div>
                <div style={{ marginTop: 6 }}>
                  <Badge tone={ready?.db === 'reachable' ? 'success' : 'danger'}>
                    {ready?.db ?? 'unknown'}
                  </Badge>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      <KpiGrid>
        <Kpi label="Calls (24h)" value={compactNumber(totalCalls)} />
        <Kpi label="Avg p95" value={`${avgP95}ms`} />
        <Kpi label="Error rate" value={`${avgErr.toFixed(2)}%`} />
        <Kpi label="Endpoints" value={API_ENDPOINTS.length} />
      </KpiGrid>

      <Card>
        <CardHead
          title="Endpoint performance"
          sub="Demonstration API telemetry"
          action={<Badge tone="neutral">DEMO</Badge>}
        />
        <Table head={['Endpoint', 'Method', 'p95', 'Error rate', 'Calls (24h)']}>
          {API_ENDPOINTS.map((e) => (
            <tr key={`${e.method} ${e.path}`}>
              <td className="tly-mono">{e.path}</td>
              <td>
                <Badge tone="info">{e.method}</Badge>
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {e.p95 > 100 ? <Badge tone="warning">{`${e.p95}ms`}</Badge> : `${e.p95}ms`}
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {e.errRate > 0.5 ? (
                  <Badge tone="warning">{`${e.errRate}%`}</Badge>
                ) : (
                  `${e.errRate}%`
                )}
              </td>
              <td className="tly-mono" style={{ textAlign: 'right' }}>
                {compactNumber(e.calls24h)}
              </td>
            </tr>
          ))}
        </Table>
        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
          {DEMO_NOTE}
        </div>
      </Card>

      <Card>
        <CardHead
          title="Request volume — last 24h (demonstration)"
          sub="Aggregate request throughput across platform endpoints"
          action={<Badge tone="neutral">DEMO</Badge>}
        />
        <LineChart data={TRAFFIC.requests} labels={TRAFFIC.labels} />
        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
          {DEMO_NOTE}
        </div>
      </Card>
    </ConsoleShell>
  );
}
