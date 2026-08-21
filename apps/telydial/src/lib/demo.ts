// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC DEMONSTRATION DATA — TelyDial (MVAS acquisition module).
//
// Data-honesty policy (PARITY-04 §31): every surface is one of —
//   • REAL — persisted platform/API data (campaigns via /campaigns, auth).
//   • DETERMINISTIC DEMONSTRATION — the fixed figures below. NOT live production
//     data, and never presented as live MTN results. Every screen says so.
//   • EXTERNAL INTEGRATION REQUIRED — MTN product registry, STK/SMS gateway,
//     charging, live acquisition events.
//
// Aggregate only — no MSISDN / subscriber identities. All constants (no random).
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_NOTE = 'Demonstration figures — not live production data.';
export const EXT_NOTE =
  'External integration required (MTN product registry / STK · SMS gateway / charging) for live data.';

// ── Dashboard KPIs ───────────────────────────────────────────────────────────
export interface Kpi {
  label: string;
  value: string;
  sub: string;
  kind: 'REAL' | 'DEMO' | 'EXT';
}
export const DASHBOARD_KPIS: Kpi[] = [
  { label: 'Active campaigns', value: '7', sub: '2 pending approval', kind: 'DEMO' },
  { label: "Today's STK pushes", value: '145,230', sub: '+18% vs yesterday', kind: 'EXT' },
  { label: 'Total STK pushes', value: '2,847,650', sub: 'All time', kind: 'EXT' },
  { label: "Today's opt-ins", value: '1,234', sub: '+12% vs yesterday', kind: 'EXT' },
  { label: 'Total opt-ins', value: '34,567', sub: 'All campaigns', kind: 'EXT' },
  { label: 'Conversion rate', value: '8.7%', sub: 'Avg across campaigns', kind: 'DEMO' },
  { label: 'Cost per acquisition', value: '₦36.05', sub: 'CPA average', kind: 'DEMO' },
  { label: "Today's spend", value: '₦87,500', sub: 'Budget: ₦250,000', kind: 'DEMO' },
  { label: 'Total spend', value: '₦1,245,000', sub: 'All time', kind: 'DEMO' },
  { label: 'Wallet balance', value: '₦450,000', sub: 'Available', kind: 'DEMO' },
  { label: 'Products', value: '5', sub: 'MTN products registered', kind: 'DEMO' },
  { label: 'Pending approval', value: '2', sub: 'Awaiting telco review', kind: 'DEMO' },
];

// ── Campaigns (demonstration management table) ───────────────────────────────
export interface DemoCampaign {
  id: string;
  name: string;
  status: 'Active' | 'Pending approval' | 'Paused' | 'Rejected';
  product: string;
  audience: string;
  pricing: 'CPA' | 'CPM';
  daily: number;
  total: number;
  optins: number;
  cpa: number;
  conv: number;
  start: string;
  end: string;
}
export const DEMO_CAMPAIGNS: DemoCampaign[] = [
  { id: 'TDC-001', name: 'World Cup Predictor Q2', status: 'Active', product: 'Soka Games', audience: 'Sports', pricing: 'CPA', daily: 25000, total: 245000, optins: 6780, cpa: 36.1, conv: 9.2, start: '2026-06-01', end: '2026-06-30' },
  { id: 'TDC-002', name: 'Yello Trivia June', status: 'Pending approval', product: 'Yello Trivia', audience: 'Entertainment', pricing: 'CPM', daily: 15000, total: 0, optins: 0, cpa: 0, conv: 0, start: '2026-07-01', end: '2026-07-31' },
  { id: 'TDC-003', name: 'Sports Tips Premium', status: 'Active', product: 'Sports Tips', audience: 'Sports', pricing: 'CPA', daily: 20000, total: 187000, optins: 4320, cpa: 43.3, conv: 7.8, start: '2026-06-05', end: '2026-07-05' },
  { id: 'TDC-004', name: 'Ringtone Fiesta', status: 'Paused', product: 'Music Plus', audience: 'Music', pricing: 'CPM', daily: 10000, total: 312000, optins: 12100, cpa: 25.8, conv: 11.2, start: '2026-05-10', end: '2026-06-10' },
  { id: 'TDC-005', name: 'News Flash Daily', status: 'Rejected', product: 'Flash News', audience: 'News', pricing: 'CPA', daily: 8000, total: 0, optins: 0, cpa: 0, conv: 0, start: '2026-06-20', end: '2026-07-20' },
];

