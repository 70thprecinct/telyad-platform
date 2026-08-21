-- Demo access control: portal isolation + administrator-issued temporary
-- accounts with a validity window.
--
-- Additive and non-destructive: new columns are nullable or NOT NULL with a
-- safe default, so existing users backfill without a data-migration step
-- (portal defaults to 'advertiser'; standing accounts are isDemo=false). Safe
-- under `prisma migrate deploy` against a populated database.

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "createdByName" TEXT,
ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "expiresAt" TEXT,
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "organisation" TEXT,
ADD COLUMN     "portal" TEXT NOT NULL DEFAULT 'advertiser',
ADD COLUMN     "revokedAt" TEXT,
ADD COLUMN     "validFrom" TEXT;

-- CreateIndex
CREATE INDEX "User_portal_idx" ON "User"("portal");

-- CreateIndex
CREATE INDEX "User_isDemo_idx" ON "User"("isDemo");
