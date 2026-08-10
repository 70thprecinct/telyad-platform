import { describe, expect, it } from 'vitest';
import { hasPermission, permissionsFor } from './rbac.js';

describe('RBAC model', () => {
  it('lets a telco Campaign Reviewer approve, but not manage wallets', () => {
    expect(hasPermission('telco', 'Campaign Reviewer', 'campaign:approve')).toBe(true);
    expect(hasPermission('telco', 'Campaign Reviewer', 'wallet:manage')).toBe(false);
  });

  it('lets an advertiser Campaign Manager create & submit, never approve', () => {
    expect(hasPermission('advertiser', 'Campaign Manager', 'campaign:submit')).toBe(true);
    expect(hasPermission('advertiser', 'Campaign Manager', 'campaign:approve')).toBe(false);
  });

  it('scopes "Read Only" to view-only in every realm', () => {
    for (const realm of ['advertiser', 'telco', 'platform'] as const) {
      expect(permissionsFor(realm, 'Read Only')).toEqual(['campaign:view']);
    }
  });

  it('never lets an advertiser role approve campaigns (approval is telco-only)', () => {
    expect(hasPermission('advertiser', 'Advertiser Admin', 'campaign:approve')).toBe(false);
  });

  it('returns no permissions for an unknown role', () => {
    expect(permissionsFor('telco', 'Nonexistent Role' as never)).toEqual([]);
  });
});