// ── Products + verification registry (demo seam for MTN product registry) ─────
export interface DemoProduct {
  id: string;
  name: string;
  status: 'Active' | 'Suspended';
  category: string;
  type: string;
  network: string;
  tariff: string;
  billing: string;
  provider: string;
  created: string;
  campaigns: number;
  acquisition: number;
}
export const PRODUCTS: DemoProduct[] = [
  { id: 'MTN-89012', name: 'Soka Games', status: 'Active', category: 'Gaming', type: 'Recurring weekly', network: 'MTN Nigeria', tariff: '₦50 / week', billing: 'DCB · recurring', provider: '70TH Precinct Limited', created: '2024-03-15', campaigns: 3, acquisition: 18420 },
  { id: 'MTN-45678', name: 'Yello Trivia', status: 'Active', category: 'Entertainment', type: 'Recurring weekly', network: 'MTN Nigeria', tariff: '₦30 / week', billing: 'DCB · recurring', provider: '70TH Precinct Limited', created: '2024-06-20', campaigns: 2, acquisition: 9310 },
  { id: 'MTN-23456', name: 'Sports Tips', status: 'Active', category: 'Sports', type: 'Daily', network: 'MTN Nigeria', tariff: '₦20 / day', billing: 'DCB · daily', provider: '70TH Precinct Limited', created: '2023-11-08', campaigns: 4, acquisition: 22140 },
  { id: 'MTN-34567', name: 'Music Plus', status: 'Suspended', category: 'Music', type: 'Weekly', network: 'MTN Nigeria', tariff: '₦40 / week', billing: 'DCB · recurring', provider: '70TH Precinct Limited', created: '2023-08-01', campaigns: 1, acquisition: 12100 },
  { id: 'MTN-12345', name: 'Flash News', status: 'Active', category: 'News', type: 'Daily', network: 'MTN Nigeria', tariff: '₦15 / day', billing: 'DCB · daily', provider: '70TH Precinct Limited', created: '2025-01-12', campaigns: 2, acquisition: 6740 },
];

/** Deterministic demo verification — NOT a live MTN registry lookup. Only known
 *  demo Product IDs verify; anything else returns not-found (we never treat an
 *  arbitrary ID as network-approved). Live lookup is EXTERNAL INTEGRATION. */
