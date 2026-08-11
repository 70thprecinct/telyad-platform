'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AD_FORMAT_IDS,
  CAMPAIGN_OBJECTIVES,
  CAPABILITY_FAMILIES,
  CAPABILITY_FAMILY_LABELS,
  CAPABILITY_PRICING_MODELS,
  CAPABILITY_STATUSES,
  CAPABILITY_STATUS_LABELS,
  compactNumber,
  formatMoney,
  LANGUAGES,
  LANGUAGE_LABELS,
  type AdCapability,
  type AdFormatId,
  type AudienceCriteria,
  type AudienceDefinition,
  type AudienceMatchResult,
  type CampaignObjective,
  type CapabilityFamily,
  type CapabilityStatus,
  type CreateCampaignRequest,
  type LanguageCode,
  type PreviewContent,
} from '@telyad/types';
import {
  Badge,
  Button,
  Card,
  CardHead,
  Chip,
  ChipWrap,
  ExperiencePreview,
  Field,
  Input,
  PageHeader,
  Select,
  Stepper,
  Table,
  Textarea,
  useToast,
} from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

// ── Wizard shape ─────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: 'Objective' },
  { n: 2, label: 'Capabilities' },
  { n: 3, label: 'Audience Match' },
  { n: 4, label: 'Creative & Language' },
  { n: 5, label: 'Review' },
];

// ── Audience-criteria vocabularies (aggregate cohorts only) ──────────────────
const GEO = ['Lagos', 'Ogun', 'Oyo', 'Abuja FCT', 'Kano', 'Rivers'];
const AGE_BANDS = ['18-24', '25-34', '35-44', '45-54', '55+'];
const DATA_USE = ['light', 'medium', 'heavy'];
const AFFINITIES = ['FMCG', 'sports', 'entertainment', 'travel', 'retail', 'business'];
const DEVICES: Array<'smartphone' | 'feature_phone'> = ['smartphone', 'feature_phone'];

// The Maltina "recommended" quick-set (spec demo).
const RECOMMENDED = [
  'recharge_confirmation_sms',
  'standard_sms',
  'ussd_pre_session',
  'rewarded_data',
  'sequenced_retargeting',
];

