import { test, type Page } from '@playwright/test';
import { TELYDIAL_URL, DEMO_PASSWORD } from '../playwright.config';

// Visual-evidence capture for PARITY-04. Full-page screenshots of every TelyDial
// destination (desktop 1440×900) plus key screens at mobile 390×844. Not asserts.

const OUT = '../visual-review-parity/telydial';

async function login(page: Page) {
  await page.goto(`${TELYDIAL_URL}/login`);
  await page.getByLabel('Work email').fill('provider@telydial.example');
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/dashboard/);
}

const PAGES: [string, string][] = [
  ['/dashboard', 'dashboard'],
  ['/campaigns', 'campaigns'],
  ['/campaigns/new', 'create'],
  ['/products', 'products'],
  ['/analytics', 'analytics'],
  ['/wallet', 'wallet'],
  ['/reports', 'reports'],
  ['/notifications', 'notifications'],
  ['/support', 'support'],
];

test('capture TelyDial desktop evidence (1440×900)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await login(page);
  for (const [path, name] of PAGES) {
    await page.goto(`${TELYDIAL_URL}${path}`);
    await page.getByRole('heading').first().waitFor();
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  }
  // Campaign builder — creative step with both device previews.
  await page.goto(`${TELYDIAL_URL}/campaigns/new`);
  await page.getByTestId('product-id').fill('MTN-89012');
  await page.getByTestId('verify-btn').click();
  await page.getByTestId('verify-ok').waitFor();
  await page.screenshot({ path: `${OUT}/create-verified.png`, fullPage: true });
  await page.getByTestId('wizard-next').click();
  await page.getByTestId('cr-sn').fill('World Cup Predictor');
  await page.getByTestId('cr-body').fill('Predict scores. WIN up to ₦4.65M! Press to play.');
  await page.getByTestId('cta-presets').getByRole('button', { name: 'Play now', exact: true }).click();
  await page.screenshot({ path: `${OUT}/create-creative-android.png`, fullPage: true });
  await page.getByTestId('device-ios').click();
  await page.screenshot({ path: `${OUT}/create-creative-ios.png`, fullPage: true });
});

test('capture TelyDial mobile evidence (390×844)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  for (const [path, name] of [['/dashboard', 'dashboard'], ['/campaigns', 'campaigns'], ['/campaigns/new', 'create'], ['/products', 'products'], ['/wallet', 'wallet'], ['/analytics', 'analytics']] as [string, string][]) {
    await page.goto(`${TELYDIAL_URL}${path}`);
    await page.getByRole('heading').first().waitFor();
    await page.screenshot({ path: `${OUT}/m-${name}.png`, fullPage: true });
  }
});
