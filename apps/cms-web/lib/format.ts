export function relativeTime(input: string | Date | null | undefined): string {
    if (!input) return "—";
    const date = typeof input === "string" ? new Date(input) : input;
    const diff = date.getTime() - Date.now();
    const abs = Math.abs(diff);
    const min = 60_000;
    const hour = 60 * min;
    const day = 24 * hour;

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    if (abs < hour) return rtf.format(Math.round(diff / min), "minute");
    if (abs < day) return rtf.format(Math.round(diff / hour), "hour");
    if (abs < 30 * day) return rtf.format(Math.round(diff / day), "day");
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function formatDateTime(input: string | Date | null | undefined): string {
    if (!input) return "—";
    const date = typeof input === "string" ? new Date(input) : input;
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function money(value: number | null | undefined): string {
    if (value == null) return "—";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

export function range(
    min: number | null | undefined,
    max: number | null | undefined,
    fmt: (n: number | null | undefined) => string = (n) => String(n ?? "—")
): string {
    if (min == null && max == null) return "—";
    if (min != null && max != null)
        return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
    return fmt(min ?? max);
}

export function titleCase(value: string): string {
    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initials(name?: string | null, email?: string | null): string {
    const source = name?.trim() || email?.split("@")[0] || "?";
    const parts = source.split(/[ .]+/).filter(Boolean);
    return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}
