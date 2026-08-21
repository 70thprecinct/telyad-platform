'use client';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, PageHeader } from '@telyad/ui';
import { AdminShell } from '@/components/AdminShell';
import { ENGINES, DEMO_NOTE } from '@/lib/demo';

function initials(name: string): string {
  return name.replace(/[a-z]/g, '').slice(0, 2) || name.slice(0, 2).toUpperCase();
}

export default function EnginesOverviewPage() {
  const router = useRouter();

  return (
    <AdminShell active="engines">
      <PageHeader
        eyebrow="INTERNAL ONLY"
        title="Engine Dashboards"
        desc="Full technical depth for each underlying engine across the entire infrastructure — not scoped to any one telco. Visible only inside Tely Master Admin."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
        }}
      >
        {ENGINES.map((e) => (
          <Card key={e.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  background: `${e.color}22`,
                  color: e.color,
                }}
              >
                {initials(e.name)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{e.name}</div>
              </div>
              <Badge tone="success">Operational</Badge>
            </div>

            <div className="tly-faint" style={{ fontSize: 12.5, lineHeight: 1.45, marginBottom: 12 }}>
              {e.purpose}
            </div>

            <dl style={{ margin: 0, display: 'grid', gap: 6, fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <dt className="tly-dim">Scope</dt>
                <dd style={{ margin: 0, textAlign: 'right' }}>All telco environments</dd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <dt className="tly-dim">Environments</dt>
                <dd className="tly-mono" style={{ margin: 0, textAlign: 'right' }}>{e.envs}</dd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <dt className="tly-dim">Current volume</dt>
                <dd className="tly-mono" style={{ margin: 0, textAlign: 'right' }}>{e.metric}</dd>
              </div>
            </dl>

            <div style={{ marginTop: 12 }}>
              <Button
                size="sm"
                variant="ghost"
                block
                onClick={() => router.push('/engines/' + e.id)}
              >
                Open {e.name} dashboard →
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="tly-faint" style={{ fontSize: 12, marginTop: 14 }}>
        {DEMO_NOTE}
      </div>
    </AdminShell>
  );
}
