-- Drop text uniqueness because keyword names now become localized JSON objects.
DROP INDEX IF EXISTS "pulse_keywords_name_key";

-- Convert existing Azerbaijani text values into a 3-language JSON structure
-- without losing any current keyword data.
ALTER TABLE "pulse_keywords"
ADD COLUMN "name_localized" JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE "pulse_keywords"
SET "name_localized" = jsonb_build_object(
  'az', "name",
  'en', "name",
  'ru', "name"
);

ALTER TABLE "pulse_keywords" DROP COLUMN "name";
ALTER TABLE "pulse_keywords" RENAME COLUMN "name_localized" TO "name";
