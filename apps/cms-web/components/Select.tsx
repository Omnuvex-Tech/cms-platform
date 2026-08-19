"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import styles from "@/styles/blog.module.css";

export type SelectOption = { value: string; label: string };

/**
 * Dizayn olunmuş açılan siyahı.
 *
 * Native `<select>`-in açılan hissəsini əməliyyat sistemi çəkir — CSS ona
 * çatmır, ona görə panelin qalanı ilə heç vaxt uyğunlaşmırdı (Windows-un mavi
 * seçim zolağı). Bu komponent siyahını özü render edir.
 *
 * Klaviatura: ↑ ↓ Home End Enter Space Escape. Açılanda seçili sətir görünür.
 */
export function Select({
    value,
    onChange,
    options,
    placeholder = "Seçin...",
    disabled,
    ariaLabel,
}: {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    ariaLabel?: string;
}) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const listId = useId();

    const selectedIndex = options.findIndex(o => o.value === value);
    const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

    // Kənara klik və Escape bağlayır.
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [open]);

    // Açılanda seçili sətri görünən sahəyə gətirir.
    useEffect(() => {
        if (!open) return;
        setActive(selectedIndex >= 0 ? selectedIndex : 0);
        const raf = requestAnimationFrame(() => {
            listRef.current
                ?.querySelector<HTMLElement>('[data-selected="true"]')
                ?.scrollIntoView({ block: "nearest" });
        });
        return () => cancelAnimationFrame(raf);
    }, [open, selectedIndex]);

    const commit = (i: number) => {
        const opt = options[i];
        if (!opt) return;
        onChange(opt.value);
        setOpen(false);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        if (!open) {
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
                e.preventDefault();
                setOpen(true);
            }
            return;
        }

        switch (e.key) {
            case "Escape":
                e.preventDefault();
                setOpen(false);
                break;
            case "ArrowDown":
                e.preventDefault();
                setActive(i => Math.min(i + 1, options.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setActive(i => Math.max(i - 1, 0));
                break;
            case "Home":
                e.preventDefault();
                setActive(0);
                break;
            case "End":
                e.preventDefault();
                setActive(options.length - 1);
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                commit(active);
                break;
        }
    };

    return (
        <div className={styles.selectRoot} ref={rootRef}>
            <button
                type="button"
                className={`${styles.selectTrigger} ${open ? styles.selectTriggerOpen : ""}`}
                onClick={() => !disabled && setOpen(o => !o)}
                onKeyDown={onKeyDown}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                aria-label={ariaLabel}
            >
                <span className={selected ? styles.selectValue : styles.selectPlaceholder}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`${styles.selectChevron} ${open ? styles.selectChevronOpen : ""}`}
                />
            </button>

            {open && (
                <div className={styles.selectMenu} ref={listRef} role="listbox" id={listId}>
                    {options.length === 0 ? (
                        <div className={styles.selectEmpty}>Variant yoxdur</div>
                    ) : (
                        options.map((opt, i) => {
                            const isSelected = opt.value === value;
                            return (
                                <div
                                    key={opt.value || `__${i}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    data-selected={isSelected}
                                    className={`${styles.selectOption} ${i === active ? styles.selectOptionActive : ""}`}
                                    onMouseEnter={() => setActive(i)}
                                    onMouseDown={e => e.preventDefault()}
                                    onClick={() => commit(i)}
                                >
                                    <span>{opt.label}</span>
                                    {isSelected && <Check size={14} className={styles.selectCheck} />}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
