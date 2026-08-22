import { test, type Page } from '@playwright/test';
import { ADVERTISER_URL, TELCO_URL, ADMIN_URL, TELYDIAL_URL, DEMO_PASSWORD } from '../playwright.config';

// PARITY-05 brand-system harmonisation — visual evidence capture (1440×900).
// Output: visual-review-final/brand-system/.
const OUT = '../visual-review-final/brand-system';

async function signIn(page: Page, base: string, email: string) {
  await page.goto(`${base}/login`);
  await page.getByLabel('Work email').fill(email);
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/dashboard/);
}
async function shot(page: Page, base: string, route: string, name: string) {
  await page.goto(`${base}${route}`);
  await page.getByRole('heading').first().waitFor();
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
}

const PLAN: { key: string; base: string; email: string; shots: [string, string][] }[] = [
  { key: 'advertiser', base: ADVERTISER_URL, email: 'bola@toyota.example', shots: [['/dashboard', 'advertiser-dashboard'], ['/channels', 'advertiser-channels'], ['/marketplace', 'advertiser-marketplace'], ['/campaigns/new', 'advertiser-new-campaign'], ['/audience', 'advertiser-audience']] },
  { key: 'telco', base: TELCO_URL, email: 'ops.lead@mtn.example', shots: [['/dashboard', 'telco-executive'], ['/approvals', 'telco-approval'], ['/revenue', 'telco-revenue'], ['/channels', 'telco-channels']] },
  { key: 'admin', base: ADMIN_URL, email: 'admin@tely.example', shots: [['/dashboard', 'admin-dashboard'], ['/directory', 'admin-directory'], ['/platform-health', 'admin-platform-health'], ['/engines/telyads', 'admin-telyads-engine']] },
  { key: 'telydial', base: TELYDIAL_URL, email: 'provider@telydial.example', shots: [['/dashboard', 'telydial-dashboard'], ['/campaigns/new', 'telydial-builder'], ['/analytics', 'telydial-analytics']] },
];

for (const p of PLAN) {
  test(`brand-system capture · ${p.key}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await signIn(page, p.base, p.email);
    for (const [route, name] of p.shots) await shot(page, p.base, route, name);
  });
}

test('brand-system capture · logins', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [base, name] of [[ADVERTISER_URL, 'login-advertiser'], [TELCO_URL, 'login-telco'], [ADMIN_URL, 'login-admin'], [TELYDIAL_URL, 'login-telydial']] as [string, string][]) {
    await page.goto(`${base}/login`);
    await page.getByAltText('TelyAd').first().waitFor();
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  }
});
