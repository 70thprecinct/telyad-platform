'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CAMPAIGN_OBJECTIVES,
  compactNumber,
  type AudienceDefinition,
  type CampaignObjective,
  type CreateCampaignRequest,
  type PricingModel,
} from '@telyad/types';
import { getFormat } from '@telyad/ad-formats';
import { estimateAudience } from '@telyad/audience';
import {
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
  { n: 1, label: 'Product' },
  { n: 2, label: 'STK Creative' },
  { n: 3, label: 'Audience' },
  { n: 4, label: 'Commercial' },
  { n: 5, label: 'Review' },
];

const GEO = ['Lagos', 'Abuja FCT', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'Anambra', 'Delta'];
const AGES = ['18-24', '25-34', '30-44', '45-54', '55+'];
const INTERESTS = ['automotive', 'travel', 'business', 'sports', 'entertainment', 'finance', 'shopping', 'news'];
const TIERS = ['premium', 'standard', 'basic'];
const ARPU = ['very_high', 'high', 'medium', 'low'];
const EXCLUSIONS = ['dnd', 'recent_subscribers', 'high_churn'];

// TelyDial is an STK-led MVAS acquisition module — the format is fixed.
const FORMAT_ID = 'stk' as const;
const STK_PRICING: PricingModel[] = ['CPA', 'CPM'];

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
  const [productId, setProductId] = useState('');
  const [name, setName] = useState('MTN Caller Tunez Acquisition');
  const [objective, setObjective] = useState<CampaignObjective>('Acquisition');
  const [creative, setCreative] = useState<Record<string, string>>({});
  const [audience, setAudience] = useState<AudienceDefinition>(emptyAudience);
  const [pricingModel, setPricingModel] = useState<PricingModel>('CPA');
  const [dailyCap, setDailyCap] = useState(50_000_00);
  const [total, setTotal] = useState(500_000_00);
  const [startDate, setStartDate] = useState('2026-08-14');
  const [endDate, setEndDate] = useState('2026-08-28');
  const [busy, setBusy] = useState(false);

  const format = getFormat(FORMAT_ID)!;
  const estimate = useMemo(() => estimateAudience(audience), [audience]);

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
      formatId: FORMAT_ID,
      audience,
      creativeFields: { ...creative, productId },
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
      router.push('/campaigns');
    } catch (e) {
      toast('Could not create campaign', e instanceof ApiError ? e.message : 'Unexpected error', 'danger');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell active="campaigns/new">
      <PageHeader
        eyebrow="Create · STK acquisition"
        title="New MVAS campaign"
        desc="Launch an STK Push acquisition campaign for an MTN VAS product. Reach figures are aggregate estimates."
      />
      <Stepper steps={STEPS} current={step} />

      <div className="tly-grid-2">
        <div>
          {step === 1 && (
            <Card>
              <CardHead title="MVAS product" sub="Which MTN VAS product is this campaign acquiring for?" />
              <Field label="MTN Product ID" hint="The VAS product identifier on MTN Nigeria (e.g. MTN-CALLER-TUNEZ-001).">
                <Input
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="MTN-CALLER-TUNEZ-001"
                />
              </Field>
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
              <CardHead title={`${format.name} creative`} sub="These fields build the live STK preview." />
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
              <CardHead title="Commercial & budget" sub="STK acquisition bills on CPA or CPM." />
              <Field label="Pricing model">
                <Select
                  value={pricingModel}
                  onChange={(e) => setPricingModel(e.target.value as PricingModel)}
                  options={STK_PRICING.map((p) => ({ value: p, label: p }))}
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
              <ReviewRow k="MTN Product ID" v={productId || '—'} />
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
            <CardHead title="Live STK preview" />
            <PhonePreview formatId={FORMAT_ID} fields={creative} />
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