export function verifyProductId(raw: string): DemoProduct | null {
  const id = raw.trim().toUpperCase();
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

// ── Wallet ───────────────────────────────────────────────────────────────────
export const WALLET = {
  balance: '₦450,000',
  reserved: '₦45,000',
  today: '₦87,500',
  totalSpend: '₦1,245,000',
  totalFunded: '₦1,740,000',
};
export interface LedgerRow {
  date: string;
  ref: string;
  type: string;
  method: string;
  platform: 'TelyDial' | 'Ads Manager';
  amount: number;
  balance: number;
}
export const LEDGER: LedgerRow[] = [
  { date: '2026-06-29', ref: 'TW-9821', type: 'Top up', method: 'Bank transfer', platform: 'TelyDial', amount: 200000, balance: 450000 },
  { date: '2026-06-29', ref: 'TS-4421', type: 'Campaign spend', method: 'TDC-001', platform: 'TelyDial', amount: -25000, balance: 250000 },
  { date: '2026-06-28', ref: 'TS-4398', type: 'Campaign spend', method: 'TDC-003', platform: 'TelyDial', amount: -20000, balance: 275000 },
  { date: '2026-06-28', ref: 'TA-2211', type: 'Campaign spend', method: 'ADC-088', platform: 'Ads Manager', amount: -15000, balance: 295000 },
  { date: '2026-06-27', ref: 'TW-9700', type: 'Top up', method: 'Paystack', platform: 'TelyDial', amount: 100000, balance: 310000 },
];
export const PAYMENT_METHODS = ['Bank transfer', 'Paystack', 'Flutterwave', 'Monnify', 'Virtual account', 'Card payment'];

// ── Notifications ────────────────────────────────────────────────────────────
export interface DemoNotif {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  body: string;
  time: string;
  unread: boolean;
}
export const NOTIFS: DemoNotif[] = [
  { type: 'success', title: 'Campaign approved', body: 'World Cup Predictor Q2 approved by MTN Nigeria. Delivery has started.', time: '2 hours ago', unread: true },
  { type: 'warning', title: 'Wallet balance low', body: 'Balance below ₦100,000. Top up to prevent campaign interruption.', time: '5 hours ago', unread: true },
  { type: 'danger', title: 'Campaign rejected', body: 'News Flash Daily rejected. Reviewer comment: creative does not meet MTN content guidelines.', time: '1 day ago', unread: true },
  { type: 'info', title: 'Campaign ending soon', body: 'Sports Tips Premium ends in 3 days. Extend the end date to maintain subscriber acquisition.', time: '2 days ago', unread: false },
  { type: 'info', title: 'Budget exhausted', body: 'Ringtone Fiesta budget fully consumed. 12,100 subscribers acquired at ₦25.8 CPA.', time: '1 week ago', unread: false },
];

// ── Support / FAQ ────────────────────────────────────────────────────────────
export const FAQS: { q: string; a: string }[] = [
  { q: 'How do I verify a new MTN product?', a: 'Go to Products → Verify new product. Enter your MTN-assigned Product ID and the platform retrieves service details from the MTN registry. (In this demo the registry is a deterministic seam — live lookup requires MTN integration.)' },
  { q: 'Why is my campaign in Pending approval?', a: 'Every new campaign, and any campaign with creative or audience changes, must be reviewed by the telco before delivery begins. MTN Nigeria approval typically takes 24–48 hours. You are notified when approved or if reviewer changes are required.' },
  { q: 'What is the difference between CPA and CPM?', a: 'CPM charges per 1,000 STK pushes delivered, regardless of opt-in outcome. CPA charges only when a subscriber presses Accept and their subscription is confirmed by the network after the cancellation window. Both respect your daily spend limit.' },
  { q: 'Are my existing subscribers excluded automatically?', a: 'Yes. The platform uses your Product ID to suppress active subscribers from all campaigns. This cannot be disabled — it prevents wasteful spend and duplicate acquisition charges.' },
  { q: 'Can I change a live campaign?', a: 'You can edit the daily budget, end date, and schedule without re-approval. Changing the creative, audience, product, or targeting returns the campaign to the telco approval queue.' },
  { q: 'What happens when my wallet runs low?', a: 'You are notified when your balance drops below ₦100,000. Campaigns pause automatically when the wallet has insufficient funds for the next delivery batch. Top up and campaigns resume.' },
];
export const SUPPORT_TOPICS: { icon: string; title: string; desc: string }[] = [
  { icon: '📣', title: 'Campaign help', desc: 'Creating, editing, and troubleshooting acquisition campaigns.' },
  { icon: '🆔', title: 'Product verification', desc: 'Verifying MTN Product IDs and resolving registry errors.' },
  { icon: '💳', title: 'Billing & wallet', desc: 'Funding, ledger, CPA/CPM charging and settlement questions.' },
  { icon: '🔌', title: 'Network & integration', desc: 'STK/SMS gateway, DCB charging and delivery integration.' },
  { icon: '🚦', title: 'Escalation', desc: 'Raise a priority issue to the TelyDial support desk.' },
];

// ── Audience option universes ────────────────────────────────────────────────
export const CATEGORIES = ['Sports', 'Gaming', 'Entertainment', 'Lifestyle', 'News', 'Education', 'Finance', 'Health', 'Religion', 'Music', 'Movies', 'Shopping', 'Jobs', 'Agriculture', 'Lottery', 'Travel', 'Food'];
export const STATES = ['Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Delta', 'Enugu', 'Anambra', 'Kaduna', 'Katsina', 'Plateau', 'Borno', 'Edo', 'Ondo', 'Osun'];
export const ARPU_BANDS = ['Very high', 'High', 'Medium', 'Low'];
export const NETWORK_TYPES = ['Urban', 'Semi urban', 'Rural', 'All'];
export const LANGUAGES = ['All languages', 'English', 'Yoruba', 'Hausa', 'Igbo', 'Pidgin'];
export const LOCATION_MODES = ['National', 'By state', 'By zone'];

// ── Creative presets ─────────────────────────────────────────────────────────
export const CTA_PRESETS = ['Subscribe', 'Join now', 'Play now', 'Activate', 'Continue', 'Learn more'];

// ── Commercial models ────────────────────────────────────────────────────────
export const COMMERCIAL_MODELS: { id: 'CPA' | 'CPM'; title: string; desc: string }[] = [
  { id: 'CPA', title: 'CPA — Cost per acquisition', desc: 'Pay only when a subscription is confirmed by the network after the opt-in window.' },
  { id: 'CPM', title: 'CPM — Cost per mille', desc: 'Pay per 1,000 STK pushes delivered, regardless of opt-in outcome.' },
];

// ── Chart datasets ───────────────────────────────────────────────────────────
export const PUSH_TREND = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  pushes: [45000, 62000, 58000, 71000, 89000, 95000, 145230],
  optins: [3200, 4100, 3800, 5200, 7100, 8400, 12340],
};
export const SPEND_TREND = {
  labels: ['Jun 23', 'Jun 24', 'Jun 25', 'Jun 26', 'Jun 27', 'Jun 28', 'Jun 29'],
  spend: [32000, 45000, 41000, 58000, 63000, 72000, 87500],
  cpa: [38, 35, 37, 34, 33, 36, 36],
};
export const STATE_SPLIT: { label: string; value: number; color: string }[] = [
  { label: 'Lagos', value: 38, color: '#6d5ae6' },
  { label: 'Abuja', value: 22, color: '#2a78d6' },
  { label: 'Kano', value: 15, color: '#1baf7a' },
  { label: 'Rivers', value: 12, color: '#eda100' },
  { label: 'Others', value: 13, color: '#94a3b8' },
];
export const FUNNEL = [
  { label: 'Sent', value: 2847650 },
  { label: 'Delivered', value: 2791420 },
  { label: 'Displayed', value: 2703890 },
  { label: 'Accepted', value: 243456 },
  { label: 'Confirmed', value: 198940 },
];
export const ANALYTICS_KPIS: Kpi[] = [
  { label: 'Pushes sent', value: '2,847,650', sub: 'All time', kind: 'EXT' },
  { label: 'Delivered', value: '2,791,420', sub: '98.0%', kind: 'EXT' },
  { label: 'Displayed', value: '2,703,890', sub: '96.9%', kind: 'EXT' },
  { label: 'Accepted', value: '243,456', sub: '9.0%', kind: 'EXT' },
  { label: 'Confirmed subs', value: '198,940', sub: 'After opt-in window', kind: 'EXT' },
  { label: 'Conversion rate', value: '8.7%', sub: 'Displayed → confirmed', kind: 'DEMO' },
  { label: 'CPA average', value: '₦36.05', sub: 'All campaigns', kind: 'DEMO' },
  { label: 'Total spend', value: '₦1,245,000', sub: 'All time', kind: 'DEMO' },
];

