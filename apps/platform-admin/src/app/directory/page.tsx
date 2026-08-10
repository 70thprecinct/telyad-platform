'use client';
import { useEffect, useState } from 'react';
import type { Telco, TelcoStatus } from '@telyad/types';
import { Badge, Card, CardHead, PageHeader } from '@telyad/ui';
import { AdminShell } from '@/components/AdminShell';
import { api } from '@/lib/api';

const STATUS_TONE: Record<TelcoStatus, 'success' | 'warning' | 'info'> = {
  Active: 'success',
  Pipeline: 'warning',
  Prospect: 'info',
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderTop: '1px solid var(--tly-card-3)',
      }}
    >
      <span className="tly-faint">{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default function DirectoryPage() {
  const [telcos, setTelcos] = useState<Telco[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .listTelcos()
      .then((r) => setTelcos(r.telcos))
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  return (
    <AdminShell active="directory">
      <PageHeader
        eyebrow="ALL TELCOS · AGGREGATED"
        title="Telco Directory"
        desc="Every telco partnership Tely operates. Active telcos run a provisioned, isolated environment; pipeline and prospect telcos are not yet provisioned."
      />
      {!loaded ? (
        <Card>
          <div className="tly-faint">Loading…</div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {telcos.map((t) => (
            <Card key={t.id}>
              <CardHead title={t.name} action={<Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge>} />
              <Row label="Country" value={t.country} />
              <Row label="Partner since" value={t.partnerSince ?? '—'} />
              <Row label="Revenue share to telco" value={`${t.revenueShareBps / 100}%`} />
              <Row label="Currency" value={t.currency} />
              <p className="tly-page-desc" style={{ marginTop: 12, marginBottom: 0 }}>
                {t.status === 'Active'
                  ? 'Provisioned isolated environment — fully separated from all other telcos.'
                  : 'Not yet provisioned. No isolated environment exists for this telco yet.'}
              </p>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
