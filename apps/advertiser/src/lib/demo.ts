// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC DEMONSTRATION DATA (advertiser portal).
//
// Data-honesty policy (PARITY-01 §19): the portal shows three kinds of data —
//   • REAL APPLICATION DATA — persisted TelyAd objects, fetched from the API
//     (campaigns, notifications, audience-match, the 48-capability registry).
//   • DETERMINISTIC DEMONSTRATION DATA — the fixed figures below, used for
//     presentation where a live MTN/carrier signal does not yet exist. These are
//     NOT live MTN statistics and every screen that uses them says so.
//   • EXTERNAL INTEGRATION REQUIRED — clearly flagged in the UI.
//
// Everything here is a constant (no randomness) so the demo is reproducible.
// No MSISDN / subscriber PII ever appears.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_NOTE = 'Demonstration figures — not live MTN production data.';

// Channel families map onto the production 48-capability registry (single source
// of truth). These are the delivery-channel groupings the prototype used.
export const CHANNEL_PERF = [
  { channel: 'STK Push', capabilityFamily: 'SIM & Device', impressions: 12_140_000, interactions: 509_880, rate: 4.2, conversions: 48_220, cpaMinor: 5860, spendMinor: 28_244_000, color: '#7c3aed' },
  { channel: 'SMS', capabilityFamily: 'Messaging', impressions: 18_420_000, interactions: 645_900, rate: 3.51, conversions: 72_110, cpaMinor: 3910, spendMinor: 78_120_000, color: '#0a9d5e' },
  { channel: 'USSD', capabilityFamily: 'USSD & Interactive', impressions: 8_040_000, interactions: 514_560, rate: 6.4, conversions: 59_640, cpaMinor: 4620, spendMinor: 41_200_000, color: '#3b5bdb' },
  { channel: 'WAP Push', capabilityFamily: 'Carrier Digital Media', impressions: 8_700_000, interactions: 208_800, rate: 2.4, conversions: 22_400, cpaMinor: 6280, spendMinor: 32_000_000, color: '#0891b2' },
  { channel: 'OBD Voice', capabilityFamily: 'Voice', impressions: 4_200_000, interactions: 134_400, rate: 3.2, conversions: 12_440, cpaMinor: 8040, spendMinor: 19_800_000, color: '#b26a00' },
];

