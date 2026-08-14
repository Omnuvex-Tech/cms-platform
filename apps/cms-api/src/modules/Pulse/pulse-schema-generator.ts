/**
 * Pulse məqaləsi üçün JSON-LD (schema.org) generatoru.
 *
 * master branch-dakı blog-schema-generator.ts-in Pulse-a uyğunlaşdırılmışıdır.
 * Məqalə mətni artıq bloklardadır, ona görə təsvir excerpt yoxdursa ilk
 * paraqraf blokundan götürülür.
 */

const LANGS = ['az', 'en', 'ru'] as const;

const stripHtml = (html: string) => (html || '').replace(/<[^>]*>/g, '').trim();

const lv = (field: any, locale: string): string => {
  if (field && typeof field === 'object' && !Array.isArray(field)) {
    return field[locale] || field.az || '';
  }
  return typeof field === 'string' ? field : '';
};

/** Excerpt boşdursa ilk görünən paraqraf blokundan qısa təsvir çıxarır. */
function firstParagraph(blocks: any, locale: string): string {
  if (!Array.isArray(blocks)) return '';
  const block = blocks.find(
    (b) => b?.type === 'paragraph' && b?.isVisible !== false,
  );
  if (!block) return '';
  return stripHtml(lv(block.text, locale)).slice(0, 300);
}

export function generatePulseArticleSchema(article: any, baseUrl: string) {
  const buildForLang = (locale: string) => {
    const title = stripHtml(lv(article.metaTitle, locale) || lv(article.title, locale));
    const description =
      stripHtml(lv(article.metaDescription, locale) || lv(article.excerpt, locale)) ||
      firstParagraph(article.blocks, locale);

    const authorName = article.author
      ? stripHtml(lv(article.author.name, locale))
      : undefined;

    const keywords = Array.isArray(article.keywords)
      ? article.keywords.map((k: any) => stripHtml(lv(k?.name, locale))).filter(Boolean)
      : undefined;

    return {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: title,
      description,
      url: `${baseUrl}/${locale}/pulse/${article.slug}`,
      inLanguage: locale,
      image: article.coverImage ? `${baseUrl}${article.coverImage}` : undefined,
      datePublished: article.date ? new Date(article.date).toISOString() : undefined,
      dateModified: article.updatedAt
        ? new Date(article.updatedAt).toISOString()
        : undefined,
      articleSection: stripHtml(lv(article.category, locale)) || undefined,
      keywords: keywords && keywords.length ? keywords : undefined,
      author: authorName
        ? {
            '@type': 'Person',
            name: authorName,
            url: article.author?.slug
              ? `${baseUrl}/${locale}/authors/${article.author.slug}`
              : undefined,
          }
        : undefined,
      publisher: {
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
