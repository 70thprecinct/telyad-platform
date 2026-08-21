// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC DEMONSTRATION DATA (telco / operator console).
//
// Data-honesty policy (PARITY-02 §29): every surface is one of —
//   • REAL — persisted application/API data (campaigns, advertisers, approvals,
//     audit, the 48-capability registry, /health + /ready).
//   • DETERMINISTIC DEMONSTRATION — the fixed operational figures below, used
//     for presentation where a live MTN/carrier signal does not yet exist. NOT
//     live MTN production data; every screen that uses them says so.
//   • EXTERNAL INTEGRATION REQUIRED — carrier/gateway/third-party dependency,
//     flagged in the UI.
//
// All constants (no randomness) → reproducible demo. No MSISDN / subscriber PII.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_NOTE = 'Demonstration figures — not live MTN production data.';
export const EXT_NOTE = 'External carrier/gateway integration required for live data.';

export const DASH = {
  combinedReachM: 28.9,
  subscriberReachM: 78.4,
  campaignsOnNetwork: 8,
  liveCampaigns: 2,
  pendingApproval: 3,
  grossSpendMinor: 71_000_000_000, // ₦710M
  mtnPayoutMinor: 56_800_000_000, // ₦568M
  revenueMtdMinor: 14_200_000_000, // ₦142M
};

export const REVENUE_TREND = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  data: [98, 104, 112, 121, 132, 142], // ₦M
};

// Campaign monitoring — deterministic demo delivery telemetry.
export const MONITORING = [
  { id: 'cm1', campaign: 'Maltina Family Moments', advertiser: 'Maltina', channel: 'SMS', status: 'Live', deliveredPct: 62, target: 29_300_000, forecast: 18_300_000, budgetMinor: 2_000_000_000, spentMinor: 1_240_000_000, anomaly: null },
  { id: 'cm2', campaign: 'Coca-Cola Weekend Refresh', advertiser: 'Coca-Cola', channel: 'SMS', status: 'Live', deliveredPct: 78, target: 943_100, forecast: 812_000, budgetMinor: 800_000_000, spentMinor: 624_000_000, anomaly: null },
  { id: 'cm3', campaign: 'Access Bank Acquisition', advertiser: 'Access Bank', channel: 'USSD', status: 'Pending approval', deliveredPct: 0, target: 4_900_000, forecast: 3_100_000, budgetMinor: 600_000_000, spentMinor: 0, anomaly: null },
  { id: 'cm4', campaign: 'FairMoney Q3 Acquisition', advertiser: 'FairMoney', channel: 'SMS', status: 'Pending approval', deliveredPct: 0, target: 5_000, forecast: 4_200, budgetMinor: 120_000_000, spentMinor: 0, anomaly: null },
  { id: 'cm5', campaign: 'Jumia Flash Sale Reminder', advertiser: 'Jumia', channel: 'SMS', status: 'Live', deliveredPct: 44, target: 2_100_000, forecast: 1_700_000, budgetMinor: 80_000_000, spentMinor: 35_000_000, anomaly: 'Delivery 8% below target 02:00–04:00' },
];

export const AUDIENCE_MON = {
  eligibleM: 73.1,
  targetedM: 41.2,
  activeCampaignAudiences: 6,
  geography: [['Lagos', 28], ['Oyo', 14], ['Kano', 12], ['Rivers', 9], ['Abuja FCT', 8], ['Other', 29]] as [string, number][],
  ageBands: [['18–24', 22], ['25–34', 34], ['35–44', 24], ['45–54', 13], ['55+', 7]] as [string, number][],
  deviceMix: [['Smartphone', 61], ['Feature phone', 39]] as [string, number][],
  overlapPct: 18,
};

export const TRAFFIC = {
  labels: Array.from({ length: 12 }, (_, i) => `${i * 2}h`),
  requests: [42, 38, 30, 28, 46, 88, 120, 132, 118, 96, 74, 58], // k/req per slot
  deliveries: [40, 36, 29, 27, 44, 84, 115, 126, 112, 92, 71, 55],
  channels: [
    { channel: 'SMS', throughput: '2.1M/h', success: 98.7, latencyMs: 180, backlog: 1240 },
    { channel: 'USSD', throughput: '1.4M/h', success: 99.2, latencyMs: 90, backlog: 320 },
    { channel: 'STK Push', throughput: '640k/h', success: 97.9, latencyMs: 210, backlog: 890 },
    { channel: 'WAP Push', throughput: '410k/h', success: 96.4, latencyMs: 260, backlog: 2100 },
    { channel: 'OBD Voice', throughput: '120k/h', success: 95.1, latencyMs: 420, backlog: 540 },
  ],
};

