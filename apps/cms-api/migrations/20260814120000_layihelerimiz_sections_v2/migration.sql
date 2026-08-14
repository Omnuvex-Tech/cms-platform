-- Layihelerimiz v2: flat sütunlardan blok əsaslı "sections" JSON-a keçid.
--
-- Köhnə sütunlar bu migration-da SİLİNMİR. Yalnız oxunub sections massivinə
-- köçürülür ki, deploy zamanı köhnə API cavabı da işləməyə davam etsin.
-- Sütunların silinməsi ayrıca migration ilə, treva-web tam keçdikdən sonra olacaq.

-- ─── 1) Yeni sütunlar ───────────────────────────────────────────────────────
ALTER TABLE "layihelerimiz_project_details"
  ADD COLUMN IF NOT EXISTS "sections" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "schema"   JSONB;

-- ─── 2) heroImages: alt string → lokalizasiya olunmuş obyekt ────────────────
-- Köhnə format: [{ "url": "...", "alt": "mətn" }]
-- Yeni format:  [{ "url": "...", "alt": { "az": "...", "en": "...", "ru": "..." } }]
-- (hesablama aşağıdakı UPDATE-in FROM alt-sorğusunda aparılır)

-- ─── 3) Backfill ────────────────────────────────────────────────────────────
-- Yalnız sections hələ boş olan sətirlərə toxunur → təkrar icra təhlükəsizdir.
UPDATE "layihelerimiz_project_details" d
SET "sections" = jsonb_build_array(

  -- hero
  jsonb_build_object(
    'type',        'hero',
    'isVisible',   true,
    'title',       COALESCE(d."heroTitle",       '{}'::jsonb),
    'desktopDesc', COALESCE(d."heroDesktopDesc", '{}'::jsonb),
    'mobileDesc',  COALESCE(d."heroMobileDesc",  '{}'::jsonb),
    'images',      COALESCE(h.images,            '[]'::jsonb),
    'ctaText',     COALESCE(d."heroCtaText",     '{}'::jsonb),
    'ctaLink',     COALESCE(d."heroCtaLink",     '')
  ),

  -- overview
  jsonb_build_object(
    'type',         'overview',
    'isVisible',    true,
    'titleLight',   COALESCE(d."overviewTitleLight",   '{}'::jsonb),
    'titleBold',    COALESCE(d."overviewTitleBold",    '{}'::jsonb),
    'brandName',    COALESCE(d."overviewBrandName",    '{}'::jsonb),
    'debutText',    COALESCE(d."overviewDebutText",    '{}'::jsonb),
    'locationText', COALESCE(d."overviewLocationText", '{}'::jsonb),
    'debutTextEnd', COALESCE(d."overviewDebutTextEnd", '{}'::jsonb),
    'description',  COALESCE(d."overviewDescription",  '{}'::jsonb),
    'images', jsonb_build_object(
      'large',  jsonb_build_object('url', COALESCE(d."overviewImageLarge",  ''), 'label', COALESCE(d."overviewImageLargeLabel",  '{}'::jsonb)),
      'medium', jsonb_build_object('url', COALESCE(d."overviewImageMedium", ''), 'label', COALESCE(d."overviewImageMediumLabel", '{}'::jsonb)),
      'small',  jsonb_build_object('url', COALESCE(d."overviewImageSmall",  ''), 'label', COALESCE(d."overviewImageSmallLabel",  '{}'::jsonb))
    ),
    'dataRows', CASE
                  WHEN jsonb_typeof(d."overviewDataRows") = 'array' THEN d."overviewDataRows"
                  ELSE '[]'::jsonb
                END
  ),

  -- features
  jsonb_build_object(
    'type',         'features',
    'isVisible',    true,
    'headerMain',   COALESCE(d."featuresHeaderMain", '{}'::jsonb),
    'headerSub',    COALESCE(d."featuresHeaderSub",  '{}'::jsonb),
    'titleLight',   COALESCE(d."featuresTitleLight", '{}'::jsonb),
    'titleBold',    COALESCE(d."featuresTitleBold",  '{}'::jsonb),
    'sections',     CASE
                      WHEN jsonb_typeof(d."featuresSections") = 'array' THEN d."featuresSections"
                      ELSE '[]'::jsonb
                    END,
    'brochureFile', COALESCE(d."brochureFile", '')
  ),

  -- location
  jsonb_build_object(
    'type',          'location',
    'isVisible',     true,
    'titleLight',    COALESCE(d."locationTitleLight",    '{}'::jsonb),
    'titleBold',     COALESCE(d."locationTitleBold",     '{}'::jsonb),
    'brandName',     COALESCE(d."locationBrandName",     '{}'::jsonb),
    'mainLead',      COALESCE(d."locationMainLead",      '{}'::jsonb),
    'subText',       COALESCE(d."locationSubText",       '{}'::jsonb),
    'mapImage',      COALESCE(d."locationMapImage",      ''),
    'footerAddress', COALESCE(d."locationFooterAddress", '{}'::jsonb),
    'googleMapsUrl', COALESCE(d."locationGoogleMapsUrl", '')
  ),

  -- layouts (unit filter — datanı categorySlug-dan özü çəkir)
  jsonb_build_object(
    'type',      'layouts',
    'isVisible', true
  )

)
FROM (
  SELECT
    src."id",
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'url', COALESCE(t.img ->> 'url', ''),
          'alt', CASE
                   WHEN jsonb_typeof(t.img -> 'alt') = 'object' THEN t.img -> 'alt'
                   ELSE jsonb_build_object(
                          'az', COALESCE(t.img ->> 'alt', ''),
                          'en', COALESCE(t.img ->> 'alt', ''),
                          'ru', COALESCE(t.img ->> 'alt', '')
                        )
                 END
        )
        ORDER BY t.ord
      ) FILTER (WHERE t.img IS NOT NULL),
      '[]'::jsonb
    ) AS images
  FROM "layihelerimiz_project_details" src
  LEFT JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(src."heroImages") = 'array' THEN src."heroImages" ELSE '[]'::jsonb END
  ) WITH ORDINALITY AS t(img, ord) ON TRUE
  GROUP BY src."id"
) h
WHERE h."id" = d."id"
  AND (d."sections" IS NULL OR d."sections" = '[]'::jsonb);
