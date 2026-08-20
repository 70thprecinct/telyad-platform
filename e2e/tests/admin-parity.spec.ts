import { test, expect, type Page } from '@playwright/test';
import { ADMIN_URL, DEMO_PASSWORD } from '../playwright.config';

// MSISDN pattern — must NEVER appear anywhere in the Master Admin console.
const MSISDN = /\b234[789]\d{9}\b/;

async function adminLogin(page: Page) {
  await page.goto(`${ADMIN_URL}/login`);
  await page.getByLabel('Work email').fill('admin@tely.example');
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

// Every Master Admin destination recovered from the approved prototype.
const DESTINATIONS: { path: string; heading: RegExp }[] = [
  { path: '/dashboard', heading: /Global Dashboard/ },
  { path: '/directory', heading: /Telco Directory/ },
  { path: '/terms', heading: /Commercial Terms/ },
  { path: '/platform-health', heading: /Platform Health/ },
  { path: '/users', heading: /Master Admin Users/ },
  { path: '/engines', heading: /Engine Dashboards/ },
  { path: '/engines/telysignal', heading: /TelySignal/ },
  { path: '/engines/telyxchange', heading: /TelyXchange/ },
  { path: '/engines/telyads', heading: /TelyAds/ },
  { path: '/engines/telyreach', heading: /TelyReach/ },
];

test.describe('Master Admin — prototype parity', () => {
  test('access control: unauthenticated console route redirects to login', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/dashboard`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('every navigation destination is a real, populated page (no dead routes, no PII)', async ({ page }) => {
    await adminLogin(page);
    for (const d of DESTINATIONS) {
      await page.goto(`${ADMIN_URL}${d.path}`);
      await expect(page.getByRole('heading', { name: d.heading }).first()).toBeVisible();
      const body = (await page.locator('body').innerText()).toLowerCase();
      expect(body).not.toContain('coming soon');
      expect(body).not.toContain('not found');
      expect(body).not.toContain('404');
      expect(body.length).toBeGreaterThan(400);
      const raw = await page.locator('body').innerText();
      expect(raw).not.toMatch(MSISDN);
    }
  });

  test('telco directory: scoped drill-down shows isolation banner and exits to global', async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${ADMIN_URL}/directory`);
    await page.getByTestId('enter-telco').first().click();
    await expect(page.getByTestId('scope-banner')).toBeVisible();
    await expect(page.getByTestId('scope-banner')).toContainText(/scoped environment/i);
    await page.getByTestId('exit-scoped').click();
    await expect(page.getByTestId('scope-banner')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /Telco Directory/ })).toBeVisible();
  });

  test('telco directory: onboard modal opens', async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${ADMIN_URL}/directory`);
    await page.getByTestId('onboard-telco').click();
    await expect(page.getByText(/Onboard a new telco/i)).toBeVisible();
  });

  test('master admin users: demo access surface and role matrix render', async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${ADMIN_URL}/users`);
    await expect(page.getByText(/Demo · time-limited/i).first()).toBeVisible();
    await expect(page.getByText('Role permission matrix', { exact: true })).toBeVisible();
  });
});
