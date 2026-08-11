/**
 * Seeds the Prisma database with reproducible demonstration data.
 * Run with: STORE=prisma DATABASE_URL=... pnpm --filter @telyad/api db:seed
 */
import { PrismaClient } from '@prisma/client';
import { hashPassword } from './auth';
import { env } from './env';
import { seedPrisma } from './store/seed-prisma';

async function main(): Promise<void> {
  // Fail safe: in production, refuse to seed users with the insecure default
  // password. A real DEMO_USER_PASSWORD must be provided (spec §18).
  if (process.env.NODE_ENV === 'production' && !process.env.DEMO_USER_PASSWORD) {
    throw new Error('DEMO_USER_PASSWORD must be set when seeding in production.');
  }
  const prisma = new PrismaClient();
  await seedPrisma(prisma, hashPassword(env.demoPassword));
  const [telcos, advertisers, users, campaigns] = await Promise.all([
    prisma.telco.count(),
    prisma.advertiser.count(),
    prisma.user.count(),
    prisma.campaign.count(),
  ]);
  console.log(
    `Seeded ${telcos} telcos, ${advertisers} advertisers, ${users} users, ${campaigns} campaigns.`,
  );
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
