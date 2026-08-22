import type {
  Advertiser,
  AuditEvent,
  Campaign,
  CampaignApproval,
  CampaignStatus,
  CapabilityStatus,
  Notification,
  Telco,
  User,
} from '@telyad/types';

/** A user as persisted, including the password hash (never leaves the store). */
export interface StoredUser extends User {
  passwordHash: string;
}

export interface CampaignFilter {
  telcoId?: string;
  advertiserId?: string;
  statuses?: CampaignStatus[];
}

/**
 * Persistence boundary. Two implementations exist: an in-memory store (tests +
 * zero-setup) and a Prisma/SQLite store (runtime). Tenant scoping is enforced
 * by the route layer passing the caller's telcoId/advertiserId into filters —
 * never by the client.
 */
export interface Store {
  /** Readiness probe — true if the backing store is reachable. */
  ping(): Promise<boolean>;

  // auth / directory
  getUserByEmail(email: string): Promise<StoredUser | null>;
  getUserById(id: string): Promise<StoredUser | null>;
  createUser(user: StoredUser): Promise<StoredUser>;
  updateUser(id: string, patch: Partial<StoredUser>): Promise<StoredUser>;
  /** All administrator-issued demo accounts (isDemo=true). Never returns hashes to callers. */
  listDemoUsers(): Promise<StoredUser[]>;
  listTelcos(): Promise<Telco[]>;
  getTelco(id: string): Promise<Telco | null>;
  listAdvertisers(telcoId: string): Promise<Advertiser[]>;
  getAdvertiser(id: string): Promise<Advertiser | null>;

  // campaigns
  createCampaign(campaign: Campaign): Promise<Campaign>;
  getCampaign(id: string): Promise<Campaign | null>;
  listCampaigns(filter: CampaignFilter): Promise<Campaign[]>;
  updateCampaign(id: string, patch: Partial<Campaign>): Promise<Campaign>;

  // approvals & audit
  addApproval(approval: CampaignApproval): Promise<CampaignApproval>;
  listApprovals(filter: { telcoId?: string; campaignId?: string }): Promise<CampaignApproval[]>;
  addAuditEvent(event: AuditEvent): Promise<AuditEvent>;
  listAuditEvents(filter: { telcoId?: string | null }): Promise<AuditEvent[]>;

  listNotifications(filter: {
    telcoId?: string | null;
    realm: string;
  }): Promise<Notification[]>;

  // capability governance (per-telco network availability overrides)
  listCapabilityOverrides(telcoId: string): Promise<Record<string, CapabilityStatus>>;
  setCapabilityStatus(telcoId: string, capabilityId: string, status: CapabilityStatus): Promise<void>;
}