export const SPEND_TREND = {
  labels: ['18 Jun', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30 Jun', '1 Jul'],
  data: [148000, 162000, 175000, 158000, 192000, 188000, 210000, 225000, 198000, 231000, 245000, 238000, 258000, 212000],
};

export const HEADLINE = {
  spendMinor: 284_000_000, // ₦2.84M
  impressions: 47_200_000,
  conversions: 192_400,
  interactionRate: 4.07,
  avgCpaMinor: 5860,
};

export interface DemoSegment {
  id: string;
  name: string;
  description: string;
  size: number;
  signalScore: number;
  geography: string[];
  devices: string;
  channels: string[];
  status: 'Active' | 'Draft' | 'Archived';
  updated: string;
}

export const SEGMENTS: DemoSegment[] = [
  { id: 'seg_sports', name: 'High-intent sports gamblers', description: 'Voice-heavy subscribers with repeat betting USSD sessions.', size: 280_000, signalScore: 91, geography: ['Lagos', 'Oyo', 'Rivers'], devices: 'Smartphone + feature', channels: ['SMS', 'USSD', 'STK Push'], status: 'Active', updated: '2026-06-29' },
  { id: 'seg_premium', name: 'Premium recharge (₦10k+)', description: 'Top recharge tier — proven purchasing power.', size: 1_240_000, signalScore: 84, geography: ['National'], devices: 'Smartphone', channels: ['SMS', 'WAP Push'], status: 'Active', updated: '2026-06-27' },
  { id: 'seg_lowbal', name: 'Low-balance credit seekers', description: 'Frequent balance enquiries under ₦100.', size: 3_100_000, signalScore: 76, geography: ['Kano', 'Kaduna'], devices: 'Feature phone', channels: ['USSD'], status: 'Active', updated: '2026-06-24' },
  { id: 'seg_data', name: 'Data-active young adults', description: '18–34 heavy data subscribers, Lagos/Abuja.', size: 2_050_000, signalScore: 88, geography: ['Lagos', 'Abuja FCT'], devices: 'Smartphone', channels: ['WAP Push', 'STK Push'], status: 'Active', updated: '2026-06-22' },
  { id: 'seg_fmcg', name: 'FMCG promo responders', description: 'Engaged with prior FMCG SMS promos.', size: 5_400_000, signalScore: 69, geography: ['National'], devices: 'All devices', channels: ['SMS'], status: 'Draft', updated: '2026-06-18' },
];

export interface DemoCreative {
  id: string;
  name: string;
  capabilityId: string;
  channel: string;
  language: string;
  status: 'Approved' | 'In review' | 'Draft' | 'Rejected';
  campaign: string | null;
  created: string;
  body: string;
}

export const CREATIVES: DemoCreative[] = [
  { id: 'cr_stk_1', name: 'Game Zone STK menu', capabilityId: 'stk_push', channel: 'STK Push', language: 'English', status: 'Approved', campaign: 'MTN Game Zone Q3', created: '2026-06-30', body: 'Play MTN Game Zone. Win daily. Dial to join.' },
  { id: 'cr_sms_1', name: 'Total Goals acquisition SMS', capabilityId: 'standard_sms', channel: 'SMS', language: 'English', status: 'Approved', campaign: 'Total Goals SMS Acq.', created: '2026-06-20', body: 'Predict. Win. Join Total Goals free this week. Reply STOP to opt out.' },
  { id: 'cr_sms_pidgin', name: 'Total Goals SMS (Pidgin)', capabilityId: 'standard_sms', channel: 'SMS', language: 'Nigerian Pidgin', status: 'In review', campaign: 'Total Goals SMS Acq.', created: '2026-06-21', body: 'Predict, win! Join Total Goals free this week. Reply STOP to comot.' },
  { id: 'cr_ussd_1', name: 'Correct Score USSD splash', capabilityId: 'ussd_pre_session', channel: 'USSD', language: 'English', status: 'Approved', campaign: 'Correct Score USSD', created: '2026-06-14', body: 'Correct Score is live. 1. Play  2. Learn more  0. Exit' },
  { id: 'cr_wap_1', name: 'Predictor WAP banner', capabilityId: 'wap_push', channel: 'WAP Push', language: 'English', status: 'Draft', campaign: null, created: '2026-06-11', body: 'Tap to open the Predictor — zero-rated.' },
];

// Billing & budget — DETERMINISTIC DEMONSTRATION DATA. No real payment processing.
export const BILLING = {
  currency: 'NGN' as const,
  availableMinor: 421_600_000, // wallet balance
  committedMinor: 199_400_000, // sum of active campaign budgets
  spentMtdMinor: 284_000_000,
  allocations: [
    { campaign: 'MTN Game Zone Q3', budgetMinor: 45_600_000, spentMinor: 28_244_000 },
    { campaign: 'Total Goals SMS Acq.', budgetMinor: 100_000_000, spentMinor: 78_120_000 },
    { campaign: 'Correct Score USSD', budgetMinor: 62_000_000, spentMinor: 41_200_000 },
    { campaign: 'WAP Predictor Push', budgetMinor: 40_000_000, spentMinor: 32_000_000 },
  ],
  ledger: [
    { id: 'lx1', date: '2026-07-01', type: 'SPEND', ref: 'CMP-GAMEZONE', desc: 'STK Push delivery', amountMinor: -2_820_000 },
    { id: 'lx2', date: '2026-06-30', type: 'TOPUP', ref: 'PAY-2210', desc: 'Wallet top-up', amountMinor: 200_000_000 },
    { id: 'lx3', date: '2026-06-29', type: 'SPEND', ref: 'CMP-TOTALGOALS', desc: 'SMS delivery', amountMinor: -7_800_000 },
    { id: 'lx4', date: '2026-06-28', type: 'CREDIT', ref: 'ADJ-014', desc: 'Delivery shortfall credit', amountMinor: 1_240_000 },
  ],
  invoices: [
    { id: 'INV-2026-06', period: 'June 2026', amountMinor: 268_400_000, status: 'Paid' as const },
    { id: 'INV-2026-05', period: 'May 2026', amountMinor: 241_100_000, status: 'Paid' as const },
    { id: 'INV-2026-07', period: 'July 2026 (running)', amountMinor: 42_000_000, status: 'Draft' as const },
  ],
};

export const DASHBOARD_ALERTS = [
  { icon: '⚠', tone: 'warning' as const, title: 'STK Push delivery slowed', desc: 'MTN Game Zone saw 8% below-target delivery between 02:00–04:00 WAT.', time: '2 hours ago' },
  { icon: '✓', tone: 'success' as const, title: 'Budget milestone reached', desc: 'Total Goals SMS campaign hit 75% of budget. Projected to end 1 Jul.', time: '6 hours ago' },
  { icon: '◆', tone: 'info' as const, title: 'New audience segment ready', desc: 'High-intent sports gamblers — 280K subscribers identified.', time: 'Yesterday' },
];
