'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CAMPAIGN_OBJECTIVES,
  compactNumber,
  LANGUAGES,
  LANGUAGE_LABELS,
  type AdFormatId,
  type AudienceDefinition,
  type CampaignObjective,
  type CreateCampaignRequest,
  type LanguageCode,
  type LanguageVariant,
  type PricingModel,
} from '@telyad/types';
import { getFormat, listFormats } from '@telyad/ad-formats';
import { estimateAudience } from '@telyad/audience';
import {
  Badge,
  Button,
  Card,
  CardHead,
  Chip,
  ChipWrap,
  Field,
  Input,
  MoneyInput,
  PageHeader,
  PhonePreview,
  Select,
  Stepper,
  Textarea,
  useToast,
} from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

const STEPS = [
  { n: 1, label: 'Format' },
  { n: 2, label: 'Creative' },
  { n: 3, label: 'Audience' },
  { n: 4, label: 'Budget' },
  { n: 5, label: 'Review' },
];

const GEO = ['Lagos', 'Abuja FCT', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'Anambra', 'Delta'];
const AGES = ['18-24', '25-34', '30-44', '45-54', '55+'];
const INTERESTS = ['automotive', 'travel', 'business', 'sports', 'entertainment', 'finance', 'shopping', 'news'];
const TIERS = ['premium', 'standard', 'basic'];
const ARPU = ['very_high', 'high', 'medium', 'low'];
const EXCLUSIONS = ['dnd', 'recent_subscribers', 'high_churn'];

const emptyAudience: AudienceDefinition = {
  geographies: [],
  ageBands: [],
  genders: ['all'],
  deviceTypes: [],
  subscriberTiers: [],
  interests: [],
  arpuBands: [],
  networkTypes: [],
  languages: [],
  exclusions: ['dnd'],
};

