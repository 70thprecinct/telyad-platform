import type { AnyRole, Permission, Realm } from '@telyad/types';

/**
 * Role → permission grants, per realm. Enforced server-side (spec §17). The
 * prototype's RBAC matrix was display-only; this is the real authority.
 *
 * Keyed by realm then role because "Read Only" exists in every realm.
 */
export const ROLE_PERMISSIONS: Record<Realm, Record<string, Permission[]>> = {
  advertiser: {
    'Advertiser Admin': [
      'campaign:create',
      'campaign:submit',
      'campaign:view',
      'campaign:launch',
      'creative:manage',
      'wallet:manage',
      'reports:export',
      'users:manage',
    ],
    'Campaign Manager': ['campaign:create', 'campaign:submit', 'campaign:view', 'campaign:launch', 'creative:manage'],
    'Creative Manager': ['campaign:view', 'creative:manage'],
    Analyst: ['campaign:view', 'reports:export'],
    Finance: ['campaign:view', 'wallet:manage', 'reports:export'],
    'Read Only': ['campaign:view'],
  },
  telco: {
    'Telco Super Admin': [
      'campaign:view',
      'campaign:approve',
      'campaign:reject',
      'advertiser:approve',
      'advertiser:suspend',
      'wallet:manage',
      'compliance:view',
      'compliance:enforce',
      'inventory:manage',
      'revenue:view',
      'audience:view',
      'platform:health:view',
      'users:manage',
      'audit:view',
      'reports:export',
    ],
    'Commercial Manager': [
      'campaign:view',
      'inventory:manage',
      'revenue:view',
      'reports:export',
      'audience:view',
    ],
    'Operations Manager': [
      'campaign:view',
      'campaign:approve',
      'campaign:reject',
      'advertiser:approve',
      'advertiser:suspend',
      'compliance:view',
      'audience:view',
      'audit:view',
      'reports:export',
    ],
    'Marketing Manager': ['campaign:view', 'audience:view', 'reports:export'],
    'Campaign Reviewer': ['campaign:view', 'campaign:approve', 'campaign:reject'],
    'Compliance Officer': [
      'campaign:view',
      'campaign:reject',
      'compliance:view',
      'compliance:enforce',
      'audit:view',
    ],
    'Finance Officer': ['campaign:view', 'wallet:manage', 'revenue:view', 'reports:export'],
    'Audience Analyst': ['campaign:view', 'audience:view', 'reports:export'],
    'Technical Operations': ['campaign:view', 'platform:health:view', 'inventory:manage'],
    Support: ['campaign:view'],
    'Read Only': ['campaign:view'],
  },
  platform: {
    'Platform Super Admin': [
      'telco:manage',
      'campaign:view',
      'compliance:view',
      'users:manage',
      'audit:view',
      'reports:export',
    ],
    'Platform Operations': ['telco:manage', 'campaign:view', 'compliance:view', 'audit:view'],
    'Platform Engineering': ['campaign:view', 'audit:view'],
    'Platform Finance': ['campaign:view', 'reports:export'],
    'Platform Support': ['campaign:view'],
    'Read Only': ['campaign:view'],
  },
};

export function permissionsFor(realm: Realm, role: AnyRole): Permission[] {
  return ROLE_PERMISSIONS[realm]?.[role] ?? [];
}

export function hasPermission(
  realm: Realm,
  role: AnyRole,
  permission: Permission,
): boolean {
  return permissionsFor(realm, role).includes(permission);
}
