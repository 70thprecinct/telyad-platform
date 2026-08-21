import { test, expect, type Page } from '@playwright/test';
import { ADVERTISER_URL, TELCO_URL, ADMIN_URL, TELYDIAL_URL, DEMO_PASSWORD } from '../playwright.config';

// PARITY-05 §19 — mobile HARD GATE at 390×844: no page-level horizontal overflow.
// document.scrollWidth must not exceed the viewport width (tables/steppers may
// scroll inside their own containers, but the page body must not).

async function login(page: Page, base: string, email: string) {
  await page.goto(`${base}/login`);
  await page.getByLabel('Work email').fill(email);
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

const CASES: { name: string; base: string; email: string; routes: string[] }[] = [
  { name: 'Advertiser', base: ADVERTISER_URL, email: 'bola@toyota.example', routes: ['/dashboard', '/campaigns', '/analytics', '/channels', '/audience', '/campaigns/new'] },
  { name: 'Telco', base: TELCO_URL, email: 'ops.lead@mtn.example', routes: ['/dashboard', '/approvals', '/channels', '/revenue'] },
  { name: 'Admin', base: ADMIN_URL, email: 'admin@tely.example', routes: ['/dashboard', '/directory', '/platform-health'] },
  { name: 'TelyDial', base: TELYDIAL_URL, email: 'provider@telydial.example', routes: ['/dashboard', '/campaigns', '/campaigns/new', '/analytics'] },
];

for (const c of CASES) {
  test(`[${c.name}] no page-level horizontal overflow @ 390×844`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, c.base, c.email);
    for (const route of c.routes) {
      await page.goto(`${c.base}${route}`);
      await page.getByRole('heading').first().waitFor();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${c.name}${route} page scrollWidth exceeds viewport by ${overflow}px`).toBeLessThanOrEqual(1);
    }
  });
}
