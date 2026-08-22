import type { NavGroup } from '@telyad/ui';

// Full operator console navigation, recovered from the approved prototype
// (Tely_Telco_Operations_Dashboard.html) — seven grouped sections. Every id is a
// real route. `/inventory` and `/ai` remain reachable (not in primary nav):
// Messaging Channels supersedes Inventory as the governance view over the same
// 48-capability registry; Analytics supersedes the standalone AI page in nav.
export const NAV: NavGroup[] = [
  { group: 'Overview', items: [{ id: 'dashboard', label: 'Executive Overview' }] },
  {
    group: 'Advertisers & Campaigns',
    items: [
      { id: 'advertisers', label: 'Advertiser Management' },
      { id: 'approvals', label: 'Campaign Approval' },
      { id: 'monitoring', label: 'Campaign Monitoring' },
    ],
  },
  {
    group: 'Audience & Traffic',
    items: [
      { id: 'audience', label: 'Audience Monitoring' },
      { id: 'traffic', label: 'Traffic Monitoring' },
      { id: 'subscribers', label: 'Subscriber Insights' },
      { id: 'channels', label: 'Messaging Channels' },
    ],
  },
  {
    group: 'Finance',
    items: [
      { id: 'revenue', label: 'Pricing & Revenue' },
      { id: 'wallet', label: 'Wallet Monitoring' },
    ],
  },
  {
    group: 'Governance',
    items: [
      { id: 'compliance', label: 'Compliance' },
      { id: 'consent', label: 'Consent & DND' },
      { id: 'moderation', label: 'Content Moderation' },
      { id: 'governance/approvals', label: 'Approvals' },
    ],
  },
  {
    group: 'Intelligence',
    items: [
      { id: 'reports', label: 'Reports' },
      { id: 'analytics', label: 'Analytics' },
    ],
  },
  {
    group: 'Access & System',
    items: [
      { id: 'users', label: 'Users & Roles' },
      { id: 'audit', label: 'Audit Logs' },
      { id: 'api-monitoring', label: 'API Monitoring' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'support', label: 'Support Centre' },
      { id: 'settings', label: 'Settings' },
      { id: 'platform-health', label: 'Platform Health' },
    ],
  },
];
