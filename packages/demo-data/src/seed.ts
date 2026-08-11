import {
  asId,
  money,
  type AdvertiserId,
  type AdvertiserType,
  type Budget,
  type Campaign,
  type Realm,
  type TelcoId,
  type UserId,
  type AudienceDefinition,
} from '@telyad/types';
import { estimateAudience } from '@telyad/audience';

/**
 * All demonstration data lives here as stable constants — no `Math.random()`.
 * IDs are fixed strings so the demo is reproducible across reseeds. This is
 * clearly DEMONSTRATION data (spec §9); it must never be presented as real MTN
 * production results.
 */

export const ENV_LABEL = 'Demonstration Environment';

// ── Telcos ───────────────────────────────────────────────────────────────────
export interface DemoTelco {
  id: TelcoId;
  name: string;
  country: string;
  status: 'Active' | 'Pipeline' | 'Prospect';
  revenueShareBps: number;
  currency: 'NGN';
  partnerSince: string | null;
}

export const MTN_TELCO_ID = asId<'TelcoId'>('telco_mtn_ng');

export const TELCOS: DemoTelco[] = [
  {
    id: MTN_TELCO_ID,
    name: 'MTN Nigeria',
    country: 'Nigeria',
    status: 'Active',
    revenueShareBps: 8000,
    currency: 'NGN',
    partnerSince: '2026-04',
  },
  {
    id: asId<'TelcoId'>('telco_airtel_ng'),
    name: 'Airtel Nigeria',
    country: 'Nigeria',
    status: 'Pipeline',
    revenueShareBps: 7800,
    currency: 'NGN',
    partnerSince: null,
  },
  {
    id: asId<'TelcoId'>('telco_glo_ng'),
    name: 'Glo Nigeria',
    country: 'Nigeria',
    status: 'Pipeline',
    revenueShareBps: 7800,
    currency: 'NGN',
    partnerSince: null,
  },
];

// ── Advertisers (all scoped to MTN for the demo) ─────────────────────────────
export interface DemoAdvertiser {
  id: AdvertiserId;
  telcoId: TelcoId;
  name: string;
  industry: string;
  type: AdvertiserType;
  status: 'Pending' | 'Active' | 'Suspended' | 'Rejected';
  risk: 'Low' | 'Medium' | 'High';
  accountManager: string | null;
  since: string | null;
}

export const TOYOTA_ADVERTISER_ID = asId<'AdvertiserId'>('adv_toyota_ng');
export const MALTINA_ADVERTISER_ID = asId<'AdvertiserId'>('adv_maltina');

const adv = (
  id: string,
  name: string,
  industry: string,
  type: AdvertiserType,
  status: DemoAdvertiser['status'],
  risk: DemoAdvertiser['risk'],
  accountManager: string | null,
  since: string | null,
): DemoAdvertiser => ({
  id: asId<'AdvertiserId'>(id),
  telcoId: MTN_TELCO_ID,
  name,
  industry,
  type,
  status,
  risk,
  accountManager,
  since,
});

export const ADVERTISERS: DemoAdvertiser[] = [
  adv('adv_maltina', 'Maltina (Nigerian Breweries)', 'FMCG', 'ENTERPRISE', 'Active', 'Low', 'F. Adeyemi', '2026-04'),
  adv('adv_cocacola', 'Coca-Cola Nigeria', 'FMCG', 'ENTERPRISE', 'Active', 'Low', 'F. Adeyemi', '2026-04'),
  adv('adv_accessbank', 'Access Bank', 'Banking', 'ENTERPRISE', 'Active', 'Low', 'B. Eze', '2026-04'),
  adv('adv_jumia', 'Jumia', 'E-commerce', 'ENTERPRISE', 'Active', 'Low', 'A. Bello', '2026-05'),
  adv('adv_ikeja_fashion', 'Ikeja Fashion Weekend', 'Retail', 'LOCAL_BUSINESS', 'Active', 'Low', 'Self-service', '2026-07'),
  adv('adv_toyota_ng', 'Toyota Nigeria', 'Automotive', 'ENTERPRISE', 'Active', 'Low', 'F. Adeyemi', '2026-05'),
  adv('adv_fairmoney', 'FairMoney', 'Fintech', 'ENTERPRISE', 'Active', 'Medium', 'B. Eze', '2026-04'),
  adv('adv_lendsqr', 'Lendsqr Loans', 'Fintech', 'VAS_PROVIDER', 'Pending', 'Medium', null, null),
];

