import { randomBytes, randomUUID } from 'node:crypto';
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
  createDemoUserSchema,
  deriveDemoStatus,
  extendDemoUserSchema,
  isDemoAccessLive,
  loginRequestSchema,
  PORTAL_REALM,
  resetDemoPasswordSchema,
  type AuditEvent,
  type AuthUser,
  type Campaign,
  type CampaignApproval,
  type DemoUserView,
  type Permission,
  type Portal,
  audienceDefinitionSchema,
} from '@telyad/types';
import { permissionsFor } from '@telyad/auth';
import { applyEvent, InvalidTransitionError, TELCO_APPROVAL_QUEUE_STATUSES } from '@telyad/campaign-engine';
import { estimateAudience, estimateAudienceMatch } from '@telyad/audience';
import type {
  AudienceCriteria,
  AudienceEstimateSnapshot,
  AudienceMatchInput,
  CampaignCapability,
} from '@telyad/types';
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
import { hashPassword, signToken, verifyPassword, verifyToken } from './auth';
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

/** Cryptographically-strong temporary password (Crockford-ish, unambiguous). */
function generatePassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(16);
  let out = '';
  for (let i = 0; i < 16; i++) out += alphabet[bytes[i]! % alphabet.length];
  return `${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8, 12)}-${out.slice(12, 16)}`;
}

/** Map a stored user to the safe admin view (never exposes the hash). */
function toDemoView(u: {
  id: string; name: string; email: string; portal: string; organisation: string | null;
  role: string; isDemo: boolean; disabled: boolean; revokedAt: string | null;
  validFrom: string | null; expiresAt: string | null; createdAt: string;
  createdByName: string | null; lastLoginAt: string | null;
}, nowMs: number): DemoUserView {
  return {
    id: u.id, name: u.name, email: u.email, portal: u.portal as DemoUserView['portal'],
    organisation: u.organisation, role: u.role,
    status: deriveDemoStatus(u, nowMs),
    createdAt: u.createdAt, createdByName: u.createdByName,
    validFrom: u.validFrom, expiresAt: u.expiresAt, lastLoginAt: u.lastLoginAt,
  };
}

