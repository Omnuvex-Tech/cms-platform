/**
 * Layihelerimiz layihə detalı — blok (section) sistemi.
 *
 * v1-də hər dizayn sahəsi ayrıca DB sütunu idi (heroTitle, overviewTitleBold, ...).
 * v2-də hamısı tək `sections` JSON massividir:
 *
 *   [{ type: "hero", isVisible: true, ...data }, { type: "overview", ... }]
 *
 * Bu fayl həm API-nin dual-read fallback-i, həm də CMS/treva-web üçün
 * yeganə həqiqət mənbəyidir (section tipləri və sahə adları burada).
 */

export type Localized = Record<string, string>;

export const PROJECT_SECTION_TYPES = [
  'hero',
  'overview',
  'features',
  'location',
  'layouts',
  // İnteryer/eksteryer foto qalereyası — sərbəst sayda şəkil.
  'gallery',
] as const;

export type ProjectSectionType = (typeof PROJECT_SECTION_TYPES)[number];

export interface ProjectSection {
  type: ProjectSectionType;
  isVisible?: boolean;
  [key: string]: unknown;
}

const asObject = (value: unknown): Localized =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Localized)
    : {};

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const asString = (value: unknown): string =>
  typeof value === 'string' ? value : '';

/**
 * heroImages köhnə formatda `alt` sahəsini düz string kimi saxlayırdı.
 * v2-də lokalizasiya olunmuş obyektdir — köhnə dəyəri üç dilə kopyalayırıq.
 */
const normalizeHeroImages = (value: unknown) =>
  asArray(value).map((raw) => {
    const img = (raw ?? {}) as Record<string, unknown>;
    const alt = img.alt;
    return {
      url: asString(img.url),
      alt:
        alt && typeof alt === 'object' && !Array.isArray(alt)
          ? (alt as Localized)
          : { az: asString(alt), en: asString(alt), ru: asString(alt) },
    };
  });

/**
 * v1 flat sütunlarından v2 sections massivini qurur.
 *
 * DİQQƏT: bu funksiya 20260814120000_layihelerimiz_sections_v2 migration-ındakı
 * SQL backfill-in eyni məntiqidir. Birini dəyişəndə o birini də dəyiş.
 */
export function buildSectionsFromLegacy(
  row: Record<string, any>,
): ProjectSection[] {
  return [
    {
      type: 'hero',
      isVisible: true,
      title: asObject(row.heroTitle),
      desktopDesc: asObject(row.heroDesktopDesc),
      mobileDesc: asObject(row.heroMobileDesc),
      images: normalizeHeroImages(row.heroImages),
      ctaText: asObject(row.heroCtaText),
      ctaLink: asString(row.heroCtaLink),
    },
    {
      type: 'overview',
      isVisible: true,
      titleLight: asObject(row.overviewTitleLight),
      titleBold: asObject(row.overviewTitleBold),
      brandName: asObject(row.overviewBrandName),
      debutText: asObject(row.overviewDebutText),
      locationText: asObject(row.overviewLocationText),
      debutTextEnd: asObject(row.overviewDebutTextEnd),
      description: asObject(row.overviewDescription),
      images: {
        large: {
          url: asString(row.overviewImageLarge),
          label: asObject(row.overviewImageLargeLabel),
        },
        medium: {
          url: asString(row.overviewImageMedium),
          label: asObject(row.overviewImageMediumLabel),
        },
        small: {
          url: asString(row.overviewImageSmall),
          label: asObject(row.overviewImageSmallLabel),
        },
      },
      dataRows: asArray(row.overviewDataRows),
    },
    {
      type: 'features',
      isVisible: true,
      headerMain: asObject(row.featuresHeaderMain),
      headerSub: asObject(row.featuresHeaderSub),
      titleLight: asObject(row.featuresTitleLight),
      titleBold: asObject(row.featuresTitleBold),
      sections: asArray(row.featuresSections),
      brochureFile: asString(row.brochureFile),
    },
    {
      type: 'location',
      isVisible: true,
      titleLight: asObject(row.locationTitleLight),
      titleBold: asObject(row.locationTitleBold),
      brandName: asObject(row.locationBrandName),
      mainLead: asObject(row.locationMainLead),
      subText: asObject(row.locationSubText),
      mapImage: asString(row.locationMapImage),
      footerAddress: asObject(row.locationFooterAddress),
      googleMapsUrl: asString(row.locationGoogleMapsUrl),
    },
    {
      // layouts bloku öz datasını categorySlug üzərindən çəkir — sahəsi yoxdur.
      type: 'layouts',
      isVisible: true,
    },
  ];
}

/**
 * Oxu tərəfində dual-read: sections hələ backfill olunmayıbsa, köhnə
 * sütunlardan uçuş vaxtı qurur. Backfill migration-ı işlədikdən sonra
 * bu fallback heç vaxt tetiklənmir, amma deploy sırası üçün lazımdır.
 */
export function withSections<T extends Record<string, any>>(row: T): T {
  if (!row) return row;
  const sections = row.sections;
  if (Array.isArray(sections) && sections.length > 0) return row;
  return { ...row, sections: buildSectionsFromLegacy(row) };
}
