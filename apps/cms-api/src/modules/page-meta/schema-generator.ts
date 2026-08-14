/**
 * Səhifə səviyyəsində JSON-LD (schema.org) generatoru.
 *
 * master branch-dakı eyniadlı fayldan portlanıb; fərq yalnız səhifə
 * açarlarındadır — burada treva-web-in route-larıdır, trenders-inki yox.
 */

const LANGS = ['az', 'en', 'ru'] as const;

export function generatePageSchema(
  pageKey: string,
  meta: any,
  baseUrl: string,
) {
  const buildForLang = (locale: string) => {
    const title = meta?.seoTitle?.[locale] || meta?.seoTitle?.az || '';
    const description =
      meta?.seoDescription?.[locale] || meta?.seoDescription?.az || '';

    const base = {
      '@context': 'https://schema.org',
      url: `${baseUrl}/${locale}${pageKey === 'home' ? '' : '/' + pageKey}`,
      inLanguage: locale,
      publisher: {
        '@type': 'Organization',
        name: 'Treva',
        url: baseUrl,
      },
    };

    switch (pageKey) {
      case 'home':
        return {
          ...base,
          '@type': 'WebSite',
          name: title,
          description,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/${locale}/projects?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        };

      case 'about-us':
        return { ...base, '@type': 'AboutPage', name: title, description };

      case 'contact':
        return { ...base, '@type': 'ContactPage', name: title, description };

      case 'privacy-policy':
        return { ...base, '@type': 'WebPage', name: title, description };

      case 'projects':
        return {
          ...base,
          '@type': 'CollectionPage',
          name: title,
          description,
          mainEntity: { '@type': 'ItemList', name: title },
        };

      case 'pulse':
        return {
          ...base,
          '@type': 'CollectionPage',
          name: title,
          description,
          mainEntity: {
            '@type': 'Blog',
            name: title,
            description,
            url: `${baseUrl}/${locale}/pulse`,
          },
        };

      case 'brokers':
      case 'developers':
        return {
          ...base,
          '@type': 'CollectionPage',
          name: title,
          description,
          mainEntity: { '@type': 'ItemList', name: title },
        };

      default:
        return { ...base, '@type': 'WebPage', name: title, description };
    }
  };

  const result: Record<string, any> = {};
  for (const lang of LANGS) result[lang] = buildForLang(lang);
  return result;
}
