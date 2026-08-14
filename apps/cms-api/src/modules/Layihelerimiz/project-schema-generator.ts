/**
 * Layihə detalı üçün JSON-LD (schema.org) generatoru.
 *
 * master branch-dakı portfolio-schema-generator.ts pattern-i ilə eynidir,
 * amma datanı flat sütunlardan yox, `sections` bloklarından oxuyur.
 */

import { buildSectionsFromLegacy, type ProjectSection } from './project-sections';

const LANGS = ['az', 'en', 'ru'] as const;

const stripHtml = (html: string) => (html || '').replace(/<[^>]*>/g, '').trim();

const lv = (field: any, locale: string): string => {
  if (field && typeof field === 'object' && !Array.isArray(field)) {
    return field[locale] || field.az || '';
  }
  return typeof field === 'string' ? field : '';
};

const findSection = (sections: ProjectSection[], type: string) =>
  sections.find((s) => s?.type === type && s?.isVisible !== false) as any;

export function generateProjectDetailSchema(detail: any, baseUrl: string) {
  const sections: ProjectSection[] =
    Array.isArray(detail?.sections) && detail.sections.length > 0
      ? detail.sections
      : buildSectionsFromLegacy(detail ?? {});

  const hero = findSection(sections, 'hero');
  const overview = findSection(sections, 'overview');
  const location = findSection(sections, 'location');

  const buildForLang = (locale: string) => {
    const name =
      stripHtml(lv(detail?.seoTitle, locale)) ||
      stripHtml(lv(hero?.title, locale)) ||
      stripHtml(lv(overview?.brandName, locale));

    const description =
      stripHtml(lv(detail?.seoDescription, locale)) ||
      stripHtml(lv(overview?.description, locale)) ||
      stripHtml(lv(hero?.desktopDesc, locale));

    const heroImage = Array.isArray(hero?.images) ? hero.images[0]?.url : undefined;
    const image = detail?.ogImage || heroImage;

    // overview.dataRows → additionalProperty (Layihə tipi, Tamamlanma ili və s.)
    const additionalProperty = Array.isArray(overview?.dataRows)
      ? overview.dataRows
          .map((row: any) => ({
            '@type': 'PropertyValue',
            name: stripHtml(lv(row?.key, locale)),
            value: stripHtml(lv(row?.value, locale)),
          }))
          .filter((prop: any) => prop.name && prop.value)
      : undefined;

    const address = stripHtml(lv(location?.footerAddress, locale));

    return {
      '@context': 'https://schema.org',
      '@type': 'ApartmentComplex',
      name,
      description,
      url: `${baseUrl}/${locale}/projects/${detail?.categorySlug ?? ''}`,
      inLanguage: locale,
      image: image ? `${baseUrl}${image}` : undefined,
      address: address
        ? { '@type': 'PostalAddress', streetAddress: address }
        : undefined,
      additionalProperty:
        additionalProperty && additionalProperty.length ? additionalProperty : undefined,
      provider: {
        '@type': 'Organization',
        name: 'Treva',
        url: baseUrl,
      },
    };
  };

  const result: Record<string, any> = {};
  for (const lang of LANGS) result[lang] = buildForLang(lang);
  return result;
}
