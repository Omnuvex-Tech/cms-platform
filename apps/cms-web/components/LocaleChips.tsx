"use client";

export const LOCALES = ["az", "en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

function raw(value: unknown, locale: Locale): string {
    if (!value) return "";
    // Köhnə qeydlər düz string ola bilər — onlar yalnız AZ sayılır.
    if (typeof value === "string") return locale === "az" ? value.trim() : "";
    if (typeof value === "object") {
        const v = (value as Record<string, unknown>)[locale];
        return typeof v === "string" ? v.trim() : "";
    }
    return "";
}

export type LocaleState = "source" | "translated" | "copy" | "missing";

/**
 * Bir dilin vəziyyətini qaytarır.
 *
 * Niyə sadəcə "var / yox" deyil: səhifələrin `save()` funksiyaları boş EN/RU
 * sahələrini AZ mətni ilə doldurur (`en: nameEn.trim() || normalizedAz`).
 * Yəni bazada tərcümə praktiki olaraq heç vaxt boş olmur və "var/yox"
 * göstəricisi həmişə "var" deyərdi. Faydalı siqnal budur: mətn AZ-dan
 * fərqlidirmi, yəni həqiqətən tərcümə olunubmu?
 */
export function localeState(value: unknown, locale: Locale): LocaleState {
    const text = raw(value, locale);
    if (locale === "az") return text ? "source" : "missing";
    if (!text) return "missing";
    return text === raw(value, "az") ? "copy" : "translated";
}

const LABEL: Record<LocaleState, string> = {
    source: "mənbə mətn",
    translated: "tərcümə olunub",
    copy: "AZ ilə eynidir — tərcümə olunmayıb",
    missing: "boşdur",
};

/**
 * Tərcümə əhatəsi göstəricisi — AZ / EN / RU.
 * Dolu = mənbə və ya həqiqi tərcümə; sönük kəsik = AZ-ın kopyası və ya boş.
 */
export function LocaleChips({
    value,
    className,
    chipClassName,
    onClassName,
    offClassName,
}: {
    value: unknown;
    className?: string;
    chipClassName?: string;
    onClassName?: string;
    offClassName?: string;
}) {
    return (
        <span className={className}>
            {LOCALES.map((l) => {
                const state = localeState(value, l);
                const filled = state === "source" || state === "translated";
                return (
                    <span
                        key={l}
                        className={`${chipClassName ?? ""} ${filled ? onClassName ?? "" : offClassName ?? ""}`}
                        title={`${l.toUpperCase()}: ${LABEL[state]}`}
                    >
                        {l.toUpperCase()}
                    </span>
                );
            })}
        </span>
    );
}
