import { randomUUID } from 'node:crypto';
import Fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from 'fastify';
import cors from '@fastify/cors';
import {
  approvalDecisionSchema,
  asId,
  createCampaignSchema,
  loginRequestSchema,
  type AuditEvent,
  type AuthUser,
  type Campaign,
  type CampaignApproval,
  type Permission,
  audienceDefinitionSchema,
} from '@telyad/types';
import { permissionsFor } from '@telyad/auth';
import { applyEvent, InvalidTransitionError, TELCO_APPROVAL_QUEUE_STATUSES } from '@telyad/campaign-engine';
import { estimateAudience } from '@telyad/audience';
import {
  getCapability,
  listCapabilities,
  listFormats,
  validateCreative,
} from '@telyad/ad-formats';
import { intelligence, type RevenueLine } from '@telyad/intelligence';
import { CAPABILITY_STATUSES, type CapabilityStatus } from '@telyad/types';
import type { AuthTokenPayload } from '@telyad/auth';
import type { Store } from './store/store';
import { signToken, verifyPassword, verifyToken } from './auth';
import { deriveCampaignMetrics } from './analytics';
import { env } from './env';

declare module 'fastify' {
  interface FastifyRequest {
    auth?: AuthTokenPayload & { permissions: Permission[] };
  }
}

export interface AppOptions {
  store: Store;
  logger?: boolean;
}

function toAuthUser(p: AuthTokenPayload): AuthUser {
  return {
    id: p.sub,
    name: p.name,
    email: p.email,
    realm: p.realm,
    role: p.role,
    telcoId: p.telcoId,
    advertiserId: p.advertiserId,
    permissions: permissionsFor(p.realm, p.role as never),
  };
}

