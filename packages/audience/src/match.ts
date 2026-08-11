import type {
  AudienceMatchInput,
  AudienceMatchResult,
  FormatEstimate,
  FunnelStage,
  MatchCapabilityInput,
} from '@telyad/types';

/**
 * Deterministic aggregate audience-match estimator (demonstration modelling).
 *
 * Same input → same result. No individual subscribers are created. Behind this
 * function is the seam a real privacy-safe MTN aggregate audience service would
 * replace. Three metrics stay distinct: eligibleAudience, selectedTarget,
 * forecastReach.
 */

export const ESTIMATOR_VERSION = 'demo-1';
const DEFAULT_BASE_POOL = 78_400_000; // MTN Nigeria demo addressable base
const PRIVACY_THRESHOLD = 50_000; // minimum aggregate audience we will size

function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
const unit = (seed: string): number => hash32(seed) / 0xffffffff;

/** Narrowing factor for a selected dimension against an approximate universe. */
function narrow(selected: string[], universe: number): number {
  if (selected.length === 0) return 1;
  return Math.max(0.05, Math.min(1, selected.length / universe));
}

/** Per-capability deterministic reach weight (0.35–0.95 of the criteria pool). */
function reachWeight(id: string): number {
  return 0.35 + unit(id + ':reach') * 0.6;
}

/** Effective cost per forecast subscriber (minor units) by pricing model. */
function rateMinor(model: string): number {
  switch (model.toUpperCase()) {
    case 'CPM':
      return 30; // ~₦0.30 / delivered subscriber
    case 'CPC':
      return 120;
    case 'CPA':
      return 900;
    case 'CPL':
      return 1500;
    case 'CPD':
      return 45;
    case 'REVSHARE':
      return 60;
    case 'FIXED':
      return 25;
    default:
      return 40;
  }
}

function deviceCompatible(cap: MatchCapabilityInput, devices: string[]): boolean {
  if (devices.length === 0) return true; // no device constraint chosen
  if (cap.deviceClass === 'both') return true;
  return devices.includes(cap.deviceClass);
}

export function estimateAudienceMatch(input: AudienceMatchInput): AudienceMatchResult {
  const basePool = input.basePool ?? DEFAULT_BASE_POOL;
  const c = input.criteria;

  // ── Funnel: base → geography → age → device → audience criteria ────────────
  const afterGeo = Math.round(basePool * narrow(c.geographies, 37));
  const afterAge = Math.round(afterGeo * narrow(c.ageBands, 6));
  // Device narrowing: choosing a subset of {smartphone, feature_phone} narrows.
  const deviceFactor = c.devices.length === 0 || c.devices.length >= 2 ? 1 : 0.58;
  const afterDevice = Math.round(afterAge * deviceFactor);
  const criteriaCount =
    c.dataUse.length + c.spendBands.length + c.affinities.length + c.engagement.length;
  const criteriaFactor = criteriaCount === 0 ? 1 : Math.max(0.25, 1 - criteriaCount * 0.08);
  const afterCriteria = Math.round(afterDevice * criteriaFactor);

  // ── Format eligibility: pool reachable by at least one selected capability ──
  const compatCaps = input.capabilities.filter((cap) => deviceCompatible(cap, c.devices));
  const maxWeight = compatCaps.reduce((m, cap) => Math.max(m, reachWeight(cap.id)), 0);
  const eligibleAudience = Math.round(afterCriteria * maxWeight);

  const funnel: FunnelStage[] = [
    { stage: 'Addressable demo base', value: basePool },
    { stage: 'Geography', value: afterGeo },
    { stage: 'Age band', value: afterAge },
    { stage: 'Device', value: afterDevice },
    { stage: 'Audience criteria', value: afterCriteria },
    { stage: 'Format eligibility', value: eligibleAudience },
  ];

  const tooNarrow = eligibleAudience < PRIVACY_THRESHOLD;

  // ── Selected target (clamped to eligible) ──────────────────────────────────
  const requested = input.selectedTarget ?? Math.round(eligibleAudience * 0.4);
  const selectedTarget = Math.max(0, Math.min(requested, eligibleAudience));

  // ── Per-format eligible + allocation (proportional to reach weight) ─────────
  const weights = input.capabilities.map((cap) => ({
    cap,
    compatible: deviceCompatible(cap, c.devices),
    w: deviceCompatible(cap, c.devices) ? reachWeight(cap.id) : 0,
  }));
  const wsum = weights.reduce((s, x) => s + x.w, 0) || 1;

  const perFormat: FormatEstimate[] = weights.map(({ cap, compatible, w }) => {
    const eligible = Math.round(afterCriteria * (compatible ? reachWeight(cap.id) : 0));
    const allocation = Math.round(selectedTarget * (w / wsum));
    const delivery = 0.85 + unit(cap.id + ':deliver') * 0.1; // 85–95%
    const forecast = Math.round(allocation * delivery);
    const costMinor = forecast * rateMinor(cap.pricingModel);
    return {
      capabilityId: cap.id,
      name: cap.name,
      eligible,
      allocation,
      forecast,
      pricingModel: cap.pricingModel,
      costMinor,
      compatible,
    };
  });

  // ── Unique forecast reach (aggregate overlap approximation) ─────────────────
  // Not a sum: subscribers reachable by multiple formats overlap. Estimate via
  // complement product against the selected target.
  const target = selectedTarget || 1;
  let missProb = 1;
  for (const f of perFormat) missProb *= 1 - Math.min(1, f.forecast / target);
  const point = Math.round(target * (1 - missProb));
  const forecastReach = {
    low: Math.round(point * 0.95),
    point,
    high: Math.min(selectedTarget, Math.round(point * 1.05)),
  };

  const totalImpressions = perFormat.reduce((s, f) => s + f.forecast, 0);
  const frequency = point > 0 ? Math.round((totalImpressions / point) * 10) / 10 : 0;
  const estimatedCostMinor = perFormat.reduce((s, f) => s + f.costMinor, 0);

  return {
    estimatorVersion: ESTIMATOR_VERSION,
    basePool,
    funnel,
    eligibleAudience,
    selectedTarget,
    forecastReach,
    frequency,
    estimatedCostMinor,
    perFormat,
    privacy: { threshold: PRIVACY_THRESHOLD, tooNarrow },
    currency: 'NGN',
  };
}
