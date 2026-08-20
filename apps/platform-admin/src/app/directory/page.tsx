'use client';
import { useState } from 'react';
import { Badge, Button, Card, CardHead, Field, Input, Modal, PageHeader, Select } from '@telyad/ui';
import { AdminShell } from '@/components/AdminShell';
import { TELCOS, type DemoTelco, DEMO_NOTE, EXT_NOTE } from '@/lib/demo';

const statusTone = (s: DemoTelco['status']) => (s === 'Active' ? 'success' : s === 'Pipeline' ? 'info' : 'neutral');

export default function DirectoryPage() {
  const [scoped, setScoped] = useState<DemoTelco | null>(null);
  const [showOnboard, setShowOnboard] = useState(false);
  const [filter, setFilter] = useState('all');

  // ── Scoped telco drill-down (§6) — shows ONLY the selected telco's data. ─────
  if (scoped) {
    const commissionPct = 100 - scoped.sharePct;
    const grossM = Math.round(scoped.revenueMinorM / (scoped.sharePct / 100));
    return (
      <AdminShell active="directory">
        <div
          data-testid="scope-banner"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            background: 'var(--tly-primary-dim)', border: '1px solid var(--tly-primary)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16, flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 12.5 }}>
            🔒 Viewing <strong>{scoped.name}</strong> scoped environment — this is exactly what {scoped.name}&apos;s own
            Telco Console shows. No other telco&apos;s data is visible here.
          </span>
          <Button size="sm" variant="ghost" onClick={() => setScoped(null)} data-testid="exit-scoped">
            ← Exit to global view
          </Button>
        </div>
        <PageHeader
          eyebrow="Telco-scoped view"
          title={`${scoped.name} Network`}
          desc={`Scoped strictly to ${scoped.name}'s own subscribers, advertisers and revenue — identical to what ${scoped.name}'s own staff see. Demonstration data.`}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
          {[
            ['Subscribers reachable', `${scoped.subsM}M`],
            ['Active advertisers', String(scoped.advertisers)],
            ['Revenue share earned (MTD)', `₦${scoped.revenueMinorM}M`],
            ['Network health', scoped.health ? `${scoped.health}%` : '—'],
            ['Revenue share rate', `${scoped.sharePct}%`],
          ].map(([l, v]) => (
            <Card key={l}><div className="tly-faint" style={{ fontSize: 11, marginBottom: 6 }}>{l}</div>
              <div style={{ fontFamily: 'var(--tly-font-display)', fontSize: 22, fontWeight: 700 }}>{v}</div></Card>
          ))}
        </div>
        <Card>
          <CardHead title={`Settlement summary (${scoped.name})`} sub="Demonstration data" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="tly-faint">Gross advertiser spend (MTD)</span><span className="tly-mono">₦{grossM}M</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="tly-faint">Tely commission ({commissionPct}%)</span><span className="tly-mono">−₦{grossM - scoped.revenueMinorM}M</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--tly-border)', paddingTop: 8 }}><span className="tly-faint">Net to {scoped.name}</span><span className="tly-mono" style={{ color: 'var(--tly-success)', fontWeight: 700 }}>₦{scoped.revenueMinorM}M</span></div>
          </div>
        </Card>
        <div className="tly-faint" style={{ fontSize: 11 }}>{DEMO_NOTE}</div>
      </AdminShell>
    );
  }

  const filtered = TELCOS.filter((t) => filter === 'all' || t.status === filter);

  return (
    <AdminShell active="directory">
      <PageHeader
        eyebrow="Partnerships"
        title="Telco Directory"
        desc="Every telco partnership, its status, and a fully isolated environment per telco. Aggregate metrics only — no subscriber data."
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 180 }}>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[{ value: 'all', label: 'All statuses' }, { value: 'Active', label: 'Active' }, { value: 'Pipeline', label: 'Pipeline' }, { value: 'Prospect', label: 'Prospect' }]}
          />
        </div>
        <Button size="sm" onClick={() => setShowOnboard(true)} data-testid="onboard-telco">+ Onboard new telco</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map((t) => (
          <Card key={t.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--tly-primary-dim)', color: 'var(--tly-accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--tly-font-display)', fontWeight: 700 }}>{t.name.slice(0, 2)}</div>
                <div>
                  <div style={{ fontFamily: 'var(--tly-font-display)', fontSize: 15, fontWeight: 600 }}>{t.name}</div>
                  <div className="tly-faint" style={{ fontSize: 11 }}>{t.country}</div>
                </div>
              </div>
              <Badge tone={statusTone(t.status)}>{t.status}</Badge>
            </div>
            {[
              ['Partner since', t.since],
              ['Revenue share to telco', `${t.sharePct}%`],
              ['Subscribers reachable', `${t.subsM}M`],
              ['Active advertisers', String(t.advertisers)],
              ['Environment health', t.health ? `${t.health}%` : 'Not yet provisioned'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed var(--tly-border-soft)', fontSize: 11.5 }}>
                <span className="tly-faint">{l}</span><span className="tly-mono">{v}</span>
              </div>
            ))}
            {t.status === 'Active' ? (
              <Button size="sm" variant="ghost" block style={{ marginTop: 12 }} onClick={() => setScoped(t)} data-testid="enter-telco">
                Enter {t.name} console →
              </Button>
            ) : (
              <Button size="sm" variant="ghost" block style={{ marginTop: 12 }} disabled>
                Environment not yet provisioned
              </Button>
            )}
          </Card>
        ))}
      </div>
      <div className="tly-faint" style={{ fontSize: 11, marginTop: 12 }}>{DEMO_NOTE}</div>

      {showOnboard && (
        <Modal
          open
          title="Onboard a new telco"
          onClose={() => setShowOnboard(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowOnboard(false)}>Cancel</Button>
              <Button onClick={() => setShowOnboard(false)}>Create environment record</Button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 2 }}>
            <p className="tly-page-desc" style={{ marginBottom: 8 }}>
              This creates a telco organisation + commercial record with environment status <strong>pending / provisioning</strong>.
              It does not automatically provision production infrastructure — {EXT_NOTE}
            </p>
            <Field label="Telco name"><Input placeholder="e.g. Airtel Nigeria" /></Field>
            <Field label="Country"><Input placeholder="e.g. Nigeria" /></Field>
            <Field label="Revenue share to telco (%)"><Input type="number" defaultValue={80} /></Field>
            <Field label="Environment status">
              <Select options={[{ value: 'pending', label: 'Pending' }, { value: 'provisioning', label: 'Provisioning (manual/external)' }]} />
            </Field>
            <Field label="Primary contact"><Input placeholder="name@telco.example" /></Field>
          </div>
        </Modal>
      )}
    </AdminShell>
  );
}
