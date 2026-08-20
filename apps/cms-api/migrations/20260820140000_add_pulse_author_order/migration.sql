-- AlterTable
ALTER TABLE "pulse_authors" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- Mövcud ardıcıllıq qorunur: bu vaxta qədər siyahı `featured DESC, slug ASC`
-- ilə düzülürdü. Backfill olmasaydı bütün sətirlərdə order=0 qalar və sıra
-- təsadüfi görünərdi.
UPDATE "pulse_authors" AS a
SET "order" = s.position
FROM (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "featured" DESC, "slug" ASC) - 1 AS position
  FROM "pulse_authors"
) AS s
WHERE a."id" = s."id";
