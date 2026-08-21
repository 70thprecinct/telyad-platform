import { test, expect, type Page } from '@playwright/test';
import { TELYDIAL_URL, DEMO_PASSWORD } from '../playwright.config';

// MSISDN pattern — must NEVER appear anywhere in TelyDial.
const MSISDN = /\b234[789]\d{9}\b/;

async function login(page: Page) {
  await page.goto(`${TELYDIAL_URL}/login`);
  await page.getByLabel('Work email').fill('provider@telydial.example');
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

const DESTINATIONS: { path: string; heading: RegExp }[] = [
  { path: '/dashboard', heading: /Dashboard/ },
  { path: '/campaigns', heading: /Campaigns/ },
  { path: '/campaigns/new', heading: /New MVAS campaign/ },
  { path: '/products', heading: /Products/ },
  { path: '/analytics', heading: /Analytics/ },
  { path: '/wallet', heading: /Wallet/ },
  { path: '/reports', heading: /Reports/ },
  { path: '/notifications', heading: /Notifications/ },
  { path: '/support', heading: /Support/ },
];

test.describe('TelyDial — prototype parity', () => {
  test('access control: unauthenticated route redirects to login', async ({ page }) => {
    await page.goto(`${TELYDIAL_URL}/dashboard`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('all 9 destinations are real, populated pages (no dead routes, no PII)', async ({ page }) => {
    await login(page);
    for (const d of DESTINATIONS) {
      await page.goto(`${TELYDIAL_URL}${d.path}`);
      await expect(page.getByRole('heading', { name: d.heading }).first()).toBeVisible();
      const body = (await page.locator('body').innerText()).toLowerCase();
      expect(body).not.toContain('coming soon');
      expect(body).not.toContain('not found');
      expect(body).not.toContain('404');
      expect(body.length).toBeGreaterThan(300);
      expect(await page.locator('body').innerText()).not.toMatch(MSISDN);
    }
  });

  test('campaign builder: verify → creative + emoji + CTA + device switch → audience → budget → submit', async ({ page }) => {
    await login(page);
    await page.goto(`${TELYDIAL_URL}/campaigns/new`);

    // Step 1 — product verification (known demo ID)
    await page.getByTestId('product-id').fill('MTN-89012');
    await page.getByTestId('verify-btn').click();
    await expect(page.getByTestId('verify-ok')).toBeVisible();
    await page.getByTestId('wizard-next').click();

    // Step 2 — creative
    await page.getByTestId('cr-name').fill('World Cup Predictor Q3');
    await page.getByTestId('cr-sn').fill('World Cup Predictor');
    await page.getByTestId('cr-body').fill('Predict scores and win big. Press to play.');
    // CTA preset renders in preview
    await page.getByTestId('cta-presets').getByRole('button', { name: 'Play now', exact: true }).click();
    await expect(page.getByTestId('preview-accept')).toHaveText('Play now');
    // Emoji insert at cursor
    const before = await page.getByTestId('cr-body').inputValue();
    await page.getByTestId('cr-body-emoji').click();
    await expect(page.getByTestId('emoji-search')).toBeVisible();
    await page.getByTestId('emoji-opt').first().click();
    expect((await page.getByTestId('cr-body').inputValue()).length).toBeGreaterThan(before.length);
    // Device switch preserves creative state
    await page.getByTestId('device-ios').click();
    await expect(page.getByTestId('preview-ios')).toBeVisible();
    await expect(page.getByTestId('ios-accept')).toHaveText('Play now');
    await page.getByTestId('device-android').click();
    await expect(page.getByTestId('preview-android')).toBeVisible();
    await expect(page.getByTestId('cr-name')).toHaveValue('World Cup Predictor Q3');
    await page.getByTestId('wizard-next').click();

    // Step 3 — audience + estimate
    await page.getByTestId('cat-chips').getByRole('button', { name: 'Sports', exact: true }).click();
    await expect(page.getByTestId('audience-estimate')).toBeVisible();
    await page.getByTestId('wizard-next').click();

    // Step 4 — commercial / budget
    await page.getByTestId('model-cards').getByRole('button', { name: /CPM/ }).click();
    await page.getByTestId('b-daily').fill('25000');
    await page.getByTestId('b-total').fill('500000');
    await page.getByTestId('wizard-next').click();

    // Step 5 — review + submit (persists + routes to detail)
    await expect(page.getByTestId('review-grid')).toBeVisible();
    await page.getByTestId('submit-campaign').click();
    await expect(page).toHaveURL(/\/campaigns\/(?!new)[^/]+$/, { timeout: 20_000 });
  });

  test('campaign builder: unknown product ID is rejected, not accepted', async ({ page }) => {
    await login(page);
    await page.goto(`${TELYDIAL_URL}/campaigns/new`);
    await page.getByTestId('product-id').fill('MTN-00000');
    await page.getByTestId('verify-btn').click();
    await expect(page.getByTestId('verify-err')).toBeVisible();
    // Continue stays disabled until a real product verifies
    await expect(page.getByTestId('wizard-next')).toBeDisabled();
  });
});
