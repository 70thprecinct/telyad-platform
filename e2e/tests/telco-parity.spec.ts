import { test, expect, type Page } from '@playwright/test';
import { TELCO_URL, DEMO_PASSWORD } from '../playwright.config';

// PARITY-02 hard gate: every operator-console prototype destination is a real
// route rendering meaningful content — no dead links, no empty pages.
const DESTINATIONS = [
  'dashboard', 'advertisers', 'approvals', 'monitoring', 'audience', 'traffic',
  'subscribers', 'channels', 'revenue', 'wallet', 'compliance', 'consent',
  'moderation', 'governance/approvals', 'reports', 'analytics', 'users', 'audit',
  'api-monitoring', 'notifications', 'support', 'settings', 'platform-health',
];

async function login(page: Page, email: string) {
  await page.goto(`${TELCO_URL}/login`);
  await page.getByLabel('Work email').fill(email);
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test('telco navigation completeness — all 23 destinations render, none dead', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await login(page, 'ops.lead@mtn.example');

  for (const path of DESTINATIONS) {
    await page.goto(`${TELCO_URL}/${path}`);
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(new RegExp(path.replace('/', '\\/')));
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('coming soon');
    expect(body).not.toContain('this page could not be found');
    expect(body).not.toContain('404');
    expect(body.length).toBeGreaterThan(200);
    // No raw subscriber identifiers (MSISDN) leak on any operator screen.
    expect(body).not.toMatch(/\b234[789]\d{9}\b/); // Nigerian MSISDN pattern
  }
  await ctx.close();
});

test('telco role smoke — multiple roles can sign in and reach the console', async ({ browser }) => {
  for (const email of ['ops.lead@mtn.example', 'commercial@mtn.example', 'reviewer@mtn.example']) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await login(page, email);
    await expect(page.getByTestId('exec-overview')).toBeVisible();
    await ctx.close();
  }
});
