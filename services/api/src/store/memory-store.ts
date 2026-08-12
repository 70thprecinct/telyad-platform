import type {
  Advertiser,
  AuditEvent,
  Campaign,
  CampaignApproval,
  CapabilityStatus,
  Notification,
  Telco,
} from '@telyad/types';
import type { CampaignFilter, Store, StoredUser } from './store';
import { buildSeed } from './seed-data';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/**
 * In-memory Store. Used by the integration tests (fast, no DB) and as a
 * zero-setup runtime option (STORE=memory). Data is reseeded on construction.
 */
export class MemoryStore implements Store {
  private telcos = new Map<string, Telco>();
  private advertisers = new Map<string, Advertiser>();
  private users = new Map<string, StoredUser>();
  private campaigns = new Map<string, Campaign>();
  private approvals: CampaignApproval[] = [];
  private audit: AuditEvent[] = [];
  private notifications: Notification[] = [];

  constructor(passwordHash: string) {
    const seed = buildSeed(passwordHash);
    seed.telcos.forEach((t) => this.telcos.set(t.id, t));
    seed.advertisers.forEach((a) => this.advertisers.set(a.id, a));
    seed.users.forEach((u) => this.users.set(u.id, u));
    seed.campaigns.forEach((c) => this.campaigns.set(c.id, c));
    this.notifications = seed.notifications;
  }

  async ping(): Promise<boolean> {
    return true;
  }

  async getUserByEmail(email: string): Promise<StoredUser | null> {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return clone(u);
    }
    return null;
  }
  async getUserById(id: string): Promise<StoredUser | null> {
    const u = this.users.get(id);
    return u ? clone(u) : null;
  }
  async createUser(user: StoredUser): Promise<StoredUser> {
    this.users.set(user.id, clone(user));
    return clone(user);
  }
  async updateUser(id: string, patch: Partial<StoredUser>): Promise<StoredUser> {
    const existing = this.users.get(id);
    if (!existing) throw new Error(`User not found: ${id}`);
    const updated = { ...existing, ...patch };
    this.users.set(id, updated);
    return clone(updated);
  }
  async listDemoUsers(): Promise<StoredUser[]> {
    return clone([...this.users.values()].filter((u) => u.isDemo));
  }
  async listTelcos(): Promise<Telco[]> {
    return clone([...this.telcos.values()]);
  }
  async getTelco(id: string): Promise<Telco | null> {
    const t = this.telcos.get(id);
    return t ? clone(t) : null;
  }
  async listAdvertisers(telcoId: string): Promise<Advertiser[]> {
    return clone([...this.advertisers.values()].filter((a) => a.telcoId === telcoId));
  }
  async getAdvertiser(id: string): Promise<Advertiser | null> {
    const a = this.advertisers.get(id);
    return a ? clone(a) : null;
  }

  async createCampaign(campaign: Campaign): Promise<Campaign> {
    this.campaigns.set(campaign.id, clone(campaign));
    return clone(campaign);
  }
  async getCampaign(id: string): Promise<Campaign | null> {
    const c = this.campaigns.get(id);
    return c ? clone(c) : null;
  }
  async listCampaigns(filter: CampaignFilter): Promise<Campaign[]> {
    let list = [...this.campaigns.values()];
    if (filter.telcoId) list = list.filter((c) => c.telcoId === filter.telcoId);
    if (filter.advertiserId) list = list.filter((c) => c.advertiserId === filter.advertiserId);
    if (filter.statuses) list = list.filter((c) => filter.statuses!.includes(c.status));
    return clone(list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
  }
  async updateCampaign(id: string, patch: Partial<Campaign>): Promise<Campaign> {
    const existing = this.campaigns.get(id);
    if (!existing) throw new Error(`Campaign not found: ${id}`);
    const updated = { ...existing, ...patch };
    this.campaigns.set(id, updated);
    return clone(updated);
  }

  async addApproval(approval: CampaignApproval): Promise<CampaignApproval> {
    this.approvals.push(clone(approval));
    return clone(approval);
  }
  async listApprovals(filter: { telcoId?: string; campaignId?: string }): Promise<CampaignApproval[]> {
    let list = this.approvals;
    if (filter.telcoId) list = list.filter((a) => a.telcoId === filter.telcoId);
    if (filter.campaignId) list = list.filter((a) => a.campaignId === filter.campaignId);
    return clone(list);
  }
  async addAuditEvent(event: AuditEvent): Promise<AuditEvent> {
    this.audit.push(clone(event));
    return clone(event);
  }
  async listAuditEvents(filter: { telcoId?: string | null }): Promise<AuditEvent[]> {
    let list = this.audit;
    if (filter.telcoId !== undefined) list = list.filter((e) => e.telcoId === filter.telcoId);
    return clone([...list].reverse());
  }
  async listNotifications(filter: { telcoId?: string | null; realm: string }): Promise<Notification[]> {
    return clone(
      this.notifications.filter(
        (n) => n.audienceRealm === filter.realm && (filter.telcoId ? n.telcoId === filter.telcoId : true),
      ),
    );
  }

  private capabilityOverrides = new Map<string, CapabilityStatus>();
  private key(telcoId: string, capabilityId: string): string {
    return `${telcoId}::${capabilityId}`;
  }
  async listCapabilityOverrides(telcoId: string): Promise<Record<string, CapabilityStatus>> {
    const out: Record<string, CapabilityStatus> = {};
    for (const [k, v] of this.capabilityOverrides) {
      const [t, cap] = k.split('::');
      if (t === telcoId && cap) out[cap] = v;
    }
    return out;
  }
  async setCapabilityStatus(telcoId: string, capabilityId: string, status: CapabilityStatus): Promise<void> {
    this.capabilityOverrides.set(this.key(telcoId, capabilityId), status);
  }
}
