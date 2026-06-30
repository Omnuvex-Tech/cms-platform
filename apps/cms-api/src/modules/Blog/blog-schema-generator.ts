export function generateBlogSchema(blog: any, baseUrl: string) {
  const langs = ["az", "en", "ru"] as const;

  const stripHtml = (html: string) => (html || "").replace(/<[^>]*>/g, "").trim();

  const lv = (field: any, locale: string) =>
    typeof field === "object" && field !== null ? (field[locale] || field.az || "") : (field || "");

  const buildForLang = (locale: string) => {
    const title = stripHtml(lv(blog.title, locale));
    const description = stripHtml(lv(blog.seoDescription, locale) || lv(blog.excerpt, locale));
    const image = lv(blog.coverImage, locale);
    const authorName = blog.author
      ? stripHtml(lv(blog.author.name, locale))
      : undefined;

    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": description,
      "url": `${baseUrl}/${locale}/blog/${blog.slug}`,
      "inLanguage": locale,
      "image": image ? `${baseUrl}${image}` : undefined,
      "datePublished": blog.publishedAt ? new Date(blog.publishedAt).toISOString() : undefined,
      "dateModified": blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
      "author": authorName
        ? { "@type": "Person", "name": authorName }
        : undefined,
      "publisher": {
        "@type": "Organization",
        "name": "Trenders",
        "url": baseUrl,
      },
    };
  };

  const result: Record<string, any> = {};
  for (const lang of langs) result[lang] = buildForLang(lang);
  return result;
}