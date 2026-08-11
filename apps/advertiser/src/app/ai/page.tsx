'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CAMPAIGN_OBJECTIVES,
  CAPABILITY_FAMILY_LABELS,
  compactNumber,
  LANGUAGES,
  LANGUAGE_LABELS,
  type CapabilityFamily,
  type LanguageCode,
  type MediaPlan,
  type MediaPlanRequest,
} from '@telyad/types';
import {
  Badge,
  Button,
  Card,
  CardHead,
  Chip,
  ChipWrap,
  Field,
  Input,
  PageHeader,
  Select,
} from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { api, ApiError } from '@/lib/api';

const SECTORS = ['FMCG', 'Banking', 'Retail', 'E-commerce', 'Automotive', 'Telco VAS', 'SME'];
const GEOS = ['Lagos', 'Abuja FCT', 'Kano', 'Rivers', 'Oyo'];
const DEVICE_MIX = [
  { value: 'both', label: 'Both' },
  { value: 'smartphone', label: 'Smartphone' },
  { value: 'feature_phone', label: 'Feature phone' },
];

const MEDIA_PLAN_KEY = 'telyad_media_plan';

function familyLabel(family: string): string {
  return CAPABILITY_FAMILY_LABELS[family as CapabilityFamily] ?? family;
}

