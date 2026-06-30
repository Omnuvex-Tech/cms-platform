export function generatePortfolioSchema(portfolio: any, baseUrl: string) {
  const langs = ["az", "en", "ru"] as const;

  const stripHtml = (html: string) => (html || "").replace(/<[^>]*>/g, "").trim();

  const buildForLang = (locale: string) => {
    const title = stripHtml(portfolio.title?.[locale] || portfolio.title?.az || "");
    const description = portfolio.seoDescription?.[locale] || "";

    return {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": title,
      "description": description,
      "url": `${baseUrl}/${locale}/portfolio/${portfolio.slug}`,
      "inLanguage": locale,
      "image": portfolio.coverImage ? `${baseUrl}${portfolio.coverImage}` : undefined,
      "keywords": (portfolio.tags ?? []).join(", "),
      "publisher": {
        "@type": "Organization",
        "name": title,
        "url": baseUrl,
      },
    };
  };

  const result: Record<string, any> = {};
  for (const lang of langs) result[lang] = buildForLang(lang);
  return result;
}