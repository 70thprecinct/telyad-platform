import type { NavGroup } from '@telyad/ui';

// Full advertiser navigation, recovered from the approved prototype
// (tely_advertiser_portal_3.html) — four grouped sections, twelve destinations.
// The campaign wizard (/campaigns/new) and per-campaign detail are reached from
// action buttons, matching the prototype (the wizard opens from "+ New Campaign").
export const NAV: NavGroup[] = [
  {
    group: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'campaigns', label: 'Campaigns' },
      { id: 'analytics', label: 'Analytics' },
    ],
  },
  {
    group: 'Targeting',
    items: [
      { id: 'audience', label: 'Audience' },
      { id: 'segments', label: 'Segments' },
      { id: 'reach', label: 'Reach & Verify' },
    ],
  },
  {
    group: 'Delivery',
    items: [
      { id: 'channels', label: 'Channels' },
      { id: 'creatives', label: 'Creatives' },
      { id: 'ai', label: 'AI Tools' },
    ],
  },
  {
    group: 'Account',
    items: [
      { id: 'billing', label: 'Billing & Budget' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'settings', label: 'Settings' },
    ],
  },
];
