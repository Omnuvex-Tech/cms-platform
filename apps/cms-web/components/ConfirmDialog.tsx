"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import styles from "@/styles/blog.module.css";

/**
 * Geri qaytarılmayan əməliyyatlar üçün təsdiq modalı.
 *
 * Brauzerin `confirm()` pəncərəsini əvəz edir — o, əməliyyat sisteminin öz
 * pəncərəsidir, dizayn oluna bilmir və səhifənin qalanı ilə heç bir əlaqəsi
 * yoxdur.
 *
 * Escape bağlayır, örtüyə klik də bağlayır; təsdiq düyməsi fokus alır.
 */
export function ConfirmDialog({
    open,
    title = "Silməyi təsdiq edin",
    message,
    subject,
    confirmLabel = "Sil",
    cancelLabel = "Ləğv et",
    busy,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title?: string;
    message: string;
    subject?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    busy?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div
                className={`${styles.modal} ${styles.confirmModal}`}
                onClick={e => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-label={title}
            >
                <div className={styles.confirmBody}>
                    <span className={styles.confirmIcon} aria-hidden="true">
                        <AlertTriangle size={18} />
                    </span>
                    <div className={styles.confirmText}>
                        <p className={styles.confirmTitle}>{title}</p>
                        <p className={styles.confirmNote}>
                            {message}
                            {subject && (
                                <>
                                    {" "}
                                    <span className={styles.confirmSubject}>{subject}</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onCancel} disabled={busy}>
                        {cancelLabel}
                    </button>
                    <button
                        className={styles.deleteConfirmBtn}
                        onClick={onConfirm}
                        disabled={busy}
                        autoFocus
                    >
                        {busy ? "Silinir..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
