/**
 * Səhifə səviyyəsində JSON-LD (schema.org) generatoru.
 *
 * master branch-dakı eyniadlı fayldan portlanıb; fərq yalnız səhifə
 * açarlarındadır — burada treva-web-in route-larıdır, trenders-inki yox.
 */

const LANGS = ['az', 'en', 'ru'] as const;

/** Dynamic detal açarları: `author:<id>`, `project:<id>`, `pulse:<id>`. */
const DYNAMIC_PREFIXES = ['author', 'project', 'pulse'] as const;

export function generatePageSchema(
  pageKey: string,
  meta: any,
  baseUrl: string,
  entity?: { slug?: string; name?: string },
) {
  const sep = pageKey.indexOf(':');
  const prefix = sep === -1 ? '' : pageKey.slice(0, sep);
  const dynamicId = sep === -1 ? '' : pageKey.slice(sep + 1);
  const isDynamic =
    !!dynamicId && (DYNAMIC_PREFIXES as readonly string[]).includes(prefix);

  const dynamicPath = (slug: string) => {
    if (prefix === 'author') return '/author/' + slug;
    if (prefix === 'project') return '/projects/' + slug;
    return '/pulse/' + slug; // pulse
  };

  const buildForLang = (locale: string) => {
    const title =
      meta?.seoTitle?.[locale] ||
      meta?.seoTitle?.az ||
      (isDynamic ? entity?.name : '') ||
      '';
    const description =
      meta?.seoDescription?.[locale] || meta?.seoDescription?.az || '';

    const path = isDynamic
      ? dynamicPath(entity?.slug || dynamicId)
      : pageKey === 'home'
        ? ''
        : '/' + pageKey;

    const base = {
      '@context': 'https://schema.org',
      url: `${baseUrl}/${locale}${path}`,
      inLanguage: locale,
      publisher: {
        '@type': 'Organization',
        name: 'Treva',
        url: baseUrl,
      },
    };

    if (isDynamic) {
      switch (prefix) {
        case 'author':
          return {
            ...base,
            '@type': 'ProfilePage',
            name: title,
            description,
            mainEntity: { '@type': 'Person', name: title, description },
          };
        case 'project':
          return {
            ...base,
            '@type': 'WebPage',
            name: title,
            description,
            about: { '@type': 'Place', name: title },
          };
        default: // pulse
          return {
            ...base,
            '@type': 'Article',
            headline: title,
            description,
            author: { '@type': 'Organization', name: 'Treva' },
          };
      }
    }

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
      case 'off-plan':
      case 'resale':
        return {
          ...base,
          '@type': 'CollectionPage',
          name: title,
          description,
          mainEntity: { '@type': 'ItemList', name: title },
        };

      case 'author':
        return {
          ...base,
          '@type': 'ProfilePage',
          name: title,
          description,
          mainEntity: { '@type': 'Person', name: title },
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
