'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  CAPABILITY_FAMILIES,
  CAPABILITY_FAMILY_LABELS,
  CAPABILITY_PRICING_MODELS,
  CAPABILITY_STATUSES,
  CAPABILITY_STATUS_LABELS,
  type AdCapability,
  type CapabilityFamily,
  type CapabilityStatus,
} from '@telyad/types';
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Modal,
  PageHeader,
  ExperiencePreview,
  Select,
} from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { api } from '@/lib/api';

const NETWORK_DISCLAIMER =
  'Availability and delivery are subject to participating network capabilities, technical integration, regulatory requirements and network approval.';


const DEVICE_OPTIONS = [
  { value: '', label: 'Any device' },
  { value: 'both', label: 'Both' },
  { value: 'smartphone', label: 'Smartphone' },
  { value: 'feature_phone', label: 'Feature phone' },
];

const STATUS_TONE: Record<CapabilityStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  TELYAD_SUPPORTED: 'info',
  NETWORK_APPROVAL_REQUIRED: 'warning',
  INTEGRATION_REQUIRED: 'warning',
  PILOT: 'success',
  LIVE: 'success',
  DISABLED: 'danger',
  FUTURE_CAPABILITY: 'neutral',
};

function CapabilityPill({ status }: { status: CapabilityStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{CAPABILITY_STATUS_LABELS[status]}</Badge>;
}

function Pills({ items }: { items: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map((it) => (
        <span
          key={it}
          style={{
            fontSize: 10.5,
            padding: '2px 8px',
            borderRadius: 999,
            border: '1px solid var(--tly-border-soft)',
            color: 'var(--tly-text-dim)',
            background: 'var(--tly-surface-2, transparent)',
          }}
        >
          {it}
        </span>
      ))}
    </div>
  );
}