// ── Product performance & commercial-model performance (analytics) ───────────
export const PRODUCT_PERFORMANCE = PRODUCTS.map((p) => ({
  name: p.name,
  acquisition: p.acquisition,
  campaigns: p.campaigns,
}));
export const MODEL_PERFORMANCE = [
  { model: 'CPA', spend: 820000, optins: 22800, cpa: 35.9 },
  { model: 'CPM', spend: 425000, optins: 11740, cpa: 36.2 },
];

// ── Reports catalogue ────────────────────────────────────────────────────────
export const REPORTS: { icon: string; title: string; desc: string }[] = [
  { icon: '📊', title: 'Campaign performance', desc: 'Pushes, opt-ins, spend, and CPA across all campaigns.' },
  { icon: '👥', title: 'Product acquisition', desc: 'Subscriber acquisition by campaign, state, and service category.' },
  { icon: '✅', title: 'Opt-in report', desc: 'Opt-in volumes and rates per campaign and per day.' },
  { icon: '💰', title: 'Spend report', desc: 'Daily and monthly spend with CPA and CPM breakdowns.' },
  { icon: '🎯', title: 'CPA report', desc: 'Cost-per-acquisition trends by campaign and model.' },
  { icon: '📍', title: 'Geography report', desc: 'Opt-in rates and acquisition cost by Nigerian state.' },
  { icon: '🗂️', title: 'Product report', desc: 'Per-product acquisition, campaigns, and status history.' },
];
