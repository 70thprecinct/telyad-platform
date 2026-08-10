import type {
  AdFormatCategory,
  AdFormatId,
  AdvertiserStatus,
  AnyRole,
  CampaignObjective,
  CampaignStatus,
  ComplianceCheckType,
  ComplianceResult,
  LedgerEntryType,
  Permission,
  PricingModel,
  Realm,
  RiskLevel,
  TelcoStatus,
} from './enums.js';
import type { CurrencyCode, Money } from './money.js';
import type {
  AdvertiserId,
  ApprovalId,
  AuditEventId,
  CampaignId,
  CreativeId,
  InvoiceId,
  LedgerEntryId,
  NotificationId,
  TelcoId,
  UserId,
  WalletId,
} from './ids.js';
import type { AudienceDefinition } from './audience.js';

/** Every telco-owned resource carries a telcoId (spec §11, multi-tenant). */
export interface Tenanted {
  readonly telcoId: TelcoId;
}

export interface Telco {
  id: TelcoId;
  name: string;
  country: string;
  status: TelcoStatus;
  /** Revenue share to the telco, in basis points (8000 = 80%). */
  revenueShareBps: number;
  currency: CurrencyCode;
  partnerSince: string | null;
  createdAt: string;
}

export interface Advertiser extends Tenanted {
  id: AdvertiserId;
  name: string;
  industry: string;
  status: AdvertiserStatus;
  risk: RiskLevel;
  accountManager: string | null;
  since: string | null;
  createdAt: string;
}

export interface Agency extends Tenanted {
  id: AdvertiserId;
  name: string;
  managesAdvertiserIds: AdvertiserId[];
}

export interface User {
  id: UserId;
  name: string;
  email: string;
  realm: Realm;
  role: AnyRole;
  /** Null for platform users (cross-telco); set for telco/advertiser users. */
  telcoId: TelcoId | null;
  /** Set for advertiser-realm users. */
  advertiserId: AdvertiserId | null;
  status: 'Active' | 'Suspended';
  lastLoginAt: string | null;
}

export interface RoleDefinition {
  role: AnyRole;
  realm: Realm;
  permissions: Permission[];
}

// ── Advertising format registry (spec §15) ───────────────────────────────────
export interface CreativeFieldSpec {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'select' | 'number';
  maxLength?: number;
  required?: boolean;
  options?: string[];
  hint?: string;
}

export interface AdvertisingFormat {
  id: AdFormatId;
  name: string;
  category: AdFormatCategory;
  description: string;
  /** Which telcos support this format. */
  supportedTelcoIds: TelcoId[] | 'all';
  creativeSchema: CreativeFieldSpec[];
  pricingModels: PricingModel[];
  targetingCapabilities: string[];
  /** Which preview renderer the UI should use. */
  previewRenderer: AdFormatId;
  complianceRequirements: ComplianceCheckType[];
  status: 'available' | 'beta' | 'coming_soon';
}

// ── Campaign aggregate ───────────────────────────────────────────────────────
export interface CampaignCreative {
  id: CreativeId;
  campaignId: CampaignId;
  formatId: AdFormatId;
  /** Format-specific field values, validated against the format's creativeSchema. */
  fields: Record<string, string>;
  /** Optional SMS fallback body for STK campaigns. */
  smsFallback?: string;
}

export interface Budget {
  pricingModel: PricingModel;
  dailyCap: Money;
  total: Money;
  lifetimeCap?: Money;
  startDate: string;
  endDate: string;
  frequencyCapPerDay?: number;
  deliverySpeed: 'standard' | 'accelerated' | 'even';
}

export interface Campaign extends Tenanted {
  id: CampaignId;
  advertiserId: AdvertiserId;
  name: string;
  objective: CampaignObjective;
  formatId: AdFormatId;
  status: CampaignStatus;
  audience: AudienceDefinition;
  /** Aggregate estimate — never contains identities. */
  estimatedReach: number;
  budget: Budget;
  /** Deterministic demo compliance/risk scoring (0–100). */
  complianceScore: number;
  riskScore: number;
  createdBy: UserId;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedByTelcoName: string | null;
}

export interface CampaignMetric {
  campaignId: CampaignId;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: Money;
}

export interface CampaignApproval {
  id: ApprovalId;
  campaignId: CampaignId;
  telcoId: TelcoId;
  decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  approverUserId: UserId;
  approverName: string;
  comments: string;
  decidedAt: string;
}

// ── Finance ──────────────────────────────────────────────────────────────────
export interface Wallet {
  id: WalletId;
  advertiserId: AdvertiserId;
  telcoId: TelcoId;
  balance: Money;
  reserved: Money;
}

export interface LedgerEntry {
  id: LedgerEntryId;
  walletId: WalletId;
  type: LedgerEntryType;
  amount: Money;
  reference: string;
  description: string;
  createdAt: string;
}

export interface Invoice {
  id: InvoiceId;
  advertiserId: AdvertiserId;
  telcoId: TelcoId;
  amount: Money;
  status: 'draft' | 'issued' | 'paid' | 'void';
  issuedAt: string | null;
}

// ── Governance ───────────────────────────────────────────────────────────────
export interface ComplianceCheck {
  type: ComplianceCheckType;
  result: ComplianceResult;
  detail: string;
}

export interface AuditEvent {
  id: AuditEventId;
  /** Null telcoId = platform-level event. */
  telcoId: TelcoId | null;
  userId: UserId | null;
  userName: string;
  role: string;
  action: string;
  target: string;
  before: string | null;
  after: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface Notification {
  id: NotificationId;
  telcoId: TelcoId | null;
  audienceRealm: Realm;
  severity: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}
