import { describe, expect, it } from 'vitest';
import {
  audienceEstimateSchema,
  findPiiLeak,
  type AudienceDefinition,
} from '@telyad/types';
import { estimateAudience } from './estimate';

const base: AudienceDefinition = {
  geographies: ['Lagos'],
  ageBands: ['30-55'],
  genders: ['all'],
  deviceTypes: ['smartphone'],
  subscriberTiers: ['premium'],
  interests: ['automotive', 'travel'],
  arpuBands: ['high'],
  networkTypes: [],
  languages: [],
  exclusions: ['dnd'],
};

describe('audience estimator', () => {
  it('is deterministic: same input → identical estimate', () => {
    expect(estimateAudience(base)).toEqual(estimateAudience(base));
  });

  it('produces a schema-valid, aggregate-only estimate', () => {
    const est = estimateAudience(base);
    expect(() => audienceEstimateSchema.parse(est)).not.toThrow();
    expect(findPiiLeak(est)).toBeNull();
  });

  it('keeps estimatedReach within [reachLow, reachHigh]', () => {
    const est = estimateAudience(base);
    expect(est.reachLow).toBeLessThanOrEqual(est.estimatedReach);
    expect(est.estimatedReach).toBeLessThanOrEqual(est.reachHigh);
  });

  it('narrows reach as targeting gets more specific', () => {
    const broad = estimateAudience({ ...base, geographies: [], interests: [], subscriberTiers: [] });
    const narrow = estimateAudience(base);
    expect(narrow.estimatedReach).toBeLessThan(broad.estimatedReach);
  });

  it('never exceeds the base pool', () => {
    const est = estimateAudience(base, { basePool: 1_000_000 });
    expect(est.estimatedReach).toBeLessThanOrEqual(1_000_000);
  });
});
