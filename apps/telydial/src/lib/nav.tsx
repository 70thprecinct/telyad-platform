import type { NavGroup } from '@telyad/ui';

// Full TelyDial navigation recovered from the approved prototype (telydial(1).html).
// TelyDial is the MVAS / telco-product acquisition module inside TelyAd.
export const NAV: NavGroup[] = [
  {
    group: 'Core',
    items: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'campaigns', label: 'Campaigns' },
      { id: 'campaigns/new', label: 'Create Campaign' },
    ],
  },
  { group: 'Product', items: [{ id: 'products', label: 'Products' }] },
  { group: 'Intelligence', items: [{ id: 'analytics', label: 'Analytics' }] },
  { group: 'Finance', items: [{ id: 'wallet', label: 'Wallet' }] },
  {
    group: 'Operations',
    items: [
      { id: 'reports', label: 'Reports' },
      { id: 'notifications', label: 'Notifications', badge: '3' },
      { id: 'support', label: 'Support' },
    ],
  },
];
