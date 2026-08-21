// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC DEMONSTRATION DATA (Tely Master Admin — cross-telco control plane).
//
// Data-honesty policy (PARITY-03 §20): every surface is one of —
//   • REAL — persisted platform/API data (telcos via /telcos, campaigns,
//     /health + /ready).
//   • DETERMINISTIC DEMONSTRATION — fixed cross-telco/operational figures below.
//     NOT live production data; every screen that uses them says so.
//   • EXTERNAL INTEGRATION REQUIRED — infrastructure/carrier/provider dependency.
//
// Aggregate only — no subscriber-level data ever appears here. All constants.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_NOTE = 'Demonstration figures — not live production data.';
export const EXT_NOTE = 'External infrastructure/carrier integration required for live data.';

export interface DemoTelco {
  name: string;
  country: string;
  status: 'Active' | 'Pipeline' | 'Prospect';
  since: string;
  sharePct: number;
  subsM: number;
  revenueMinorM: number; // ₦M revenue-share earned by the telco (MTD)
  advertisers: number;
  health: number | null;
}

export const TELCOS: DemoTelco[] = [
  { name: 'MTN Nigeria', country: 'Nigeria', status: 'Active', since: '2026-04', sharePct: 80, subsM: 78.4, revenueMinorM: 568, advertisers: 538, health: 99.97 },
  { name: 'Airtel Nigeria', country: 'Nigeria', status: 'Pipeline', since: '—', sharePct: 78, subsM: 0, revenueMinorM: 0, advertisers: 0, health: null },
  { name: 'Glo Nigeria', country: 'Nigeria', status: 'Pipeline', since: '—', sharePct: 78, subsM: 0, revenueMinorM: 0, advertisers: 0, health: null },
  { name: 'Vodacom Tanzania', country: 'Tanzania', status: 'Prospect', since: '—', sharePct: 0, subsM: 0, revenueMinorM: 0, advertisers: 0, health: null },
];

export const GLOBAL = {
  platformRevenueMinorM: 142, // Tely commission (MTD), ₦M
  combinedPayoutMinorM: 568, // combined telco payout (MTD), ₦M
  subscriberReachM: 78.4,
  totalAdvertisers: 538,
  revenueTrend: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], data: [98, 104, 112, 121, 132, 142] },
  reachTrend: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], data: [62, 65, 68, 71, 75, 78.4] },
};

export interface DemoEngine {
  id: 'telysignal' | 'telyxchange' | 'telyads' | 'telyreach';
  name: string;
  purpose: string;
  metric: string;
  envs: string;
  color: string;
}

export const ENGINES: DemoEngine[] = [
  { id: 'telysignal', name: 'TelySignal', purpose: 'Carrier audience intelligence — signal ingestion, pseudonymisation gateway, segment generation.', metric: '2.84B signal events / day', envs: '1 (MTN)', color: '#0891b2' },
  { id: 'telyxchange', name: 'TelyXchange', purpose: 'Programmatic exchange — campaign demand, inventory allocation, decisioning.', metric: '5.04M decisions / day', envs: '1 (MTN)', color: '#3b5bdb' },
  { id: 'telyads', name: 'TelyAds', purpose: 'Multi-channel execution — SMS, USSD, SIM Toolkit, zero-rated web, DCB.', metric: '50.2M deliveries / day', envs: '1 (MTN)', color: '#0a9d5e' },
  { id: 'telyreach', name: 'TelyReach', purpose: 'Reach, attribution and verification — conversion matching, fraud scoring.', metric: '5.18M conversions verified / day', envs: '1 (MTN)', color: '#7c3aed' },
];

export const INFRA_LOAD = {
  labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
  data: [72, 70, 68, 66, 71, 80, 88, 92, 90, 86, 82, 79, 84, 88, 91, 89, 85, 80, 76, 74, 73, 72, 71, 70],
};