// ── Demo users (passwords are assigned at seed time from env, never here) ─────
export interface DemoUser {
  id: UserId;
  name: string;
  email: string;
  realm: Realm;
  role: string;
  telcoId: TelcoId | null;
  advertiserId: AdvertiserId | null;
}

export const DEMO_USERS: DemoUser[] = [
  // Advertiser realm — Toyota Nigeria
  {
    id: asId<'UserId'>('user_adv_toyota_admin'),
    name: 'Ada Obi',
    email: 'ada@toyota.example',
    realm: 'advertiser',
    role: 'Advertiser Admin',
    telcoId: MTN_TELCO_ID,
    advertiserId: TOYOTA_ADVERTISER_ID,
  },
  {
    id: asId<'UserId'>('user_adv_toyota_cm'),
    name: 'Bola Nwosu',
    email: 'bola@toyota.example',
    realm: 'advertiser',
    role: 'Campaign Manager',
    telcoId: MTN_TELCO_ID,
    advertiserId: TOYOTA_ADVERTISER_ID,
  },
  // Telco realm — MTN Nigeria operations
  {
    id: asId<'UserId'>('user_mtn_ops'),
    name: 'T. Okafor',
    email: 'ops.lead@mtn.example',
    realm: 'telco',
    role: 'Operations Manager',
    telcoId: MTN_TELCO_ID,
    advertiserId: null,
  },
  {
    id: asId<'UserId'>('user_mtn_reviewer'),
    name: 'C. Nwosu',
    email: 'reviewer@mtn.example',
    realm: 'telco',
    role: 'Campaign Reviewer',
    telcoId: MTN_TELCO_ID,
    advertiserId: null,
  },
  // Advertiser realm — Maltina (primary demo brand for the marketplace/AI story)
  {
    id: asId<'UserId'>('user_adv_maltina_cm'),
    name: 'Chidi Okeke',
    email: 'chidi@maltina.example',
    realm: 'advertiser',
    role: 'Campaign Manager',
    telcoId: MTN_TELCO_ID,
    advertiserId: MALTINA_ADVERTISER_ID,
  },
  // Telco realm — MTN commercial manager (inventory + revenue governance)
  {
    id: asId<'UserId'>('user_mtn_commercial'),
    name: 'A. Balogun',
    email: 'commercial@mtn.example',
    realm: 'telco',
    role: 'Commercial Manager',
    telcoId: MTN_TELCO_ID,
    advertiserId: null,
  },
  // Platform realm — Tely master admin
  {
    id: asId<'UserId'>('user_tely_admin'),
    name: 'Osa Umweni',
    email: 'admin@tely.example',
    realm: 'platform',
    role: 'Platform Super Admin',
    telcoId: null,
    advertiserId: null,
  },
];

// ── Audience definitions & budgets ───────────────────────────────────────────
const highlanderAudience: AudienceDefinition = {
  geographies: ['Lagos', 'Abuja FCT', 'Rivers'],
  ageBands: ['30-44', '45-54'],
  genders: ['all'],
  deviceTypes: ['smartphone'],
  subscriberTiers: ['premium'],
  interests: ['automotive', 'travel', 'business'],
  arpuBands: ['very_high', 'high'],
  networkTypes: ['urban'],
  languages: [],
  exclusions: ['dnd'],
};

const highlanderBudget: Budget = {
  pricingModel: 'CPM',
  dailyCap: money(50_000_00),
  total: money(500_000_00),
  startDate: '2026-08-14',
  endDate: '2026-08-28',
  frequencyCapPerDay: 3,
  deliverySpeed: 'standard',
};

function scores(audience: AudienceDefinition): { complianceScore: number; riskScore: number } {
  const est = estimateAudience(audience);
  // Deterministic demo scoring derived from quality + exclusions.
  const complianceScore = Math.min(100, 70 + audience.exclusions.length * 8);
  const riskScore = Math.max(4, 30 - Math.round(est.qualityScore / 5));
  return { complianceScore, riskScore };
}

const NOW = '2026-08-10T09:00:00.000Z';

/**
 * The Wednesday demo campaign. Seeded as DRAFT so the presenter submits it live
 * (spec §8 Step 1). After submission it appears in MTN's approval queue.
 */
export const HIGHLANDER_CAMPAIGN: Campaign = {
  id: asId<'CampaignId'>('camp_highlander_testdrive'),
  telcoId: MTN_TELCO_ID,
  advertiserId: TOYOTA_ADVERTISER_ID,
  name: 'Highlander Test Drive',
  objective: 'Acquisition',
  formatId: 'stk',
  status: 'DRAFT',
  audience: highlanderAudience,
  estimatedReach: estimateAudience(highlanderAudience).estimatedReach,
  budget: highlanderBudget,
  ...scores(highlanderAudience),
  createdBy: asId<'UserId'>('user_adv_toyota_cm'),
  createdAt: NOW,
  updatedAt: NOW,
  submittedAt: null,
  approvedAt: null,
  approvedByTelcoName: null,
};