const DEVICE_FILTER_OPTIONS = [
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

const NETWORK_DISCLAIMER =
  'Availability and delivery are subject to participating network capabilities, technical integration, regulatory requirements and network approval.';

type LangStatus = 'DRAFT' | 'REVIEW_REQUIRED' | 'APPROVED';
interface LangVariant {
  body: string;
  cta?: string;
  status: LangStatus;
}

interface Creative {
  brand: string;
  headline: string;
  body: string;
  cta: string;
  offer: string;
  reward: string;
  code: string;
  question: string;
  options: string;
}

const emptyCriteria: AudienceCriteria = {
  geographies: [],
  ageBands: [],
  devices: ['smartphone', 'feature_phone'],
  dataUse: [],
  spendBands: [],
  affinities: [],
  engagement: [],
  languages: ['en'],
};

// Merge the advertiser's shared creative (and the active language variant) OVER
// the capability's representative sample — unedited fields fall back to sample.
function buildContent(cap: AdCapability, cr: Creative, variant?: LangVariant): PreviewContent {
  const s = cap.sample;
  const options = cr.options.trim()
    ? cr.options.split(/\n|,/).map((o) => o.trim()).filter(Boolean)
    : undefined;
  return {
    ...s,
    brand: cr.brand.trim() || s.brand,
    title: cr.headline.trim() || s.title,
    body: variant?.body || cr.body.trim() || s.body,
    cta: variant?.cta || cr.cta.trim() || s.cta,
    offer: cr.offer.trim() || s.offer,
    reward: cr.reward.trim() || s.reward,
    code: cr.code.trim() || s.code,
    question: cr.question.trim() || s.question,
    options: options ?? s.options,
  };
}

export default function NewCampaignPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);

  // Objective
  const [name, setName] = useState('Maltina Refresh Nigeria');
  const [objective, setObjective] = useState<CampaignObjective>('Conversion');

  // Capability universe + selection
  const [caps, setCaps] = useState<AdCapability[]>([]);
  const [capsLoaded, setCapsLoaded] = useState(false);
  const [capsError, setCapsError] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  // Capability filters (mirrors the marketplace)
  const [q, setQ] = useState('');
  const [family, setFamily] = useState('');
  const [objFilter, setObjFilter] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [pricingFilter, setPricingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Creative + language
  const [creative, setCreative] = useState<Creative>({
    brand: 'Maltina',
    headline: 'Refresh with Maltina',
    body: 'Buy any 2 Maltina, get 1 FREE this weekend at your nearest store. Reply STOP to opt out.',
    cta: 'Find a store',
    offer: '',
    reward: '',
    code: '',
    question: '',
    options: '',
  });
  const [activeLang, setActiveLang] = useState<LanguageCode>('en');
  const [variants, setVariants] = useState<Partial<Record<LanguageCode, LangVariant>>>({});
  const [langBusy, setLangBusy] = useState<LanguageCode | null>(null);

  // Audience match
  const [criteria, setCriteria] = useState<AudienceCriteria>(emptyCriteria);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [match, setMatch] = useState<AudienceMatchResult | null>(null);
  const [matching, setMatching] = useState(false);
  const [funnelOpen, setFunnelOpen] = useState(false);

  const [busy, setBusy] = useState(false);
  const [planNote, setPlanNote] = useState<string | null>(null);

  const capMap = useMemo(() => new Map(caps.map((c) => [c.id, c])), [caps]);

  // ── Load capabilities ──────────────────────────────────────────────────────
  function loadCaps() {
    setCapsLoaded(false);
    setCapsError(false);
    api
      .capabilities()
      .then((r) => setCaps(r.capabilities))
      .catch(() => setCapsError(true))
      .finally(() => setCapsLoaded(true));
  }
  useEffect(loadCaps, []);

  // Arrived from the AI Copilot with an applied media plan?
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem('telyad_media_plan');
    } catch {
      raw = null;
    }
    if (!raw) return;
    try {
      const plan = JSON.parse(raw) as { items?: unknown[]; request?: { objective?: string } };
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

  // Keep the active preview tab pointed at a currently-selected capability.
  useEffect(() => {
    if (selectedIds.length === 0) {
      setActivePreviewId(null);
    } else if (!activePreviewId || !selectedIds.includes(activePreviewId)) {
      setActivePreviewId(selectedIds[0] ?? null);
    }
  }, [selectedIds, activePreviewId]);

  // ── Audience match: recompute on criteria / selection / target change ──────
  useEffect(() => {
    if (selectedIds.length === 0) {
      setMatch(null);
      return;
    }
    setMatching(true);
    let cancelled = false;
    const handle = setTimeout(() => {
      api
        .audienceMatch({
          criteria,
          capabilityIds: selectedIds,
          selectedTarget: selectedTarget ?? undefined,
        })
        .then(({ match: m }) => {
          if (cancelled) return;
          setMatch(m);
          if (!m.privacy.tooNarrow) {
            // Clamp the target to the eligible audience; default it once when unset.
            setSelectedTarget((prev) =>
              prev === null ? m.selectedTarget : Math.min(prev, m.eligibleAudience),
            );
          }
        })
        .catch(() => {
          if (!cancelled) setMatch(null);
        })
        .finally(() => {
          if (!cancelled) setMatching(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // Intentionally NOT keyed on selectedTarget: the slider recomputes via a
    // separate lightweight effect below, so setting the default target here
    // never triggers a refetch loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria, selectedIds]);

  // Recompute forecast/cost when the advertiser changes the target (debounced),
  // without re-running the full eligibility funnel.
  useEffect(() => {
    if (selectedIds.length === 0 || selectedTarget === null) return;
    let cancelled = false;
    const handle = setTimeout(() => {
      api
        .audienceMatch({ criteria, capabilityIds: selectedIds, selectedTarget })
        .then(({ match: m }) => {
          if (!cancelled && !m.privacy.tooNarrow) setMatch(m);
        })
        .catch(() => undefined);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTarget]);

  // ── Capability filtering ────────────────────────────────────────────────────
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
      if (objFilter && !c.objectives.includes(objFilter)) return false;
      if (deviceFilter) {
        if (deviceFilter === 'both') {
          if (c.deviceClass !== 'both') return false;
        } else if (c.deviceClass !== deviceFilter && c.deviceClass !== 'both') {
          return false;
        }
      }
      if (pricingFilter && !c.pricingModels.includes(pricingFilter as (typeof CAPABILITY_PRICING_MODELS)[number]))
        return false;
      if (statusFilter && c.defaultNetworkStatus !== statusFilter) return false;
      return true;
    });
  }, [caps, q, family, objFilter, deviceFilter, pricingFilter, statusFilter]);

  const byFamily = useMemo(() => {
    const groups: Array<{ family: CapabilityFamily; items: AdCapability[] }> = [];
    for (const fam of CAPABILITY_FAMILIES) {
      const items = filtered.filter((c) => c.family === fam);
      if (items.length) groups.push({ family: fam, items });
    }
    return groups;
  }, [filtered]);

  const selectedCaps = useMemo(
    () => selectedIds.map((id) => capMap.get(id)).filter((c): c is AdCapability => !!c),
    [selectedIds, capMap],
  );

  // Campaign languages: English plus any generated variant.
  const campaignLangs = useMemo<LanguageCode[]>(
    () => [...new Set<LanguageCode>(['en', ...(Object.keys(variants) as LanguageCode[])])],
    [variants],
  );

  // ── Handlers ────────────────────────────────────────────────────────────────
  function toggleCap(id: string) {
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }
  function applyRecommended() {
    const ids = RECOMMENDED.filter((id) => capMap.has(id));
    setSelectedIds(ids);
    if (ids.length) setActivePreviewId(ids[0] ?? null);
  }

  function toggleCriteria<K extends keyof AudienceCriteria>(key: K, value: string) {
    setCriteria((c) => {
      const arr = c[key] as string[];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...c, [key]: next } as AudienceCriteria;
    });
  }
  function toggleDevice(d: 'smartphone' | 'feature_phone') {
    setCriteria((c) => {
      const next = c.devices.includes(d) ? c.devices.filter((x) => x !== d) : [...c.devices, d];
      return { ...c, devices: next };
    });
  }

  async function selectLanguage(l: LanguageCode) {
    setActiveLang(l);
    // Keep criteria languages in sync so the estimate reflects the strategy.
    setCriteria((c) => (c.languages.includes(l) ? c : { ...c, languages: [...c.languages, l] }));
    if (l === 'en' || variants[l]) return;
    const baseText = creative.body.trim();
    if (!baseText) return;
    setLangBusy(l);
    try {
      const { variant } = await api.localise({
        baseText,
        cta: creative.cta.trim() || undefined,
        targetLanguage: l,
        charLimit: 160,
      });
      setVariants((v) => ({
        ...v,
        [l]: { body: variant.text, cta: variant.cta, status: 'REVIEW_REQUIRED' },
      }));
    } catch {
      toast('Localisation failed', 'Could not generate a variant. Try again.', 'danger');
    } finally {
      setLangBusy(null);
    }
  }

  function regenerateVariants() {
    const targets = (Object.keys(variants) as LanguageCode[]).filter((l) => l !== 'en');
    setVariants({});
    targets.forEach((l) => {
      if (l !== activeLang) selectLanguage(l);
    });
    if (activeLang !== 'en') selectLanguage(activeLang);
  }

  const activeVariant = activeLang === 'en' ? undefined : variants[activeLang];
  const activePreviewCap = activePreviewId ? capMap.get(activePreviewId) ?? null : null;

  // ── Submit ──────────────────────────────────────────────────────────────────
  function primaryFormatId(): AdFormatId {
    for (const id of selectedIds) {
      const f = capMap.get(id)?.creatableFormatId;
      if (f && (AD_FORMAT_IDS as readonly string[]).includes(f)) return f as AdFormatId;
    }
    return 'sms';
  }

  // Map the generic creative into the concrete primary-format's required schema
  // so the persisted campaign passes server-side creative validation.
  function creativeFields(fmt: AdFormatId): Record<string, string> {
    const brand = (creative.brand?.trim() || 'TelyAd').slice(0, 40);
    const body = (creative.body?.trim() || creative.headline?.trim() || 'Sample creative').slice(0, 300);
    const cta = creative.cta?.trim() || 'Learn more';
    const headline = creative.headline?.trim() || brand;
    const base: Record<string, string> = { brand, body, cta };
    if (creative.offer?.trim()) base.offer = creative.offer.trim();
    if (creative.reward?.trim()) base.reward = creative.reward.trim();
    switch (fmt) {
      case 'sms':
        return {
          ...base,
          senderId: (brand.replace(/[^A-Za-z0-9]/g, '') || 'TelyAd').slice(0, 11),
          message: body.slice(0, 160),
        };
      case 'ussd':
        return { ...base, shortCode: '*123#', menuText: (creative.options?.trim() || body).slice(0, 182) };
      case 'stk':
        return { ...base, menuTitle: headline.slice(0, 20), option1: cta, serviceName: brand.slice(0, 20) };
      case 'wap':
        return { ...base, title: headline.slice(0, 30), url: 'http://mtn.ng/offer', body: body.slice(0, 120) };
      case 'obd':
        return { ...base, script: body, language: 'English (Nigerian)' };
      default:
        return base;
    }
  }

  function toAudienceDefinition(): AudienceDefinition {
    return {
      geographies: criteria.geographies,
      ageBands: criteria.ageBands,
      genders: ['all'],
      deviceTypes: criteria.devices,
      subscriberTiers: [],
      interests: criteria.affinities,
      arpuBands: criteria.spendBands,
      networkTypes: [],
      languages: campaignLangs,
      exclusions: ['dnd'],
    };
  }

  async function create(submitAfter: boolean) {
    if (!user?.advertiserId || !user.telcoId) {
      toast('Not signed in', 'Please sign in again.', 'danger');
      return;
    }
    if (selectedIds.length === 0) {
      toast('No capabilities selected', 'Choose at least one capability first.', 'danger');
      return;
    }
    setBusy(true);
    const total = Math.max(match?.estimatedCostMinor ?? 500_000_00, 50_000_00);
    const payload: CreateCampaignRequest = {
      advertiserId: user.advertiserId,
      telcoId: user.telcoId,
      name,
      objective,
      formatId: primaryFormatId(),
      audience: toAudienceDefinition(),
      creativeFields: creativeFields(primaryFormatId()),
      budget: {
        pricingModel: 'CPM',
        dailyCap: { minor: 50_000_00, currency: 'NGN' },
        total: { minor: total, currency: 'NGN' },
        startDate: '2026-08-14',
        endDate: '2026-08-28',
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

  // ── Derived audience figures ────────────────────────────────────────────────
  const eligible = match?.eligibleAudience ?? 0;
  const tooNarrow = match?.privacy.tooNarrow ?? false;
  const floor = eligible > 0 ? Math.min(Math.max(100_000, Math.round(eligible * 0.02)), eligible) : 0;
  const displayTarget = Math.min(selectedTarget ?? match?.selectedTarget ?? 0, eligible);

  return (
    <PortalShell active="campaigns/new">
      <PageHeader
        eyebrow="Create"
        title="New campaign"
        desc="Compose a multi-capability campaign on MTN Nigeria. Audience figures are aggregate demonstration estimates."
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
        {/* ── Left column: controls ─────────────────────────────────────────── */}
        <div>
          {step === 1 && (
            <Card>
              <CardHead title="Campaign objective" sub="Name your campaign and set its primary objective." />
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
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHead
                title="Choose advertising capabilities"
                sub="Select one or more of the 48 carrier-advertising capabilities."
                action={
                  <Button size="sm" variant="ghost" onClick={applyRecommended}>
                    Use recommended set
                  </Button>
                }
              />

              {selectedIds.length > 0 && (
                <div data-testid="selected-capabilities" style={{ marginBottom: 12 }}>
                  <div className="tly-faint" style={{ fontSize: 11.5, marginBottom: 6 }}>
                    {selectedIds.length} selected
                  </div>
                  <ChipWrap>
                    {selectedCaps.map((c) => (
                      <Chip key={c.id} active onToggle={() => toggleCap(c.id)}>
                        {c.name} ✕
                      </Chip>
                    ))}
                  </ChipWrap>
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <Field label="Search">
                  <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
                </Field>
                <Field label="Family">
                  <Select
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
                    value={objFilter}
                    onChange={(e) => setObjFilter(e.target.value)}
                    options={[
                      { value: '', label: 'All objectives' },
                      ...objectiveOptions.map((o) => ({ value: o, label: o })),
                    ]}
                  />
                </Field>
                <Field label="Device">
                  <Select
                    value={deviceFilter}
                    onChange={(e) => setDeviceFilter(e.target.value)}
                    options={DEVICE_FILTER_OPTIONS}
                  />
                </Field>
                <Field label="Pricing">
                  <Select
                    value={pricingFilter}
                    onChange={(e) => setPricingFilter(e.target.value)}
                    options={[
                      { value: '', label: 'All pricing' },
                      ...CAPABILITY_PRICING_MODELS.map((p) => ({ value: p, label: p })),
                    ]}
                  />
                </Field>
                <Field label="Network status">
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: '', label: 'All statuses' },
                      ...CAPABILITY_STATUSES.map((s) => ({ value: s, label: CAPABILITY_STATUS_LABELS[s] })),
                    ]}
                  />
                </Field>
              </div>

              {capsError ? (
                <div className="tly-empty" data-testid="capabilities-error">
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Couldn’t reach the API</div>
                  <Button variant="ghost" size="sm" onClick={loadCaps}>
                    Retry
                  </Button>
                </div>
              ) : !capsLoaded ? (
                <div className="tly-faint" style={{ padding: 8 }}>
                  Loading capabilities…
                </div>
              ) : filtered.length === 0 ? (
                <div className="tly-empty">No capabilities match your filters.</div>
              ) : (
                <div data-testid="capability-selector">
                  <div className="tly-faint" style={{ fontSize: 12, marginBottom: 12 }}>
                    {filtered.length} of {caps.length} capabilities
                  </div>
                  {byFamily.map((group) => (
                    <div key={group.family} style={{ marginBottom: 18 }}>
                      <div
                        style={{
                          fontFamily: 'var(--tly-font-display)',
                          fontSize: 13.5,
                          fontWeight: 600,
                          marginBottom: 8,
                        }}
                      >
                        {CAPABILITY_FAMILY_LABELS[group.family]}
                        <span className="tly-faint" style={{ fontSize: 11.5, fontWeight: 400, marginLeft: 8 }}>
                          {group.items.length}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                          gap: 10,
                        }}
                      >
                        {group.items.map((c) => {
                          const on = selectedIds.includes(c.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              data-testid="capability-option"
                              data-selected={on ? 'true' : 'false'}
                              onClick={() => toggleCap(c.id)}
                              style={{
                                textAlign: 'left',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 6,
                                padding: 12,
                                borderRadius: 10,
                                cursor: 'pointer',
                                background: on ? 'var(--tly-accent-soft, var(--tly-surface-2, transparent))' : 'transparent',
                                border: `1px solid ${on ? 'var(--tly-accent, #16a34a)' : 'var(--tly-border-soft)'}`,
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</span>
                                <span
                                  aria-hidden
                                  style={{
                                    flex: '0 0 auto',
                                    width: 18,
                                    height: 18,
                                    borderRadius: 5,
                                    fontSize: 12,
                                    lineHeight: '18px',
                                    textAlign: 'center',
                                    color: on ? '#fff' : 'var(--tly-text-faint)',
                                    background: on ? 'var(--tly-accent, #16a34a)' : 'transparent',
                                    border: `1px solid ${on ? 'var(--tly-accent, #16a34a)' : 'var(--tly-border-soft)'}`,
                                  }}
                                >
                                  {on ? '✓' : ''}
                                </span>
                              </div>
                              <Badge tone={STATUS_TONE[c.defaultNetworkStatus]}>
                                {CAPABILITY_STATUS_LABELS[c.defaultNetworkStatus]}
                              </Badge>
                              <span className="tly-faint" style={{ fontSize: 10.5 }}>
                                {CAPABILITY_FAMILY_LABELS[c.family]} · {c.deviceClass.replace('_', ' ')}
                              </span>
                              <span style={{ fontSize: 11.5, color: 'var(--tly-text-dim)', lineHeight: 1.4 }}>
                                {c.description.length > 96 ? `${c.description.slice(0, 96)}…` : c.description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {step === 3 && (
            <Card data-testid="audience-match">
              <CardHead
                title="Audience match"
                sub="Aggregate, privacy-safe estimates. No individual subscribers are modelled."
              />

              {selectedIds.length === 0 ? (
                <div className="tly-empty">Select capabilities first to compute an audience match.</div>
              ) : (
                <>
                  <CriteriaGroup label="Geography" values={GEO} selected={criteria.geographies} onToggle={(v) => toggleCriteria('geographies', v)} />
                  <CriteriaGroup label="Age bands" values={AGE_BANDS} selected={criteria.ageBands} onToggle={(v) => toggleCriteria('ageBands', v)} />
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11.5, color: 'var(--tly-text-dim)', marginBottom: 6 }}>Device</div>
                    <ChipWrap>
                      {DEVICES.map((d) => (
                        <Chip key={d} active={criteria.devices.includes(d)} onToggle={() => toggleDevice(d)}>
                          {d === 'smartphone' ? 'Smartphone' : 'Feature phone'}
                        </Chip>
                      ))}
                    </ChipWrap>
                  </div>
                  <CriteriaGroup label="Data use" values={DATA_USE} selected={criteria.dataUse} onToggle={(v) => toggleCriteria('dataUse', v)} />
                  <CriteriaGroup label="Affinities" values={AFFINITIES} selected={criteria.affinities} onToggle={(v) => toggleCriteria('affinities', v)} />
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11.5, color: 'var(--tly-text-dim)', marginBottom: 6 }}>Languages</div>
                    <ChipWrap>
                      {LANGUAGES.map((l) => (
                        <Chip key={l} active={criteria.languages.includes(l)} onToggle={() => toggleCriteria('languages', l)}>
                          {LANGUAGE_LABELS[l]}
                        </Chip>
                      ))}
                    </ChipWrap>
                  </div>

                  <div style={{ borderTop: '1px solid var(--tly-border-soft)', margin: '6px 0 16px' }} />

                  {tooNarrow ? (
                    <div className="tly-empty" data-testid="audience-too-narrow">
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Audience too narrow.</div>
                      <div style={{ fontSize: 12.5 }}>Broaden your targeting criteria.</div>
                    </div>
                  ) : (
                    <>
                      {/* Eligible audience */}
                      <div style={{ marginBottom: 16 }}>
                        <div className="tly-faint" style={{ fontSize: 11.5 }}>
                          Estimated Eligible Audience · Demonstration estimate
                        </div>
                        <div style={{ fontFamily: 'var(--tly-font-display)', fontSize: 34, fontWeight: 600 }}>
                          {matching && !match ? '…' : compactNumber(eligible)}
                        </div>
                      </div>

                      {/* Target selection */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>
                          How many would you like to target?
                        </div>
                        <input
                          data-testid="target-slider"
                          type="range"
                          min={floor}
                          max={eligible || floor}
                          step={Math.max(1000, Math.round((eligible || 1) / 200))}
                          value={displayTarget}
                          onChange={(e) => setSelectedTarget(Math.min(Number(e.target.value), eligible))}
                          style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '10px 0' }}>
                          {[
                            { label: '100K', v: 100_000 },
                            { label: '250K', v: 250_000 },
                            { label: '500K', v: 500_000 },
                            { label: '1M', v: 1_000_000 },
                            { label: '2M', v: 2_000_000 },
                            { label: 'Max', v: eligible },
                          ].map((c) => (
                            <Chip
                              key={c.label}
                              active={displayTarget === Math.min(c.v, eligible)}
                              onToggle={() => setSelectedTarget(Math.min(c.v, eligible))}
                            >
                              {c.label}
                            </Chip>
                          ))}
                        </div>
                        <Field label="Exact target">
                          <Input
                            data-testid="target-input"
                            type="number"
                            min={0}
                            max={eligible}
                            value={displayTarget}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setSelectedTarget(Number.isFinite(v) ? Math.max(0, Math.min(v, eligible)) : 0);
                            }}
                          />
                        </Field>
                        {selectedTarget !== null && selectedTarget > eligible && (
                          <div className="hint" style={{ color: 'var(--tly-danger)' }}>
                            Target cannot exceed the eligible audience.
                          </div>
                        )}
                      </div>

                      {/* Distinct metrics */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                          gap: 10,
                          marginBottom: 16,
                        }}
                      >
                        <Metric label="Selected Target" value={compactNumber(match?.selectedTarget ?? displayTarget)} />
                        <Metric
                          label="Forecast Unique Reach"
                          value={compactNumber(match?.forecastReach.point ?? 0)}
                          sub={
                            match
                              ? `${compactNumber(match.forecastReach.low)}–${compactNumber(match.forecastReach.high)}`
                              : undefined
                          }
                        />
                        <Metric label="Estimated Frequency" value={`${(match?.frequency ?? 0).toFixed(1)}×`} />
                        <Metric
                          label="Estimated Cost"
                          value={formatMoney({ minor: match?.estimatedCostMinor ?? 0, currency: 'NGN' })}
                        />
                      </div>

                      {/* Funnel */}
                      <div style={{ marginBottom: 14 }}>
                        <Button size="sm" variant="ghost" onClick={() => setFunnelOpen((o) => !o)}>
                          {funnelOpen ? 'Hide' : 'How was this calculated?'}
                        </Button>
                        {funnelOpen && match && (
                          <div data-testid="audience-funnel" style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                            {match.funnel.map((f) => (
                              <div
                                key={f.stage}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: 12,
                                  padding: '6px 0',
                                  borderBottom: '1px solid var(--tly-border-soft)',
                                }}
                              >
                                <span className="tly-faint">{f.stage}</span>
                                <span>{compactNumber(f.value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Per-format table */}
                      {match && match.perFormat.length > 0 && (
                        <div data-testid="per-format-table">
                          <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>Per-capability breakdown</div>
                          <Table head={['Capability', 'Eligible', 'Allocation', 'Forecast', 'Pricing']}>
                            {match.perFormat.map((f) => (
                              <tr key={f.capabilityId}>
                                <td>{f.name}</td>
                                <td>{compactNumber(f.eligible)}</td>
                                <td>{compactNumber(f.allocation)}</td>
                                <td>{compactNumber(f.forecast)}</td>
                                <td>{f.pricingModel}</td>
                              </tr>
                            ))}
                          </Table>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </Card>
          )}

          {step === 4 && (
            <>
              <Card>
                <CardHead title="Creative" sub="One shared creative drives every selected capability’s preview." />
                <Field label="Brand">
                  <Input value={creative.brand} onChange={(e) => setCreative((c) => ({ ...c, brand: e.target.value }))} />
                </Field>
                <Field label="Headline / title">
                  <Input value={creative.headline} onChange={(e) => setCreative((c) => ({ ...c, headline: e.target.value }))} />
                </Field>
                <Field label="Body">
                  <Textarea
                    data-testid="creative-body"
                    maxLength={160}
                    value={creative.body}
                    onChange={(e) => setCreative((c) => ({ ...c, body: e.target.value }))}
                  />
                </Field>
                <Field label="Call to action">
                  <Input value={creative.cta} onChange={(e) => setCreative((c) => ({ ...c, cta: e.target.value }))} />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Offer">
                    <Input value={creative.offer} onChange={(e) => setCreative((c) => ({ ...c, offer: e.target.value }))} />
                  </Field>
                  <Field label="Reward">
                    <Input value={creative.reward} onChange={(e) => setCreative((c) => ({ ...c, reward: e.target.value }))} />
                  </Field>
                  <Field label="Code">
                    <Input value={creative.code} onChange={(e) => setCreative((c) => ({ ...c, code: e.target.value }))} />
                  </Field>
                  <Field label="Survey question">
                    <Input value={creative.question} onChange={(e) => setCreative((c) => ({ ...c, question: e.target.value }))} />
                  </Field>
                </div>
                <Field label="Options (one per line, for menus/surveys)">
                  <Textarea
                    value={creative.options}
                    onChange={(e) => setCreative((c) => ({ ...c, options: e.target.value }))}
                  />
                </Field>
              </Card>

              <Card>
                <CardHead
                  title="Language"
                  sub="Machine variants are drafts — human review is required before use."
                  action={
                    Object.keys(variants).length > 0 ? (
                      <Button size="sm" variant="ghost" onClick={regenerateVariants}>
                        Regenerate
                      </Button>
                    ) : undefined
                  }
                />
                <div data-testid="language-chips">
                  <ChipWrap>
                    {LANGUAGES.map((l) => (
                      <Chip key={l} active={activeLang === l} onToggle={() => selectLanguage(l)}>
                        {LANGUAGE_LABELS[l]}
                        {langBusy === l ? ' …' : ''}
                      </Chip>
                    ))}
                  </ChipWrap>
                </div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="tly-faint" style={{ fontSize: 11.5 }}>
                    Previewing:
                  </span>
                  <span data-testid="language-active">
                    <Badge tone="info">{LANGUAGE_LABELS[activeLang]}</Badge>
                  </span>
                  {activeLang !== 'en' && (
                    <Badge tone="warning">
                      {(activeVariant?.status ?? 'REVIEW_REQUIRED').replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                {activeLang !== 'en' && (
                  <div className="tly-faint" style={{ fontSize: 11, marginTop: 8 }}>
                    Human review required before this variant can go live.
                  </div>
                )}
                {campaignLangs.length > 1 && (
                  <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                    {(Object.keys(variants) as LanguageCode[]).map((l) => {
                      const v = variants[l]!;
                      return (
                        <div key={l} style={{ border: '1px solid var(--tly-border-soft)', borderRadius: 8, padding: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <strong style={{ fontSize: 12.5 }}>{LANGUAGE_LABELS[l]}</strong>
                            <Badge tone="warning">{v.status.replace('_', ' ')}</Badge>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--tly-text-dim)', lineHeight: 1.45 }}>{v.body}</div>
                          {v.cta && (
                            <div className="tly-faint" style={{ fontSize: 11, marginTop: 4 }}>
                              CTA: {v.cta}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </>
          )}

          {step === 5 && (
            <Card>
              <CardHead title="Review & submit" />
              <ReviewRow k="Name" v={name} />
              <ReviewRow k="Objective" v={objective} />
              <ReviewRow k="Capabilities" v={`${selectedCaps.length}: ${selectedCaps.map((c) => c.name).join(', ') || '—'}`} />
              <ReviewRow k="Primary format (persisted)" v={primaryFormatId()} />
              <ReviewRow k="Languages" v={campaignLangs.map((l) => LANGUAGE_LABELS[l]).join(', ')} />
              {tooNarrow ? (
                <ReviewRow k="Audience" v="Too narrow — broaden targeting" />
              ) : (
                <>
                  <ReviewRow k="Eligible audience" v={compactNumber(eligible)} />
                  <ReviewRow k="Selected target" v={compactNumber(match?.selectedTarget ?? displayTarget)} />
                  <ReviewRow
                    k="Forecast unique reach"
                    v={
                      match
                        ? `${compactNumber(match.forecastReach.point)} (${compactNumber(match.forecastReach.low)}–${compactNumber(match.forecastReach.high)})`
                        : '—'
                    }
                  />
                  <ReviewRow k="Estimated frequency" v={`${(match?.frequency ?? 0).toFixed(1)}×`} />
                  <ReviewRow
                    k="Estimated cost"
                    v={formatMoney({ minor: match?.estimatedCostMinor ?? 0, currency: 'NGN' })}
                  />
                </>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Button variant="ghost" onClick={() => create(false)} disabled={busy}>
                  Save draft
                </Button>
                <Button onClick={() => create(true)} disabled={busy}>
                  {busy ? 'Submitting…' : 'Submit for approval'}
                </Button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--tly-text-faint)', lineHeight: 1.5, marginTop: 12 }}>
                {NETWORK_DISCLAIMER}
              </div>
            </Card>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
              ← Back
            </Button>
            {step < 5 && (
              <Button disabled={step === 2 && selectedIds.length === 0} onClick={() => setStep((s) => s + 1)}>
                Next →
              </Button>
            )}
          </div>
        </div>

        {/* ── Right column: live multi-format preview ───────────────────────── */}
        <div>
          <Card>
            <CardHead title="Live experience preview" sub="Switch capability to preview each surface." />
            {selectedCaps.length === 0 ? (
              <div className="tly-empty">Select capabilities to preview the subscriber experience.</div>
            ) : (
              <>
                <div data-testid="preview-tabs" style={{ marginBottom: 12 }}>
                  <ChipWrap>
                    {selectedCaps.map((c) => (
                      <Chip key={c.id} active={activePreviewId === c.id} onToggle={() => setActivePreviewId(c.id)}>
                        {c.name}
                      </Chip>
                    ))}
                  </ChipWrap>
                </div>
                {activePreviewCap && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Badge tone={STATUS_TONE[activePreviewCap.defaultNetworkStatus]}>
                        {CAPABILITY_STATUS_LABELS[activePreviewCap.defaultNetworkStatus]}
                      </Badge>
                      <Badge tone="info">{LANGUAGE_LABELS[activeLang]}</Badge>
                    </div>
                    <div data-testid="experience-preview" style={{ display: 'flex', justifyContent: 'center' }}>
                      <ExperiencePreview
                        renderer={activePreviewCap.previewRenderer}
                        content={buildContent(activePreviewCap, creative, activeVariant)}
                        device={activePreviewCap.deviceClass === 'feature_phone' ? 'feature_phone' : 'smartphone'}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </Card>

          {match && !tooNarrow && (
            <Card>
              <CardHead title="Audience snapshot" sub="Demonstration estimate" />
              <div style={{ fontFamily: 'var(--tly-font-display)', fontSize: 24, fontWeight: 600 }}>
                {compactNumber(eligible)}
              </div>
              <div className="tly-faint" style={{ fontSize: 12 }}>
                eligible · target {compactNumber(match.selectedTarget)} · reach {compactNumber(match.forecastReach.point)}
              </div>
            </Card>
          )}
        </div>
      </div>
    </PortalShell>
  );
}

function CriteriaGroup({
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

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ border: '1px solid var(--tly-border-soft)', borderRadius: 10, padding: '10px 12px' }}>
      <div className="tly-faint" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--tly-font-display)', fontSize: 20, fontWeight: 600 }}>{value}</div>
      {sub && (
        <div className="tly-faint" style={{ fontSize: 11 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function ReviewRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        padding: '8px 0',
        borderBottom: '1px solid var(--tly-border-soft)',
        fontSize: 12.5,
      }}
    >
      <span className="tly-faint">{k}</span>
      <span style={{ textAlign: 'right' }}>{v}</span>
    </div>
  );
}
