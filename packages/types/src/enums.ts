/**
 * Canonical enums. Declared as `as const` arrays so they double as runtime
 * value lists (for validation, seeds and UI) and as string-literal union types.
 * SQLite/Postgres-portable: stored as strings, validated in the app layer.
 */

// ── Campaign lifecycle (spec §7) ─────────────────────────────────────────────
export const CAMPAIGN_STATUSES = [
  'DRAFT',
  'READY_FOR_REVIEW',
  'SUBMITTED',
  'PENDING_TELCO_APPROVAL',
  'APPROVED',
  'REJECTED',
  'SCHEDULED',
  'LIVE',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

// ── Advertising formats (spec §15) — current registry; ~19 more to come ──────
export const AD_FORMAT_IDS = ['stk', 'sms', 'obd', 'wap', 'ussd'] as const;
export type AdFormatId = (typeof AD_FORMAT_IDS)[number];

export const AD_FORMAT_CATEGORIES = ['messaging', 'voice', 'interactive', 'web'] as const;
export type AdFormatCategory = (typeof AD_FORMAT_CATEGORIES)[number];

// ── Pricing models ───────────────────────────────────────────────────────────
export const PRICING_MODELS = ['CPM', 'CPC', 'CPA', 'CPL'] as const;
export type PricingModel = (typeof PRICING_MODELS)[number];

// ── Campaign objective ───────────────────────────────────────────────────────
export const CAMPAIGN_OBJECTIVES = [
  'Acquisition',
  'Conversion',
  'Awareness',
  'Engagement',
] as const;
export type CampaignObjective = (typeof CAMPAIGN_OBJECTIVES)[number];

// ── Telco / partnership ──────────────────────────────────────────────────────
export const TELCO_STATUSES = ['Active', 'Pipeline', 'Prospect'] as const;
export type TelcoStatus = (typeof TELCO_STATUSES)[number];

// ── Advertiser ───────────────────────────────────────────────────────────────
export const ADVERTISER_STATUSES = ['Pending', 'Active', 'Suspended', 'Rejected'] as const;
export type AdvertiserStatus = (typeof ADVERTISER_STATUSES)[number];

export const RISK_LEVELS = ['Low', 'Medium', 'High'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

// ── Approvals ────────────────────────────────────────────────────────────────
export const APPROVAL_DECISIONS = ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'] as const;
export type ApprovalDecision = (typeof APPROVAL_DECISIONS)[number];

// ── Realms & roles (spec §16) ────────────────────────────────────────────────
export const REALMS = ['advertiser', 'telco', 'platform'] as const;
export type Realm = (typeof REALMS)[number];

export const ADVERTISER_ROLES = [
  'Advertiser Admin',
  'Campaign Manager',
  'Analyst',
  'Finance',
  'Read Only',
] as const;
export type AdvertiserRole = (typeof ADVERTISER_ROLES)[number];

export const TELCO_ROLES = [
  'Telco Super Admin',
  'Operations Manager',
  'Marketing Manager',
  'Compliance Officer',
  'Campaign Reviewer',
  'Finance Officer',
  'Support',
  'Read Only',
] as const;
export type TelcoRole = (typeof TELCO_ROLES)[number];

export const PLATFORM_ROLES = [
  'Platform Super Admin',
  'Platform Operations',
  'Platform Engineering',
  'Platform Finance',
  'Platform Support',
  'Read Only',
] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export type AnyRole = AdvertiserRole | TelcoRole | PlatformRole;

// ── Permissions (server-enforced) ────────────────────────────────────────────
export const PERMISSIONS = [
  'campaign:create',
  'campaign:submit',
  'campaign:view',
  'campaign:approve',
  'campaign:reject',
  'campaign:launch',
  'advertiser:approve',
  'advertiser:suspend',
  'wallet:manage',
  'compliance:view',
  'users:manage',
  'audit:view',
  'reports:export',
  'telco:manage',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

// ── Compliance / consent ─────────────────────────────────────────────────────
export const COMPLIANCE_CHECK_TYPES = ['DND', 'NDPA', 'NCC_VAS', 'CONSENT', 'CONTENT'] as const;
export type ComplianceCheckType = (typeof COMPLIANCE_CHECK_TYPES)[number];

export const COMPLIANCE_RESULTS = ['PASS', 'WARN', 'FAIL'] as const;
export type ComplianceResult = (typeof COMPLIANCE_RESULTS)[number];

// ── Ledger ───────────────────────────────────────────────────────────────────
export const LEDGER_ENTRY_TYPES = ['TOPUP', 'SPEND', 'REFUND', 'SETTLEMENT', 'CREDIT'] as const;
export type LedgerEntryType = (typeof LEDGER_ENTRY_TYPES)[number];
