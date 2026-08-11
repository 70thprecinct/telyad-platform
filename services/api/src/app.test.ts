import { beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app';
import { MemoryStore } from './store/memory-store';
import { hashPassword, signToken } from './auth';
import { env } from './env';

let app: FastifyInstance;

async function login(email: string): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email, password: env.demoPassword },
  });
  expect(res.statusCode, `login ${email}`).toBe(200);
  return res.json().token as string;
}

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

const newCampaignBody = {
  advertiserId: 'adv_toyota_ng',
  telcoId: 'telco_mtn_ng',
  name: 'Highlander Test Drive — Live Demo',
  objective: 'Acquisition',
  formatId: 'stk',
  audience: {
    geographies: ['Lagos', 'Abuja FCT'],
    ageBands: ['30-44'],
    genders: ['all'],
    deviceTypes: ['smartphone'],
    subscriberTiers: ['premium'],
    interests: ['automotive', 'travel'],
    arpuBands: ['high'],
    networkTypes: ['urban'],
    languages: [],
    exclusions: ['dnd'],
  },
  creativeFields: {
    menuTitle: 'Toyota Highlander',
    body: 'Book your Highlander test drive today. Reply to reserve your slot.',
    option1: 'Book Test Drive',
    serviceName: 'Toyota NG',
  },
  budget: {
    pricingModel: 'CPM',
    dailyCap: { minor: 5_000_000, currency: 'NGN' },
    total: { minor: 50_000_000, currency: 'NGN' },
    startDate: '2026-08-14',
    endDate: '2026-08-28',
    deliverySpeed: 'standard',
  },
};

beforeAll(() => {
  app = buildApp({ store: new MemoryStore(hashPassword(env.demoPassword)) });
});

