import type { PrismaClient } from '@prisma/client';
import {
  asId,
  type Advertiser,
  type AuditEvent,
  type AudienceDefinition,
  type Budget,
  type Campaign,
  type CampaignApproval,
  type CampaignObjective,
  type CampaignStatus,
  type Notification,
  type Telco,
  type AdFormatId,
  type AnyRole,
  type Realm,
} from '@telyad/types';
import type { CampaignFilter, Store, StoredUser } from './store';

/** Maps a persisted Campaign row (JSON strings) back into the domain type. */
function rowToCampaign(r: {
  id: string;
  telcoId: string;
  advertiserId: string;
  name: string;
  objective: string;
  formatId: string;
  status: string;
  audienceJson: string;
  estimatedReach: number;
  budgetJson: string;
  complianceScore: number;
  riskScore: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedByTelcoName: string | null;
}): Campaign {
  return {
    id: asId<'CampaignId'>(r.id),
    telcoId: asId<'TelcoId'>(r.telcoId),
    advertiserId: asId<'AdvertiserId'>(r.advertiserId),
    name: r.name,
    objective: r.objective as CampaignObjective,
    formatId: r.formatId as AdFormatId,
    status: r.status as CampaignStatus,
    audience: JSON.parse(r.audienceJson) as AudienceDefinition,
    estimatedReach: r.estimatedReach,
    budget: JSON.parse(r.budgetJson) as Budget,
    complianceScore: r.complianceScore,
    riskScore: r.riskScore,
    createdBy: asId<'UserId'>(r.createdBy),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    submittedAt: r.submittedAt,
    approvedAt: r.approvedAt,
    approvedByTelcoName: r.approvedByTelcoName,
  };
}

function campaignToRow(c: Campaign) {
  return {
    id: c.id,
    telcoId: c.telcoId,
    advertiserId: c.advertiserId,
    name: c.name,
    objective: c.objective,
    formatId: c.formatId,
    status: c.status,
    audienceJson: JSON.stringify(c.audience),
    estimatedReach: c.estimatedReach,
    budgetJson: JSON.stringify(c.budget),
    complianceScore: c.complianceScore,
    riskScore: c.riskScore,
    createdBy: c.createdBy,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    submittedAt: c.submittedAt,
    approvedAt: c.approvedAt,
    approvedByTelcoName: c.approvedByTelcoName,
  };
}

/** Prisma-backed Store (production persistence path). */
export class PrismaStore implements Store {
  constructor(private readonly prisma: PrismaClient) {}

