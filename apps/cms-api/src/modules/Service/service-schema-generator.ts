export function generateServiceSchema(service: any, baseUrl: string) {
  const langs = ["az", "en", "ru"] as const;

  const stripHtml = (html: string) => (html || "").replace(/<[^>]*>/g, "").trim();

  const lv = (field: any, locale: string) =>
    typeof field === "object" && field !== null ? (field[locale] || field.az || "") : (field || "");

  const buildForLang = (locale: string) => {
    const title = stripHtml(lv(service.title, locale));
    const description = stripHtml(lv(service.seoDescription, locale) || lv(service.description, locale));

    return {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": title,
      "description": description,
      "url": `${baseUrl}/${locale}/service/${service.slug}`,
      "inLanguage": locale,
      "image": service.image ? `${baseUrl}${service.image}` : undefined,
      "provider": {
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