describe('Wednesday demo flow — advertiser submit → MTN approve → advertiser sees approved', () => {
  let campaignId: string;

  it('advertiser (Campaign Manager) creates a DRAFT campaign', async () => {
    const token = await login('bola@toyota.example');
    const res = await app.inject({
      method: 'POST',
      url: '/campaigns',
      headers: auth(token),
      payload: newCampaignBody,
    });
    expect(res.statusCode).toBe(201);
    const c = res.json().campaign;
    expect(c.status).toBe('DRAFT');
    expect(c.estimatedReach).toBeGreaterThan(0);
    campaignId = c.id;
  });

  it('advertiser submits → PENDING_TELCO_APPROVAL', async () => {
    const token = await login('bola@toyota.example');
    const res = await app.inject({
      method: 'POST',
      url: `/campaigns/${campaignId}/submit`,
      headers: auth(token),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().campaign.status).toBe('PENDING_TELCO_APPROVAL');
  });

  it('MTN operator sees it in the approval queue', async () => {
    const token = await login('ops.lead@mtn.example');
    const res = await app.inject({ method: 'GET', url: '/telco/approval-queue', headers: auth(token) });
    expect(res.statusCode).toBe(200);
    const ids = res.json().campaigns.map((c: { id: string }) => c.id);
    expect(ids).toContain(campaignId);
  });

  it('MTN operator approves with a comment → APPROVED + audit event', async () => {
    const token = await login('ops.lead@mtn.example');
    const res = await app.inject({
      method: 'POST',
      url: `/campaigns/${campaignId}/decision`,
      headers: auth(token),
      payload: { decision: 'APPROVED', comments: 'Compliant, low risk. Approved for delivery.' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().campaign.status).toBe('APPROVED');
    expect(res.json().campaign.approvedByTelcoName).toBe('MTN Nigeria');

    const auditRes = await app.inject({ method: 'GET', url: '/telco/audit', headers: auth(token) });
    const actions = auditRes.json().events.map((e: { action: string }) => e.action);
    expect(actions).toContain('Approved campaign');
  });

  it('advertiser now sees the campaign as APPROVED by MTN Nigeria', async () => {
    const token = await login('bola@toyota.example');
    const res = await app.inject({ method: 'GET', url: `/campaigns/${campaignId}`, headers: auth(token) });
    expect(res.statusCode).toBe(200);
    expect(res.json().campaign.status).toBe('APPROVED');
    expect(res.json().campaign.approvedByTelcoName).toBe('MTN Nigeria');
  });
});

describe('demo analytics & approval rules', () => {
  it('derives stable metrics for a LIVE campaign', async () => {
    const token = await login('ops.lead@mtn.example');
    const a = await app.inject({ method: 'GET', url: '/campaigns/camp_jumia_flash/metrics', headers: auth(token) });
    const b = await app.inject({ method: 'GET', url: '/campaigns/camp_jumia_flash/metrics', headers: auth(token) });
    expect(a.statusCode).toBe(200);
    expect(a.json().metrics.hasData).toBe(true);
    expect(a.json().metrics.impressions).toBeGreaterThan(0);
    // deterministic — identical across calls
    expect(a.json().metrics).toEqual(b.json().metrics);
  });

  it('rejecting without a comment is refused (400)', async () => {
    const token = await login('ops.lead@mtn.example');
    const res = await app.inject({
      method: 'POST',
      url: '/campaigns/camp_fairmoney_q3/decision',
      headers: auth(token),
      payload: { decision: 'REJECTED', comments: '   ' },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('health & readiness', () => {
  it('reports liveness on /health', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json().ok).toBe(true);
  });

  it('reports readiness (store reachable) on /ready', async () => {
    const res = await app.inject({ method: 'GET', url: '/ready' });
    expect(res.statusCode).toBe(200);
    expect(res.json().ready).toBe(true);
  });
});

describe('tenant isolation & RBAC (server-enforced)', () => {
  it('advertiser listing returns only its own campaigns', async () => {
    const token = await login('bola@toyota.example');
    const res = await app.inject({ method: 'GET', url: '/campaigns', headers: auth(token) });
    const advertiserIds = new Set(res.json().campaigns.map((c: { advertiserId: string }) => c.advertiserId));
    expect([...advertiserIds]).toEqual(['adv_toyota_ng']);
  });

  it('a foreign advertiser cannot read another advertiser’s campaign', async () => {
    const foreignToken = signToken({
      sub: 'user_foreign',
      email: 'x@other.example',
      name: 'Foreign',
      realm: 'advertiser',
      role: 'Campaign Manager',
      telcoId: 'telco_mtn_ng',
      advertiserId: 'adv_other',
    });
    // Jumia's seeded campaign belongs to adv_jumia, not adv_other.
    const res = await app.inject({
      method: 'GET',
      url: '/campaigns/camp_jumia_flash',
      headers: auth(foreignToken),
    });
    expect(res.statusCode).toBe(404);
  });

  it('an advertiser cannot approve campaigns (approval is telco-only)', async () => {
    const token = await login('bola@toyota.example');
    const res = await app.inject({
      method: 'POST',
      url: '/campaigns/camp_fairmoney_q3/decision',
      headers: auth(token),
      payload: { decision: 'APPROVED', comments: 'nope' },
    });
    expect(res.statusCode).toBe(403);
  });

  it('rejects unauthenticated requests', async () => {
    const res = await app.inject({ method: 'GET', url: '/campaigns' });
    expect(res.statusCode).toBe(401);
  });
});

describe('WP02C.1 — persisted audience snapshot + multi-capability plan', () => {
  const capIds = ['recharge_confirmation_sms', 'standard_sms', 'ussd_pre_session', 'rewarded_data'];
  const body = () => ({
    ...newCampaignBody,
    name: `Maltina Plan ${Math.random().toString(36).slice(2, 8)}`,
    capabilityIds: capIds,
    selectedTarget: 999_999_999, // deliberately huge → must be clamped server-side
  });

  it('computes + persists the snapshot and full capability plan on create', async () => {
    const token = await login('bola@toyota.example');
    const res = await app.inject({ method: 'POST', url: '/campaigns', headers: auth(token), payload: body() });
    expect(res.statusCode).toBe(201);
    const c = res.json().campaign;
    // Snapshot present and internally consistent (eligible ≥ target ≥ forecast).
    expect(c.audienceSnapshot).toBeTruthy();
    expect(c.audienceSnapshot.eligibleAudience).toBeGreaterThan(0);
    expect(c.audienceSnapshot.selectedTarget).toBeLessThanOrEqual(c.audienceSnapshot.eligibleAudience);
    expect(c.audienceSnapshot.forecastReach.point).toBeLessThanOrEqual(c.audienceSnapshot.selectedTarget);
    // All selected capabilities persisted, order preserved.
    expect(c.capabilityPlan.map((p: { capabilityId: string }) => p.capabilityId)).toEqual(capIds);
    expect(c.capabilityPlan.map((p: { sortOrder: number }) => p.sortOrder)).toEqual([0, 1, 2, 3]);
  });

  it('is forgery-proof: the client cannot dictate the eligible count (server recomputes deterministically)', async () => {
    const token = await login('bola@toyota.example');
    const r1 = await app.inject({ method: 'POST', url: '/campaigns', headers: auth(token), payload: body() });
    const r2 = await app.inject({ method: 'POST', url: '/campaigns', headers: auth(token), payload: body() });
    // Same inputs (differing only by random name) → identical server-computed eligible.
    expect(r1.json().campaign.audienceSnapshot.eligibleAudience).toBe(
      r2.json().campaign.audienceSnapshot.eligibleAudience,
    );
  });

  it('rejects an invalid capabilityId', async () => {
    const token = await login('bola@toyota.example');
    const res = await app.inject({
      method: 'POST',
      url: '/campaigns',
      headers: auth(token),
      payload: { ...body(), capabilityIds: ['standard_sms', 'not_a_real_capability'] },
    });
    expect(res.statusCode).toBe(400);
  });

  it('MTN reviews the EXACT submitted snapshot (immutable, not recalculated)', async () => {
    const advToken = await login('bola@toyota.example');
    const created = await app.inject({ method: 'POST', url: '/campaigns', headers: auth(advToken), payload: body() });
    const id = created.json().campaign.id;
    const submittedSnapshot = created.json().campaign.audienceSnapshot;
    await app.inject({ method: 'POST', url: `/campaigns/${id}/submit`, headers: auth(advToken) });

    const mtnToken = await login('ops.lead@mtn.example');
    const mtnView = await app.inject({ method: 'GET', url: `/campaigns/${id}`, headers: auth(mtnToken) });
    expect(mtnView.statusCode).toBe(200);
    expect(mtnView.json().campaign.audienceSnapshot).toEqual(submittedSnapshot);
    expect(mtnView.json().campaign.capabilityPlan).toHaveLength(capIds.length);
  });
});
