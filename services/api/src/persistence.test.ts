import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app';
import { PrismaStore } from './store/prisma-store';
import { seedPrisma } from './store/seed-prisma';
import { hashPassword } from './auth';
import { env } from './env';

/**
 * Proves campaign state, approval metadata and audit events survive an API/store
 * restart when using the persistent Prisma store. Each "restart" tears down the
 * PrismaClient + Fastify app and rebuilds them against the same database file.
 */

const DB_URL = 'file:./prisma/test-restart.db';
let client: PrismaClient;
let app: FastifyInstance;

function makeClient(): PrismaClient {
  return new PrismaClient({ datasources: { db: { url: DB_URL } } });
}

async function restart(): Promise<void> {
  if (app) await app.close();
  if (client) await client.$disconnect();
  client = makeClient();
  app = buildApp({ store: new PrismaStore(client) });
}

async function login(email: string): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email, password: env.demoPassword },
  });
  expect(res.statusCode, `login ${email}`).toBe(200);
  return res.json().token as string;
}
const auth = (t: string) => ({ authorization: `Bearer ${t}` });

beforeAll(async () => {
  // Start from a fresh throwaway sqlite file (removing it first avoids the
  // destructive --force-reset), create the schema, then seed it.
  for (const suffix of ['', '-journal']) {
    rmSync(`./prisma/test-restart.db${suffix}`, { force: true });
  }
  execSync('pnpm exec prisma db push --skip-generate', {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: DB_URL },
    stdio: 'ignore',
  });
  const seedClient = makeClient();
  await seedPrisma(seedClient, hashPassword(env.demoPassword));
  await seedClient.$disconnect();
  await restart();
}, 60_000);

afterAll(async () => {
  if (app) await app.close();
  if (client) await client.$disconnect();
});

describe('persistence survives restart (Prisma store)', () => {
  let campaignId: string;

  it('advertiser creates + submits; state is PENDING', async () => {
    const token = await login('bola@toyota.example');
    const created = await app.inject({
      method: 'POST',
      url: '/campaigns',
      headers: auth(token),
      payload: {
        advertiserId: 'adv_toyota_ng',
        telcoId: 'telco_mtn_ng',
        name: 'Restart Persistence Campaign',
        objective: 'Acquisition',
        formatId: 'stk',
        audience: {
          geographies: ['Lagos'],
          ageBands: ['30-44'],
          genders: ['all'],
          deviceTypes: ['smartphone'],
          subscriberTiers: ['premium'],
          interests: ['automotive'],
          arpuBands: ['high'],
          networkTypes: ['urban'],
          languages: [],
          exclusions: ['dnd'],
        },
        creativeFields: {
          menuTitle: 'Toyota Highlander',
          body: 'Book your test drive today.',
          option1: 'Book now',
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
        capabilityIds: ['standard_sms', 'ussd_pre_session', 'rewarded_data'],
        selectedTarget: 500_000,
      },
    });
    expect(created.statusCode).toBe(201);
    expect(created.json().campaign.audienceSnapshot).toBeTruthy();
    expect(created.json().campaign.capabilityPlan).toHaveLength(3);
    campaignId = created.json().campaign.id;
    const submitted = await app.inject({
      method: 'POST',
      url: `/campaigns/${campaignId}/submit`,
      headers: auth(token),
    });
    expect(submitted.json().campaign.status).toBe('PENDING_TELCO_APPROVAL');
  });

  it('after RESTART #1 the campaign still exists and is still PENDING', async () => {
    await restart();
    const token = await login('bola@toyota.example');
    const res = await app.inject({ method: 'GET', url: `/campaigns/${campaignId}`, headers: auth(token) });
    expect(res.statusCode).toBe(200);
    expect(res.json().campaign.status).toBe('PENDING_TELCO_APPROVAL');
    // The audience snapshot + multi-capability plan survive the restart.
    expect(res.json().campaign.audienceSnapshot?.eligibleAudience).toBeGreaterThan(0);
    expect(res.json().campaign.capabilityPlan).toHaveLength(3);
  });

  it('MTN approves; approval persists', async () => {
    const token = await login('ops.lead@mtn.example');
    const res = await app.inject({
      method: 'POST',
      url: `/campaigns/${campaignId}/decision`,
      headers: auth(token),
      payload: { decision: 'APPROVED', comments: 'Persisted approval.' },
    });
    expect(res.json().campaign.status).toBe('APPROVED');
  });

  it('after RESTART #2 the campaign is still APPROVED with metadata + audit', async () => {
    await restart();
    const advToken = await login('bola@toyota.example');
    const campaignRes = await app.inject({
      method: 'GET',
      url: `/campaigns/${campaignId}`,
      headers: auth(advToken),
    });
    const campaign = campaignRes.json().campaign;
    expect(campaign.status).toBe('APPROVED');
    expect(campaign.approvedByTelcoName).toBe('MTN Nigeria');
    expect(campaign.approvedAt).toBeTruthy();

    const mtnToken = await login('ops.lead@mtn.example');
    const auditRes = await app.inject({ method: 'GET', url: '/telco/audit', headers: auth(mtnToken) });
    const actions = auditRes.json().events.map((e: { action: string }) => e.action);
    expect(actions).toContain('Approved campaign');
  });
});
