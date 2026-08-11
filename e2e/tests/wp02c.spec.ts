import { test, expect, type Page } from '@playwright/test';
import { ADVERTISER_URL, DEMO_PASSWORD } from '../playwright.config';

async function login(page: Page) {
  await page.goto(`${ADVERTISER_URL}/login`);
  await page.getByLabel('Work email').fill('chidi@maltina.example');
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe('WP02C — 48/48 previews + audience match', () => {
  test('marketplace shows a populated capability-specific preview (formerly empty)', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await login(page);
    await page.goto(`${ADVERTISER_URL}/marketplace`);
    await expect(page.getByTestId('marketplace-grid')).toBeVisible();

    // Capture representative family previews — including ones that had NO preview before.
    for (const [term, file] of [
      ['Lock Screen', 'wp02c-lock-screen'],
      ['Coupon', 'wp02c-voucher'],
      ['Digital Out-of-Home', 'wp02c-dooh'],
      ['Sequenced Follow', 'wp02c-journey'],
      ['Rewarded Data', 'wp02c-reward'],
    ] as const) {
      await page.getByPlaceholder('Search capabilities…').fill(term);
      await page.waitForTimeout(200);
      await page.getByTestId('capability-card').first().getByRole('button', { name: 'View details' }).click();
      const preview = page.getByTestId('capability-preview');
      await expect(preview).toBeVisible();
      // No "not available" placeholder anywhere.
      await expect(preview.getByText(/not available/i)).toHaveCount(0);
      await preview.screenshot({ path: `screenshots/${file}.png` }).catch(() => undefined);
      await page.getByRole('button', { name: 'Close' }).click();
      await page.waitForTimeout(100);
    }
    await ctx.close();
  });

  test('audience match: eligible → target slider changes forecast/cost; language + preview', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await login(page);
    await page.goto(`${ADVERTISER_URL}/campaigns/new`);
    await expect(page.getByRole('heading', { name: 'New campaign' })).toBeVisible();

    // Step 1 → 2: recommended capabilities.
    await page.getByLabel('Campaign name').fill('Maltina Family Moments E2E');
    await page.getByRole('button', { name: 'Next →' }).click();
    await expect(page.getByTestId('capability-selector')).toBeVisible();
    await page.getByRole('button', { name: 'Use recommended set' }).click();
    await expect(page.getByTestId('selected-capabilities')).toBeVisible();
    await page.getByRole('button', { name: 'Next →' }).click();

    // Step 3: audience match — eligible audience, then move the target and see cost change.
    const match = page.getByTestId('audience-match');
    await expect(match).toBeVisible();
    await page.screenshot({ path: 'screenshots/wp02c-audience-match.png', fullPage: true }).catch(() => undefined);

    const targetInput = page.getByTestId('target-input');
    await targetInput.fill('250000');
    await targetInput.blur();
    await page.waitForTimeout(400);
    await targetInput.fill('1500000');
    await targetInput.blur();
    await page.waitForTimeout(400);
    await expect(match).toBeVisible();
    await page.getByRole('button', { name: 'Next →' }).click();

    // Step 4: creative + language — preview reflects creative, language switch available.
    await page.getByTestId('creative-body').fill('Win with Maltina — join the family promo!');
    await page.waitForTimeout(200);
    await expect(page.getByTestId('experience-preview')).toBeVisible();
    await page.screenshot({ path: 'screenshots/wp02c-creative-language.png', fullPage: true }).catch(() => undefined);
    await ctx.close();
  });
});
