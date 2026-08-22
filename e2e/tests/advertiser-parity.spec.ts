import { test, expect, type Page } from '@playwright/test';
import { ADVERTISER_URL, DEMO_PASSWORD } from '../playwright.config';

// PARITY-01 hard gate: every advertiser prototype destination is a real route
// that renders meaningful content — no dead links, no empty pages, no "coming
// soon". Twelve prototype destinations → twelve production destinations.
const DESTINATIONS: { path: string; heading: RegExp }[] = [
  { path: '/dashboard', heading: /Advertiser dashboard/i },
  { path: '/campaigns', heading: /Campaigns/i },
  { path: '/analytics', heading: /Analytics/i },
  { path: '/audience', heading: /Audience/i },
  { path: '/segments', heading: /Segments/i },
  { path: '/reach', heading: /Reach & Verify/i },
  { path: '/channels', heading: /Channels/i },
  { path: '/creatives', heading: /Creative Library/i },
  { path: '/ai', heading: /AI Tools/i },
  { path: '/billing', heading: /Billing & Budget/i },
  { path: '/notifications', heading: /Notifications/i },
  { path: '/settings', heading: /Settings/i },
];

async function login(page: Page) {
  await page.goto(`${ADVERTISER_URL}/login`);
  await page.getByLabel('Work email').fill('chidi@maltina.example');
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test('advertiser navigation completeness — all 12 destinations render, none dead', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await login(page);

  for (const d of DESTINATIONS) {
    await page.goto(`${ADVERTISER_URL}${d.path}`);
    // A real page header renders for the route (not a 404 / redirect to login).
    await expect(page.getByRole('heading', { name: d.heading }).first()).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(new RegExp(d.path));
    // No dead-route / placeholder markers anywhere on the page.
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('coming soon');
    expect(body).not.toContain('this page could not be found');
    expect(body).not.toContain('404');
    // The page must have meaningful content, not an empty shell.
    expect(body.length).toBeGreaterThan(200);
  }

  await ctx.close();
});

test('advertiser sidebar links all navigate to a live page', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await login(page);
  // Every nav item in the sidebar routes to a heading-bearing page.
  for (const label of ['Dashboard', 'Campaigns', 'Analytics', 'Audience', 'Segments', 'Reach & Verify', 'Channels', 'Creatives', 'AI Tools', 'Billing & Budget', 'Notifications', 'Settings']) {
    await page.getByRole('button', { name: label }).first().click();
    await expect(page.getByRole('heading').first()).toBeVisible();
  }
  await ctx.close();
});
