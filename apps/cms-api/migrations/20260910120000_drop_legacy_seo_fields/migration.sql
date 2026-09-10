-- Köhnə, saytda (treva-web) istifadə olunmayan SEO / JSON-LD sahələri silinir.
-- Bunları yeni mərkəzi SEO bölməsi (PageMeta: static + dynamic pages) əvəz edir.
-- Yalnız bu sütunlar düşür — sətirlərə, digər sahələrə toxunulmur.

-- Pulse məqalələri
ALTER TABLE "pulse_articles" DROP COLUMN IF EXISTS "metaTitle";
ALTER TABLE "pulse_articles" DROP COLUMN IF EXISTS "metaDescription";
ALTER TABLE "pulse_articles" DROP COLUMN IF EXISTS "schema";

-- Layihə detalları
ALTER TABLE "layihelerimiz_project_details" DROP COLUMN IF EXISTS "schema";
ALTER TABLE "layihelerimiz_project_details" DROP COLUMN IF EXISTS "seoTitle";
ALTER TABLE "layihelerimiz_project_details" DROP COLUMN IF EXISTS "seoDescription";
ALTER TABLE "layihelerimiz_project_details" DROP COLUMN IF EXISTS "ogImage";

-- Vakansiyalar
ALTER TABLE "Vacancy" DROP COLUMN IF EXISTS "seoTitle";
ALTER TABLE "Vacancy" DROP COLUMN IF EXISTS "seoDescription";
ALTER TABLE "Vacancy" DROP COLUMN IF EXISTS "seoKeywords";