export default function MarketplacePage() {
  const [caps, setCaps] = useState<AdCapability[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [family, setFamily] = useState('');
  const [objective, setObjective] = useState('');
  const [device, setDevice] = useState('');
  const [pricing, setPricing] = useState('');
  const [status, setStatus] = useState('');

  function load() {
    setLoaded(false);
    setError(false);
    api
      .capabilities()
      .then((r) => setCaps(r.capabilities))
      .catch(() => setError(true))
      .finally(() => setLoaded(true));
  }
  useEffect(load, []);

  const objectiveOptions = useMemo(() => {
    const set = new Set<string>();
    caps.forEach((c) => c.objectives.forEach((o) => set.add(o)));
    return Array.from(set).sort();
  }, [caps]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return caps.filter((c) => {
      if (needle) {
        const hay = `${c.name} ${c.description} ${c.id}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (family && c.family !== family) return false;
      if (objective && !c.objectives.includes(objective)) return false;
      if (device) {
        // Device filter is inclusive: a "both" capability matches any device.
        if (device === 'both') {
          if (c.deviceClass !== 'both') return false;
        } else if (c.deviceClass !== device && c.deviceClass !== 'both') {
          return false;
        }
      }
      if (pricing && !c.pricingModels.includes(pricing as (typeof CAPABILITY_PRICING_MODELS)[number]))
        return false;
      if (status && c.defaultNetworkStatus !== status) return false;
      return true;
    });
  }, [caps, q, family, objective, device, pricing, status]);

  const byFamily = useMemo(() => {
    const groups: Array<{ family: CapabilityFamily; items: AdCapability[] }> = [];
    for (const fam of CAPABILITY_FAMILIES) {
      const items = filtered.filter((c) => c.family === fam);
      if (items.length) groups.push({ family: fam, items });
    }
    return groups;
  }, [filtered]);

  const open = openId ? caps.find((c) => c.id === openId) ?? null : null;

  return (
    <PortalShell active="marketplace">
      <PageHeader
        eyebrow="Discover"
        title="Ad Format Marketplace"
        desc="Explore the full TelyAd carrier-advertising capability portfolio. Demonstration environment — figures are illustrative."
      />
      <div
        style={{
          fontSize: 11.5,
          color: 'var(--tly-text-faint)',
          background: 'var(--tly-surface-2, transparent)',
          border: '1px solid var(--tly-border-soft)',
          borderRadius: 8,
          padding: '8px 12px',
          marginBottom: 16,
        }}
      >
        {NETWORK_DISCLAIMER}
      </div>

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <Field label="Search">
            <Input placeholder="Search capabilities…" value={q} onChange={(e) => setQ(e.target.value)} />
          </Field>
          <Field label="Family">
            <Select
              data-testid="filter-family"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              options={[
                { value: '', label: 'All families' },
                ...CAPABILITY_FAMILIES.map((f) => ({ value: f, label: CAPABILITY_FAMILY_LABELS[f] })),
              ]}
            />
          </Field>
          <Field label="Objective">
            <Select
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              options={[
                { value: '', label: 'All objectives' },
                ...objectiveOptions.map((o) => ({ value: o, label: o })),
              ]}
            />
          </Field>
          <Field label="Device">
            <Select value={device} onChange={(e) => setDevice(e.target.value)} options={DEVICE_OPTIONS} />
          </Field>
          <Field label="Pricing model">
            <Select
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
              options={[
                { value: '', label: 'All pricing' },
                ...CAPABILITY_PRICING_MODELS.map((p) => ({ value: p, label: p })),
              ]}
            />
          </Field>
          <Field label="Network status">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: '', label: 'All statuses' },
                ...CAPABILITY_STATUSES.map((s) => ({ value: s, label: CAPABILITY_STATUS_LABELS[s] })),
              ]}
            />
          </Field>
        </div>
      </Card>

      {error ? (
        <div className="tly-empty" data-testid="marketplace-error">
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Couldn’t reach the API</div>
          <div style={{ fontSize: 12.5, marginBottom: 12 }}>Check the API is running, then retry.</div>
          <Button variant="ghost" size="sm" onClick={load}>
            Retry
          </Button>
        </div>
      ) : !loaded ? (
        <div className="tly-faint" style={{ padding: 8 }}>
          Loading capabilities…
        </div>
      ) : filtered.length === 0 ? (
        <div className="tly-empty">No capabilities match your filters.</div>
      ) : (
        <div data-testid="marketplace-grid">
          <div className="tly-faint" style={{ fontSize: 12, margin: '4px 0 14px' }}>
            {filtered.length} of {caps.length} capabilities
          </div>
          {byFamily.map((group) => (
            <div key={group.family} style={{ marginBottom: 22 }}>
              <div
                style={{
                  fontFamily: 'var(--tly-font-display)',
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                {CAPABILITY_FAMILY_LABELS[group.family]}
                <span className="tly-faint" style={{ fontSize: 12, fontWeight: 400, marginLeft: 8 }}>
                  {group.items.length}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {group.items.map((c) => (
                  <div
                    key={c.id}
                    data-testid="capability-card"
                    className="tly-card"
                    style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.name}</div>
                      <span className="tly-faint" style={{ fontSize: 10.5, whiteSpace: 'nowrap' }}>
                        #{c.number}
                      </span>
                    </div>
                    <div>
                      <CapabilityPill status={c.defaultNetworkStatus} />
                    </div>
                    <div className="tly-faint" style={{ fontSize: 11 }}>
                      {CAPABILITY_FAMILY_LABELS[c.family]} · {c.deviceClass.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--tly-text-dim)', lineHeight: 1.45 }}>
                      {c.description.length > 130 ? `${c.description.slice(0, 130)}…` : c.description}
                    </div>
                    <Pills items={c.pricingModels} />
                    <div style={{ marginTop: 'auto', paddingTop: 4 }}>
                      <Button size="sm" variant="ghost" onClick={() => setOpenId(c.id)}>
                        View details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!open} title={open?.name ?? ''} onClose={() => setOpenId(null)}>
        {open && (
          <div data-testid="capability-detail" style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <CapabilityPill status={open.defaultNetworkStatus} />
              <span className="tly-faint" style={{ fontSize: 11 }}>
                {CAPABILITY_FAMILY_LABELS[open.family]} · #{open.number}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--tly-text-dim)', lineHeight: 1.5 }}>{open.description}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ display: 'grid', gap: 10 }}>
                <MetaRow label="Placement" value={open.placement} />
                <MetaRow label="Creative types" value={open.creativeTypes.join(', ')} />
                <MetaRow label="Triggers" value={open.triggers.join(', ')} />
                <MetaRow label="Mechanics" value={open.mechanics.join(', ')} />
                <MetaRow label="Journey types" value={open.journeyTypes.join(', ')} />
                <MetaRow label="Objectives" value={open.objectives.join(', ')} />
                <MetaRow label="Pricing" value={open.pricingModels.join(', ')} />
                <MetaRow label="Targeting" value={open.targetingCapabilities.join(', ')} />
                <MetaRow label="Device" value={open.deviceClass.replace('_', ' ')} />
                <MetaRow label="TelyAd status" value={CAPABILITY_STATUS_LABELS[open.telyadStatus]} />
                <MetaRow label="Network status" value={CAPABILITY_STATUS_LABELS[open.defaultNetworkStatus]} />
                <MetaRow label="Compliance" value={open.complianceRequirements.join(', ') || '—'} />
                <MetaRow label="Best use cases" value={open.bestUseCases.join(', ')} />
                <MetaRow label="Recommended sectors" value={open.recommendedSectors.join(', ')} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }} data-testid="capability-preview">
                <ExperiencePreview renderer={open.previewRenderer} content={open.sample} device={open.deviceClass === 'feature_phone' ? 'feature_phone' : 'smartphone'} />
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--tly-text-faint)', lineHeight: 1.5 }}>{NETWORK_DISCLAIMER}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" onClick={() => setOpenId(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PortalShell>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--tly-text-faint)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: 'var(--tly-text)', lineHeight: 1.4 }}>{value}</div>
    </div>
  );
}
