"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import ui from "@/styles/ui.module.css";

export function SideSheet({
    open,
    onClose,
    title,
    subtitle,
    headerExtra,
    wide = false,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    headerExtra?: React.ReactNode;
    wide?: boolean;
    children: React.ReactNode;
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <>
            <div className={ui.sheetOverlay} onClick={onClose} />
            <aside className={`${ui.sheet} ${wide ? ui.sheetWide : ""}`}>
                <div className={ui.sheetHeader}>
                    <div>
                        <div className={ui.sheetTitle}>{title}</div>
                        {subtitle && <div className={ui.sheetSub}>{subtitle}</div>}
                        {headerExtra}
                    </div>
                    <button className={ui.sheetClose} onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>
                <div className={ui.sheetBody}>{children}</div>
            </aside>
        </>
    );
}
