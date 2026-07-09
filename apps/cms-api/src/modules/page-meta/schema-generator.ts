export function generatePageSchema(pageKey: string, meta: any, baseUrl: string) {
  const langs = ["az", "en", "ru"] as const;

  const buildForLang = (locale: string) => {
    const title = meta?.seoTitle?.[locale] || meta?.seoTitle?.az || "";
    const description = meta?.seoDescription?.[locale] || meta?.seoDescription?.az || "";

    const base = {
      "@context": "https://schema.org",
      "url": `${baseUrl}/${locale}${pageKey === "home" ? "" : "/" + pageKey}`,
      "inLanguage": locale,
      "publisher": {
        "@type": "Organization",
        "name": title,
        "url": baseUrl,
      },
    };

    switch (pageKey) {
      case "home":
        return {
          ...base,
          "@type": "WebSite",
          "name": title,
          "description": description,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${baseUrl}/${locale}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        };
      case "about":
        return { ...base, "@type": "AboutPage", "name": title, "description": description };
      case "contact":
        return { ...base, "@type": "ContactPage", "name": title, "description": description };
      case "blog":
        return {
          ...base,
          "@type": "CollectionPage",
          "name": title,
          "description": description,
          "mainEntity": { "@type": "Blog", "name": title, "description": description, "url": `${baseUrl}/${locale}/blog` },
        };
      case "services":
        return { ...base, "@type": "CollectionPage", "name": title, "description": description, "mainEntity": { "@type": "ItemList", "name": title } };
      case "portfolio":
        return { ...base, "@type": "CollectionPage", "name": title, "description": description };
      case "vacancy":
        return { ...base, "@type": "CollectionPage", "name": title, "description": description, "mainEntity": { "@type": "ItemList", "name": title } };
      case "team":
        return { ...base, "@type": "CollectionPage", "name": title, "description": description };
      case "partners":
        return { ...base, "@type": "CollectionPage", "name": title, "description": description };
      default:
        return { ...base, "@type": "WebPage", "name": title, "description": description };
    }
  };

  const result: Record<string, any> = {};
  for (const lang of langs) {
    result[lang] = buildForLang(lang);
  }
  return result;
}