export function buildApp({ store, logger = false }: AppOptions): FastifyInstance {
  const app = Fastify({ logger });

  app.register(cors, { origin: env.corsOrigins, credentials: true });

  // Safe error handler: log the real error server-side, return a generic message.
  app.setErrorHandler((err: FastifyError, req, reply) => {
    req.log.error({ err: err.message, url: req.url, method: req.method }, 'request error');
    const status = typeof err.statusCode === 'number' ? err.statusCode : 500;
    reply.code(status >= 400 && status < 600 ? status : 500).send({
      error: status >= 500 || !err.message ? 'Internal error' : err.message,
    });
  });

  // ── auth middleware ────────────────────────────────────────────────────────
  const authenticate = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Missing bearer token' });
    }
    try {
      const payload = verifyToken(header.slice(7));
      req.auth = { ...payload, permissions: permissionsFor(payload.realm, payload.role as never) };
    } catch {
      return reply.code(401).send({ error: 'Invalid or expired token' });
    }
  };

  const require = (req: FastifyRequest, reply: FastifyReply, perm: Permission): boolean => {
    if (!req.auth) {
      reply.code(401).send({ error: 'Unauthenticated' });
      return false;
    }
    if (!req.auth.permissions.includes(perm)) {
      reply.code(403).send({ error: `Missing permission: ${perm}` });
      return false;
    }
    return true;
  };

  const audit = async (
    req: FastifyRequest,
    fields: Pick<AuditEvent, 'action' | 'target' | 'before' | 'after'>,
  ): Promise<void> => {
    const a = req.auth;
    const event: AuditEvent = {
      id: asId<'AuditEventId'>(randomUUID()),
      telcoId: a?.telcoId ? asId<'TelcoId'>(a.telcoId) : null,
      userId: a ? asId<'UserId'>(a.sub) : null,
      userName: a?.name ?? 'system',
      role: a?.role ?? 'system',
      action: fields.action,
      target: fields.target,
      before: fields.before,
      after: fields.after,
      ip: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
      createdAt: new Date().toISOString(),
    };
    await store.addAuditEvent(event);
  };

  // ── health & readiness ──────────────────────────────────────────────────────
  // Liveness: the process is up. No dependencies checked, no secrets exposed.
  app.get('/health', async () => ({ ok: true, env: env.envLabel }));

  // Readiness: the backing store is reachable. 503 if not (for load balancers).
  app.get('/ready', async (_req, reply) => {
    const storeKind = process.env.STORE === 'memory' ? 'memory' : 'prisma';
    const dbReachable = await store.ping();
    return reply
      .code(dbReachable ? 200 : 503)
      .send({ ready: dbReachable, store: storeKind, db: dbReachable ? 'reachable' : 'unreachable' });
  });

  // ── auth ───────────────────────────────────────────────────────────────────
  app.post('/auth/login', async (req, reply) => {
    const parsed = loginRequestSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid credentials payload' });
    const user = await store.getUserByEmail(parsed.data.email);
    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      // Log the attempt (email only — never the password) for ops visibility.
      req.log.warn({ email: parsed.data.email }, 'auth: login failed');
      return reply.code(401).send({ error: 'Invalid email or password' });
    }
    req.log.info({ userId: user.id, realm: user.realm }, 'auth: login ok');
    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      realm: user.realm,
      role: user.role,
      telcoId: user.telcoId,
      advertiserId: user.advertiserId,
    };
    return { token: signToken(payload), user: toAuthUser(payload) };
  });

  app.get('/auth/me', { preHandler: authenticate }, async (req) => ({ user: toAuthUser(req.auth!) }));

  // ── reference data ───────────────────────────────────────────────────────────
  app.get('/formats', { preHandler: authenticate }, async () => ({ formats: listFormats() }));

  app.post('/audience/estimate', { preHandler: authenticate }, async (req, reply) => {
    const parsed = audienceDefinitionSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid audience definition' });
    return { estimate: estimateAudience(parsed.data) };
  });

  app.get('/telcos', { preHandler: authenticate }, async (req, reply) => {
    if (req.auth!.realm !== 'platform') return reply.code(403).send({ error: 'Platform only' });
    return { telcos: await store.listTelcos() };
  });

  // ── capability universe (catalogue, all realms) ──────────────────────────────
  app.get('/capabilities', { preHandler: authenticate }, async () => ({
    capabilities: listCapabilities(),
  }));
  app.get('/capabilities/:id', { preHandler: authenticate }, async (req, reply) => {
    const capability = getCapability((req.params as { id: string }).id);
    if (!capability) return reply.code(404).send({ error: 'Unknown capability' });
    return { capability };
  });

  // ── advertiser AI (demonstration intelligence) ───────────────────────────────
  app.post('/ai/media-plan', { preHandler: authenticate }, async (req, reply) => {
    if (!require(req, reply, 'campaign:view')) return;
    const body = req.body as Parameters<typeof intelligence.planner.recommendMediaPlan>[0];
    if (!body || typeof body.budgetMinor !== 'number' || !body.objective || !body.sector) {
      return reply.code(400).send({ error: 'sector, objective and budgetMinor are required' });
    }
    return { plan: intelligence.planner.recommendMediaPlan(body) };
  });

  app.post('/ai/localise', { preHandler: authenticate }, async (req, reply) => {
    if (!require(req, reply, 'campaign:view')) return;
    const body = req.body as Parameters<typeof intelligence.localisation.generateVariant>[0];
    if (!body || !body.baseText || !body.targetLanguage) {
      return reply.code(400).send({ error: 'baseText and targetLanguage are required' });
    }
    return { variant: intelligence.localisation.generateVariant(body) };
  });

  app.post('/ai/audience-opportunity', { preHandler: authenticate }, async (req, reply) => {
    if (!require(req, reply, 'campaign:view')) return;
    const parsed = audienceDefinitionSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid audience definition' });
    const estimate = estimateAudience(parsed.data);
    return { estimate, opportunities: intelligence.audience.findOpportunities(parsed.data, estimate) };
  });

  // ── telco inventory governance ───────────────────────────────────────────────
  app.get('/telco/inventory', { preHandler: authenticate }, async (req, reply) => {
    if (!require(req, reply, 'campaign:view')) return;
    const a = req.auth!;
    if (a.realm !== 'telco') return reply.code(403).send({ error: 'Telco console only' });
    const overrides = await store.listCapabilityOverrides(a.telcoId ?? '__none__');
    const items = listCapabilities().map((c) => ({
      capability: c,
      effectiveStatus: overrides[c.id] ?? c.defaultNetworkStatus,
      isOverridden: overrides[c.id] !== undefined,
    }));
    return { items };
  });

  app.post('/telco/inventory/:id/status', { preHandler: authenticate }, async (req, reply) => {
    if (!require(req, reply, 'inventory:manage')) return;
    const a = req.auth!;
    if (a.realm !== 'telco') return reply.code(403).send({ error: 'Telco console only' });
    const capabilityId = (req.params as { id: string }).id;
    const capability = getCapability(capabilityId);
    if (!capability) return reply.code(404).send({ error: 'Unknown capability' });
    const status = (req.body as { status?: string })?.status as CapabilityStatus;
    if (!CAPABILITY_STATUSES.includes(status)) {
      return reply.code(400).send({ error: 'Invalid capability status' });
    }
    const before = (await store.listCapabilityOverrides(a.telcoId ?? '__none__'))[capabilityId] ?? capability.defaultNetworkStatus;
    await store.setCapabilityStatus(a.telcoId!, capabilityId, status);
    await audit(req, {
      action: 'Changed capability network status',
      target: capability.name,
      before,
      after: status,
    });
    req.log.info({ capabilityId, from: before, to: status, by: a.sub }, 'inventory: status changed');
    return { capabilityId, status };
  });

  // ── telco revenue intelligence ───────────────────────────────────────────────
  app.get('/telco/revenue-intelligence', { preHandler: authenticate }, async (req, reply) => {
    if (!require(req, reply, 'revenue:view')) return;
    const a = req.auth!;
    if (a.realm !== 'telco') return reply.code(403).send({ error: 'Telco console only' });
    const [campaigns, advertisers] = await Promise.all([
      store.listCampaigns({ telcoId: a.telcoId ?? '__none__' }),
      store.listAdvertisers(a.telcoId ?? '__none__'),
    ]);
    const advIndustry = new Map(advertisers.map((ad) => [ad.id, ad.industry]));
    const familyByFormat: Record<string, string> = {
      sms: 'messaging',
      ussd: 'ussd_interactive',
      stk: 'sim_device',
      wap: 'sim_device',
      obd: 'voice',
    };
    const lines: RevenueLine[] = campaigns.map((c) => ({
      industry: advIndustry.get(c.advertiserId) ?? 'Other',
      family: familyByFormat[c.formatId] ?? 'messaging',
      pricingModel: c.budget.pricingModel,
      spendMinor: c.budget.total.minor,
    }));
    return { report: intelligence.revenue.analyse({ currency: 'NGN', lines }) };
  });

  // ── telco AI intelligence (demonstration insights) ───────────────────────────
  app.get('/telco/ai-intelligence', { preHandler: authenticate }, async (req, reply) => {
    if (!require(req, reply, 'campaign:view')) return;
    const a = req.auth!;
    if (a.realm !== 'telco') return reply.code(403).send({ error: 'Telco console only' });
    const [campaigns, advertisers] = await Promise.all([
      store.listCampaigns({ telcoId: a.telcoId ?? '__none__' }),
      store.listAdvertisers(a.telcoId ?? '__none__'),
    ]);
    const advIndustry = new Map(advertisers.map((ad) => [ad.id, ad.industry]));
    const familyByFormat: Record<string, string> = {
      sms: 'messaging', ussd: 'ussd_interactive', stk: 'sim_device', wap: 'sim_device', obd: 'voice',
    };
    const report = intelligence.revenue.analyse({
      currency: 'NGN',
      lines: campaigns.map((c) => ({
        industry: advIndustry.get(c.advertiserId) ?? 'Other',
        family: familyByFormat[c.formatId] ?? 'messaging',
        pricingModel: c.budget.pricingModel,
        spendMinor: c.budget.total.minor,
      })),
    });
    const pending = campaigns.filter((c) => c.status === 'PENDING_TELCO_APPROVAL').length;
    const insights = [
      {
        kind: 'revenue_opportunity',
        title: 'Under-utilised inventory could unlock FMCG revenue',
        detail: report.opportunities[0]?.detail ?? 'Inventory utilisation is healthy across live formats.',
      },
      {
        kind: 'campaign_risk',
        title: `${pending} campaign(s) awaiting review`,
        detail: 'Timely approvals keep advertiser spend flowing and inventory monetised.',
      },
      {
        kind: 'audience_saturation',
        title: 'Monitor repeated targeting of the same aggregate cohorts',
        detail: 'Diversifying targeted cohorts protects engagement and frequency-cap compliance.',
      },
    ];
    return { insights, report, generatedBy: 'demonstration-rules' as const };
  });

  // ── campaigns (advertiser + telco scoped) ────────────────────────────────────
  app.get('/campaigns', { preHandler: authenticate }, async (req) => {
    const a = req.auth!;
    const campaigns = await store.listCampaigns(
      a.realm === 'advertiser'
        ? { advertiserId: a.advertiserId ?? '__none__' }
        : a.realm === 'telco'
          ? { telcoId: a.telcoId ?? '__none__' }
          : {},
    );
    return { campaigns };
  });

  app.get('/campaigns/:id', { preHandler: authenticate }, async (req, reply) => {
    const c = await store.getCampaign((req.params as { id: string }).id);
    if (!c || !canAccessCampaign(req.auth!, c)) return reply.code(404).send({ error: 'Not found' });
    return { campaign: c };
  });

  // Deterministic demo analytics for a campaign (scoped).
  app.get('/campaigns/:id/metrics', { preHandler: authenticate }, async (req, reply) => {
    const c = await store.getCampaign((req.params as { id: string }).id);
    if (!c || !canAccessCampaign(req.auth!, c)) return reply.code(404).send({ error: 'Not found' });
    return { metrics: deriveCampaignMetrics(c) };
  });

  app.post('/campaigns', { preHandler: authenticate }, async (req, reply) => {
    if (!require(req, reply, 'campaign:create')) return;
    const parsed = createCampaignSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid campaign', details: parsed.error.flatten() });
    }
    const input = parsed.data;
    const a = req.auth!;
    // Tenant enforcement: an advertiser can only create for its own advertiserId/telco.
    if (a.realm === 'advertiser' && input.advertiserId !== a.advertiserId) {
      return reply.code(403).send({ error: 'Cannot create a campaign for another advertiser' });
    }
    const creative = validateCreative(input.formatId, input.creativeFields);
    if (!creative.ok) return reply.code(400).send({ error: 'Invalid creative', details: creative.errors });

    const est = estimateAudience(input.audience);
    const now = new Date().toISOString();
    const campaign: Campaign = {
      id: asId<'CampaignId'>(randomUUID()),
      telcoId: asId<'TelcoId'>(input.telcoId),
      advertiserId: asId<'AdvertiserId'>(input.advertiserId),
      name: input.name,
      objective: input.objective,
      formatId: input.formatId,
      status: 'DRAFT',
      audience: input.audience,
      estimatedReach: est.estimatedReach,
      budget: input.budget as unknown as Campaign['budget'],
      complianceScore: Math.min(100, 70 + input.audience.exclusions.length * 8),
      riskScore: Math.max(4, 30 - Math.round(est.qualityScore / 5)),
      createdBy: asId<'UserId'>(a.sub),
      createdAt: now,
      updatedAt: now,
      submittedAt: null,
      approvedAt: null,
      approvedByTelcoName: null,
    };
    const saved = await store.createCampaign(campaign);
    await audit(req, { action: 'Created campaign', target: saved.name, before: null, after: 'DRAFT' });
    req.log.info({ campaignId: saved.id, advertiserId: saved.advertiserId }, 'campaign: created');
    return reply.code(201).send({ campaign: saved });
  });

  app.post('/campaigns/:id/submit', { preHandler: authenticate }, async (req, reply) => {
    if (!require(req, reply, 'campaign:submit')) return;
    const id = (req.params as { id: string }).id;
    const c = await store.getCampaign(id);
    if (!c || !canAccessCampaign(req.auth!, c)) return reply.code(404).send({ error: 'Not found' });
    try {
      const next = applyEvent(c.status, 'submit');
      const updated = await store.updateCampaign(id, {
        status: next,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await audit(req, {
        action: 'Submitted campaign for approval',
        target: c.name,
        before: c.status,
        after: next,
      });
      req.log.info({ campaignId: id, from: c.status, to: next }, 'campaign: submitted');
      return { campaign: updated };
    } catch (e) {
      if (e instanceof InvalidTransitionError) return reply.code(409).send({ error: e.message });
      throw e;
    }
  });

  // ── telco approval queue + decision ──────────────────────────────────────────
  app.get('/telco/approval-queue', { preHandler: authenticate }, async (req, reply) => {
    if (!require(req, reply, 'campaign:view')) return;
    const a = req.auth!;
    if (a.realm !== 'telco') return reply.code(403).send({ error: 'Telco console only' });
    const campaigns = await store.listCampaigns({
      telcoId: a.telcoId ?? '__none__',
      statuses: TELCO_APPROVAL_QUEUE_STATUSES,
    });
    return { campaigns };
  });

  app.post('/campaigns/:id/decision', { preHandler: authenticate }, async (req, reply) => {
    const parsed = approvalDecisionSchema.safeParse({
      ...(req.body as object),
      campaignId: (req.params as { id: string }).id,
    });
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid decision payload' });
    const wantsApprove = parsed.data.decision === 'APPROVED';
    // A rejection must carry a reason (spec §13).
    if (!wantsApprove && parsed.data.comments.trim().length === 0) {
      return reply.code(400).send({ error: 'A comment is required when rejecting a campaign' });
    }
    if (!require(req, reply, wantsApprove ? 'campaign:approve' : 'campaign:reject')) return;

    const a = req.auth!;
    if (a.realm !== 'telco') return reply.code(403).send({ error: 'Telco console only' });
    const c = await store.getCampaign(parsed.data.campaignId);
    // Tenant isolation: a telco can only decide on its own campaigns.
    if (!c || c.telcoId !== a.telcoId) return reply.code(404).send({ error: 'Not found' });

    const event = parsed.data.decision === 'APPROVED' ? 'approve' : 'reject';
    try {
      const next = applyEvent(c.status, event as 'approve' | 'reject');
      const telco = await store.getTelco(c.telcoId);
      const updated = await store.updateCampaign(c.id, {
        status: next,
        updatedAt: new Date().toISOString(),
        approvedAt: next === 'APPROVED' ? new Date().toISOString() : null,
        approvedByTelcoName: next === 'APPROVED' ? (telco?.name ?? null) : null,
      });
      const approval: CampaignApproval = {
        id: asId<'ApprovalId'>(randomUUID()),
        campaignId: c.id,
        telcoId: c.telcoId,
        decision: parsed.data.decision,
        approverUserId: asId<'UserId'>(a.sub),
        approverName: a.name,
        comments: parsed.data.comments,
        decidedAt: new Date().toISOString(),
      };
      await store.addApproval(approval);
      await audit(req, {
        action: next === 'APPROVED' ? 'Approved campaign' : 'Rejected campaign',
        target: c.name,
        before: c.status,
        after: next,
      });
      req.log.info(
        { campaignId: c.id, decision: parsed.data.decision, to: next, approver: a.sub },
        'campaign: approval decision',
      );
      return { campaign: updated, approval };
    } catch (e) {
      if (e instanceof InvalidTransitionError) return reply.code(409).send({ error: e.message });
      throw e;
    }
  });

  // ── telco directory + audit + notifications ─────────────────────────────────
  app.get('/telco/advertisers', { preHandler: authenticate }, async (req, reply) => {
    const a = req.auth!;
    if (a.realm !== 'telco') return reply.code(403).send({ error: 'Telco console only' });
    return { advertisers: await store.listAdvertisers(a.telcoId ?? '__none__') };
  });

  app.get('/telco/approvals', { preHandler: authenticate }, async (req, reply) => {
    if (!require(req, reply, 'campaign:view')) return;
    const a = req.auth!;
    if (a.realm !== 'telco') return reply.code(403).send({ error: 'Telco console only' });
    return { approvals: await store.listApprovals({ telcoId: a.telcoId ?? '__none__' }) };
  });

  app.get('/telco/audit', { preHandler: authenticate }, async (req, reply) => {
    if (!require(req, reply, 'audit:view')) return;
    const a = req.auth!;
    return { events: await store.listAuditEvents({ telcoId: a.telcoId }) };
  });

  app.get('/notifications', { preHandler: authenticate }, async (req) => {
    const a = req.auth!;
    return {
      notifications: await store.listNotifications({ telcoId: a.telcoId, realm: a.realm }),
    };
  });

  return app;
}

function canAccessCampaign(auth: AuthTokenPayload, c: Campaign): boolean {
  if (auth.realm === 'platform') return true;
  if (auth.realm === 'telco') return c.telcoId === auth.telcoId;
  return c.advertiserId === auth.advertiserId;
}
