export function generateVacancySchema(vacancy: any, baseUrl: string) {
  const langs = ["az", "en", "ru"] as const;

  const stripHtml = (html: string) => (html || "").replace(/<[^>]*>/g, "").trim();

  const lv = (field: any, locale: string) =>
    typeof field === "object" && field !== null ? (field[locale] || field.az || "") : (field || "");

  const joinLocalizedList = (arr: any[], locale: string) =>
    (arr ?? []).map((item: any) => stripHtml(lv(item, locale))).filter(Boolean).join(", ");

  const buildForLang = (locale: string) => {
    const title = stripHtml(lv(vacancy.title, locale));
    const description = stripHtml(
      lv(vacancy.seoDescription, locale) || lv(vacancy.aboutRole, locale)
    );
    const skills = joinLocalizedList(vacancy.skills, locale);

    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": title,
      "description": description,
      "url": `${baseUrl}/${locale}/vacancy/${vacancy.slug}`,
      "inLanguage": locale,
      "datePosted": vacancy.createdAt ? new Date(vacancy.createdAt).toISOString() : undefined,
      "validThrough": vacancy.closingDate ? new Date(vacancy.closingDate).toISOString() : undefined,
      "employmentType": "FULL_TIME",
      "skills": skills || undefined,
      "hiringOrganization": {
        "@type": "Organization",
        "name": "Trenders",
        "url": baseUrl,
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "AZ",
        },
      },
    };
  };

  const result: Record<string, any> = {};
  for (const lang of langs) result[lang] = buildForLang(lang);
  return result;
}