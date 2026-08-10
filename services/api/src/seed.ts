/**
 * Seeds the Prisma database with reproducible demonstration data.
 * Run with: STORE=prisma DATABASE_URL=... pnpm --filter @telyad/api db:seed
 */
import { PrismaClient } from '@prisma/client';
import { hashPassword } from './auth';
import { env } from './env';
import { buildSeed } from './store/seed-data';

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const seed = buildSeed(hashPassword(env.demoPassword));

  // Idempotent reseed.
  await prisma.$transaction([
    prisma.campaignApproval.deleteMany(),
    prisma.auditEvent.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.campaign.deleteMany(),
    prisma.user.deleteMany(),
    prisma.advertiser.deleteMany(),
    prisma.telco.deleteMany(),
  ]);

  await prisma.telco.createMany({ data: seed.telcos });
  await prisma.advertiser.createMany({ data: seed.advertisers });
  await prisma.user.createMany({ data: seed.users });
  await prisma.campaign.createMany({
    data: seed.campaigns.map((c) => ({
      id: c.id,
      telcoId: c.telcoId,
      advertiserId: c.advertiserId,
      name: c.name,
      objective: c.objective,
      formatId: c.formatId,
      status: c.status,
      audienceJson: JSON.stringify(c.audience),
      estimatedReach: c.estimatedReach,
      budgetJson: JSON.stringify(c.budget),
      complianceScore: c.complianceScore,
      riskScore: c.riskScore,
      createdBy: c.createdBy,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      submittedAt: c.submittedAt,
      approvedAt: c.approvedAt,
      approvedByTelcoName: c.approvedByTelcoName,
    })),
  });
  await prisma.notification.createMany({ data: seed.notifications });

  console.log(
    `Seeded ${seed.telcos.length} telcos, ${seed.advertisers.length} advertisers, ${seed.users.length} users, ${seed.campaigns.length} campaigns.`,
  );
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
