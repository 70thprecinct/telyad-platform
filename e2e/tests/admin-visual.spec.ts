import { test, type Page } from '@playwright/test';
import { ADMIN_URL, DEMO_PASSWORD } from '../playwright.config';

// Visual-evidence capture for PARITY-03. Writes full-page screenshots of every
// Master Admin destination to visual-review-parity/admin/ for side-by-side QA
// against the approved prototype. Not an assertion suite.

const OUT = '../visual-review-parity/admin';

async function adminLogin(page: Page) {
  await page.goto(`${ADMIN_URL}/login`);
  await page.getByLabel('Work email').fill('admin@tely.example');
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/dashboard/);
}

const PAGES: [string, string][] = [
  ['/dashboard', 'dashboard'],
  ['/directory', 'directory'],
  ['/terms', 'terms'],
  ['/platform-health', 'platform-health'],
  ['/users', 'users'],
  ['/engines', 'engines'],
  ['/engines/telysignal', 'engines-telysignal'],
  ['/engines/telyxchange', 'engines-telyxchange'],
  ['/engines/telyads', 'engines-telyads'],
  ['/engines/telyreach', 'engines-telyreach'],
];

test('capture Master Admin visual evidence', async ({ page }) => {
  await adminLogin(page);
  for (const [path, name] of PAGES) {
    await page.goto(`${ADMIN_URL}${path}`);
    await page.getByRole('heading').first().waitFor();
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  }
  // Scoped drill-down state (isolation banner).
  await page.goto(`${ADMIN_URL}/directory`);
  await page.getByTestId('enter-telco').first().click();
  await page.getByTestId('scope-banner').waitFor();
  await page.screenshot({ path: `${OUT}/directory-scoped.png`, fullPage: true });
  // Onboard modal state.
  await page.getByTestId('exit-scoped').click();
  await page.getByTestId('onboard-telco').click();
  await page.screenshot({ path: `${OUT}/directory-onboard-modal.png`, fullPage: true });
});