export const SUBSCRIBERS = {
  reachableM: 78.4,
  geography: [['Lagos', 21], ['Kano', 13], ['Oyo', 9], ['Rivers', 8], ['Kaduna', 7], ['Other', 42]] as [string, number][],
  device: [['Smartphone', 61], ['Feature phone', 39]] as [string, number][],
  usage: [['Data-active', 44], ['Voice-heavy', 33], ['USSD power users', 23]] as [string, number][],
  rechargeBands: [['₦50–₦199', 38], ['₦200–₦999', 34], ['₦1k–₦4.9k', 21], ['₦5k+', 7]] as [string, number][],
  engagement: [['High', 19], ['Medium', 48], ['Low', 33]] as [string, number][],
};

export const WALLET = [
  { advertiser: 'Maltina', balanceMinor: 12_400_000_000, reservedMinor: 2_000_000_000, status: 'Healthy' as const },
  { advertiser: 'Coca-Cola', balanceMinor: 8_100_000_000, reservedMinor: 800_000_000, status: 'Healthy' as const },
  { advertiser: 'Access Bank', balanceMinor: 600_000_000, reservedMinor: 600_000_000, status: 'Low' as const },
  { advertiser: 'FairMoney', balanceMinor: 90_000_000, reservedMinor: 120_000_000, status: 'Exposed' as const },
  { advertiser: 'Jumia', balanceMinor: 3_400_000_000, reservedMinor: 80_000_000, status: 'Healthy' as const },
];

export const COMPLIANCE = [
  { advertiser: 'Maltina', campaign: 'Family Moments', score: 78, risk: 19, dnd: 'Applied', consent: 'Gated', flags: 0, status: 'Pass' as const },
  { advertiser: 'Access Bank', campaign: 'Acquisition', score: 86, risk: 17, dnd: 'Applied', consent: 'Gated', flags: 0, status: 'Pass' as const },
  { advertiser: 'FairMoney', campaign: 'Q3 Acquisition', score: 64, risk: 34, dnd: 'Applied', consent: 'Gated', flags: 1, status: 'Warn' as const },
  { advertiser: 'QuickCash NG', campaign: 'Loan blast', score: 41, risk: 72, dnd: 'Missing', consent: 'None', flags: 3, status: 'Fail' as const },
];

export const CONSENT = {
  dndSuppressedM: 9.8,
  consentEligibleM: 68.6,
  exclusionRatePct: 12.5,
  registrySync: 'Synced 14 min ago',
  channelSuppression: [['SMS', 12.5], ['OBD Voice', 21.3], ['USSD', 0], ['STK Push', 0]] as [string, number][],
};

export const MODERATION = [
  { id: 'md1', campaign: 'FairMoney Q3', advertiser: 'FairMoney', capability: 'Standard SMS', language: 'English', status: 'Pending' as const, risk: 'Medium', reviewer: '—' },
  { id: 'md2', campaign: 'QuickCash Loan blast', advertiser: 'QuickCash NG', capability: 'Flash SMS', language: 'English', status: 'Flagged' as const, risk: 'High', reviewer: 'A. Balogun' },
  { id: 'md3', campaign: 'Maltina Family Moments', advertiser: 'Maltina', capability: 'Recharge SMS', language: 'Pidgin', status: 'Approved' as const, risk: 'Low', reviewer: 'T. Okafor' },
];

export const GOV_APPROVALS = [
  { id: 'ga1', type: 'Advertiser approval', subject: 'Lendsqr Loans', requestedBy: 'Onboarding', maker: 'Ops', checker: '—', status: 'Pending' as const },
  { id: 'ga2', type: 'Capability enablement', subject: 'RCS Rich Message → Live', requestedBy: 'Commercial', maker: 'A. Balogun', checker: '—', status: 'Pending' as const },
  { id: 'ga3', type: 'Commercial config', subject: 'FairMoney rate card', requestedBy: 'Finance', maker: 'Finance', checker: 'T. Okafor', status: 'Approved' as const },
  { id: 'ga4', type: 'Content exception', subject: 'Betting creative — match day', requestedBy: 'Compliance', maker: 'Compliance', checker: '—', status: 'Rejected' as const },
];

export const REPORTS = [
  { name: 'Campaign performance', cat: 'Campaigns', freq: 'Daily', last: '2026-07-01' },
  { name: 'Advertiser revenue', cat: 'Finance', freq: 'Weekly', last: '2026-06-30' },
  { name: 'Capability utilisation', cat: 'Inventory', freq: 'Weekly', last: '2026-06-30' },
  { name: 'Compliance summary', cat: 'Governance', freq: 'Weekly', last: '2026-06-29' },
  { name: 'DND / consent', cat: 'Governance', freq: 'Monthly', last: '2026-06-28' },
  { name: 'Finance settlement', cat: 'Finance', freq: 'Weekly', last: '2026-06-30' },
  { name: 'Operational health', cat: 'System', freq: 'Daily', last: '2026-07-01' },
];

