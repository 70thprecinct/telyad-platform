import { test, expect, type Page } from '@playwright/test';
import { ADVERTISER_URL, DEMO_PASSWORD } from '../playwright.config';

const VIEWPORTS = [
  { name: '1440-desktop', width: 1440, height: 900 },
  { name: '1280-desktop', width: 1280, height: 800 },
  { name: '768-tablet', width: 768, height: 1024 },
  { name: '430-mobile', width: 430, height: 932 },
  { name: '390-mobile', width: 390, height: 844 },
  { name: '360-mobile', width: 360, height: 780 },
];

async function noHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
}

async function login(page: Page) {
  await page.goto(`${ADVERTISER_URL}/login`);
  await page.getByLabel('Work email').fill('bola@toyota.example');
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

for (const vp of VIEWPORTS) {
  test(`advertiser responsive smoke @ ${vp.name}`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();

    await login(page);
    expect(await noHorizontalOverflow(page), 'dashboard has no horizontal overflow').toBeTruthy();

    // Navigation remains usable at every size.
    if (vp.width <= 860) {
      await expect(page.getByTestId('menu-toggle')).toBeVisible();
      await page.getByTestId('menu-toggle').click();
    }
    await page.getByRole('button', { name: 'Campaigns', exact: true }).click();
    await expect(page).toHaveURL(/\/campaigns$/);
    expect(await noHorizontalOverflow(page), 'campaigns list has no horizontal overflow').toBeTruthy();

    // Campaign wizard remains usable: handset preview and controls present, no overflow.
    await page.goto(`${ADVERTISER_URL}/campaigns/new`);
    await expect(page.getByRole('heading', { name: 'New campaign' })).toBeVisible();
    await expect(page.locator('.tly-phone')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next →' })).toBeVisible();
    expect(await noHorizontalOverflow(page), 'wizard has no horizontal overflow').toBeTruthy();

    await page.screenshot({ path: `screenshots/responsive-${vp.name}.png`, fullPage: true }).catch(() => undefined);
    await ctx.close();
  });
}