export const PLATFORM_SERVICES = [
  { service: 'API (Fastify)', kind: 'REAL' as const, probe: '/health, /ready', status: 'Operational' },
  { service: 'Database (Postgres/Prisma)', kind: 'REAL' as const, probe: '/ready → db reachable', status: 'Operational' },
  { service: 'Capability registry', kind: 'REAL' as const, probe: '48 capabilities loaded', status: 'Operational' },
  { service: 'Advertiser Portal', kind: 'DEMO' as const, probe: 'app reachability', status: 'Operational' },
  { service: 'Telco Console', kind: 'DEMO' as const, probe: 'app reachability', status: 'Operational' },
  { service: 'Tely Master Admin', kind: 'DEMO' as const, probe: 'app reachability', status: 'Operational' },
  { service: 'TelyDial', kind: 'DEMO' as const, probe: 'app reachability', status: 'Operational' },
  { service: 'SMS / USSD / DCB gateways', kind: 'EXT' as const, probe: 'MTN carrier', status: 'Integration required' },
];

export const ADMIN_USERS = [
  { name: 'Osa Umweni', email: 'admin@tely.example', role: 'Platform Super Admin', portal: 'admin', visibility: 'All telcos', status: 'Active', demo: false, lastLogin: '2026-07-01 09:20', validFrom: null, expires: null },
  { name: 'Tunde Aderinwale', email: 'cto@tely.example', role: 'Platform Engineering', portal: 'admin', visibility: 'All telcos', status: 'Active', demo: false, lastLogin: '2026-07-01 08:05', validFrom: null, expires: null },
  { name: 'Commercial Lead', email: 'commercial@tely.example', role: 'Platform Finance', portal: 'admin', visibility: 'All telcos', status: 'Active', demo: false, lastLogin: '2026-06-30 16:40', validFrom: null, expires: null },
  { name: 'Demo Reviewer', email: 'demo.admin@tely.example', role: 'Read Only', portal: 'admin', visibility: 'All telcos (read)', status: 'Active', demo: true, lastLogin: '2026-07-01 07:30', validFrom: '2026-07-01 08:00', expires: '2026-07-03 08:00' },
];

export const ADMIN_ROLE_MATRIX: { role: string; perms: Record<string, boolean> }[] = [
  { role: 'Platform Super Admin', perms: { global: true, telcos: true, terms: true, health: true, users: true, engines: true } },
  { role: 'Platform Operations', perms: { global: true, telcos: true, terms: false, health: true, users: false, engines: true } },
  { role: 'Platform Finance', perms: { global: true, telcos: true, terms: true, health: false, users: false, engines: false } },
  { role: 'Platform Engineering', perms: { global: true, telcos: false, terms: false, health: true, users: false, engines: true } },
  { role: 'Read Only', perms: { global: true, telcos: true, terms: false, health: true, users: false, engines: true } },
];

// Per-engine detail (deterministic demonstration; TelyAds maps to the 48-cap registry).
export const ENGINE_DETAIL = {
  telysignal: {
    kpis: [['Signal events / day', '2.84B'], ['Ingestion rate', '32.9k/s'], ['Processing latency', '180ms'], ['Data freshness', '14 min']] as [string, string][],
    rows: [['Pseudonymisation gateway', 'Operational', 'No raw MSISDN downstream'], ['Segment generation', 'Operational', '312 active segments'], ['Ingestion queue', 'Healthy', 'Backlog 12k']],
  },
  telyxchange: {
    kpis: [['Decisions / day', '5.04M'], ['Advertiser demand', '538 active'], ['Avg decision latency', '42ms'], ['Fill rate', '92%']] as [string, string][],
    rows: [['Campaign demand', 'Operational', '184 live line items'], ['Inventory allocation', 'Operational', '48 capabilities'], ['Pricing mix', 'CPM 93% · CPA 6% · CPC 1%', '']],
  },
  telyads: {
    kpis: [['Deliveries / day', '50.2M'], ['Success rate', '98.1%'], ['Queue depth', '124k'], ['Avg delivery latency', '210ms']] as [string, string][],
    rows: [['SMS', 'Operational', '2.1M/h'], ['USSD', 'Operational', '1.4M/h'], ['STK Push', 'Operational', '640k/h'], ['WAP Push', 'Operational', '410k/h'], ['OBD Voice', 'Operational', '120k/h']],
  },
  telyreach: {
    kpis: [['Conversions verified / day', '5.18M'], ['Verification rate', '70%'], ['Attribution seam', 'Postback'], ['Fraud flags (24h)', '312']] as [string, string][],
    rows: [['Targeted', '29.3M', ''], ['Delivered', '26.1M', '89% of targeted'], ['Verified', '18.3M', '70% of delivered'], ['Attributed', '17.8M', 'external postback']],
  },
};
