'use client';
import { useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  compactNumber,
  type AudienceDefinition,
  type CreateCampaignRequest,
  type PricingModel,
} from '@telyad/types';
import { estimateAudience } from '@telyad/audience';
import { Button, Card, CardHead, Field, Input, PageHeader, Select, Stepper, useToast } from '@telyad/ui';
import { PortalShell } from '@/components/PortalShell';
import { EmojiField } from '@/components/EmojiField';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import {
  ARPU_BANDS,
  CATEGORIES,
  CTA_PRESETS,
  COMMERCIAL_MODELS,
  DEMO_NOTE,
  EXT_NOTE,
  LANGUAGES,
  LOCATION_MODES,
  NETWORK_TYPES,
  STATES,
  verifyProductId,
  type DemoProduct,
} from '@/lib/demo';

const STEPS = [
  { n: 1, label: 'Product' },
  { n: 2, label: 'Creative' },
  { n: 3, label: 'Audience' },
  { n: 4, label: 'Commercial' },
  { n: 5, label: 'Review' },
];

const FORMAT_ID = 'stk' as const;
const arpuKey = (v: string) => v.toLowerCase().replace(/\s+/g, '_');
const netKey = (v: string) => v.toLowerCase().replace(/\s+/g, '_');

export default function NewCampaignPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);

  // Step 1 — product verification (deterministic demo registry seam)
  const [productId, setProductId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [product, setProduct] = useState<DemoProduct | null>(null);
  const [verifyErr, setVerifyErr] = useState(false);

  // Step 2 — creative
  const [name, setName] = useState('');
  const [internalRef, setInternalRef] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [body, setBody] = useState('');
  const [cta, setCta] = useState('Subscribe');
  const [sms, setSms] = useState('');
  const [device, setDevice] = useState<'android' | 'ios'>('android');

  // Step 3 — audience
  const [categories, setCategories] = useState<string[]>([]);
  const [arpu, setArpu] = useState<string>('');
  const [network, setNetwork] = useState<string>('All');
  const [language, setLanguage] = useState('All languages');
  const [locMode, setLocMode] = useState('National');
  const [states, setStates] = useState<string[]>([]);

  // Step 4 — commercial / budget (naira, converted to minor on submit)
  const [pricingModel, setPricingModel] = useState<PricingModel>('CPA');
  const [daily, setDaily] = useState(25000);
  const [total, setTotal] = useState(500000);
  const [priority, setPriority] = useState('Standard');
  const [speed, setSpeed] = useState('Normal');
  const [startDate, setStartDate] = useState('2026-08-24');
  const [endDate, setEndDate] = useState('2026-09-24');
  const [busy, setBusy] = useState(false);

  const audience: AudienceDefinition = useMemo(
    () => ({
      geographies: locMode === 'By state' ? states : [],
      ageBands: [],
      genders: ['all'],
      deviceTypes: [],
      subscriberTiers: [],
      interests: categories.map((c) => c.toLowerCase()),
      arpuBands: arpu ? [arpuKey(arpu)] : [],
      networkTypes: network && network !== 'All' ? [netKey(network)] : [],
      languages: language !== 'All languages' ? [language.toLowerCase()] : [],
      exclusions: ['dnd'],
    }),
    [locMode, states, categories, arpu, network, language],
  );
  const estimate = useMemo(() => estimateAudience(audience), [audience]);
  const forecastOptIns = Math.round(estimate.estimatedReach * (0.06 + estimate.qualityScore / 2000));
  const forecastCpa = pricingModel === 'CPA' ? 34 + (100 - estimate.qualityScore) / 8 : 30;

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function doVerify() {
    if (!productId.trim()) return;
    setVerifying(true);
    setVerifyErr(false);
    setProduct(null);
    // Deterministic demo lookup (no live MTN registry). Small delay to show state.
    const found = verifyProductId(productId);
    window.setTimeout(() => {
      setVerifying(false);
      if (found) {
        setProduct(found);
        if (!serviceName) setServiceName(found.name);
      } else {
        setVerifyErr(true);
      }
    }, 700);
  }

  const canLeaveStep1 = !!product;

  async function submit() {
    if (!user?.advertiserId || !user.telcoId) {
      toast('Not signed in', 'Please sign in again.', 'danger');
      return;
    }
    setBusy(true);
    const payload: CreateCampaignRequest = {
      advertiserId: user.advertiserId,
      telcoId: user.telcoId,
      name: name || `${product?.name ?? 'MVAS'} acquisition`,
      objective: 'Acquisition',
      formatId: FORMAT_ID,
      audience,
      creativeFields: {
        // Required STK schema keys (validated server-side):
        menuTitle: (serviceName || product?.name || 'MVAS').slice(0, 20),
        serviceName: serviceName || product?.name || 'MVAS service',
        body: body || `Subscribe to ${product?.name ?? 'this service'}.`,
        option1: cta || 'Subscribe',
        option2: 'No thanks',
        // Extra TelyDial fields (ignored by validation, retained on the record):
        productId: product?.id ?? productId,
        cta,
        sms,
        internalRef,
      },
      budget: {
        pricingModel,
        dailyCap: { minor: daily * 100, currency: 'NGN' },
        total: { minor: total * 100, currency: 'NGN' },
        startDate,
        endDate,
        deliverySpeed: 'standard',
      },
    };
    try {
      const { campaign } = await api.createCampaign(payload);
      await api.submitCampaign(campaign.id);
      toast('Submitted for approval', 'MTN Nigeria will review this campaign.', 'success');
      router.push(`/campaigns/${campaign.id}`);
    } catch (e) {
      toast('Could not submit', e instanceof ApiError ? e.message : 'Unexpected error', 'danger');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell active="campaigns/new">
      <PageHeader
        eyebrow="Create · STK acquisition"
        title="New MVAS campaign"
        desc="Acquire subscribers for an MTN VAS product through a network-controlled STK experience. Reach and forecast figures are aggregate estimates."
      />
      <Stepper steps={STEPS} current={step} />

      {/* STEP 1 — PRODUCT VERIFICATION */}
      {step === 1 && (
        <Card>
          <CardHead title="Product verification" sub="Enter your MTN-assigned Product ID. Service details come from the MTN registry (demonstration seam)." />
          <div style={{ maxWidth: 460 }}>
            <Field label="MTN Product ID" hint="Assigned by MTN Nigeria during service onboarding.">
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  value={productId}
                  onChange={(e) => { setProductId(e.target.value); setProduct(null); setVerifyErr(false); }}
                  placeholder="e.g. MTN-89012"
                  data-testid="product-id"
                  style={{ fontFamily: 'var(--tly-font-mono, monospace)' }}
                />
                <Button onClick={doVerify} disabled={verifying} data-testid="verify-btn">
                  {verifying ? 'Verifying…' : 'Verify'}
                </Button>
              </div>
            </Field>
            <div className="tly-faint" style={{ fontSize: 10.5, marginTop: 4 }}>
              Known demo IDs: MTN-89012, MTN-45678, MTN-23456, MTN-34567, MTN-12345. {EXT_NOTE}
            </div>
          </div>

          {product && (
            <div
              data-testid="verify-ok"
              style={{ marginTop: 16, padding: 14, borderRadius: 10, background: 'var(--tly-success-dim)', border: '1px solid var(--tly-success)' }}
            >
              <div style={{ fontWeight: 600, marginBottom: 10, color: 'var(--tly-success)' }}>✓ Product verified</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 12 }}>
                {([
                  ['Product name', product.name], ['Category', product.category], ['Subscription type', product.type],
                  ['Network', product.network], ['Tariff', product.tariff], ['Billing model', product.billing],
                  ['Provider', product.provider], ['Status', product.status], ['Product ID', product.id],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k}><div className="tly-faint" style={{ fontSize: 10 }}>{k}</div><div style={{ fontWeight: 500 }}>{v}</div></div>
                ))}
              </div>
            </div>
          )}
          {verifyErr && (
            <div data-testid="verify-err" style={{ marginTop: 16, padding: 14, borderRadius: 10, background: 'var(--tly-warning-dim)', border: '1px solid var(--tly-warning)', fontSize: 12, color: 'var(--tly-warning)' }}>
              Product not found. <strong>{productId}</strong> is not a registered MTN Product ID. Unverified IDs are never treated as network-approved. Live registry lookup requires MTN integration.
            </div>
          )}

          <WizardNav
            onBack={undefined}
            onNext={() => setStep(2)}
            nextLabel="Continue"
            nextDisabled={!canLeaveStep1}
          />
        </Card>
      )}

      {/* STEP 2 — CREATIVE + DEVICE PREVIEW */}
      {step === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 210px', gap: 12, alignItems: 'start' }} className="tly-creative-grid">
          <Card>
            <CardHead title="Creative builder" sub="Compose the STK push. The handset preview updates as you type." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Campaign name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="World Cup Predictor Q3" data-testid="cr-name" /></Field>
              <Field label="Internal reference"><Input value={internalRef} onChange={(e) => setInternalRef(e.target.value)} placeholder="SOKA-2026-Q3" /></Field>
            </div>
            <Field label="Service name — top line of the push" hint="Max 32 characters">
              <EmojiField value={serviceName} onChange={(v) => setServiceName(v.slice(0, 32))} placeholder="e.g. World Cup Predictor" maxLength={32} data-testid="cr-sn" />
            </Field>
            <Field label={`Body copy — ${body.length}/160 characters`}>
              <EmojiField value={body} onChange={(v) => setBody(v.slice(0, 160))} multiline maxLength={160} placeholder="e.g. Predict scores. WIN up to ₦4.65M! Press Subscribe to play now." data-testid="cr-body" />
            </Field>
            <Group label="Accept button label">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }} data-testid="cta-presets">
                {CTA_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCta(c)}
                    style={{
                      padding: '4px 11px', borderRadius: 14, fontSize: 11, cursor: 'pointer',
                      border: cta === c ? '1.5px solid var(--tly-primary)' : '1px solid var(--tly-border)',
                      background: cta === c ? 'var(--tly-primary-dim)' : 'var(--tly-card)',
                      color: cta === c ? 'var(--tly-accent-ink)' : 'var(--tly-text-dim)', fontWeight: cta === c ? 600 : 400,
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <Input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Custom label…" data-testid="cr-cta" />
            </Group>
            <Field label="SMS fallback — for non-STK handsets" hint="Delivered only where STK is unavailable. Live fallback delivery requires gateway integration.">
              <EmojiField value={sms} onChange={setSms} multiline rows={2} placeholder="World Cup Predictor: Predict scores. WIN up to ₦4.65M! Reply YES to subscribe." data-testid="cr-sms" />
            </Field>
            <WizardNav onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Continue" />
          </Card>

          <DevicePreview device={device} setDevice={setDevice} serviceName={serviceName} body={body} cta={cta} />
        </div>
      )}

      {/* STEP 3 — AUDIENCE */}
      {step === 3 && (
        <Card>
          <CardHead title="Audience targeting" sub="Define who receives the STK push. Existing subscribers are auto-excluded by Product ID. Aggregate segments only — no subscriber identities." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="tly-aud-grid">
            <div>
              <Group label="Target category">
                <ChipRow options={CATEGORIES} selected={categories} onToggle={(v) => toggle(categories, setCategories, v)} testid="cat-chips" />
              </Group>
            </div>
            <div>
              <Group label="ARPU band"><ToggleRow options={ARPU_BANDS} value={arpu} onSelect={setArpu} /></Group>
              <Group label="Network type"><ToggleRow options={NETWORK_TYPES} value={network} onSelect={setNetwork} /></Group>
              <Field label="Language preference">
                <Select value={language} onChange={(e) => setLanguage(e.target.value)} options={LANGUAGES.map((l) => ({ value: l, label: l }))} />
              </Field>
            </div>
          </div>
          <Group label="Location targeting">
            <ToggleRow options={LOCATION_MODES} value={locMode} onSelect={setLocMode} />
          </Group>
          {locMode === 'By state' && (
            <div style={{ marginTop: 8 }}>
              <ChipRow options={STATES} selected={states} onToggle={(v) => toggle(states, setStates, v)} testid="state-chips" />
            </div>
          )}
          <EstimateBox estimate={estimate} forecastOptIns={forecastOptIns} forecastCpa={forecastCpa} pricingModel={pricingModel} />
          <WizardNav onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Continue" />
        </Card>
      )}

      {/* STEP 4 — COMMERCIAL / BUDGET */}
      {step === 4 && (
        <Card>
          <CardHead title="Commercial & budget" sub="Choose a pricing model and set spend. No real charge occurs in this demonstration." />
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }} data-testid="model-cards">
            {COMMERCIAL_MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPricingModel(m.id)}
                style={{
                  flex: 1, minWidth: 220, textAlign: 'left', padding: 13, borderRadius: 9, cursor: 'pointer',
                  border: pricingModel === m.id ? '1.5px solid var(--tly-primary)' : '1px solid var(--tly-border)',
                  background: pricingModel === m.id ? 'var(--tly-primary-dim)' : 'var(--tly-card)',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 3, color: pricingModel === m.id ? 'var(--tly-accent-ink)' : 'var(--tly-text)' }}>{m.title}</div>
                <div className="tly-faint" style={{ fontSize: 11 }}>{m.desc}</div>
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Daily spend limit (₦)"><Input type="number" value={daily} onChange={(e) => setDaily(Number(e.target.value) || 0)} data-testid="b-daily" /></Field>
            <Field label="Campaign budget (₦)"><Input type="number" value={total} onChange={(e) => setTotal(Number(e.target.value) || 0)} data-testid="b-total" /></Field>
            <Group label="Campaign priority"><ToggleRow options={['Standard', 'High', 'Premium']} value={priority} onSelect={setPriority} /></Group>
            <Group label="Delivery speed"><ToggleRow options={['Normal', 'Accelerated', 'Even']} value={speed} onSelect={setSpeed} /></Group>
            <Field label="Start date"><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Field>
            <Field label="End date"><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></Field>
          </div>
          <BudgetImpact daily={daily} total={total} forecastOptIns={forecastOptIns} forecastCpa={forecastCpa} />
          <WizardNav onBack={() => setStep(3)} onNext={() => setStep(5)} nextLabel="Review campaign" />
        </Card>
      )}

      {/* STEP 5 — REVIEW & SUBMIT */}
      {step === 5 && (
        <Card>
          <CardHead title="Review & submit" sub="After submission the campaign enters the MTN Nigeria approval queue." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }} data-testid="review-grid">
            <ReviewSection title="Product" rows={[['Product ID', product?.id ?? '—'], ['Service name', product?.name ?? '—'], ['Category', product?.category ?? '—'], ['Status', product?.status ?? '—']]} onEdit={() => setStep(1)} />
            <ReviewSection title="Creative" rows={[['Campaign name', name || '—'], ['Service title', serviceName || '—'], ['Accept button', cta], ['SMS fallback', sms ? 'Configured' : 'Not set']]} onEdit={() => setStep(2)} />
            <ReviewSection title="Audience" rows={[['Categories', categories.length ? categories.join(', ') : 'All'], ['Location', locMode === 'By state' ? (states.join(', ') || 'By state') : locMode], ['ARPU band', arpu || 'All'], ['Network', network]]} onEdit={() => setStep(3)} />
            <ReviewSection title="Commercial" rows={[['Pricing model', pricingModel], ['Daily limit', `₦${daily.toLocaleString()}`], ['Campaign budget', `₦${total.toLocaleString()}`], ['Schedule', `${startDate} → ${endDate}`]]} onEdit={() => setStep(4)} />
          </div>

          <div style={{ marginTop: 14, padding: 13, borderRadius: 10, background: 'var(--tly-success-dim)', border: '1px solid var(--tly-success)' }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--tly-success)' }}>Forecast (demonstration)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, textAlign: 'center' }}>
              <Metric v={`${compactNumber(estimate.reachLow)}–${compactNumber(estimate.reachHigh)}`} k="Est. reach" />
              <Metric v={compactNumber(estimate.estimatedReach)} k="Est. pushes" />
              <Metric v={compactNumber(forecastOptIns)} k="Expected opt-ins" />
              <Metric v={`${estimate.qualityScore}/100`} k="Quality score" />
            </div>
          </div>

          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--tly-primary-dim)', display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
            <span>Wallet balance available</span><strong>₦450,000</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, gap: 10 }}>
            <Button variant="ghost" onClick={() => setStep(4)}>← Back</Button>
            <Button onClick={submit} disabled={busy} data-testid="submit-campaign">
              {busy ? 'Submitting…' : 'Submit for approval'}
            </Button>
          </div>
        </Card>
      )}

      <div className="tly-faint" style={{ fontSize: 11, marginTop: 12 }}>
        {DEMO_NOTE} The submitted campaign is REAL — persisted via the platform API and routed to telco approval. {EXT_NOTE}
      </div>
    </PortalShell>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────
