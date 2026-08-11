import { describe, expect, it } from 'vitest';
import type { AudienceMatchInput, MatchCapabilityInput } from '@telyad/types';
import { estimateAudienceMatch } from './match';

const sms: MatchCapabilityInput = {
  id: 'standard_sms',
  name: 'Standard SMS',
  deviceClass: 'both',
  pricingModel: 'CPM',
  networkStatus: 'LIVE',
};
const rcs: MatchCapabilityInput = {
  id: 'rcs_message',
  name: 'RCS Rich Message',
  deviceClass: 'smartphone',
  pricingModel: 'CPM',
  networkStatus: 'INTEGRATION_REQUIRED',
};

const base = (over: Partial<AudienceMatchInput> = {}): AudienceMatchInput => ({
  criteria: {
    geographies: ['Lagos', 'Ogun', 'Oyo'],
    ageBands: ['25-34'],
    devices: ['smartphone', 'feature_phone'],
    dataUse: ['medium'],
    spendBands: [],
    affinities: ['fmcg'],
    engagement: [],
    languages: ['en', 'pcm'],
  },
  capabilities: [sms],
  ...over,
});

describe('audience-match estimator', () => {
  it('is deterministic', () => {
    expect(estimateAudienceMatch(base())).toEqual(estimateAudienceMatch(base()));
  });

  it('keeps eligible ≥ target ≥ forecast and never exceeds eligible', () => {
    const r = estimateAudienceMatch(base({ selectedTarget: 999_999_999 }));
    expect(r.selectedTarget).toBeLessThanOrEqual(r.eligibleAudience);
    expect(r.forecastReach.point).toBeLessThanOrEqual(r.selectedTarget);
  });

  it('geography narrows the eligible audience', () => {
    const national = estimateAudienceMatch(base({ criteria: { ...base().criteria, geographies: [] } }));
    const local = estimateAudienceMatch(base());
    expect(local.eligibleAudience).toBeLessThan(national.eligibleAudience);
  });

  it('device choice changes eligibility (smartphone-only excludes feature-phone caps)', () => {
    const both = estimateAudienceMatch(base({ capabilities: [sms, rcs] }));
    const smartOnly = estimateAudienceMatch(
      base({ capabilities: [sms, rcs], criteria: { ...base().criteria, devices: ['smartphone'] } }),
    );
    // rcs is compatible in both; but smartphone-only narrows the base pool.
    expect(smartOnly.eligibleAudience).toBeLessThan(both.eligibleAudience);
  });

  it('marks a feature-phone-only device mix incompatible with a smartphone capability', () => {
    const r = estimateAudienceMatch(
      base({ capabilities: [rcs], criteria: { ...base().criteria, devices: ['feature_phone'] } }),
    );
    const f = r.perFormat.find((x) => x.capabilityId === 'rcs_message')!;
    expect(f.compatible).toBe(false);
    expect(f.eligible).toBe(0);
  });

  it('adding a capability changes the audience/forecast (format affects audience)', () => {
    const one = estimateAudienceMatch(base({ capabilities: [sms] }));
    const two = estimateAudienceMatch(base({ capabilities: [sms, rcs] }));
    expect(two.perFormat.length).toBe(2);
    expect(two.forecastReach.point).not.toBe(one.forecastReach.point);
  });

  it('multi-format forecast is a unique reach, not a naive sum', () => {
    const r = estimateAudienceMatch(base({ capabilities: [sms, rcs], selectedTarget: 1_000_000 }));
    const naiveSum = r.perFormat.reduce((s, f) => s + f.forecast, 0);
    expect(r.forecastReach.point).toBeLessThan(naiveSum);
    expect(r.frequency).toBeGreaterThanOrEqual(1);
  });

  it('flags too-narrow audiences below the privacy threshold', () => {
    const r = estimateAudienceMatch(
      base({
        basePool: 100_000,
        criteria: {
          ...base().criteria,
          geographies: ['Lagos'],
          ageBands: ['25-34'],
          devices: ['smartphone'],
          affinities: ['fmcg', 'sports', 'travel'],
          dataUse: ['heavy'],
          spendBands: ['very_high'],
          engagement: ['high'],
        },
      }),
    );
    expect(r.privacy.tooNarrow).toBe(true);
  });

  it('recomputes cost when target changes', () => {
    const small = estimateAudienceMatch(base({ selectedTarget: 100_000 }));
    const big = estimateAudienceMatch(base({ selectedTarget: 1_000_000 }));
    expect(big.estimatedCostMinor).toBeGreaterThan(small.estimatedCostMinor);
  });

  it('emits a full funnel ending at the eligible audience', () => {
    const r = estimateAudienceMatch(base());
    expect(r.funnel[0]!.stage).toBe('Addressable demo base');
    expect(r.funnel[r.funnel.length - 1]!.value).toBe(r.eligibleAudience);
  });
});
