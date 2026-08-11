/**
 * Restores the deterministic demonstration state (spec §19).
 *
 * SAFETY: refuses to run unless DEMO_MODE is enabled. This is an explicit,
 * demo-only operation — it restores the fixed demo dataset (advertisers, users,
 * campaigns across statuses, capability availability defaults) without touching
 * schema. It never runs a destructive schema reset. Never point this at a
 * non-demo database.
 *
 * Run: DEMO_MODE=on STORE=prisma DATABASE_URL=... pnpm --filter @telyad/api demo:reset
 */
import { PrismaClient } from '@prisma/client';
import { hashPassword } from './auth';
import { env } from './env';
import { seedPrisma } from './store/seed-prisma';

async function main(): Promise<void> {
  if (!env.demoMode) {
    console.error(
      'Refusing to run demo:reset — DEMO_MODE is not enabled. Set DEMO_MODE=on to restore the demonstration state.',
    );
    process.exit(2);
  }
  console.log(`[demo:reset] APP_ENV=${env.appEnv} — restoring deterministic demonstration state…`);
  const prisma = new PrismaClient();
  try {
    await seedPrisma(prisma, hashPassword(env.demoPassword));
    const [telcos, advertisers, users, campaigns] = await Promise.all([
      prisma.telco.count(),
      prisma.advertiser.count(),
      prisma.user.count(),
      prisma.campaign.count(),
    ]);
    console.log(
      `[demo:reset] restored ${telcos} telcos, ${advertisers} advertisers, ${users} users, ${campaigns} campaigns.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[demo:reset] failed', err);
  process.exit(1);
});
