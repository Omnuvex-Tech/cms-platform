-- ⚠️  GERİ QAYTARILA BİLMƏYƏN ADDIM ⚠️
--
-- trenders-dən qalma cədvəlləri düşürür. treva-web bu cədvəllərin heç birini
-- çağırmır (yoxlanılıb: yalnız layihelerimiz/*, pulse/*, callback,
-- broker-registration, newsletter/subscribe, contact/submit istifadə olunur).
--
-- DEPLOY-DAN ƏVVƏL: cədvəllərdə lazımlı data qalıb-qalmadığını yoxla, məsələn:
--   SELECT 'blogs', count(*) FROM blogs
--   UNION ALL SELECT 'portfolios', count(*) FROM portfolios
--   UNION ALL SELECT 'services',  count(*) FROM services
--   UNION ALL SELECT 'partners',  count(*) FROM partners
--   UNION ALL SELECT 'blog_authors', count(*) FROM blog_authors;
--
-- Data lazımdırsa əvvəlcə pg_dump ilə arxivləyin — bu migration onu qaytarmır.

-- Xarici açar asılılıqları: blogs → blog_authors/blog_categories, partners → partner_sections.
-- CASCADE asılı constraint-ləri özü təmizləyir.
DROP TABLE IF EXISTS "blogs"              CASCADE;
DROP TABLE IF EXISTS "blog_authors"       CASCADE;
DROP TABLE IF EXISTS "blog_categories"    CASCADE;
DROP TABLE IF EXISTS "blog_settings"      CASCADE;
DROP TABLE IF EXISTS "our_team_settings"  CASCADE;
DROP TABLE IF EXISTS "partners"           CASCADE;
DROP TABLE IF EXISTS "partner_sections"   CASCADE;
DROP TABLE IF EXISTS "portfolios"         CASCADE;
DROP TABLE IF EXISTS "PortfolioSettings"  CASCADE;
DROP TABLE IF EXISTS "services"           CASCADE;
DROP TABLE IF EXISTS "about_settings"     CASCADE;
