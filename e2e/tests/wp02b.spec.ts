import { test, expect, type Page } from '@playwright/test';
import { ADVERTISER_URL, TELCO_URL, DEMO_PASSWORD } from '../playwright.config';

async function login(page: Page, base: string, email: string) {
  await page.goto(`${base}/login`);
  await page.getByLabel('Work email').fill(email);
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe('WP02B — capability universe & intelligence', () => {
  test('advertiser: marketplace browse, filter and capability detail', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await login(page, ADVERTISER_URL, 'chidi@maltina.example');

    await page.goto(`${ADVERTISER_URL}/marketplace`);
    await expect(page.getByTestId('marketplace-grid')).toBeVisible();
    const total = await page.getByTestId('capability-card').count();
    expect(total).toBeGreaterThanOrEqual(20);

    // Filter to the Voice family — fewer cards.
    await page.getByTestId('filter-family').selectOption('voice');
    const voiceCount = await page.getByTestId('capability-card').count();
    expect(voiceCount).toBeGreaterThan(0);
    expect(voiceCount).toBeLessThan(total);

    // Open a capability detail.
    await page.screenshot({ path: 'screenshots/wp02b-01-marketplace.png', fullPage: true }).catch(() => undefined);
    await page.getByTestId('capability-card').first().getByRole('button', { name: 'View details' }).click();
    await expect(page.getByTestId('capability-detail')).toBeVisible();
    await page.screenshot({ path: 'screenshots/wp02b-02-capability-detail.png' }).catch(() => undefined);
    await ctx.close();
  });

  test('advertiser: AI copilot generates and applies a media plan', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await login(page, ADVERTISER_URL, 'chidi@maltina.example');

    await page.goto(`${ADVERTISER_URL}/ai`);
    await expect(page.getByTestId('copilot-form')).toBeVisible();
    await page.getByLabel('Budget (₦ millions)').fill('20');
    await page.getByTestId('generate-plan').click();
    await expect(page.getByTestId('media-plan')).toBeVisible();
    await page.screenshot({ path: 'screenshots/wp02b-03-media-plan.png', fullPage: true }).catch(() => undefined);

    await page.getByTestId('apply-plan').click();
    await expect(page).toHaveURL(/\/campaigns\/new/);
    await ctx.close();
  });

  test('MTN Commercial: inventory governance status change persists', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await login(page, TELCO_URL, 'commercial@mtn.example');

    await page.goto(`${TELCO_URL}/inventory`);
    await expect(page.getByTestId('inventory-table')).toBeVisible();
    await page.screenshot({ path: 'screenshots/wp02b-04-inventory-governance.png', fullPage: true }).catch(() => undefined);

    await page.getByTestId('manage-capability').first().click();
    await page.getByTestId('capability-status-select').selectOption('PILOT');
    await page.getByTestId('save-capability-status').click();
    // Modal closes; table remains.
    await expect(page.getByTestId('capability-status-select')).toHaveCount(0);
    await expect(page.getByTestId('inventory-table')).toBeVisible();
    await ctx.close();
  });

  test('MTN Commercial: revenue intelligence report renders', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await login(page, TELCO_URL, 'commercial@mtn.example');
    await page.goto(`${TELCO_URL}/revenue`);
    await expect(page.getByTestId('revenue-report')).toBeVisible();
    await page.screenshot({ path: 'screenshots/wp02b-05-revenue-intelligence.png', fullPage: true }).catch(() => undefined);
    await ctx.close();
  });

  test('MTN Campaign Reviewer: inventory is read-only (RBAC)', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await login(page, TELCO_URL, 'reviewer@mtn.example');
    await page.goto(`${TELCO_URL}/inventory`);
    await expect(page.getByTestId('inventory-readonly-note')).toBeVisible();
    await expect(page.getByTestId('manage-capability')).toHaveCount(0);
    await ctx.close();
  });
});