// A second campaign already in the queue, so the console isn't empty on open.
const fairmoneyAudience: AudienceDefinition = {
  geographies: ['Lagos', 'Kano', 'Oyo'],
  ageBands: ['25-34', '35-44'],
  genders: ['all'],
  deviceTypes: ['smartphone', 'feature_phone'],
  subscriberTiers: ['standard'],
  interests: ['finance'],
  arpuBands: ['medium'],
  networkTypes: ['urban', 'semi_urban'],
  languages: [],
  exclusions: ['dnd', 'recent_subscribers'],
};

export const FAIRMONEY_CAMPAIGN: Campaign = {
  id: asId<'CampaignId'>('camp_fairmoney_q3'),
  telcoId: MTN_TELCO_ID,
  advertiserId: asId<'AdvertiserId'>('adv_fairmoney'),
  name: 'FairMoney Q3 Acquisition',
  objective: 'Acquisition',
  formatId: 'sms',
  status: 'PENDING_TELCO_APPROVAL',
  audience: fairmoneyAudience,
  estimatedReach: estimateAudience(fairmoneyAudience).estimatedReach,
  budget: {
    pricingModel: 'CPC',
    dailyCap: money(80_000_00),
    total: money(1_200_000_00),
    startDate: '2026-08-12',
    endDate: '2026-08-31',
    frequencyCapPerDay: 2,
    deliverySpeed: 'even',
  },
  ...scores(fairmoneyAudience),
  createdBy: asId<'UserId'>('user_adv_toyota_admin'),
  createdAt: '2026-08-08T10:00:00.000Z',
  updatedAt: '2026-08-08T10:00:00.000Z',
  submittedAt: '2026-08-08T11:30:00.000Z',
  approvedAt: null,
  approvedByTelcoName: null,
};

// An already-live campaign so advertiser & telco dashboards have history.
const jumiaAudience: AudienceDefinition = {
  geographies: [],
  ageBands: ['18-24', '25-34'],
  genders: ['all'],
  deviceTypes: ['smartphone'],
  subscriberTiers: [],
  interests: ['shopping', 'entertainment'],
  arpuBands: [],
  networkTypes: [],
  languages: [],
  exclusions: ['dnd'],
};

export const JUMIA_CAMPAIGN: Campaign = {
  id: asId<'CampaignId'>('camp_jumia_flash'),
  telcoId: MTN_TELCO_ID,
  advertiserId: asId<'AdvertiserId'>('adv_jumia'),
  name: 'Jumia Flash Sale Reminder',
  objective: 'Conversion',
  formatId: 'sms',
  status: 'LIVE',
  audience: jumiaAudience,
  estimatedReach: estimateAudience(jumiaAudience).estimatedReach,
  budget: {
    pricingModel: 'CPM',
    dailyCap: money(40_000_00),
    total: money(800_000_00),
    startDate: '2026-08-01',
    endDate: '2026-08-20',
    frequencyCapPerDay: 1,
    deliverySpeed: 'standard',
  },
  ...scores(jumiaAudience),
  createdBy: asId<'UserId'>('user_adv_toyota_admin'),
  createdAt: '2026-07-30T09:00:00.000Z',
  updatedAt: '2026-08-01T09:00:00.000Z',
  submittedAt: '2026-07-30T12:00:00.000Z',
  approvedAt: '2026-07-31T09:00:00.000Z',
  approvedByTelcoName: 'MTN Nigeria',
};

// ── Multi-industry demo ecosystem (FMCG · banking · retail · SME) ────────────
function mkCampaign(o: {
  id: string;
  advertiserId: string;
  name: string;
  objective: Campaign['objective'];
  formatId: Campaign['formatId'];
  status: Campaign['status'];
  audience: AudienceDefinition;
  pricingModel: Budget['pricingModel'];
  dailyCap: number;
  total: number;
  start: string;
  end: string;
  createdBy: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  approvedByTelcoName?: string | null;
}): Campaign {
  return {
    id: asId<'CampaignId'>(o.id),
    telcoId: MTN_TELCO_ID,
    advertiserId: asId<'AdvertiserId'>(o.advertiserId),
    name: o.name,
    objective: o.objective,
    formatId: o.formatId,
    status: o.status,
    audience: o.audience,
    estimatedReach: estimateAudience(o.audience).estimatedReach,
    budget: {
      pricingModel: o.pricingModel,
      dailyCap: money(o.dailyCap),
      total: money(o.total),
      startDate: o.start,
      endDate: o.end,
      deliverySpeed: 'standard',
    },
    ...scores(o.audience),
    createdBy: asId<'UserId'>(o.createdBy),
    createdAt: NOW,
    updatedAt: NOW,
    submittedAt: o.submittedAt ?? null,
    approvedAt: o.approvedAt ?? null,
    approvedByTelcoName: o.approvedByTelcoName ?? null,
  };
}

