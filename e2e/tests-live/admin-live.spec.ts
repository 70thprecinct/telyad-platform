import { test, expect } from '@playwright/test';
import { ADMIN_URL, DEMO_PASSWORD } from '../playwright.config';

/**
 * Live-only Tely Master Admin smoke (spec §20). Not run in the local suite (the
 * admin app is not started by the local webServer); it runs under the live
 * config against the deployed admin domain.
 */
test('admin: login, global overview and telco directory', async ({ page }) => {
  await page.goto(`${ADMIN_URL}/login`);
  await page.getByLabel('Work email').fill('admin@tely.example');
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  // Global overview lists telcos.
  await expect(page.getByText('MTN Nigeria').first()).toBeVisible();

  // Telco Directory.
  await page.getByRole('button', { name: 'Telco Directory' }).click();
  await expect(page).toHaveURL(/\/directory/);
  await expect(page.getByText('MTN Nigeria').first()).toBeVisible();
});
