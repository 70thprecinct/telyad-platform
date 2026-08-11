-- WP02C.1 persistence: capture the exact audience estimate snapshot and the full
-- multi-capability media plan at submission time, so MTN reviews the immutable
-- figures the advertiser saw.
--
-- Additive and non-destructive: both columns are nullable, so existing rows
-- backfill to NULL and no data is rewritten or dropped. Safe under
-- `prisma migrate deploy` against a populated production database.

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "audienceSnapshotJson" TEXT,
ADD COLUMN     "capabilityPlanJson" TEXT;
