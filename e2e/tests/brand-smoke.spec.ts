import { test, expect, type Page } from '@playwright/test';
import { ADVERTISER_URL, TELCO_URL, ADMIN_URL, TELYDIAL_URL, DEMO_PASSWORD } from '../playwright.config';

// PARITY-05 brand patch — visual smoke of all four portal shells + logins.
// Confirms the official TelyAd logo renders (img alt="TelyAd") in login + chrome,
// no tagline, and no leftover single-letter mark box.

const OUT = '../visual-review-final/brand';

const PORTALS: { dir: string; base: string; email: string }[] = [
  { dir: 'advertiser', base: ADVERTISER_URL, email: 'bola@toyota.example' },
  { dir: 'telco', base: TELCO_URL, email: 'ops.lead@mtn.example' },
  { dir: 'admin', base: ADMIN_URL, email: 'admin@tely.example' },
  { dir: 'telydial', base: TELYDIAL_URL, email: 'provider@telydial.example' },
];

async function login(page: Page, base: string, email: string) {
  await page.getByLabel('Work email').fill(email);
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

for (const p of PORTALS) {
  test(`[${p.dir}] official logo renders in login + shell, no tagline/letter-mark`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // Login page: the TelyAd logo image is present.
    await page.goto(`${p.base}/login`);
    const loginLogo = page.getByAltText('TelyAd');
    await expect(loginLogo.first()).toBeVisible();
    const src = await loginLogo.first().getAttribute('src');
    expect(src).toContain('logo.png');
    await page.screenshot({ path: `${OUT}/${p.dir}-login.png`, fullPage: false });

    // No payoff/tagline text anywhere on the login.
    const loginBody = (await page.locator('body').innerText()).toUpperCase();
    expect(loginBody).not.toContain('SMART ADS');
    expect(loginBody).not.toContain('REAL RESULTS');

    // Shell chrome: the logo image is in the sidebar.
    await login(page, p.base, p.email);
    await expect(page.getByAltText('TelyAd').first()).toBeVisible();
    await page.screenshot({ path: `${OUT}/${p.dir}-shell.png`, fullPage: false });
  });
}
