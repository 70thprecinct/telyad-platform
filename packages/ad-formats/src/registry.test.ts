import { describe, expect, it } from 'vitest';
import { AD_FORMAT_IDS } from '@telyad/types';
import { getFormat, listFormats, validateCreative } from './registry.js';

describe('advertising-format registry', () => {
  it('registers every current format', () => {
    const ids = listFormats().map((f) => f.id).sort();
    expect(ids).toEqual([...AD_FORMAT_IDS].sort());
  });

  it('exposes a creative schema and pricing models per format', () => {
    for (const id of AD_FORMAT_IDS) {
      const f = getFormat(id)!;
      expect(f.creativeSchema.length).toBeGreaterThan(0);
      expect(f.pricingModels.length).toBeGreaterThan(0);
    }
  });

  it('flags missing required creative fields', () => {
    const { ok, errors } = validateCreative('stk', {});
    expect(ok).toBe(false);
    expect(errors).toHaveProperty('menuTitle');
  });

  it('flags over-length fields (STK menu title max 20)', () => {
    const { ok, errors } = validateCreative('stk', {
      menuTitle: 'x'.repeat(30),
      body: 'hello',
      option1: 'Play',
      serviceName: 'MTN Games',
    });
    expect(ok).toBe(false);
    expect(errors).toHaveProperty('menuTitle');
  });

  it('accepts a valid STK creative', () => {
    const { ok } = validateCreative('stk', {
      menuTitle: 'MTN Game Zone',
      body: 'Play now and win',
      option1: 'Play Now',
      serviceName: 'MTN Games',
    });
    expect(ok).toBe(true);
  });
});
