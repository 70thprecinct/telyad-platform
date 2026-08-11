import type { NavGroup } from '@telyad/ui';

export const NAV: NavGroup[] = [
  { group: 'Overview', items: [{ id: 'dashboard', label: 'Executive Overview' }] },
  {
    group: 'Advertisers & Campaigns',
    items: [
      { id: 'advertisers', label: 'Advertiser Management' },
      { id: 'approvals', label: 'Campaign Approval' },
    ],
  },
  {
    group: 'Commercial & Inventory',
    items: [
      { id: 'inventory', label: 'Inventory & Ad Formats' },
      { id: 'revenue', label: 'Revenue & Commercials' },
    ],
  },
  { group: 'Intelligence', items: [{ id: 'ai', label: 'AI Intelligence' }] },
  { group: 'Access & System', items: [{ id: 'audit', label: 'Audit Logs' }] },
];