  async ping(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async getUserByEmail(email: string): Promise<StoredUser | null> {
    const u = await this.prisma.user.findUnique({ where: { email } });
    return u ? this.mapUser(u) : null;
  }
  async getUserById(id: string): Promise<StoredUser | null> {
    const u = await this.prisma.user.findUnique({ where: { id } });
    return u ? this.mapUser(u) : null;
  }
  private mapUser(u: {
    id: string;
    name: string;
    email: string;
    realm: string;
    role: string;
    telcoId: string | null;
    advertiserId: string | null;
    status: string;
    lastLoginAt: string | null;
    passwordHash: string;
  }): StoredUser {
    return {
      id: asId<'UserId'>(u.id),
      name: u.name,
      email: u.email,
      realm: u.realm as Realm,
      role: u.role as AnyRole,
      telcoId: u.telcoId ? asId<'TelcoId'>(u.telcoId) : null,
      advertiserId: u.advertiserId ? asId<'AdvertiserId'>(u.advertiserId) : null,
      status: u.status as 'Active' | 'Suspended',
      lastLoginAt: u.lastLoginAt,
      passwordHash: u.passwordHash,
    };
  }

  async listTelcos(): Promise<Telco[]> {
    return (await this.prisma.telco.findMany()).map((t) => ({
      ...t,
      id: asId<'TelcoId'>(t.id),
      status: t.status as Telco['status'],
      currency: t.currency as Telco['currency'],
    }));
  }
  async getTelco(id: string): Promise<Telco | null> {
    const t = await this.prisma.telco.findUnique({ where: { id } });
    return t
      ? { ...t, id: asId<'TelcoId'>(t.id), status: t.status as Telco['status'], currency: t.currency as Telco['currency'] }
      : null;
  }
  async listAdvertisers(telcoId: string): Promise<Advertiser[]> {
    return (await this.prisma.advertiser.findMany({ where: { telcoId } })).map((a) => ({
      ...a,
      id: asId<'AdvertiserId'>(a.id),
      telcoId: asId<'TelcoId'>(a.telcoId),
      type: a.type as Advertiser['type'],
      status: a.status as Advertiser['status'],
      risk: a.risk as Advertiser['risk'],
    }));
  }
  async getAdvertiser(id: string): Promise<Advertiser | null> {
    const a = await this.prisma.advertiser.findUnique({ where: { id } });
    return a
      ? {
          ...a,
          id: asId<'AdvertiserId'>(a.id),
          telcoId: asId<'TelcoId'>(a.telcoId),
          type: a.type as Advertiser['type'],
          status: a.status as Advertiser['status'],
          risk: a.risk as Advertiser['risk'],
        }
      : null;
  }

  async createCampaign(campaign: Campaign): Promise<Campaign> {
    const row = await this.prisma.campaign.create({ data: campaignToRow(campaign) });
    return rowToCampaign(row);
  }
  async getCampaign(id: string): Promise<Campaign | null> {
    const row = await this.prisma.campaign.findUnique({ where: { id } });
    return row ? rowToCampaign(row) : null;
  }
  async listCampaigns(filter: CampaignFilter): Promise<Campaign[]> {
    const rows = await this.prisma.campaign.findMany({
      where: {
        telcoId: filter.telcoId,
        advertiserId: filter.advertiserId,
        status: filter.statuses ? { in: filter.statuses } : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(rowToCampaign);
  }
  async updateCampaign(id: string, patch: Partial<Campaign>): Promise<Campaign> {
    const data: Record<string, unknown> = {};
    if (patch.status !== undefined) data.status = patch.status;
    if (patch.updatedAt !== undefined) data.updatedAt = patch.updatedAt;
    if (patch.submittedAt !== undefined) data.submittedAt = patch.submittedAt;
    if (patch.approvedAt !== undefined) data.approvedAt = patch.approvedAt;
    if (patch.approvedByTelcoName !== undefined) data.approvedByTelcoName = patch.approvedByTelcoName;
    if (patch.audience !== undefined) data.audienceJson = JSON.stringify(patch.audience);
    if (patch.budget !== undefined) data.budgetJson = JSON.stringify(patch.budget);
    const row = await this.prisma.campaign.update({ where: { id }, data });
    return rowToCampaign(row);
  }

  async addApproval(approval: CampaignApproval): Promise<CampaignApproval> {
    await this.prisma.campaignApproval.create({ data: approval });
    return approval;
  }
  async listApprovals(filter: { telcoId?: string; campaignId?: string }): Promise<CampaignApproval[]> {
    const rows = await this.prisma.campaignApproval.findMany({
      where: { telcoId: filter.telcoId, campaignId: filter.campaignId },
    });
    return rows.map((r) => ({
      ...r,
      id: asId<'ApprovalId'>(r.id),
      campaignId: asId<'CampaignId'>(r.campaignId),
      telcoId: asId<'TelcoId'>(r.telcoId),
      decision: r.decision as CampaignApproval['decision'],
      approverUserId: asId<'UserId'>(r.approverUserId),
    }));
  }
  async addAuditEvent(event: AuditEvent): Promise<AuditEvent> {
    await this.prisma.auditEvent.create({ data: event });
    return event;
  }
  async listAuditEvents(filter: { telcoId?: string | null }): Promise<AuditEvent[]> {
    const rows = await this.prisma.auditEvent.findMany({
      where: filter.telcoId !== undefined ? { telcoId: filter.telcoId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      ...r,
      id: asId<'AuditEventId'>(r.id),
      telcoId: r.telcoId ? asId<'TelcoId'>(r.telcoId) : null,
      userId: r.userId ? asId<'UserId'>(r.userId) : null,
    }));
  }
  async listNotifications(filter: { telcoId?: string | null; realm: string }): Promise<Notification[]> {
    const rows = await this.prisma.notification.findMany({
      where: { audienceRealm: filter.realm, telcoId: filter.telcoId ?? undefined },
    });
    return rows.map((r) => ({
      ...r,
      id: asId<'NotificationId'>(r.id),
      telcoId: r.telcoId ? asId<'TelcoId'>(r.telcoId) : null,
      audienceRealm: r.audienceRealm as Realm,
      severity: r.severity as Notification['severity'],
    }));
  }
}
