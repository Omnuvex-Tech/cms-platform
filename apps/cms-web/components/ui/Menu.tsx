"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import ui from "@/styles/ui.module.css";

/**
 * Button + anchored popover. `children` is a render prop so the panel can close
 * itself once the operator picks something — the alternative, lifting `open` into
 * every caller, made three pages own state they had no other use for.
 */
export function Menu({
    label,
    icon,
    align = "right",
    panelClassName,
    buttonClassName,
    children,
}: {
    label: ReactNode;
    icon?: ReactNode;
    /** Which edge the panel lines up with — flip it when the button sits near a viewport edge. */
    align?: "left" | "right";
    panelClassName?: string;
    buttonClassName?: string;
    children: (close: () => void) => ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent) => {
            if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div className={ui.menuWrap} ref={wrapRef}>
            <button
                type="button"
                className={buttonClassName ?? `${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                {icon}
                {label}
                <ChevronDown
                    size={13}
                    className={open ? ui.menuChevronOpen : ui.menuChevron}
                />
            </button>
            {open && (
                <div
                    role="menu"
                    className={`${ui.menu} ${align === "left" ? ui.menuAlignLeft : ui.menuAlignRight} ${panelClassName ?? ""}`}
                >
                    {children(() => setOpen(false))}
                </div>
            )}
        </div>
    );
}

/** A single clickable row inside a `Menu` panel. */
export function MenuItem({
    icon,
    children,
    hint,
    onClick,
}: {
    icon?: ReactNode;
    children: ReactNode;
    hint?: string;
    onClick: () => void;
}) {
    return (
        <button type="button" role="menuitem" className={ui.menuItem} onClick={onClick}>
            {icon}
            <span className={ui.menuItemLabel}>{children}</span>
            {hint && <span className={ui.menuItemHint}>{hint}</span>}
        </button>
    );
}
