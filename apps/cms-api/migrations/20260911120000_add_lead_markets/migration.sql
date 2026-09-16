-- Which market a lead engaged with on the bot — TREVA's off-plan projects and/or its resale
-- listings — plus the resale listings the customer picked. Every lead ingested before resale
-- existed came through the off-plan funnel, so all existing rows are tagged off_plan.

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "markets" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "resaleUnits" JSONB NOT NULL DEFAULT '[]';

-- Backfill
UPDATE "leads" SET "markets" = ARRAY['off_plan']::TEXT[];
