-- JSON-LD strukturlaşdırılmış datanın saxlanması üçün sahələr.
-- master branch-dakı schema generator pattern-i ilə eyni: generator cavabı
-- CMS-də önizlənir, admin təsdiqləyəndə bu sütuna yazılır.

ALTER TABLE "PageMeta"
  ADD COLUMN IF NOT EXISTS "schema" JSONB;

ALTER TABLE "pulse_articles"
  ADD COLUMN IF NOT EXISTS "schema" JSONB;
