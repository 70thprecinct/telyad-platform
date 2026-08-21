'use client';
import { useEffect, useState } from 'react';
import type { Telco, TelcoStatus } from '@telyad/types';
import { Badge, Card, CardHead, Kpi, KpiGrid, PageHeader, Table } from '@telyad/ui';
import { AdminShell } from '@/components/AdminShell';
import { api } from '@/lib/api';
import { TELCOS, DEMO_NOTE } from '@/lib/demo';

const STATUS_TONE: Record<TelcoStatus, 'success' | 'warning' | 'info'> = {
  Active: 'success',
  Pipeline: 'warning',
  Prospect: 'info',
};

// Deterministic per-telco commercial detail (demonstration).
const TERM_DETAIL: Record<string, { settlement: string; contract: string; effective: string; contractStatus: 'Signed' | 'In negotiation' | 'LOI' }> = {
  'MTN Nigeria': { settlement: 'Monthly · NGN', contract: '24-month MSA', effective: '2026-04-01', contractStatus: 'Signed' },
  'Airtel Nigeria': { settlement: 'Monthly · NGN', contract: 'Term sheet', effective: '—', contractStatus: 'In negotiation' },
  'Glo Nigeria': { settlement: 'Monthly · NGN', contract: 'Term sheet', effective: '—', contractStatus: 'In negotiation' },
  'Vodacom Tanzania': { settlement: 'TBD', contract: 'LOI', effective: '—', contractStatus: 'LOI' },
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

  const signed = TELCOS.filter((t) => TERM_DETAIL[t.name]?.contractStatus === 'Signed').length;

  return (
    <AdminShell active="terms">
      <PageHeader
        eyebrow="Partnerships · commercial"
        title="Commercial Terms"
        desc="Revenue-share terms, settlement cadence and contract status per telco. Aggregated commercial data only — no subscriber data."
      />

      <KpiGrid>
        <Kpi label="Signed agreements" value={`${signed}`} delta="Active revenue share" />
        <Kpi label="In negotiation / LOI" value={`${TELCOS.length - signed}`} delta="Pipeline & prospect" />
        <Kpi label="Default share to telco" value="80%" delta="Tely commission 20%" />
        <Kpi label="Settlement cadence" value="Monthly" delta="NGN · demo" />
      </KpiGrid>

      <Card>
        <CardHead title="Revenue-share model" />
        <p className="tly-page-desc" style={{ marginBottom: 0 }}>
          Advertiser spend on each network is split between the telco and Tely. The telco receives its agreed
          revenue share; Tely retains the remaining commission. Every telco runs a fully isolated environment —
          no telco can see another telco&apos;s advertisers, campaigns, subscribers or terms.
        </p>
      </Card>

      <Card>
        <CardHead title="Terms by telco" sub="Share % and status are REAL (/telcos); settlement, contract and effective date are demonstration." />
        {!loaded ? (
          <div className="tly-faint">Loading…</div>
        ) : (
          <Table head={['Telco', 'Share to telco', 'Tely commission', 'Settlement', 'Contract', 'Effective', 'Status']}>
            {telcos.map((t) => {
              const d = TERM_DETAIL[t.name];
              return (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td className="tly-mono">{t.revenueShareBps / 100}%</td>
                  <td className="tly-mono">{(10000 - t.revenueShareBps) / 100}%</td>
                  <td className="tly-faint">{d?.settlement ?? '—'}</td>
                  <td className="tly-faint">{d?.contract ?? '—'}</td>
                  <td className="tly-mono">{d?.effective ?? '—'}</td>
                  <td><Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge></td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>
      <div className="tly-faint" style={{ fontSize: 11 }}>{DEMO_NOTE}</div>
    </AdminShell>
  );
}