function toAuthUser(p: AuthTokenPayload): AuthUser {
  return {
    id: p.sub,
    name: p.name,
    email: p.email,
    realm: p.realm,
    portal: p.portal,
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
    let payload: AuthTokenPayload;
    try {
      payload = verifyToken(header.slice(7));
    } catch {
      return reply.code(401).send({ error: 'Invalid or expired token' });
    }
    // Re-check the account against the store on EVERY protected request, so a
    // demo account that has since expired / been revoked / disabled stops
    // working immediately — an already-issued token is never sufficient on its
    // own. Enforcement is server-side; the frontend is never trusted for this.
    const user = await store.getUserById(payload.sub);
    if (!user) return reply.code(401).send({ error: 'Account no longer exists' });
    if (!isDemoAccessLive(user, Date.now())) {
      req.log.info({ userId: user.id, portal: user.portal }, 'auth: demo access no longer valid');
      return reply.code(401).send({ error: 'Demo access has expired', code: 'ACCESS_EXPIRED' });
    }
    req.auth = { ...payload, permissions: permissionsFor(payload.realm, payload.role as never) };
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
    // Portal isolation: an account issued for one portal cannot sign into
    // another. When the client declares its portal, it must match.
    if (parsed.data.portal && parsed.data.portal !== user.portal) {
      req.log.warn(
        { email: user.email, requested: parsed.data.portal, actual: user.portal },
        'auth: portal mismatch',
      );
      return reply.code(403).send({ error: 'This account cannot access this portal' });
    }
    // Demo lifecycle: reject before validFrom, after expiry, when revoked/disabled.
    const now = Date.now();
    if (!isDemoAccessLive(user, now)) {
      req.log.warn({ userId: user.id }, 'auth: demo access not valid at login');
      const status = deriveDemoStatus(user, now);
      return reply.code(403).send({ error: `Demo access ${status.toLowerCase()}`, code: 'ACCESS_EXPIRED' });
    }
    req.log.info({ userId: user.id, realm: user.realm, portal: user.portal }, 'auth: login ok');
    await store.updateUser(user.id, { lastLoginAt: new Date(now).toISOString() });
    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      realm: user.realm,
      portal: user.portal,
      role: user.role,
      telcoId: user.telcoId,
      advertiserId: user.advertiserId,
    };
    // Clamp the token lifetime so it can never outlive the account's expiry.
    const maxAgeSec = user.expiresAt
      ? Math.max(1, Math.floor((Date.parse(user.expiresAt) - now) / 1000))
      : undefined;
    return { token: signToken(payload, maxAgeSec), user: toAuthUser(payload) };
  });

  app.get('/auth/me', { preHandler: authenticate }, async (req) => ({ user: toAuthUser(req.auth!) }));

  // ── demo access (administrator-issued temporary accounts) ─────────────────────
  // Only a platform (Tely Master Admin) user with users:manage may administer
  // demo accounts. RBAC/tenant rules are unchanged — a demo account is a normal
  // account with a validity window; it never bypasses any security rule.
  const requireAdmin = (req: FastifyRequest, reply: FastifyReply): boolean => {
    if (!req.auth) {
      reply.code(401).send({ error: 'Unauthenticated' });
      return false;
    }
    if (req.auth.realm !== 'platform' || !req.auth.permissions.includes('users:manage' as Permission)) {
      reply.code(403).send({ error: 'Demo access administration is restricted' });
      return false;
    }
    return true;
  };

  app.get('/admin/demo-users', { preHandler: authenticate }, async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const now = Date.now();
    const users = await store.listDemoUsers();
    return {
      users: users
        .map((u) => toDemoView(u, now))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    };
  });

  app.post('/admin/demo-users', { preHandler: authenticate }, async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const parsed = createDemoUserSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid demo user payload' });
    const input = parsed.data;

    if (await store.getUserByEmail(input.email)) {
      return reply.code(409).send({ error: 'A user with this email already exists' });
    }

    // The administrator chooses the portal → realm; the demo user can never
    // pick or widen its own role/realm/portal.
    const portal = input.portal as Portal;
    const realm = PORTAL_REALM[portal];
    if (permissionsFor(realm, input.role as never).length === 0) {
      return reply.code(400).send({ error: `Role "${input.role}" is not valid for the ${portal} portal` });
    }

    // Resolve + validate the tenant for tenant-scoped portals.
    let telcoId: string | null = null;
    let advertiserId: string | null = null;
    let organisation = input.organisation ?? null;
    if (realm === 'telco') {
      if (!input.tenantId) return reply.code(400).send({ error: 'tenantId (telco) required for this portal' });
      const telco = await store.getTelco(input.tenantId);
      if (!telco) return reply.code(400).send({ error: 'Unknown telco tenant' });
      telcoId = telco.id;
      organisation = organisation ?? telco.name;
    } else if (realm === 'advertiser') {
      if (input.tenantId) {
        const adv = await store.getAdvertiser(input.tenantId);
        if (!adv) return reply.code(400).send({ error: 'Unknown advertiser tenant' });
        advertiserId = adv.id;
        telcoId = adv.telcoId;
        organisation = organisation ?? adv.name;
      }
    }

    const now = Date.now();
    const validFrom = input.validFrom ?? new Date(now).toISOString();
    const expiresAt =
      input.expiresAt ?? new Date(Date.parse(validFrom) + input.durationHours! * 3600_000).toISOString();
    if (Date.parse(expiresAt) <= Date.parse(validFrom)) {
      return reply.code(400).send({ error: 'expiresAt must be after validFrom' });
    }

    const plainPassword = input.password ?? generatePassword();
    const user = {
      id: asId<'UserId'>(randomUUID()),
      name: input.name,
      email: input.email,
      realm,
      portal,
      role: input.role as never,
      telcoId: telcoId ? asId<'TelcoId'>(telcoId) : null,
      advertiserId: advertiserId ? asId<'AdvertiserId'>(advertiserId) : null,
      status: 'Active' as const,
      lastLoginAt: null,
      passwordHash: hashPassword(plainPassword), // bcrypt — plaintext never stored
      isDemo: true,
      organisation,
      createdAt: new Date(now).toISOString(),
      createdByUserId: asId<'UserId'>(req.auth!.sub),
      createdByName: req.auth!.name,
      validFrom,
      expiresAt,
      revokedAt: null,
      disabled: false,
    };
    const created = await store.createUser(user);
    await audit(req, {
      action: 'Created demo access',
      target: `${input.email} · ${portal} · ${input.role}`,
      before: null,
      after: `valid ${validFrom} → ${expiresAt}`,
    });
    // The plaintext password is returned exactly once, here, so the admin can
    // hand it to the invited user. It is never persisted or retrievable again.
    return reply.code(201).send({
      user: toDemoView(created, now),
      credentials: { email: created.email, password: plainPassword, portal, expiresAt },
    });
  });

  const getDemoUserOr404 = async (id: string, reply: FastifyReply) => {
    const u = await store.getUserById(id);
    if (!u || !u.isDemo) {
      reply.code(404).send({ error: 'Demo user not found' });
      return null;
    }
    return u;
  };

  app.post('/admin/demo-users/:id/extend', { preHandler: authenticate }, async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const parsed = extendDemoUserSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid expiry' });
    const u = await getDemoUserOr404((req.params as { id: string }).id, reply);
    if (!u) return;
    const updated = await store.updateUser(u.id, { expiresAt: parsed.data.expiresAt });
    await audit(req, { action: 'Changed demo access expiry', target: u.email, before: u.expiresAt, after: parsed.data.expiresAt });
    return { user: toDemoView(updated, Date.now()) };
  });

  app.post('/admin/demo-users/:id/revoke', { preHandler: authenticate }, async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const u = await getDemoUserOr404((req.params as { id: string }).id, reply);
    if (!u) return;
    const updated = await store.updateUser(u.id, { revokedAt: new Date().toISOString() });
    await audit(req, { action: 'Revoked demo access', target: u.email, before: 'active', after: 'revoked' });
    return { user: toDemoView(updated, Date.now()) };
  });

  app.post('/admin/demo-users/:id/disable', { preHandler: authenticate }, async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const u = await getDemoUserOr404((req.params as { id: string }).id, reply);
    if (!u) return;
    const updated = await store.updateUser(u.id, { disabled: true });
    await audit(req, { action: 'Disabled demo access', target: u.email, before: 'enabled', after: 'disabled' });
    return { user: toDemoView(updated, Date.now()) };
  });

  app.post('/admin/demo-users/:id/enable', { preHandler: authenticate }, async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const u = await getDemoUserOr404((req.params as { id: string }).id, reply);
    if (!u) return;
    // Re-enable only clears the disabled flag; a revoked or expired account
    // stays inaccessible (the window still governs access).
    const updated = await store.updateUser(u.id, { disabled: false });
    await audit(req, { action: 'Re-enabled demo access', target: u.email, before: 'disabled', after: 'enabled' });
    return { user: toDemoView(updated, Date.now()) };
  });

  app.post('/admin/demo-users/:id/reset-password', { preHandler: authenticate }, async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const parsed = resetDemoPasswordSchema.safeParse(req.body ?? {});
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid reset payload' });
    const u = await getDemoUserOr404((req.params as { id: string }).id, reply);
    if (!u) return;
    const plainPassword = parsed.data.password ?? generatePassword();
    await store.updateUser(u.id, { passwordHash: hashPassword(plainPassword) });
    await audit(req, { action: 'Reset demo access password', target: u.email, before: null, after: null });
    return { credentials: { email: u.email, password: plainPassword, portal: u.portal, expiresAt: u.expiresAt } };
  });

  // ── reference data ───────────────────────────────────────────────────────────
  app.get('/formats', { preHandler: authenticate }, async () => ({ formats: listFormats() }));

  app.post('/audience/estimate', { preHandler: authenticate }, async (req, reply) => {
    const parsed = audienceDefinitionSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid audience definition' });
    return { estimate: estimateAudience(parsed.data) };
  });

  // Audience-match: eligible / selected target / forecast for selected capabilities.
  app.post('/audience/match', { preHandler: authenticate }, async (req, reply) => {
    const body = req.body as {
      criteria?: AudienceCriteria;
      capabilityIds?: string[];
      selectedTarget?: number;
    };
    if (!body?.criteria || !Array.isArray(body.capabilityIds) || body.capabilityIds.length === 0) {
      return reply.code(400).send({ error: 'criteria and at least one capabilityId are required' });
    }
    const caps = body.capabilityIds.map((id) => getCapability(id)).filter((c): c is NonNullable<typeof c> => !!c);
    if (caps.length === 0) return reply.code(400).send({ error: 'No valid capabilities selected' });

    const input: AudienceMatchInput = {
      criteria: body.criteria,
      selectedTarget: typeof body.selectedTarget === 'number' ? body.selectedTarget : undefined,
      capabilities: caps.map((c) => ({
        id: c.id,
        name: c.name,
        deviceClass: c.deviceClass,
        pricingModel: c.pricingModels[0] ?? 'CPM',
        networkStatus: c.defaultNetworkStatus,
      })),
    };
    const result = estimateAudienceMatch(input);

    // Privacy (spec §24): never expose exact small counts. When too narrow,
    // return only the flag + threshold, no precise figures.
    if (result.privacy.tooNarrow) {
      return {
        match: {
          estimatorVersion: result.estimatorVersion,
          basePool: result.basePool,
          funnel: [],
          eligibleAudience: 0,
          selectedTarget: 0,
          forecastReach: { low: 0, point: 0, high: 0 },
          frequency: 0,
          estimatedCostMinor: 0,
          perFormat: [],
          privacy: result.privacy,
          currency: 'NGN' as const,
        },
      };
    }
    return { match: result };
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

    // ── Compute the media plan + audience snapshot SERVER-SIDE (authoritative).
    // The client's numbers are never trusted — we recompute from the criteria,
    // selected capabilities and target so eligible/forecast counts cannot be
    // forged. This snapshot is persisted and is exactly what MTN reviews.
    const capIds: string[] =
      input.capabilityIds && input.capabilityIds.length > 0
        ? input.capabilityIds
        : (() => {
            const c = listCapabilities().find((x) => x.creatableFormatId === input.formatId);
            return c ? [c.id] : [];
          })();
    const caps = capIds.map((id) => getCapability(id)).filter((c): c is NonNullable<typeof c> => !!c);
    if (input.capabilityIds && caps.length !== capIds.length) {
      return reply.code(400).send({ error: 'One or more capabilityIds are invalid' });
    }
    const criteria: AudienceCriteria = {
      geographies: input.audience.geographies,
      ageBands: input.audience.ageBands,
      devices: input.audience.deviceTypes.filter(
        (d): d is 'smartphone' | 'feature_phone' => d === 'smartphone' || d === 'feature_phone',
      ),
      dataUse: [],
      spendBands: input.audience.arpuBands,
      affinities: input.audience.interests,
      engagement: [],
      languages: input.audience.languages,
    };
    let audienceSnapshot: AudienceEstimateSnapshot | null = null;
    let capabilityPlan: CampaignCapability[] = [];
    if (caps.length > 0) {
      const match = estimateAudienceMatch({
        criteria,
        selectedTarget: input.selectedTarget,
        capabilities: caps.map((c) => ({
          id: c.id,
          name: c.name,
          deviceClass: c.deviceClass,
          pricingModel: c.pricingModels[0] ?? 'CPM',
          networkStatus: c.defaultNetworkStatus,
        })),
      });
      capabilityPlan = caps.map((c, i) => {
        const f = match.perFormat.find((p) => p.capabilityId === c.id);
        return {
          capabilityId: c.id,
          name: c.name,
          statusAtSubmission: c.defaultNetworkStatus,
          allocation: f?.allocation ?? 0,
          eligible: f?.eligible ?? 0,
          forecast: f?.forecast ?? 0,
          costMinor: f?.costMinor ?? 0,
          sortOrder: i,
        };
      });
      if (!match.privacy.tooNarrow) {
        audienceSnapshot = {
          estimatorVersion: match.estimatorVersion,
          estimatedAt: now,
          criteria,
          capabilityIds: capIds,
          eligibleAudience: match.eligibleAudience,
          selectedTarget: match.selectedTarget,
          forecastReach: match.forecastReach,
          frequency: match.frequency,
          estimatedCostMinor: match.estimatedCostMinor,
          formatAllocation: match.perFormat.map((f) => ({
            capabilityId: f.capabilityId,
            allocation: f.allocation,
            forecast: f.forecast,
            costMinor: f.costMinor,
          })),
          languageStrategy: input.audience.languages,
        };
      }
    }

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
      audienceSnapshot,
      capabilityPlan,
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
