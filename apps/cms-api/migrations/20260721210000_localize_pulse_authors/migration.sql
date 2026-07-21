-- Convert author fields to localized JSON while preserving all current data.
ALTER TABLE "pulse_authors"
ADD COLUMN "name_localized" JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN "title_localized" JSONB,
ADD COLUMN "description_localized" JSONB;

UPDATE "pulse_authors"
SET
  "name_localized" = jsonb_build_object(
    'az', "name",
    'en', "name",
    'ru', "name"
  ),
  "title_localized" = CASE
    WHEN "title" IS NULL OR btrim("title") = '' THEN NULL
    ELSE jsonb_build_object('az', "title", 'en', "title", 'ru', "title")
  END,
  "description_localized" = CASE
    WHEN "description" IS NULL OR btrim("description") = '' THEN NULL
    ELSE jsonb_build_object('az', "description", 'en', "description", 'ru', "description")
  END;

ALTER TABLE "pulse_authors" DROP COLUMN "name";
ALTER TABLE "pulse_authors" DROP COLUMN "title";
ALTER TABLE "pulse_authors" DROP COLUMN "description";

ALTER TABLE "pulse_authors" RENAME COLUMN "name_localized" TO "name";
ALTER TABLE "pulse_authors" RENAME COLUMN "title_localized" TO "title";
ALTER TABLE "pulse_authors" RENAME COLUMN "description_localized" TO "description";
