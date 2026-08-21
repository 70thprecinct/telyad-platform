import { test, expect, type Page } from '@playwright/test';
import { ADVERTISER_URL, TELCO_URL, ADMIN_URL, TELYDIAL_URL, DEMO_PASSWORD } from '../playwright.config';

// PARITY-05 — final integration route-completeness HARD GATE.
// Proves all 54 primary prototype destinations exist across the four integrated
// portals, with no dead routes, no "coming soon", no 404, and no subscriber PII.

const MSISDN = /\b234[789]\d{9}\b/;

async function login(page: Page, base: string, email: string) {
  await page.goto(`${base}/login`);
  await page.getByLabel('Work email').fill(email);
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

const PORTALS: { name: string; base: string; email: string; routes: string[] }[] = [
  {
    name: 'Advertiser', base: ADVERTISER_URL, email: 'bola@toyota.example',
    routes: ['/dashboard', '/campaigns', '/analytics', '/audience', '/segments', '/reach', '/channels', '/creatives', '/ai', '/billing', '/notifications', '/settings'],
  },
  {
    name: 'Telco', base: TELCO_URL, email: 'ops.lead@mtn.example',
    routes: ['/dashboard', '/advertisers', '/approvals', '/monitoring', '/audience', '/traffic', '/subscribers', '/channels', '/revenue', '/wallet', '/compliance', '/consent', '/moderation', '/governance/approvals', '/reports', '/analytics', '/users', '/audit', '/api-monitoring', '/notifications', '/support', '/settings', '/platform-health'],
  },
  {
    name: 'Master Admin', base: ADMIN_URL, email: 'admin@tely.example',
    routes: ['/dashboard', '/directory', '/terms', '/platform-health', '/users', '/engines', '/engines/telysignal', '/engines/telyxchange', '/engines/telyads', '/engines/telyreach'],
  },
  {
    name: 'TelyDial', base: TELYDIAL_URL, email: 'provider@telydial.example',
    routes: ['/dashboard', '/campaigns', '/campaigns/new', '/products', '/analytics', '/wallet', '/reports', '/notifications', '/support'],
  },
];

for (const portal of PORTALS) {
  test(`[${portal.name}] ${portal.routes.length} primary destinations — populated, no dead routes, no PII`, async ({ page }) => {
    await login(page, portal.base, portal.email);
    for (const route of portal.routes) {
      await page.goto(`${portal.base}${route}`);
      await expect(page.getByRole('heading').first()).toBeVisible();
      const raw = await page.locator('body').innerText();
      const body = raw.toLowerCase();
      expect(body, `${portal.name}${route} should not be a stub`).not.toContain('coming soon');
      expect(body, `${portal.name}${route} should not be a 404`).not.toContain('this page could not be found');
      expect(raw.length, `${portal.name}${route} should be populated`).toBeGreaterThan(300);
      expect(raw, `${portal.name}${route} must not leak an MSISDN`).not.toMatch(MSISDN);
    }
  });
}

test('[Master Admin] Demo Access console is reachable (server-side lifecycle engine surface)', async ({ page }) => {
  await login(page, ADMIN_URL, 'admin@tely.example');
  await page.goto(`${ADMIN_URL}/demo-access`);
  await expect(page.getByRole('heading').first()).toBeVisible();
  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body).toContain('demo');
});
