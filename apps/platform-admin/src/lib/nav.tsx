import type { NavGroup } from '@telyad/ui';

export const NAV: NavGroup[] = [
  { group: 'Global', items: [{ id: 'dashboard', label: 'Global Dashboard' }] },
  {
    group: 'Partnerships',
    items: [
      { id: 'directory', label: 'Telco Directory' },
      { id: 'terms', label: 'Commercial Terms' },
    ],
  },
];
