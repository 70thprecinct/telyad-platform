import { beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app';
import { MemoryStore } from './store/memory-store';
import { hashPassword } from './auth';
import { env } from './env';
import type { CreateDemoUserRequest } from '@telyad/types';

/**
 * Demo access control: administrator-issued temporary accounts with a validity
 * window, enforced entirely server-side. A demo account is a normal account
 * with a window — it never bypasses RBAC, tenancy or portal isolation.
 */

let store: MemoryStore;
let app: FastifyInstance;

function makeApp() {
  store = new MemoryStore(hashPassword(env.demoPassword));
  app = buildApp({ store });
}

async function login(email: string, password: string, portal?: string) {
  return app.inject({ method: 'POST', url: '/auth/login', payload: { email, password, portal } });
}
async function adminToken() {
  const res = await login('admin@tely.example', env.demoPassword, 'admin');
  expect(res.statusCode, 'admin login').toBe(200);
  return res.json().token as string;
}
const auth = (t: string) => ({ authorization: `Bearer ${t}` });

const iso = (msFromNow: number) => new Date(Date.now() + msFromNow).toISOString();

async function createDemo(token: string, over: Partial<CreateDemoUserRequest> = {}) {
  const body: CreateDemoUserRequest = {
    name: 'John Smith',
    email: `demo-${Math.abs(over.email ? 0 : 1)}-${over.role ?? 'x'}-${over.portal ?? 'advertiser'}@company.example`,
    portal: 'advertiser',
    role: 'Campaign Manager',
    generatePassword: true,
    durationHours: 72,
    ...over,
  };
  return app.inject({ method: 'POST', url: '/admin/demo-users', headers: auth(token), payload: body });
}

beforeEach(makeApp);

describe('demo access — creation', () => {
  it('an administrator creates a temporary account and receives one-time credentials', async () => {
    const t = await adminToken();
    const res = await createDemo(t, { email: 'jane@company.example', organisation: 'Coca-Cola Demo' });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.credentials.password).toBeTruthy();
    expect(body.credentials.email).toBe('jane@company.example');
    expect(body.user.status).toBe('Active');
    expect(body.user.organisation).toBe('Coca-Cola Demo');
  });

  it('records the correct portal, role and tenant', async () => {
    const t = await adminToken();
    await createDemo(t, { email: 'adv@company.example', portal: 'advertiser', role: 'Campaign Manager', tenantId: 'adv_toyota_ng' });
    const u = await store.getUserByEmail('adv@company.example');
    expect(u?.portal).toBe('advertiser');
    expect(u?.role).toBe('Campaign Manager');
    expect(u?.realm).toBe('advertiser');
    expect(u?.advertiserId).toBe('adv_toyota_ng');
    expect(u?.isDemo).toBe(true);
  });

  it('stores only a bcrypt hash — the plaintext password is never persisted', async () => {
    const t = await adminToken();
    const res = await createDemo(t, { email: 'hash@company.example' });
    const plain = res.json().credentials.password as string;
    const u = await store.getUserByEmail('hash@company.example');
    expect(u?.passwordHash).toBeTruthy();
    expect(u?.passwordHash).not.toBe(plain);
    expect(u?.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt
  });

  it('rejects a role that is not valid for the chosen portal (no self-escalation)', async () => {
    const t = await adminToken();
    // "Platform Super Admin" is not an advertiser role.
    const res = await createDemo(t, { email: 'bad@company.example', portal: 'advertiser', role: 'Platform Super Admin' });
    expect(res.statusCode).toBe(400);
  });
});

describe('demo access — lifecycle enforcement (server-side)', () => {
  it('allows login during the active window', async () => {
    const t = await adminToken();
    const res = await createDemo(t, { email: 'active@company.example' });
    const pw = res.json().credentials.password;
    const l = await login('active@company.example', pw, 'advertiser');
    expect(l.statusCode).toBe(200);
  });

  it('rejects login before validFrom (scheduled)', async () => {
    const t = await adminToken();
    const res = await createDemo(t, { email: 'future@company.example', validFrom: iso(60 * 60_000), expiresAt: iso(120 * 60_000) });
    const pw = res.json().credentials.password;
    const l = await login('future@company.example', pw, 'advertiser');
    expect(l.statusCode).toBe(403);
  });

  it('rejects login after expiresAt', async () => {
    const t = await adminToken();
    const res = await createDemo(t, { email: 'expired@company.example', validFrom: iso(-120 * 60_000), expiresAt: iso(-60 * 60_000) });
    const pw = res.json().credentials.password;
    const l = await login('expired@company.example', pw, 'advertiser');
    expect(l.statusCode).toBe(403);
  });

  it('invalidates an already-issued session once the account expires', async () => {
    const t = await adminToken();
    const res = await createDemo(t, { email: 'sess@company.example', expiresAt: iso(60 * 60_000) });
    const pw = res.json().credentials.password;
    const id = res.json().user.id;
    const l = await login('sess@company.example', pw, 'advertiser');
    const token = l.json().token;
    // Session works now.
    expect((await app.inject({ method: 'GET', url: '/auth/me', headers: auth(token) })).statusCode).toBe(200);
    // Admin moves expiry into the past → the existing token must stop working.
    await app.inject({ method: 'POST', url: `/admin/demo-users/${id}/extend`, headers: auth(t), payload: { expiresAt: iso(-1000) } });
    const after = await app.inject({ method: 'GET', url: '/auth/me', headers: auth(token) });
    expect(after.statusCode).toBe(401);
    expect(after.json().code).toBe('ACCESS_EXPIRED');
  });

  it('revokes access immediately — both new logins and existing sessions', async () => {
    const t = await adminToken();
    const res = await createDemo(t, { email: 'revoke@company.example' });
    const pw = res.json().credentials.password;
    const id = res.json().user.id;
    const token = (await login('revoke@company.example', pw, 'advertiser')).json().token;
    await app.inject({ method: 'POST', url: `/admin/demo-users/${id}/revoke`, headers: auth(t) });
    // Existing session dies.
    expect((await app.inject({ method: 'GET', url: '/auth/me', headers: auth(token) })).statusCode).toBe(401);
    // New login refused.
    expect((await login('revoke@company.example', pw, 'advertiser')).statusCode).toBe(403);
  });

  it('extends expiry so access continues', async () => {
    const t = await adminToken();
    const res = await createDemo(t, { email: 'extend@company.example', expiresAt: iso(30 * 60_000) });
    const pw = res.json().credentials.password;
    const id = res.json().user.id;
    const ext = await app.inject({ method: 'POST', url: `/admin/demo-users/${id}/extend`, headers: auth(t), payload: { expiresAt: iso(7 * 24 * 60 * 60_000) } });
    expect(ext.statusCode).toBe(200);
    expect((await login('extend@company.example', pw, 'advertiser')).statusCode).toBe(200);
  });

  it('resets the password — the old password stops working, the new one works', async () => {
    const t = await adminToken();
    const res = await createDemo(t, { email: 'reset@company.example' });
    const oldPw = res.json().credentials.password;
    const id = res.json().user.id;
    const reset = await app.inject({ method: 'POST', url: `/admin/demo-users/${id}/reset-password`, headers: auth(t), payload: { generatePassword: true } });
    const newPw = reset.json().credentials.password;
    expect(newPw).not.toBe(oldPw);
    expect((await login('reset@company.example', oldPw, 'advertiser')).statusCode).toBe(401);
    expect((await login('reset@company.example', newPw, 'advertiser')).statusCode).toBe(200);
  });

  it('disable then re-enable within a valid window', async () => {
    const t = await adminToken();
    const res = await createDemo(t, { email: 'disable@company.example' });
    const pw = res.json().credentials.password;
    const id = res.json().user.id;
    await app.inject({ method: 'POST', url: `/admin/demo-users/${id}/disable`, headers: auth(t) });
    expect((await login('disable@company.example', pw, 'advertiser')).statusCode).toBe(403);
    await app.inject({ method: 'POST', url: `/admin/demo-users/${id}/enable`, headers: auth(t) });
    expect((await login('disable@company.example', pw, 'advertiser')).statusCode).toBe(200);
  });
});

describe('demo access — isolation & security', () => {
  it('rejects portal crossover (an advertiser demo account cannot sign into another portal)', async () => {
    const t = await adminToken();
    const res = await createDemo(t, { email: 'cross@company.example', portal: 'advertiser' });
    const pw = res.json().credentials.password;
    // Correct portal works…
    expect((await login('cross@company.example', pw, 'advertiser')).statusCode).toBe(200);
    // …the MTN operator portal is refused.
    expect((await login('cross@company.example', pw, 'telco')).statusCode).toBe(403);
    expect((await login('cross@company.example', pw, 'admin')).statusCode).toBe(403);
  });

  it('preserves tenant isolation for a demo advertiser account', async () => {
    const t = await adminToken();
    const res = await createDemo(t, { email: 'tenant@company.example', portal: 'advertiser', tenantId: 'adv_toyota_ng' });
    const pw = res.json().credentials.password;
    const token = (await login('tenant@company.example', pw, 'advertiser')).json().token;
    // Jumia's campaign belongs to another advertiser → 404, never leaked.
    const r = await app.inject({ method: 'GET', url: '/campaigns/camp_jumia_flash', headers: auth(token) });
    expect(r.statusCode).toBe(404);
  });

  it('a demo account cannot escalate — no access to admin demo-user management', async () => {
    const t = await adminToken();
    const res = await createDemo(t, { email: 'noesc@company.example', portal: 'advertiser' });
    const pw = res.json().credentials.password;
    const token = (await login('noesc@company.example', pw, 'advertiser')).json().token;
    // Cannot list demo users…
    expect((await app.inject({ method: 'GET', url: '/admin/demo-users', headers: auth(token) })).statusCode).toBe(403);
    // …and cannot create them.
    expect((await createDemo(token, { email: 'x@company.example' })).statusCode).toBe(403);
  });

  it('demo-access administration is restricted to platform admins', async () => {
    makeApp();
    // A telco operator (not platform) may not administer demo access.
    const opToken = (await login('ops.lead@mtn.example', env.demoPassword, 'telco')).json().token;
    expect((await app.inject({ method: 'GET', url: '/admin/demo-users', headers: auth(opToken) })).statusCode).toBe(403);
  });
});

describe('demo access — audit', () => {
  it('writes audit events for creation, revocation and password reset (never the password)', async () => {
    const t = await adminToken();
    const res = await createDemo(t, { email: 'audit@company.example' });
    const id = res.json().user.id;
    const pw = res.json().credentials.password;
    await app.inject({ method: 'POST', url: `/admin/demo-users/${id}/reset-password`, headers: auth(t), payload: { generatePassword: true } });
    await app.inject({ method: 'POST', url: `/admin/demo-users/${id}/revoke`, headers: auth(t) });

    const events = await store.listAuditEvents({ telcoId: null });
    const actions = events.map((e) => e.action);
    expect(actions).toContain('Created demo access');
    expect(actions).toContain('Reset demo access password');
    expect(actions).toContain('Revoked demo access');
    // No audit event ever contains the plaintext password.
    const serialised = JSON.stringify(events);
    expect(serialised).not.toContain(pw);
  });
});