// Users & Roles — DEMO presentation. The LIVE temporary/demo-access lifecycle
// (create / expiry / revoke / extend / reset) is the Demo Access engine
// (feature/demo-access-control, PR #6); this screen is its console surface and
// wires to it on merge — it is NOT a re-implementation.
export const USERS = [
  { name: 'T. Okafor', email: 'ops.lead@mtn.example', role: 'Operations Manager', portal: 'telco', org: 'MTN Nigeria', status: 'Active', demo: false, lastLogin: '2026-07-01 09:12', validFrom: null, expires: null },
  { name: 'A. Balogun', email: 'commercial@mtn.example', role: 'Commercial Manager', portal: 'telco', org: 'MTN Nigeria', status: 'Active', demo: false, lastLogin: '2026-07-01 08:40', validFrom: null, expires: null },
  { name: 'C. Reviewer', email: 'reviewer@mtn.example', role: 'Campaign Reviewer', portal: 'telco', org: 'MTN Nigeria', status: 'Active', demo: false, lastLogin: '2026-06-30 17:22', validFrom: null, expires: null },
  { name: 'Demo Auditor', email: 'audit.demo@mtn.example', role: 'Read Only', portal: 'telco', org: 'MTN Nigeria', status: 'Active', demo: true, lastLogin: '2026-07-01 07:55', validFrom: '2026-07-01 08:00', expires: '2026-07-04 08:00' },
];

export const TELCO_ROLE_MATRIX: { role: string; perms: Record<string, boolean> }[] = [
  { role: 'Telco Super Admin', perms: { view: true, approve: true, inventory: true, revenue: true, users: true, audit: true } },
  { role: 'Commercial Manager', perms: { view: true, approve: false, inventory: true, revenue: true, users: false, audit: false } },
  { role: 'Operations Manager', perms: { view: true, approve: true, inventory: false, revenue: false, users: false, audit: true } },
  { role: 'Campaign Reviewer', perms: { view: true, approve: true, inventory: false, revenue: false, users: false, audit: false } },
  { role: 'Compliance Officer', perms: { view: true, approve: false, inventory: false, revenue: false, users: false, audit: true } },
  { role: 'Finance Officer', perms: { view: true, approve: false, inventory: false, revenue: true, users: false, audit: false } },
  { role: 'Read Only', perms: { view: true, approve: false, inventory: false, revenue: false, users: false, audit: false } },
];

export const API_ENDPOINTS = [
  { path: '/campaigns', method: 'GET', p95: 42, errRate: 0.1, calls24h: 184_200 },
  { path: '/audience/match', method: 'POST', p95: 118, errRate: 0.3, calls24h: 52_400 },
  { path: '/capabilities', method: 'GET', p95: 18, errRate: 0.0, calls24h: 96_100 },
  { path: '/campaigns/:id/decision', method: 'POST', p95: 66, errRate: 0.2, calls24h: 3_120 },
  { path: '/notifications', method: 'GET', p95: 24, errRate: 0.0, calls24h: 40_800 },
];

export const PLATFORM_SERVICES = [
  { service: 'API (Fastify)', kind: 'REAL', probe: '/health, /ready', status: 'Operational' },
  { service: 'Database (Postgres/Prisma)', kind: 'REAL', probe: '/ready → db reachable', status: 'Operational' },
  { service: 'Capability registry', kind: 'REAL', probe: '48 capabilities loaded', status: 'Operational' },
  { service: 'SMS gateway', kind: 'EXT', probe: 'MTN SMSC', status: 'Integration required' },
  { service: 'USSD gateway', kind: 'EXT', probe: 'MTN USSD', status: 'Integration required' },
  { service: 'DCB billing', kind: 'EXT', probe: 'MTN DCB', status: 'Integration required' },
];

export const SUPPORT_TICKETS = [
  { id: 'TK-1042', subject: 'Access Bank — USSD code verification', advertiser: 'Access Bank', priority: 'High', status: 'Open' },
  { id: 'TK-1039', subject: 'FairMoney — creative rejected, clarification', advertiser: 'FairMoney', priority: 'Medium', status: 'Open' },
  { id: 'TK-1031', subject: 'Maltina — reporting export request', advertiser: 'Maltina', priority: 'Low', status: 'Resolved' },
];

export const SUPPORT_FAQ = [
  { q: 'How long does campaign approval take?', a: 'Compliance review completes within 2 hours of submission; nothing goes live without an operator decision.' },
  { q: 'Which capabilities require network approval?', a: 'Capabilities marked "Network Approval Required" in Messaging Channels need MTN enablement before going live.' },
  { q: 'How is DND enforced?', a: 'DND filtering is applied automatically on every SMS and OBD campaign at platform level; it cannot be removed.' },
];
