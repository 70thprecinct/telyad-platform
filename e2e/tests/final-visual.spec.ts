import { test, type Page } from '@playwright/test';
import { ADVERTISER_URL, TELCO_URL, ADMIN_URL, TELYDIAL_URL, DEMO_PASSWORD } from '../playwright.config';

// PARITY-05 — final visual certification capture. Full-page desktop (1440×900)
// screenshots of every primary destination + key mobile (390×844) screens.
// Output: visual-review-final/{advertiser,telco,admin,telydial,mobile}/.

async function login(page: Page, base: string, email: string) {
  await page.goto(`${base}/login`);
  await page.getByLabel('Work email').fill(email);
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/dashboard/);
}

const PORTALS: { dir: string; base: string; email: string; routes: [string, string][]; mobile: string[] }[] = [
  {
    dir: 'advertiser', base: ADVERTISER_URL, email: 'bola@toyota.example',
    routes: [['/dashboard', 'dashboard'], ['/campaigns', 'campaigns'], ['/analytics', 'analytics'], ['/audience', 'audience'], ['/segments', 'segments'], ['/reach', 'reach'], ['/channels', 'channels'], ['/creatives', 'creatives'], ['/ai', 'ai'], ['/billing', 'billing'], ['/notifications', 'notifications'], ['/settings', 'settings']],
    mobile: ['/dashboard', '/campaigns', '/analytics', '/channels', '/audience', '/campaigns/new'],
  },
  {
    dir: 'telco', base: TELCO_URL, email: 'ops.lead@mtn.example',
    routes: [['/dashboard', 'dashboard'], ['/advertisers', 'advertisers'], ['/approvals', 'approvals'], ['/monitoring', 'monitoring'], ['/audience', 'audience'], ['/traffic', 'traffic'], ['/subscribers', 'subscribers'], ['/channels', 'channels'], ['/revenue', 'revenue'], ['/wallet', 'wallet'], ['/compliance', 'compliance'], ['/consent', 'consent'], ['/moderation', 'moderation'], ['/governance/approvals', 'governance-approvals'], ['/reports', 'reports'], ['/analytics', 'analytics'], ['/users', 'users'], ['/audit', 'audit'], ['/api-monitoring', 'api-monitoring'], ['/notifications', 'notifications'], ['/support', 'support'], ['/settings', 'settings'], ['/platform-health', 'platform-health']],
    mobile: ['/dashboard', '/approvals', '/channels', '/revenue'],
  },
  {
    dir: 'admin', base: ADMIN_URL, email: 'admin@tely.example',
    routes: [['/dashboard', 'dashboard'], ['/directory', 'directory'], ['/terms', 'terms'], ['/platform-health', 'platform-health'], ['/users', 'users'], ['/demo-access', 'demo-access'], ['/engines', 'engines'], ['/engines/telysignal', 'engines-telysignal'], ['/engines/telyxchange', 'engines-telyxchange'], ['/engines/telyads', 'engines-telyads'], ['/engines/telyreach', 'engines-telyreach']],
    mobile: ['/dashboard', '/directory', '/platform-health'],
  },
  {
    dir: 'telydial', base: TELYDIAL_URL, email: 'provider@telydial.example',
    routes: [['/dashboard', 'dashboard'], ['/campaigns', 'campaigns'], ['/campaigns/new', 'create'], ['/products', 'products'], ['/analytics', 'analytics'], ['/wallet', 'wallet'], ['/reports', 'reports'], ['/notifications', 'notifications'], ['/support', 'support']],
    mobile: ['/dashboard', '/campaigns', '/campaigns/new', '/analytics'],
  },
];

for (const p of PORTALS) {
  test(`capture ${p.dir} desktop`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await login(page, p.base, p.email);
    for (const [route, name] of p.routes) {
      await page.goto(`${p.base}${route}`);
      await page.getByRole('heading').first().waitFor();
      await page.screenshot({ path: `../visual-review-final/${p.dir}/${name}.png`, fullPage: true });
    }
  });

  test(`capture ${p.dir} mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, p.base, p.email);
    for (const route of p.mobile) {
      await page.goto(`${p.base}${route}`);
      await page.getByRole('heading').first().waitFor();
      const name = route.replace(/\//g, '-').replace(/^-/, '');
      await page.screenshot({ path: `../visual-review-final/mobile/${p.dir}-${name}.png`, fullPage: true });
    }
  });
}
