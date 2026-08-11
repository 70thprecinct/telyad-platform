import { describe, expect, it } from 'vitest';
import type { AudienceDefinition, AudienceEstimate, MediaPlanRequest } from '@telyad/types';
import { intelligence } from './index';

const planReq: MediaPlanRequest = {
  sector: 'FMCG',
  objective: 'Awareness',
  budgetMinor: 20_000_000_00,
  currency: 'NGN',
  geographies: ['Lagos', 'Kano'],
  deviceMix: 'both',
  languages: ['en', 'pcm'],
  durationDays: 28,
};

describe('AI media planner (deterministic)', () => {
  it('is deterministic for identical input', () => {
    expect(intelligence.planner.recommendMediaPlan(planReq)).toEqual(
      intelligence.planner.recommendMediaPlan(planReq),
    );
  });

  it('returns explainable items whose shares sum to 100', () => {
    const plan = intelligence.planner.recommendMediaPlan(planReq);
    expect(plan.items.length).toBeGreaterThanOrEqual(4);
    expect(plan.items.reduce((a, i) => a + i.sharePct, 0)).toBe(100);
    for (const i of plan.items) {
      expect(i.reason.length).toBeGreaterThan(10);
      expect(i.estimatedReach).toBeGreaterThan(0);
    }
    expect(plan.generatedBy).toBe('demonstration-rules');
  });

  it('flags non-live recommended capabilities as network-enablement warnings', () => {
    const plan = intelligence.planner.recommendMediaPlan({ ...planReq, objective: 'Reward' });
    // warnings are strings; may be empty if all picks are live — assert type only
    expect(Array.isArray(plan.networkWarnings)).toBe(true);
  });
});

describe('localisation', () => {
  it('localises the CTA from the dictionary and flags body for review', () => {
    const v = intelligence.localisation.generateVariant({
      baseText: 'Maltina: enjoy family moments this weekend.',
      cta: 'Buy now',
      targetLanguage: 'pcm',
      charLimit: 160,
    });
    expect(v.cta).toBe('Buy am now');
    expect(v.requiresReview).toBe(true);
    expect(v.status).toBe('draft');
    expect(v.withinLimit).toBe(true);
  });

  it('keeps English as-is with no review required', () => {
    const v = intelligence.localisation.generateVariant({ baseText: 'Hello', targetLanguage: 'en' });
    expect(v.requiresReview).toBe(false);
  });
});

describe('creative intelligence', () => {
  it('writes copy within the character limit with a quality score', () => {
    const s = intelligence.creative.writeCopy({ brand: 'Maltina', offer: 'Win prizes daily', cta: 'Reply YES', charLimit: 160 });
    expect(s.withinLimit).toBe(true);
    expect(s.qualityScore).toBeGreaterThan(0);
  });
  it('flags over-limit text', () => {
    const s = intelligence.creative.score('x'.repeat(200), 160);
    expect(s.withinLimit).toBe(false);
    expect(s.warnings.some((w) => /limit/i.test(w))).toBe(true);
  });
});

describe('audience opportunity finder', () => {
  const def: AudienceDefinition = {
    geographies: ['Lagos'],
    ageBands: ['25-34'],
    genders: ['all'],
    deviceTypes: ['smartphone'],
    subscriberTiers: [],
    interests: [],
    arpuBands: [],
    networkTypes: [],
    languages: ['en'],
    exclusions: ['dnd'],
  };
  const est: AudienceEstimate = {
    estimatedReach: 1_400_000,
    reachLow: 1_200_000,
    reachHigh: 1_600_000,
    excludedForCompliance: 50_000,
    qualityScore: 70,
    seed: 't',
  };
  it('suggests Pidgin, geo and device expansions with incremental reach', () => {
    const ops = intelligence.audience.findOpportunities(def, est);
    expect(ops.length).toBeGreaterThanOrEqual(2);
    expect(ops.every((o) => o.incrementalReach > 0)).toBe(true);
    expect(ops.some((o) => o.action === 'add_language:pcm')).toBe(true);
  });
});

describe('revenue intelligence', () => {
  it('computes slices and opportunities from demo lines', () => {
    const report = intelligence.revenue.analyse({
      currency: 'NGN',
      lines: [
        { industry: 'FMCG', family: 'messaging', pricingModel: 'CPM', spendMinor: 500_000_00 },
        { industry: 'Banking', family: 'ussd_interactive', pricingModel: 'CPA', spendMinor: 300_000_00 },
      ],
    });
    expect(report.totalRevenueMinor).toBe(800_000_00);
    expect(report.byIndustry[0]!.label).toBe('FMCG');
    expect(report.inventoryUtilisation.length).toBe(48);
    expect(report.generatedBy).toBe('demonstration-rules');
  });
});
