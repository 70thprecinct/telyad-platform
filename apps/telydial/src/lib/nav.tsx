import type { NavGroup } from '@telyad/ui';

export const NAV: NavGroup[] = [
  {
    group: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'campaigns', label: 'Campaigns' },
    ],
  },
  {
    group: 'Create',
    items: [{ id: 'campaigns/new', label: 'New Campaign' }],
  },
];
