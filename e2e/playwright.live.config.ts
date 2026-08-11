import { defineConfig, devices } from '@playwright/test';

/**
 * Live-domain Playwright config (spec §20–21). Runs the SAME specs plus the
 * live-only admin smoke against the DEPLOYED domains — NO webServer is started.
 *
 * The shared `tests/**` glob now includes the reworked multi-capability journey
 * (demo-journey.spec.ts: wizard capability selection → audience-match estimate →
 * MTN reviews the persisted audience snapshot + full capability plan + per-
 * capability experience preview) and the WP02C preview/audience-match suite
 * (wp02c.spec.ts), so the WP02C.1 persistence path is exercised end-to-end
 * against the live deployment, not just locally.
 *
 * Required env before running:
 *   ADVERTISER_URL=https://advertiser.telyad.com
 *   TELCO_URL=https://mtn.telyad.com
 *   ADMIN_URL=https://admin.telyad.com
 *   API_URL=https://api.telyad.com
 *   DEMO_USER_PASSWORD=<the deployed demo password>
 *
 * Run: pnpm --filter @telyad/e2e e2e:live
 */
export default defineConfig({
  testDir: '.',
  testMatch: ['tests/**/*.spec.ts', 'tests-live/**/*.spec.ts'],
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-live' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: false,
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  // No webServer — targets the live deployed domains.
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
  ],
});