export default function NewCampaignPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formatId, setFormatId] = useState<AdFormatId>('stk');
  const [name, setName] = useState('Highlander Test Drive');
  const [objective, setObjective] = useState<CampaignObjective>('Acquisition');
  const [creative, setCreative] = useState<Record<string, string>>({});
  const [audience, setAudience] = useState<AudienceDefinition>(emptyAudience);
  const [pricingModel, setPricingModel] = useState<PricingModel>('CPM');
  const [dailyCap, setDailyCap] = useState(50_000_00);
  const [total, setTotal] = useState(500_000_00);
  const [startDate, setStartDate] = useState('2026-08-14');
  const [endDate, setEndDate] = useState('2026-08-28');
  const [busy, setBusy] = useState(false);

  // Multilingual localisation (drafts requiring human review — never auto-active).
  const [localeLangs, setLocaleLangs] = useState<LanguageCode[]>(['en']);
  const [variants, setVariants] = useState<LanguageVariant[]>([]);
  const [localising, setLocalising] = useState(false);

  // Note surfaced when arriving from the AI Copilot with an applied media plan.
  const [planNote, setPlanNote] = useState<string | null>(null);

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem('telyad_media_plan');
    } catch {
      raw = null;
    }
    if (!raw) return;
    try {
      const plan = JSON.parse(raw) as {
        items?: unknown[];
        request?: { objective?: string };
      };
      const count = Array.isArray(plan.items) ? plan.items.length : 0;
      setPlanNote(`Applied AI media plan: ${count} format${count === 1 ? '' : 's'} recommended`);
      const obj = plan.request?.objective;
      if (obj && (CAMPAIGN_OBJECTIVES as readonly string[]).includes(obj)) {
        setObjective(obj as CampaignObjective);
      }
    } catch {
      /* ignore malformed plan */
    }
  }, []);

  const format = getFormat(formatId)!;
  const estimate = useMemo(() => estimateAudience(audience), [audience]);

  const toggleLocaleLang = (v: LanguageCode) =>
    setLocaleLangs((l) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]));

  async function generateVariants() {
    // Pick the primary body/message field for this format as the base copy.
    const baseText =
      creative.body ||
      creative.message ||
      creative.menuText ||
      creative.script ||
      creative.title ||
      Object.values(creative).find((v) => v && v.trim().length > 0) ||
      '';
    const cta = creative.option1 || creative.cta || creative.ctaText || undefined;
    const targets = localeLangs.filter((l) => l !== 'en');
    if (!baseText.trim() || targets.length === 0) {
      setVariants([]);
      return;
    }
    setLocalising(true);
    try {
      const results = await Promise.all(
        targets.map((targetLanguage) =>
          api
            .localise({ baseText, cta, targetLanguage, charLimit: 160 })
            .then((r) => r.variant)
            .catch(() => null),
        ),
      );
      setVariants(results.filter((v): v is LanguageVariant => v !== null));
    } finally {
      setLocalising(false);
    }
  }

  const toggle = (key: keyof AudienceDefinition, value: string) =>
    setAudience((a) => {
      const arr = a[key] as string[];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...a, [key]: next };
    });

  async function create(submitAfter: boolean) {
    if (!user?.advertiserId || !user.telcoId) {
      toast('Not signed in', 'Please sign in again.', 'danger');
      return;
    }
    setBusy(true);
    const payload: CreateCampaignRequest = {
      advertiserId: user.advertiserId,
      telcoId: user.telcoId,
      name,
      objective,
      formatId,
      audience,
      creativeFields: creative,
      budget: {
        pricingModel,
        dailyCap: { minor: dailyCap, currency: 'NGN' },
        total: { minor: total, currency: 'NGN' },
        startDate,
        endDate,
        deliverySpeed: 'standard',
      },
    };
    try {
      const { campaign } = await api.createCampaign(payload);
      if (submitAfter) {
        await api.submitCampaign(campaign.id);
        toast('Submitted for approval', 'MTN Nigeria will review this campaign.', 'success');
      } else {
        toast('Draft saved', 'You can submit it for approval any time.', 'success');
      }
      router.push(`/campaigns/${campaign.id}`);
    } catch (e) {
      toast('Could not create campaign', e instanceof ApiError ? e.message : 'Unexpected error', 'danger');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell active="campaigns/new">
      <PageHeader
        eyebrow="Create"
        title="New campaign"
        desc="Build a privacy-safe campaign on MTN Nigeria. Reach figures are aggregate estimates."
      />
      <Stepper steps={STEPS} current={step} />

      {planNote && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            border: '1px solid var(--tly-border-soft)',
            borderRadius: 8,
            padding: '8px 12px',
            marginBottom: 12,
            fontSize: 12.5,
            color: 'var(--tly-text-dim)',
          }}
        >
          <span>✨ {planNote}</span>
          <Button variant="ghost" size="sm" onClick={() => setPlanNote(null)}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="tly-grid-2">
        <div>
          {step === 1 && (
            <Card>
              <CardHead title="Choose an advertising format" />
              <ChipWrap>
                {listFormats().map((f) => (
                  <button
                    key={f.id}
                    className={`tly-chip ${f.id === formatId ? 'on' : ''}`}
                    onClick={() => setFormatId(f.id)}
                    style={{ padding: '12px 16px', flexDirection: 'column', alignItems: 'flex-start', maxWidth: 220 }}
                  >
                    <strong>{f.name}</strong>
                    <span className="tly-faint" style={{ fontSize: 11 }}>
                      {f.description}
                    </span>
                  </button>
                ))}
              </ChipWrap>
              <div style={{ marginTop: 16 }}>
                <Field label="Campaign name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Objective">
                  <Select
                    value={objective}
                    onChange={(e) => setObjective(e.target.value as CampaignObjective)}
                    options={CAMPAIGN_OBJECTIVES.map((o) => ({ value: o, label: o }))}
                  />
                </Field>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHead title={`${format.name} creative`} sub="These fields build the live preview." />
              {format.creativeSchema.map((spec) => (
                <Field
                  key={spec.key}
                  label={spec.label + (spec.required ? ' *' : '')}
                  hint={spec.maxLength ? `Max ${spec.maxLength} characters` : undefined}
                >
                  {spec.type === 'textarea' ? (
                    <Textarea
                      maxLength={spec.maxLength}
                      value={creative[spec.key] ?? ''}
                      onChange={(e) => setCreative((c) => ({ ...c, [spec.key]: e.target.value }))}
                    />
                  ) : spec.type === 'select' ? (
                    <Select
                      value={creative[spec.key] ?? ''}
                      onChange={(e) => setCreative((c) => ({ ...c, [spec.key]: e.target.value }))}
                      options={[{ value: '', label: 'Select…' }, ...(spec.options ?? []).map((o) => ({ value: o, label: o }))]}
                    />
                  ) : (
                    <Input
                      maxLength={spec.maxLength}
                      type={spec.type === 'number' ? 'number' : 'text'}
                      value={creative[spec.key] ?? ''}
                      onChange={(e) => setCreative((c) => ({ ...c, [spec.key]: e.target.value }))}
                    />
                  )}
                </Field>
              ))}
            </Card>
          )}

          {step === 2 && (
            <Card data-testid="localise-panel">
              <CardHead
                title="Languages & localisation"
                sub="Drafts only — machine variants require human review before use."
              />
              <ChipWrap>
                {LANGUAGES.map((l) => (
                  <Chip key={l} active={localeLangs.includes(l)} onToggle={() => toggleLocaleLang(l)}>
                    {LANGUAGE_LABELS[l]}
                  </Chip>
                ))}
              </ChipWrap>
              <div style={{ marginTop: 12 }}>
                <Button
                  data-testid="generate-variants"
                  size="sm"
                  variant="ghost"
                  disabled={localising}
                  onClick={generateVariants}
                >
                  {localising ? 'Generating…' : 'Generate variants'}
                </Button>
              </div>
              {variants.length > 0 && (
                <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                  {variants.map((v) => (
                    <div
                      key={v.language}
                      style={{ border: '1px solid var(--tly-border-soft)', borderRadius: 8, padding: 10 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <strong style={{ fontSize: 12.5 }}>{LANGUAGE_LABELS[v.language]}</strong>
                        {v.requiresReview && <Badge tone="warning">Human review required</Badge>}
                        <Badge tone={v.withinLimit ? 'success' : 'danger'}>
                          {v.withinLimit ? 'Within limit' : 'Over limit'}
                        </Badge>
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--tly-text-dim)', lineHeight: 1.45 }}>{v.text}</div>
                      {v.cta && (
                        <div className="tly-faint" style={{ fontSize: 11, marginTop: 6 }}>
                          CTA: {v.cta}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHead title="Audience" sub="Abstract segments only — no subscriber identities." />
              <AudienceGroup label="Geographies" values={GEO} selected={audience.geographies} onToggle={(v) => toggle('geographies', v)} />
              <AudienceGroup label="Age bands" values={AGES} selected={audience.ageBands} onToggle={(v) => toggle('ageBands', v)} />
              <AudienceGroup label="Interests" values={INTERESTS} selected={audience.interests} onToggle={(v) => toggle('interests', v)} />
              <AudienceGroup label="Subscriber tiers" values={TIERS} selected={audience.subscriberTiers} onToggle={(v) => toggle('subscriberTiers', v)} />
              <AudienceGroup label="ARPU bands" values={ARPU} selected={audience.arpuBands} onToggle={(v) => toggle('arpuBands', v)} />
              <AudienceGroup label="Exclusions" values={EXCLUSIONS} selected={audience.exclusions} onToggle={(v) => toggle('exclusions', v)} />
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHead title="Budget & schedule" />
              <Field label="Pricing model">
                <Select
                  value={pricingModel}
                  onChange={(e) => setPricingModel(e.target.value as PricingModel)}
                  options={format.pricingModels.map((p) => ({ value: p, label: p }))}
                />
              </Field>
              <Field label="Daily cap">
                <MoneyInput valueMinor={dailyCap} onChangeMinor={setDailyCap} />
              </Field>
              <Field label="Total budget">
                <MoneyInput valueMinor={total} onChangeMinor={setTotal} />
              </Field>
              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="Start date">
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </Field>
                <Field label="End date">
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </Field>
              </div>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <CardHead title="Review & submit" />
              <ReviewRow k="Name" v={name} />
              <ReviewRow k="Objective" v={objective} />
              <ReviewRow k="Format" v={format.name} />
              <ReviewRow k="Estimated reach" v={`${compactNumber(estimate.estimatedReach)} (${compactNumber(estimate.reachLow)}–${compactNumber(estimate.reachHigh)})`} />
              <ReviewRow k="Excluded (DND/consent)" v={compactNumber(estimate.excludedForCompliance)} />
              <ReviewRow k="Quality score" v={`${estimate.qualityScore}/100`} />
              <ReviewRow k="Pricing" v={pricingModel} />
              <ReviewRow k="Schedule" v={`${startDate} → ${endDate}`} />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Button variant="ghost" onClick={() => create(false)} disabled={busy}>
                  Save draft
                </Button>
                <Button onClick={() => create(true)} disabled={busy}>
                  {busy ? 'Submitting…' : 'Submit for approval'}
                </Button>
              </div>
            </Card>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
              ← Back
            </Button>
            {step < 5 && <Button onClick={() => setStep((s) => s + 1)}>Next →</Button>}
          </div>
        </div>

        <div>
          <Card>
            <CardHead title="Live preview" />
            <PhonePreview formatId={formatId} fields={creative} />
          </Card>
          <Card>
            <CardHead title="Estimated audience" sub="Deterministic, aggregate only" />
            <div style={{ fontFamily: 'var(--tly-font-display)', fontSize: 26, fontWeight: 600 }}>
              {compactNumber(estimate.estimatedReach)}
            </div>
            <div className="tly-faint" style={{ fontSize: 12 }}>
              eligible subscribers · {compactNumber(estimate.reachLow)}–{compactNumber(estimate.reachHigh)}
            </div>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}

function AudienceGroup({
  label,
  values,
  selected,
  onToggle,
}: {
  label: string;
  values: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11.5, color: 'var(--tly-text-dim)', marginBottom: 6 }}>{label}</div>
      <ChipWrap>
        {values.map((v) => (
          <Chip key={v} active={selected.includes(v)} onToggle={() => onToggle(v)}>
            {v.replace(/_/g, ' ')}
          </Chip>
        ))}
      </ChipWrap>
    </div>
  );
}

function ReviewRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid var(--tly-border-soft)',
        fontSize: 12.5,
      }}
    >
      <span className="tly-faint">{k}</span>
      <span>{v}</span>
    </div>
  );
}
