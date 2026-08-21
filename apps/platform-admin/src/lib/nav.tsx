import type { NavGroup } from '@telyad/ui';

// Full Tely Master Admin navigation, recovered from the approved prototype
// (Tely_Master_Admin_3_2.html) — the Tely-owned cross-telco control plane.
export const NAV: NavGroup[] = [
  { group: 'Global', items: [{ id: 'dashboard', label: 'Global Dashboard' }] },
  {
    group: 'Partnerships',
    items: [
      { id: 'directory', label: 'Telco Directory' },
      { id: 'terms', label: 'Commercial Terms' },
    ],
  },
  {
    group: 'Platform',
    items: [
      { id: 'platform-health', label: 'Platform Health' },
      { id: 'users', label: 'Master Admin Users' },
      { id: 'demo-access', label: 'Demo Access' },
    ],
  },
  {
    group: 'Engineering',
    items: [{ id: 'engines', label: 'Engine Dashboards' }],
  },
];
