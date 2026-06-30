export function generateBlogAuthorSchema(author: any, baseUrl: string) {
    const langs = ["az", "en", "ru"] as const;

    const stripHtml = (html: string) => (html || "").replace(/<[^>]*>/g, "").trim();

    const lv = (field: any, locale: string) =>
        typeof field === "object" && field !== null ? (field[locale] || field.az || "") : (field || "");

    const buildForLang = (locale: string) => {
        const name = stripHtml(lv(author.name, locale));
        const description = stripHtml(lv(author.seoDescription, locale) || lv(author.bio, locale));
        const jobTitle = stripHtml(lv(author.role, locale));

        return {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": name,
            "description": description,
            "jobTitle": jobTitle || undefined,
            "url": `${baseUrl}/${locale}/blog/author/${author.slug}`,
            "inLanguage": locale,
            "image": author.avatar ? `${baseUrl}${author.avatar}` : undefined,
            "sameAs": author.linkedinHref ? [author.linkedinHref] : undefined,
            "worksFor": {
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