// Labelled group for MULTIPLE controls (chips/toggles). Unlike Field it does not
// wrap children in a <label> — wrapping many buttons in one label pollutes their
// accessible names and is invalid a11y.
function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="tly-field">
      <span className="tly-field-label">{label}</span>
      {children}
    </div>
  );
}

function WizardNav({ onBack, onNext, nextLabel, nextDisabled }: { onBack?: () => void; onNext: () => void; nextLabel: string; nextDisabled?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
      {onBack ? <Button variant="ghost" onClick={onBack}>← Back</Button> : <span />}
      <Button onClick={onNext} disabled={nextDisabled} data-testid="wizard-next">{nextLabel} →</Button>
    </div>
  );
}

function ChipRow({ options, selected, onToggle, testid }: { options: string[]; selected: string[]; onToggle: (v: string) => void; testid?: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }} data-testid={testid}>
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button key={o} type="button" onClick={() => onToggle(o)} style={{
            padding: '3px 10px', borderRadius: 14, fontSize: 11, cursor: 'pointer',
            border: on ? '1.5px solid var(--tly-primary)' : '1px solid var(--tly-border)',
            background: on ? 'var(--tly-primary-dim)' : 'var(--tly-card)',
            color: on ? 'var(--tly-accent-ink)' : 'var(--tly-text-dim)', fontWeight: on ? 600 : 400,
          }}>{o}</button>
        );
      })}
    </div>
  );
}

