import { describe, expect, it } from 'vitest';
import {
  CAPABILITY_FAMILIES,
  CAPABILITY_STATUSES,
  PREVIEW_RENDERERS,
  type AdCapability,
} from '@telyad/types';
import {
  capabilitiesByFamily,
  capabilityCount,
  getCapability,
  listCapabilities,
  networkAvailableCapabilities,
} from './capabilities';
import { getFormat } from './registry';

describe('capability universe (48)', () => {
  const all = listCapabilities();

  it('registers exactly 48 capabilities numbered 1..48 uniquely', () => {
    expect(capabilityCount()).toBe(48);
    const numbers = all.map((c) => c.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 48 }, (_, i) => i + 1));
  });

  it('has unique slug ids', () => {
    expect(new Set(all.map((c) => c.id)).size).toBe(48);
  });

  it('uses only known families and statuses', () => {
    for (const c of all) {
      expect(CAPABILITY_FAMILIES).toContain(c.family);
      expect(CAPABILITY_STATUSES).toContain(c.telyadStatus);
      expect(CAPABILITY_STATUSES).toContain(c.defaultNetworkStatus);
    }
  });

  it('every capability has objectives, pricing and at least one mechanic', () => {
    for (const c of all) {
      expect(c.objectives.length, c.id).toBeGreaterThan(0);
      expect(c.pricingModels.length, c.id).toBeGreaterThan(0);
      expect(c.mechanics.length, c.id).toBeGreaterThan(0);
    }
  });

  it('maps creatable capabilities to real formats in the registry', () => {
    const creatable = all.filter((c) => c.creatableFormatId);
    expect(creatable.length).toBeGreaterThanOrEqual(5);
    for (const c of creatable) {
      expect(getFormat(c.creatableFormatId as never), c.id).toBeTruthy();
    }
  });

  it('groups by family (every family populated)', () => {
    for (const fam of CAPABILITY_FAMILIES) {
      expect(capabilitiesByFamily(fam).length, fam).toBeGreaterThan(0);
    }
  });

  it('network availability filter returns only LIVE/PILOT and honours overrides', () => {
    const live = networkAvailableCapabilities();
    expect(live.every((c) => ['LIVE', 'PILOT'].includes(c.defaultNetworkStatus))).toBe(true);
    // Disabling a live capability removes it; enabling a future one adds it.
    const withOverrides = networkAvailableCapabilities({ standard_sms: 'DISABLED', dooh_extension: 'LIVE' });
    expect(withOverrides.find((c) => c.id === 'standard_sms')).toBeUndefined();
    expect(withOverrides.find((c) => c.id === 'dooh_extension')).toBeTruthy();
  });

  it('never presents a non-live capability as network-available by default', () => {
    const future = getCapability('network_event_journey') as AdCapability;
    expect(future.defaultNetworkStatus).toBe('FUTURE_CAPABILITY');
    expect(networkAvailableCapabilities().find((c) => c.id === future.id)).toBeUndefined();
  });

  it('every capability maps to a known preview renderer, none generic', () => {
    for (const c of all) {
      expect(PREVIEW_RENDERERS, c.id).toContain(c.previewRenderer);
      expect(c.previewRenderer, c.id).not.toBe('generic');
    }
  });

  it('every capability has a non-empty sample (at least one field set)', () => {
    for (const c of all) {
      expect(c.sample, c.id).toBeTruthy();
      const setFields = Object.entries(c.sample).filter(([, v]) =>
        Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== '',
      );
      expect(setFields.length, c.id).toBeGreaterThan(0);
    }
  });
});
