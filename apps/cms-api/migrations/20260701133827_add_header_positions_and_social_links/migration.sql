-- AlterTable: pulse_articles - add headerPositions (JSON array) and socialLinks
ALTER TABLE "pulse_articles" ADD COLUMN "headerPositions" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "pulse_articles" ADD COLUMN "socialLinks" JSONB;

-- Migrate existing data: copy single headerPosition value into the new array
UPDATE "pulse_articles" SET "headerPositions" = to_jsonb(ARRAY["headerPosition"]) WHERE "headerPosition" IS NOT NULL;

-- Drop the old column
ALTER TABLE "pulse_articles" DROP COLUMN "headerPosition";
