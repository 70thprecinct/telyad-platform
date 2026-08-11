import type { PrismaClient } from '@prisma/client';
import { buildSeed } from './seed-data';

/**
 * Idempotent, deterministic seed of the Prisma database. Safe to run repeatedly
 * (wipes then re-inserts the fixed demo dataset). Shared by the CLI seed script
 * and the persistence tests.
 */
export async function seedPrisma(prisma: PrismaClient, passwordHash: string): Promise<void> {
  const seed = buildSeed(passwordHash);

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
}