function ToggleRow({ options, value, onSelect }: { options: string[]; value: string; onSelect: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map((o) => {
        const on = value === o;
        return (
          <button key={o} type="button" onClick={() => onSelect(o)} style={{
            flex: 1, padding: '6px 0', borderRadius: 6, fontSize: 10.5, cursor: 'pointer', textAlign: 'center',
            border: on ? '1.5px solid var(--tly-primary)' : '1px solid var(--tly-border)',
            background: on ? 'var(--tly-primary-dim)' : 'var(--tly-card)',
            color: on ? 'var(--tly-accent-ink)' : 'var(--tly-text-dim)', fontWeight: on ? 600 : 400,
          }}>{o}</button>
        );
      })}
    </div>
  );
}

function DevicePreview({ device, setDevice, serviceName, body, cta }: { device: 'android' | 'ios'; setDevice: (d: 'android' | 'ios') => void; serviceName: string; body: string; cta: string }) {
  const title = serviceName || 'Service name';
  const msg = body || 'Your message will appear here exactly as subscribers will see it on their handset.';
  const accept = cta || 'Subscribe';
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div className="tly-faint" style={{ fontSize: 9, letterSpacing: '.07em', textTransform: 'uppercase' }}>Live preview</div>
        <div style={{ display: 'flex', gap: 4, width: '100%', background: 'var(--tly-primary-dim)', borderRadius: 8, padding: 3 }} data-testid="device-tabs">
          {(['android', 'ios'] as const).map((d) => (
            <button key={d} type="button" onClick={() => setDevice(d)} data-testid={`device-${d}`} style={{
              flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 10.5, border: 'none', cursor: 'pointer', textTransform: 'capitalize',
              background: device === d ? 'var(--tly-card)' : 'transparent', color: device === d ? 'var(--tly-text)' : 'var(--tly-text-dim)', fontWeight: device === d ? 600 : 400,
              boxShadow: device === d ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
            }}>{d === 'android' ? 'Android' : 'iOS'}</button>
          ))}
        </div>

        {device === 'android' ? (
          <div data-testid="preview-android" style={{ width: 166, height: 300, background: '#0f172a', borderRadius: 24, border: '4px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 46, height: 10, background: '#1e293b', borderRadius: '0 0 8px 8px' }} />
            <div style={{ width: '83%', background: 'rgba(30,41,59,.97)', borderRadius: 9, padding: '12px 11px', textAlign: 'center', border: '0.5px solid rgba(255,255,255,.09)' }}>
              <div data-testid="preview-title" style={{ color: '#f1f5f9', fontSize: 10, fontWeight: 500, marginBottom: 7, wordBreak: 'break-word' }}>{title}</div>
              <div data-testid="preview-body" style={{ color: '#94a3b8', fontSize: 8.5, lineHeight: 1.55, marginBottom: 11, wordBreak: 'break-word' }}>{msg}</div>
              <div style={{ display: 'flex', gap: 5 }}>
                <div style={{ flex: 1, border: '0.5px solid rgba(255,255,255,.1)', color: '#64748b', borderRadius: 5, padding: '5px 0', fontSize: 7.5 }}>Cancel</div>
                <div data-testid="preview-accept" style={{ flex: 1, background: 'var(--tly-primary)', color: '#fff', borderRadius: 5, padding: '5px 0', fontSize: 7.5 }}>{accept}</div>
              </div>
            </div>
          </div>
        ) : (
          <div data-testid="preview-ios" style={{ width: 166, height: 300, background: '#f2f2f7', borderRadius: 34, border: '5px solid #1c1c1e', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 56, height: 14, background: '#1c1c1e', borderRadius: 20, zIndex: 10 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#1a1a2e,#16213e 45%,#0f3460)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
              <div style={{ width: '100%', background: 'rgba(242,242,247,.95)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,.25)' }}>
                <div style={{ padding: '14px 12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: '#8e8e93', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Configured experience</div>
                  <div data-testid="ios-title" style={{ fontSize: 11, fontWeight: 700, color: '#000', marginBottom: 6, wordBreak: 'break-word' }}>{title}</div>
                  <div data-testid="ios-body" style={{ fontSize: 9, color: '#3c3c43', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg}</div>
                </div>
                <div style={{ height: '0.5px', background: 'rgba(60,60,67,.29)' }} />
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1, padding: '9px 6px', fontSize: 11, textAlign: 'center', color: '#007aff' }}>Cancel</div>
                  <div style={{ width: '0.5px', background: 'rgba(60,60,67,.29)' }} />
                  <div data-testid="ios-accept" style={{ flex: 1, padding: '9px 6px', fontSize: 11, textAlign: 'center', color: '#007aff', fontWeight: 600 }}>{accept}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="tly-faint" style={{ fontSize: 9, textAlign: 'center' }}>
          {device === 'android' ? 'Android STK push' : 'iOS — configured subscriber experience (not native SIM Toolkit)'}
        </div>
        <div style={{ width: '100%', padding: 9, background: 'var(--tly-primary-dim)', borderRadius: 6, fontSize: 9.5, color: 'var(--tly-text-dim)', lineHeight: 1.7 }}>
          <strong style={{ display: 'block', fontSize: 10, color: 'var(--tly-text)' }}>Composition</strong>
          <div>Title: {serviceName.length}/32</div>
          <div>Body: {body.length}/160</div>
          <div>Button: {cta.length}/14</div>
        </div>
      </div>
    </Card>
  );
}

function EstimateBox({ estimate, forecastOptIns, forecastCpa, pricingModel }: { estimate: { estimatedReach: number; reachLow: number; reachHigh: number; excludedForCompliance: number; qualityScore: number }; forecastOptIns: number; forecastCpa: number; pricingModel: PricingModel }) {
  return (
    <div data-testid="audience-estimate" style={{ marginTop: 14, padding: 13, borderRadius: 8, background: 'var(--tly-primary-dim)', border: '1px solid var(--tly-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 500 }}>Estimated audience (forecast · demonstration)</div>
          <div style={{ fontSize: 19, fontWeight: 600, marginTop: 3 }}>{compactNumber(estimate.reachLow)} – {compactNumber(estimate.reachHigh)}</div>
          <div className="tly-faint" style={{ fontSize: 10 }}>eligible subscribers · {compactNumber(estimate.excludedForCompliance)} excluded (DND / existing)</div>
        </div>
        <div style={{ fontSize: 11, textAlign: 'right', lineHeight: 1.8 }}>
          <div>Forecast opt-ins: <strong>{compactNumber(forecastOptIns)}</strong></div>
          <div>Forecast {pricingModel}: <strong>₦{forecastCpa.toFixed(0)}</strong></div>
          <div>Quality score: <strong>{estimate.qualityScore}/100</strong></div>
        </div>
      </div>
    </div>
  );
}

function BudgetImpact({ daily, total, forecastOptIns, forecastCpa }: { daily: number; total: number; forecastOptIns: number; forecastCpa: number }) {
  const wallet = 450000;
  const acquireForBudget = forecastCpa > 0 ? Math.round(total / forecastCpa) : 0;
  const remaining = wallet - total;
  return (
    <div style={{ marginTop: 14, padding: 13, borderRadius: 8, background: 'var(--tly-primary-dim)', border: '1px solid var(--tly-primary)', fontSize: 11.5, lineHeight: 1.9 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Budget impact (forecast · demonstration)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 6 }}>
        <div>Daily spend: <strong>₦{daily.toLocaleString()}</strong></div>
        <div>Campaign budget: <strong>₦{total.toLocaleString()}</strong></div>
        <div>Forecast acquisition: <strong>{compactNumber(Math.min(acquireForBudget, forecastOptIns))}</strong></div>
        <div>Wallet balance: <strong>₦450,000</strong></div>
        <div style={{ color: remaining < 0 ? 'var(--tly-warning)' : undefined }}>
          Balance after: <strong>{remaining < 0 ? `−₦${Math.abs(remaining).toLocaleString()} (exceeds wallet)` : `₦${remaining.toLocaleString()}`}</strong>
        </div>
      </div>
      <div className="tly-faint" style={{ fontSize: 10, marginTop: 4 }}>No real charge occurs in demonstration mode. Charging requires network/billing integration.</div>
    </div>
  );
}

function ReviewSection({ title, rows, onEdit }: { title: string; rows: [string, string][]; onEdit: () => void }) {
  return (
    <div style={{ border: '1px solid var(--tly-border)', borderRadius: 10, padding: 13 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 12 }}>{title}</div>
        <button type="button" onClick={onEdit} style={{ border: 'none', background: 'none', color: 'var(--tly-accent-ink)', fontSize: 11, cursor: 'pointer' }}>Edit</button>
      </div>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--tly-border-soft)', fontSize: 11.5, gap: 12 }}>
          <span className="tly-faint">{k}</span><span style={{ textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function Metric({ v, k }: { v: string; k: string }) {
  return <div><div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div><div style={{ fontSize: 9.5 }} className="tly-faint">{k}</div></div>;
}
