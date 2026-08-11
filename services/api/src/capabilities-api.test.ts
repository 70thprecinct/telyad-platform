import { beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app';
import { MemoryStore } from './store/memory-store';
import { hashPassword } from './auth';
import { env } from './env';

let app: FastifyInstance;
async function login(email: string): Promise<string> {
  const res = await app.inject({ method: 'POST', url: '/auth/login', payload: { email, password: env.demoPassword } });
  expect(res.statusCode, `login ${email}`).toBe(200);
  return res.json().token as string;
}
const auth = (t: string) => ({ authorization: `Bearer ${t}` });

beforeAll(() => {
  app = buildApp({ store: new MemoryStore(hashPassword(env.demoPassword)) });
});

describe('capability universe API', () => {
  it('lists all 48 capabilities', async () => {
    const token = await login('chidi@maltina.example');
    const res = await app.inject({ method: 'GET', url: '/capabilities', headers: auth(token) });
    expect(res.statusCode).toBe(200);
    expect(res.json().capabilities).toHaveLength(48);
  });
});

describe('advertiser AI endpoints', () => {
  it('generates a deterministic media plan', async () => {
    const token = await login('chidi@maltina.example');
    const payload = {
      sector: 'FMCG', objective: 'Awareness', budgetMinor: 20_000_000_00, currency: 'NGN',
      geographies: ['Lagos'], deviceMix: 'both', languages: ['en', 'pcm'], durationDays: 28,
    };
    const res = await app.inject({ method: 'POST', url: '/ai/media-plan', headers: auth(token), payload });
    expect(res.statusCode).toBe(200);
    expect(res.json().plan.items.length).toBeGreaterThanOrEqual(4);
  });

  it('localises a CTA', async () => {
    const token = await login('chidi@maltina.example');
    const res = await app.inject({
      method: 'POST', url: '/ai/localise', headers: auth(token),
      payload: { baseText: 'Enjoy family moments', cta: 'Buy now', targetLanguage: 'pcm', charLimit: 160 },
    });
    expect(res.json().variant.cta).toBe('Buy am now');
    expect(res.json().variant.requiresReview).toBe(true);
  });
});

describe('telco inventory governance (RBAC + persistence)', () => {
  it('Commercial Manager can view inventory and change a capability status; it persists', async () => {
    const token = await login('commercial@mtn.example');
    const before = await app.inject({ method: 'GET', url: '/telco/inventory', headers: auth(token) });
    expect(before.statusCode).toBe(200);
    const item = before.json().items.find((i: { capability: { id: string } }) => i.capability.id === 'lock_screen_interstitial');
    expect(item.effectiveStatus).toBe('NETWORK_APPROVAL_REQUIRED');

    const set = await app.inject({
      method: 'POST', url: '/telco/inventory/lock_screen_interstitial/status', headers: auth(token),
      payload: { status: 'PILOT' },
    });
    expect(set.statusCode).toBe(200);

    const after = await app.inject({ method: 'GET', url: '/telco/inventory', headers: auth(token) });
    const updated = after.json().items.find((i: { capability: { id: string } }) => i.capability.id === 'lock_screen_interstitial');
    expect(updated.effectiveStatus).toBe('PILOT');
    expect(updated.isOverridden).toBe(true);
  });

  it('a Campaign Reviewer (no inventory:manage) cannot change status', async () => {
    const token = await login('reviewer@mtn.example');
    const res = await app.inject({
      method: 'POST', url: '/telco/inventory/standard_sms/status', headers: auth(token), payload: { status: 'DISABLED' },
    });
    expect(res.statusCode).toBe(403);
  });

  it('an advertiser cannot access telco inventory', async () => {
    const token = await login('chidi@maltina.example');
    const res = await app.inject({ method: 'GET', url: '/telco/inventory', headers: auth(token) });
    expect(res.statusCode).toBe(403);
  });
});

describe('telco revenue intelligence (RBAC)', () => {
  it('Commercial Manager (revenue:view) gets a report', async () => {
    const token = await login('commercial@mtn.example');
    const res = await app.inject({ method: 'GET', url: '/telco/revenue-intelligence', headers: auth(token) });
    expect(res.statusCode).toBe(200);
    expect(res.json().report.totalRevenueMinor).toBeGreaterThan(0);
  });

  it('Operations Manager (no revenue:view) is refused revenue intelligence', async () => {
    const token = await login('ops.lead@mtn.example');
    const res = await app.inject({ method: 'GET', url: '/telco/revenue-intelligence', headers: auth(token) });
    expect(res.statusCode).toBe(403);
  });
});
