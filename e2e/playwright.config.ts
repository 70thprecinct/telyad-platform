import { defineConfig, devices } from '@playwright/test';

/**
 * Spins up the persistent API (fresh seeded e2e SQLite DB) plus the advertiser
 * and telco Next.js apps, then runs the demo-journey and responsive specs.
 *
 * The apps are served with `next start`, so they must be built first
 * (`pnpm build`). Locally: `pnpm test:e2e` builds then runs.
 */

const CI = !!process.env.CI;
const JWT_SECRET = process.env.JWT_SECRET ?? 'e2e-only-secret-0123456789abcdef';
// Not a secret — must match the API's dev seed default so local login works.
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD ?? 'dev-demo-password-not-secret';

export const ADVERTISER_URL = 'http://localhost:3001';
export const TELCO_URL = 'http://localhost:3002';
export const API_URL = 'http://localhost:4000';
export const DEMO_PASSWORD = DEMO_USER_PASSWORD;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm --filter @telyad/api e2e:serve',
      url: `${API_URL}/health`,
      cwd: '..',
      timeout: 120_000,
      reuseExistingServer: !CI,
      env: {
        DATABASE_URL: 'file:./prisma/e2e.db',
        JWT_SECRET,
        DEMO_USER_PASSWORD,
        API_PORT: '4000',
        NODE_ENV: 'test',
      },
    },
    {
      command: 'pnpm --filter @telyad/advertiser start',
      url: ADVERTISER_URL,
      cwd: '..',
      timeout: 120_000,
      reuseExistingServer: !CI,
      env: { NEXT_PUBLIC_API_URL: API_URL },
    },
    {
      command: 'pnpm --filter @telyad/telco-console start',
      url: TELCO_URL,
      cwd: '..',
      timeout: 120_000,
      reuseExistingServer: !CI,
      env: { NEXT_PUBLIC_API_URL: API_URL },
    },
  ],
});
