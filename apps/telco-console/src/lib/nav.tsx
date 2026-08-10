import type { NavGroup } from '@telyad/ui';

export const NAV: NavGroup[] = [
  { group: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard' }] },
  {
    group: 'Advertisers & Campaigns',
    items: [
      { id: 'advertisers', label: 'Advertiser Management' },
      { id: 'approvals', label: 'Campaign Approval' },
    ],
  },
  { group: 'Access & System', items: [{ id: 'audit', label: 'Audit Logs' }] },
];
