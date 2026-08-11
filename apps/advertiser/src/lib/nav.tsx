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
    group: 'Discover',
    items: [
      { id: 'marketplace', label: 'Ad Format Marketplace' },
      { id: 'ai', label: 'AI Intelligence' },
    ],
  },
  {
    group: 'Create',
    items: [{ id: 'campaigns/new', label: 'New Campaign' }],
  },
];