const nationalFmcg: AudienceDefinition = {
  geographies: [],
  ageBands: ['18-24', '25-34', '35-44'],
  genders: ['all'],
  deviceTypes: [],
  subscriberTiers: [],
  interests: ['food', 'family', 'entertainment'],
  arpuBands: [],
  networkTypes: [],
  languages: ['en', 'pcm', 'yo', 'ha', 'ig'],
  exclusions: ['dnd'],
};

export const MALTINA_CAMPAIGN = mkCampaign({
  id: 'camp_maltina_family',
  advertiserId: 'adv_maltina',
  name: 'Maltina Family Moments',
  objective: 'Engagement',
  formatId: 'stk',
  status: 'APPROVED',
  audience: nationalFmcg,
  pricingModel: 'CPM',
  dailyCap: 1_000_000_00,
  total: 20_000_000_00,
  start: '2026-08-14',
  end: '2026-09-11',
  createdBy: 'user_adv_maltina_cm',
  submittedAt: '2026-08-09T10:00:00.000Z',
  approvedAt: '2026-08-10T09:00:00.000Z',
  approvedByTelcoName: 'MTN Nigeria',
});

export const CAMPAIGNS: Campaign[] = [
  HIGHLANDER_CAMPAIGN,
  FAIRMONEY_CAMPAIGN,
  JUMIA_CAMPAIGN,
  MALTINA_CAMPAIGN,
  mkCampaign({
    id: 'camp_cocacola_weekend',
    advertiserId: 'adv_cocacola',
    name: 'Coca-Cola Weekend Refresh',
    objective: 'Awareness',
    formatId: 'sms',
    status: 'LIVE',
    audience: { ...nationalFmcg, geographies: ['Lagos', 'Oyo', 'Rivers'] },
    pricingModel: 'CPM',
    dailyCap: 500_000_00,
    total: 8_000_000_00,
    start: '2026-08-05',
    end: '2026-08-26',
    createdBy: 'user_adv_maltina_cm',
    submittedAt: '2026-08-03T10:00:00.000Z',
    approvedAt: '2026-08-04T09:00:00.000Z',
    approvedByTelcoName: 'MTN Nigeria',
  }),
  mkCampaign({
    id: 'camp_access_digital',
    advertiserId: 'adv_accessbank',
    name: 'Access Bank Digital Account Acquisition',
    objective: 'Acquisition',
    formatId: 'ussd',
    status: 'PENDING_TELCO_APPROVAL',
    audience: {
      ...nationalFmcg,
      interests: ['finance', 'business'],
      deviceTypes: ['smartphone', 'feature_phone'],
      exclusions: ['dnd', 'recent_subscribers'],
    },
    pricingModel: 'CPA',
    dailyCap: 400_000_00,
    total: 6_000_000_00,
    start: '2026-08-15',
    end: '2026-09-05',
    createdBy: 'user_adv_maltina_cm',
    submittedAt: '2026-08-10T08:00:00.000Z',
  }),
  mkCampaign({
    id: 'camp_ikeja_fashion',
    advertiserId: 'adv_ikeja_fashion',
    name: 'Ikeja Fashion Weekend',
    objective: 'Conversion',
    formatId: 'sms',
    status: 'DRAFT',
    audience: {
      geographies: ['Lagos'],
      ageBands: ['18-24', '25-34'],
      genders: ['all'],
      deviceTypes: ['smartphone'],
      subscriberTiers: [],
      interests: ['shopping', 'fashion'],
      arpuBands: [],
      networkTypes: ['urban'],
      languages: ['en', 'pcm', 'yo'],
      exclusions: ['dnd'],
    },
    pricingModel: 'CPM',
    dailyCap: 20_000_00,
    total: 100_000_00,
    start: '2026-08-16',
    end: '2026-08-18',
    createdBy: 'user_adv_maltina_cm',
  }),
];
