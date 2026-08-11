import { test, expect, type Page } from '@playwright/test';
import { ADVERTISER_URL, TELCO_URL, DEMO_PASSWORD } from '../playwright.config';

const shot = (page: Page, name: string) =>
  page.screenshot({ path: `screenshots/${name}.png`, fullPage: true }).catch(() => undefined);

async function login(page: Page, base: string, email: string) {
  await page.goto(`${base}/login`);
  await page.getByLabel('Work email').fill(email);
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test('Wednesday demo journey: advertiser submit → MTN approve → advertiser sees approved', async ({
  browser,
}) => {
  const campaignName = `Highlander Test Drive E2E ${Date.now()}`;

  // ── Advertiser ─────────────────────────────────────────────────────────────
  const advCtx = await browser.newContext();
  const adv = await advCtx.newPage();

  await test.step('advertiser login', () => login(adv, ADVERTISER_URL, 'bola@toyota.example'));
  await shot(adv, '01-advertiser-dashboard');

  await test.step('open the campaign wizard', async () => {
    await adv.getByRole('button', { name: '+ New Campaign' }).first().click();
    await expect(adv.getByRole('heading', { name: 'New campaign' })).toBeVisible();
  });

  await test.step('step 1 — objective & name', async () => {
    await adv.getByLabel('Campaign name').fill(campaignName);
    await shot(adv, '02-objective');
    await adv.getByRole('button', { name: 'Next →' }).click();
  });

  await test.step('step 2 — select capabilities (all 48 available)', async () => {
    await expect(adv.getByTestId('capability-selector')).toBeVisible();
    await adv.getByRole('button', { name: 'Use recommended set' }).click();
    await expect(adv.getByTestId('selected-capabilities')).toBeVisible();
    await shot(adv, '03-capabilities');
    await adv.getByRole('button', { name: 'Next →' }).click();
  });

  await test.step('step 3 — audience match (eligible/target/forecast)', async () => {
    await expect(adv.getByTestId('audience-match')).toBeVisible();
    await shot(adv, '04-audience-match');
    await adv.getByRole('button', { name: 'Next →' }).click();
  });

  await test.step('step 4 — creative & language', async () => {
    await adv.getByTestId('creative-body').fill('Win with Maltina — join the family promo today!');
    await shot(adv, '05-creative-language');
    await adv.getByRole('button', { name: 'Next →' }).click();
  });

  await test.step('step 5 — review & submit', async () => {
    await adv.getByRole('button', { name: 'Submit for approval' }).click();
  });

  await test.step('advertiser sees Pending MTN approval', async () => {
    const detail = adv.getByTestId('campaign-detail');
    await expect(detail).toBeVisible();
    await expect(detail).toHaveAttribute('data-status', 'PENDING_TELCO_APPROVAL');
    await expect(adv.getByText('Pending approval').first()).toBeVisible();
    await shot(adv, '06-pending-approval');
  });
  const advDetailUrl = adv.url();

  // ── MTN Operations ─────────────────────────────────────────────────────────
  const mtnCtx = await browser.newContext();
  const mtn = await mtnCtx.newPage();

  await test.step('MTN login', () => login(mtn, TELCO_URL, 'ops.lead@mtn.example'));
  await shot(mtn, '07-mtn-dashboard');

  await test.step('MTN sees the campaign in the approval queue', async () => {
    await mtn.getByRole('button', { name: 'Campaign Approval' }).click();
    await expect(mtn.getByTestId('approval-queue')).toBeVisible();
    const card = mtn.getByTestId('approval-card').filter({ hasText: campaignName });
    await expect(card).toBeVisible();
    await shot(mtn, '08-approval-queue');

    await test.step('review + approve', async () => {
      await card.getByTestId('approve-button').click();
      await mtn.getByTestId('decision-comment').fill('Compliant, low risk. Approved for delivery.');
      await shot(mtn, '09-campaign-review');
      await mtn.getByTestId('confirm-decision').click();
    });

    // The card leaves the queue once approved.
    await expect(card).toHaveCount(0);
    await shot(mtn, '10-approved');
  });

  // ── Advertiser return ──────────────────────────────────────────────────────
  await test.step('advertiser now sees Approved by MTN Nigeria', async () => {
    await adv.goto(advDetailUrl);
    const banner = adv.getByTestId('approval-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Approved by MTN Nigeria');
    await expect(adv.getByTestId('campaign-detail')).toHaveAttribute('data-status', 'APPROVED');
    await shot(adv, '11-advertiser-approved');
  });

  await test.step('analytics render for the campaign', async () => {
    await expect(adv.getByText('Campaign analytics')).toBeVisible();
    await shot(adv, '12-analytics');
  });

  await advCtx.close();
  await mtnCtx.close();
});
