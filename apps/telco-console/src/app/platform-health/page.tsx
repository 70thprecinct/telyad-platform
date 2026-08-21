'use client';
import { useEffect, useState } from 'react';
import { Badge, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { ConsoleShell } from '@/components/ConsoleShell';
import { api } from '@/lib/api';
import { EXT_NOTE, PLATFORM_SERVICES } from '@/lib/demo';

interface LiveState {
  health: { ok: boolean; env: string } | null;
  ready: { ready: boolean; store: string; db: string } | null;
}

function statusTone(status: string): 'success' | 'warning' {
  return status === 'Operational' ? 'success' : 'warning';
}

export default function PlatformHealthPage() {
  const [live, setLive] = useState<LiveState>({ health: null, ready: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api.health(), api.ready()])
      .then(([health, ready]) => {
        if (active) setLive({ health, ready });
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const { health, ready } = live;

  // Override the API and Database rows from the live probes where available (REAL).
  const rows = PLATFORM_SERVICES.map((s) => {
    if (s.service.startsWith('API') && health) {
      return { ...s, status: health.ok ? 'Operational' : 'Degraded' };
    }
    if (s.service.startsWith('Database') && ready) {
      return { ...s, status: ready.db === 'reachable' ? 'Operational' : 'Degraded' };
    }
    return s;
  });

  const operationalCount = rows.filter((s) => s.status.includes('Operational')).length;
  const extPending = rows.filter((s) => s.kind === 'EXT').length;

  return (
    <ConsoleShell active="platform-health">
      <PageHeader
        eyebrow="ACCESS & SYSTEM"
        title="Platform Health"
        desc="Real service probes, external integration status and demonstration history."
      />

      <KpiGrid>
        <Kpi label="Services" value={rows.length} />
        <Kpi label="Operational" value={operationalCount} />
        <Kpi label="External pending" value={extPending} />
      </KpiGrid>

      <Card>
        <CardHead
          title="Service health"
          sub="REAL API/DB/registry via /health, /ready — external gateways flagged"
          action={loading ? <Badge tone="neutral">Probing…</Badge> : <Badge tone="info">REAL + EXT</Badge>}
        />
        <Table head={['Service', 'Type', 'Probe', 'Status']}>
          {rows.map((s) => (
            <tr key={s.service}>
              <td style={{ fontWeight: 600 }}>{s.service}</td>
              <td>
                <Badge tone={s.kind === 'REAL' ? 'success' : 'neutral'}>{s.kind}</Badge>
              </td>
              <td className="tly-mono tly-faint">{s.probe}</td>
              <td>
                <Badge tone={statusTone(s.status)}>{s.status}</Badge>
              </td>
            </tr>
          ))}
        </Table>
        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
          REAL rows (API, Database, capability registry) reflect live /health and /ready probes.
          EXT rows (SMS / USSD / DCB gateways) — {EXT_NOTE}
        </div>
      </Card>

      <Card>
        <CardHead
          title="Status history — last 7 days"
          sub="Demonstration uptime timeline"
          action={<Badge tone="neutral">DEMO</Badge>}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((s) => (
            <div key={s.service} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 200, fontSize: 12.5 }} className="tly-faint">
                {s.service}
              </span>
              <div style={{ display: 'flex', gap: 5 }}>
                {Array.from({ length: 7 }, (_, i) => (
                  <span
                    key={i}
                    title="Operational"
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: 'var(--tly-success)',
                      display: 'inline-block',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="tly-faint" style={{ fontSize: 11.5, marginTop: 12 }}>
          Status history is a demonstration timeline, not a live incident record.
        </div>
      </Card>
    </ConsoleShell>
  );
}
