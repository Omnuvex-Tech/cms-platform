"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "@/styles/blog.module.css";

/* Həftə bazar ertəsindən başlayır — Azərbaycanda qəbul olunmuş sıra.
   Native `type="date"` bunu brauzerin dilinə görə qurur və dəyişdirilə bilmir. */
const WEEKDAYS = ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"];

const MONTHS = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
    "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
];

function parseISO(value: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(d.getTime()) ? null : d;
}

function toISO(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Göstərilən format — dd.mm.yyyy */
function format(d: Date): string {
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Ayın 6 həftəlik şəbəkəsi; həftə bazar ertəsindən başlayır. */
function monthGrid(year: number, month: number): Date[] {
    const first = new Date(year, month, 1);
    // getDay(): 0=bazar. Bazar ertəsi başlanğıc üçün sürüşdürürük.
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - offset);
    return Array.from({ length: 42 }, (_, i) =>
        new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
    );
}

/**
 * Dizayn olunmuş tarix seçicisi.
 *
 * Native `<input type="date">`-in təqvim pəncərəsini brauzer çəkir — CSS ona
 * çatmır, ona görə panelin qalanı ilə heç vaxt uyğunlaşmırdı. Bu komponent
 * təqvimi özü render edir.
 *
 * Dəyər formatı native input ilə eynidir: `yyyy-mm-dd`.
 */
export function DatePicker({
    value,
    onChange,
    placeholder = "Tarix seçin",
    disabled,
    ariaLabel,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    ariaLabel?: string;
}) {
    const selected = useMemo(() => parseISO(value), [value]);
    const today = useMemo(() => new Date(), []);
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<Date>(() => selected ?? today);
    const rootRef = useRef<HTMLDivElement>(null);

    // Açılanda seçili aya qayıdır.
    useEffect(() => {
        if (open) setView(selected ?? today);
    }, [open, selected, today]);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const days = useMemo(() => monthGrid(view.getFullYear(), view.getMonth()), [view]);
    const shiftMonth = (delta: number) =>
        setView(v => new Date(v.getFullYear(), v.getMonth() + delta, 1));

    const pick = (d: Date) => {
        onChange(toISO(d));
        setOpen(false);
    };

    return (
        <div className={styles.dateRoot} ref={rootRef}>
            <button
                type="button"
                className={`${styles.dateTrigger} ${open ? styles.dateTriggerOpen : ""}`}
                onClick={() => !disabled && setOpen(o => !o)}
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-label={ariaLabel}
            >
                <span className={selected ? styles.dateValue : styles.datePlaceholder}>
                    {selected ? format(selected) : placeholder}
                </span>
                <Calendar size={15} className={styles.dateIcon} />
            </button>

            {open && (
                <div className={styles.dateMenu} role="dialog" aria-label="Təqvim">
                    <div className={styles.dateHead}>
                        <button
                            type="button"
                            className={styles.dateNav}
                            onClick={() => shiftMonth(-1)}
                            aria-label="Əvvəlki ay"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className={styles.dateTitle}>
                            {MONTHS[view.getMonth()]} {view.getFullYear()}
                        </span>
                        <button
                            type="button"
                            className={styles.dateNav}
                            onClick={() => shiftMonth(1)}
                            aria-label="Növbəti ay"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className={styles.dateWeekRow}>
                        {WEEKDAYS.map(w => (
                            <span key={w} className={styles.dateWeekday}>{w}</span>
                        ))}
                    </div>

                    <div className={styles.dateGrid}>
                        {days.map((d, i) => {
                            const outside = d.getMonth() !== view.getMonth();
                            const isSelected = selected ? sameDay(d, selected) : false;
                            const isToday = sameDay(d, today);
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => pick(d)}
                                    className={[
                                        styles.dateCell,
                                        outside ? styles.dateCellOutside : "",
                                        isToday && !isSelected ? styles.dateCellToday : "",
                                        isSelected ? styles.dateCellSelected : "",
                                    ].filter(Boolean).join(" ")}
                                    aria-current={isToday ? "date" : undefined}
                                >
                                    {d.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.dateFoot}>
                        <button
                            type="button"
                            className={styles.dateFootBtn}
                            onClick={() => { onChange(""); setOpen(false); }}
                        >
                            Təmizlə
                        </button>
                        <button
                            type="button"
                            className={styles.dateFootBtn}
                            onClick={() => pick(today)}
                        >
                            Bu gün
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
