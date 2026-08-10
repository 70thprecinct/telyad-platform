'use client';
import { useEffect, useState } from 'react';
import type { Telco, TelcoStatus } from '@telyad/types';
import { Badge, Card, CardHead, PageHeader, Table } from '@telyad/ui';
import { AdminShell } from '@/components/AdminShell';
import { api } from '@/lib/api';

const STATUS_TONE: Record<TelcoStatus, 'success' | 'warning' | 'info'> = {
  Active: 'success',
  Pipeline: 'warning',
  Prospect: 'info',
};

export default function TermsPage() {
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
    <AdminShell active="terms">
      <PageHeader
        eyebrow="ALL TELCOS · AGGREGATED"
        title="Commercial Terms"
        desc="Revenue-share terms per telco partnership. Aggregated commercial data only — no subscriber data."
      />

      <Card>
        <CardHead title="Revenue-share model" />
        <p className="tly-page-desc" style={{ marginBottom: 0 }}>
          Advertiser spend on each network is split between the telco and Tely. The telco receives its agreed
          revenue share; Tely retains the remaining commission. Every telco runs a fully isolated environment —
          no telco can see another telco&apos;s advertisers, campaigns, subscribers or terms.
        </p>
      </Card>

      <Card>
        <CardHead title="Terms by telco" />
        {!loaded ? (
          <div className="tly-faint">Loading…</div>
        ) : (
          <Table head={['Telco', 'Share to telco', 'Tely commission', 'Status']}>
            {telcos.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 600 }}>{t.name}</td>
                <td className="tly-mono">{t.revenueShareBps / 100}%</td>
                <td className="tly-mono">{(10000 - t.revenueShareBps) / 100}%</td>
                <td>
                  <Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </AdminShell>
  );
}