export default function AiPage() {
  const router = useRouter();

  const [sector, setSector] = useState<string>(SECTORS[0] ?? 'FMCG');
  const [objective, setObjective] = useState<string>(CAMPAIGN_OBJECTIVES[0] ?? 'Acquisition');
  const [budgetM, setBudgetM] = useState('5');
  const [geographies, setGeographies] = useState<string[]>(['Lagos']);
  const [languages, setLanguages] = useState<LanguageCode[]>(['en']);
  const [durationDays, setDurationDays] = useState('14');
  const [deviceMix, setDeviceMix] = useState<'both' | 'smartphone' | 'feature_phone'>('both');

  const [plan, setPlan] = useState<MediaPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleGeo(v: string) {
    setGeographies((g) => (g.includes(v) ? g.filter((x) => x !== v) : [...g, v]));
  }
  function toggleLang(v: LanguageCode) {
    setLanguages((l) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]));
  }

  async function generate() {
    setBusy(true);
    setError(null);
    const millions = Number(budgetM) || 0;
    const req: MediaPlanRequest = {
      sector,
      objective,
      budgetMinor: Math.round(millions * 1_000_000 * 100),
      currency: 'NGN',
      geographies,
      deviceMix,
      languages,
      durationDays: Number(durationDays) || 0,
    };
    try {
      const { plan: p } = await api.mediaPlan(req);
      setPlan(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unexpected error');
    } finally {
      setBusy(false);
    }
  }

  function applyPlan() {
    if (!plan) return;
    try {
      sessionStorage.setItem(MEDIA_PLAN_KEY, JSON.stringify(plan));
    } catch {
      /* sessionStorage unavailable — proceed anyway */
    }
    router.push('/campaigns/new');
  }

  return (
    <PortalShell active="ai">
      <PageHeader
        eyebrow="Discover"
        title="AI Campaign Copilot"
        desc="Generate a suggested media plan across the TelyAd capability portfolio."
      />
      <div
        style={{
          fontSize: 11.5,
          color: 'var(--tly-text-faint)',
          border: '1px solid var(--tly-border-soft)',
          borderRadius: 8,
          padding: '8px 12px',
          marginBottom: 16,
        }}
      >
        Demonstration intelligence — deterministic, rule-based suggestions. Not production ML.
      </div>

      <div className="tly-grid-2">
        <Card>
          <CardHead title="Brief" sub="Describe the campaign to plan for." />
          <div data-testid="copilot-form">
            <Field label="Sector">
              <Select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                options={SECTORS.map((s) => ({ value: s, label: s }))}
              />
            </Field>
            <Field label="Objective">
              <Select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                options={CAMPAIGN_OBJECTIVES.map((o) => ({ value: o, label: o }))}
              />
            </Field>
            <Field label="Budget (₦ millions)">
              <Input
                type="number"
                min={0}
                value={budgetM}
                onChange={(e) => setBudgetM(e.target.value)}
              />
            </Field>
            <Field label="Duration (days)">
              <Input
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
              />
            </Field>
            <Field label="Device mix">
              <Select
                value={deviceMix}
                onChange={(e) => setDeviceMix(e.target.value as typeof deviceMix)}
                options={DEVICE_MIX}
              />
            </Field>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, color: 'var(--tly-text-dim)', marginBottom: 6 }}>Geographies</div>
              <ChipWrap>
                {GEOS.map((g) => (
                  <Chip key={g} active={geographies.includes(g)} onToggle={() => toggleGeo(g)}>
                    {g}
                  </Chip>
                ))}
              </ChipWrap>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, color: 'var(--tly-text-dim)', marginBottom: 6 }}>Languages</div>
              <ChipWrap>
                {LANGUAGES.map((l) => (
                  <Chip key={l} active={languages.includes(l)} onToggle={() => toggleLang(l)}>
                    {LANGUAGE_LABELS[l]}
                  </Chip>
                ))}
              </ChipWrap>
            </div>
            <Button data-testid="generate-plan" onClick={generate} disabled={busy} block>
              {busy ? 'Generating…' : 'Generate media plan'}
            </Button>
            {error && (
              <div style={{ color: 'var(--tly-danger)', fontSize: 12, marginTop: 10 }}>{error}</div>
            )}
          </div>
        </Card>

        <div>
          {!plan ? (
            <Card>
              <div className="tly-faint" style={{ fontSize: 12.5 }}>
                Fill in the brief and generate a plan to see recommended formats, estimated reach and budget
                allocation.
              </div>
            </Card>
          ) : (
            <div data-testid="media-plan">
              <Card>
                <CardHead
                  title="Recommended media plan"
                  sub="Demonstration intelligence — deterministic"
                  action={
                    <Button data-testid="apply-plan" size="sm" onClick={applyPlan}>
                      Apply to Campaign
                    </Button>
                  }
                />
                <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                  <div>
                    <div className="tly-faint" style={{ fontSize: 11 }}>
                      Total est. reach
                    </div>
                    <div style={{ fontFamily: 'var(--tly-font-display)', fontSize: 22, fontWeight: 600 }}>
                      {compactNumber(plan.totalEstimatedReach)}
                    </div>
                  </div>
                  <div>
                    <div className="tly-faint" style={{ fontSize: 11 }}>
                      Est. frequency
                    </div>
                    <div style={{ fontFamily: 'var(--tly-font-display)', fontSize: 22, fontWeight: 600 }}>
                      {plan.estimatedFrequency.toFixed(1)}x
                    </div>
                  </div>
                </div>

                {plan.networkWarnings.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {plan.networkWarnings.map((w, i) => (
                      <Badge key={i} tone="warning">
                        {w}
                      </Badge>
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gap: 12 }}>
                  {plan.items.map((it) => (
                    <div
                      key={it.capabilityId}
                      style={{
                        border: '1px solid var(--tly-border-soft)',
                        borderRadius: 10,
                        padding: 12,
                        display: 'grid',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{it.capabilityName}</div>
                        <div className="tly-mono" style={{ fontSize: 12 }}>{it.sharePct}%</div>
                      </div>
                      <div className="tly-faint" style={{ fontSize: 11 }}>
                        {familyLabel(it.family)} · {it.pricingModel} · reach {compactNumber(it.estimatedReach)}
                      </div>
                      <div
                        className="tly-progress"
                        style={{ height: 6, borderRadius: 999, overflow: 'hidden', background: 'var(--tly-border-soft)' }}
                      >
                        <span
                          style={{
                            display: 'block',
                            height: '100%',
                            width: `${Math.max(0, Math.min(100, it.sharePct))}%`,
                            background: 'var(--tly-primary, #ff7a00)',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--tly-text-dim)', lineHeight: 1.45 }}>
                        {it.reason}
                      </div>
                    </div>
                  ))}
                </div>

                {plan.notes && (
                  <div className="tly-faint" style={{ fontSize: 11, marginTop: 12, lineHeight: 1.5 }}>
                    {plan.notes}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
