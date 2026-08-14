"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { apiFetch, toAbsUrl } from "@/lib/pulse-api";
import styles from "@/styles/blog.module.css";
import layout from "@/styles/pulseLayout.module.css";

type Article = { id: string; title: string | { az?: string; en?: string; ru?: string }; slug: string; coverImage?: string; headerPositions?: string[]; headerOrder?: number };
// color/bg/border JSX-də CSS dəyişəni kimi ötürülür (--sec-color və s.),
// beləcə rənglər dinamik qalır, qalan bütün stil CSS module-dadır.
type Section = { position: string; label: string; color: string; bg: string; border: string };

const sectionVars = (sec: Section) => ({
    "--sec-color": sec.color,
    "--sec-bg": sec.bg,
    "--sec-border": sec.border,
}) as React.CSSProperties;

function getLocalizedName(value: string | { az?: string; en?: string; ru?: string } | undefined): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value.az || Object.values(value)[0] || "";
}

const SECTIONS: Section[] = [
    { position: "left", label: "Sol", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    { position: "center", label: "Mərkəz", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
    { position: "right", label: "Sağ", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
    { position: "week", label: "Həftənin seçimi", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
];

export default function PulseLayoutPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try { setArticles(await apiFetch("/pulse/articles/all")); } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const getArticlesForPosition = (pos: string) =>
        articles.filter(a => a.headerPositions?.includes(pos)).sort((a, b) => (a.headerOrder || 0) - (b.headerOrder || 0));

    const getUnassigned = () => articles.filter(a => !a.headerPositions || a.headerPositions.length === 0);

    const assignArticle = async (articleId: string, position: string) => {
        setSaving(true);
        try {
            const article = articles.find(a => a.id === articleId);
            const currentPositions = article?.headerPositions || [];
            if (currentPositions.includes(position)) {
                setSaving(false);
                return;
            }
            const newPositions = [...currentPositions, position];
            const sectionArticles = getArticlesForPosition(position);
            const maxOrder = sectionArticles.length > 0 ? Math.max(...sectionArticles.map(a => a.headerOrder || 0)) : 0;
            await apiFetch(`/pulse/articles/${articleId}`, {
                method: "PUT",
                body: JSON.stringify({ headerPositions: newPositions, headerOrder: maxOrder + 1 }),
            });
            await load();
        } finally { setSaving(false); }
    };

    const removeArticle = async (articleId: string, position?: string) => {
        setSaving(true);
        try {
            const article = articles.find(a => a.id === articleId);
            if (!article) { setSaving(false); return; }
            const currentPositions = article.headerPositions || [];
            const newPositions = position
                ? currentPositions.filter(p => p !== position)
                : [];
            await apiFetch(`/pulse/articles/${articleId}`, {
                method: "PUT",
                body: JSON.stringify({
                    headerPositions: newPositions,
                    headerOrder: newPositions.length === 0 ? null : undefined,
                }),
            });
            await load();
        } finally { setSaving(false); }
    };

    const moveArticle = async (articleId: string, direction: "up" | "down") => {
        const article = articles.find(a => a.id === articleId);
        if (!article || !article.headerPositions || article.headerPositions.length === 0) return;

        const currentPosition = article.headerPositions[0];
        if (!currentPosition) return;
        const sectionArticles = getArticlesForPosition(currentPosition);
        const idx = sectionArticles.findIndex(a => a.id === articleId);
        if (idx === -1) return;

        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sectionArticles.length) return;

        setSaving(true);
        try {
            const a1 = sectionArticles[idx]!;
            const a2 = sectionArticles[swapIdx]!;
            await Promise.all([
                apiFetch(`/pulse/articles/${a1.id}`, { method: "PUT", body: JSON.stringify({ headerOrder: a2.headerOrder }) }),
                apiFetch(`/pulse/articles/${a2.id}`, { method: "PUT", body: JSON.stringify({ headerOrder: a1.headerOrder }) }),
            ]);
            await load();
        } finally { setSaving(false); }
    };

    if (loading) return <div className={styles.empty}>Yüklənir...</div>;

    return (
        <div className={layout.page}>
            <div className={`${styles.tabHeader} ${layout.header}`}>
                <h2 className={styles.tabTitle}>Pulse Layout İdarəetməsi</h2>
                {saving && <span className={layout.savingHint}>Saxlanır...</span>}
            </div>

            <div className={layout.grid}>
                {SECTIONS.map(sec => {
                    const items = getArticlesForPosition(sec.position);
                    return (
                        <div key={sec.position}
                            className={`${styles.settingsCard} ${layout.section}`}
                            style={sectionVars(sec)}>
                            <div className={layout.sectionHeader}>
                                <div className={layout.sectionDot} />
                                <h3 className={`${styles.settingsGroupTitle} ${layout.sectionTitle}`}>{sec.label}</h3>
                                <span className={layout.sectionCount}>{items.length}</span>
                            </div>
                            <div className={layout.list}>
                                {items.map((a, idx) => (
                                    <div key={a.id} className={layout.row}>
                                        {a.coverImage && (
                                            <img src={toAbsUrl(a.coverImage)} alt="" className={layout.thumb} />
                                        )}
                                        <span className={layout.rowOrder}>#{a.headerOrder || idx + 1}</span>
                                        <span className={layout.rowTitle}>{getLocalizedName(a.title)}</span>
                                        <button type="button" className={layout.moveBtn}
                                            onClick={() => moveArticle(a.id, "up")} disabled={idx === 0}>▲</button>
                                        <button type="button" className={layout.moveBtn}
                                            onClick={() => moveArticle(a.id, "down")} disabled={idx === items.length - 1}>▼</button>
                                        <button type="button" className={layout.removeBtn}
                                            onClick={() => removeArticle(a.id, sec.position)}>✕</button>
                                    </div>
                                ))}
                                {items.length === 0 && (
                                    <div className={layout.emptySlot}>Bu bölmədə məqalə yoxdur</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={`${styles.settingsCard} ${layout.unassigned}`}>
                <h3 className={styles.settingsGroupTitle}>Təyin edilməmiş məqalələr</h3>
                <div className={layout.list}>
                    {getUnassigned().map(a => (
                        <div key={a.id} className={layout.unassignedRow}>
                            {a.coverImage && (
                                <img src={toAbsUrl(a.coverImage)} alt="" className={layout.thumb} />
                            )}
                            <span className={layout.rowTitle}>{getLocalizedName(a.title)}</span>
                            <div className={layout.assignRow}>
                                {SECTIONS.map(sec => (
                                    <button key={sec.position} type="button"
                                        className={layout.assignBtn}
                                        style={sectionVars(sec)}
                                        onClick={() => assignArticle(a.id, sec.position)}>
                                        {sec.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {getUnassigned().length === 0 && (
                        <div className={layout.emptyNote}>Bütün məqalələr təyin edilib</div>
                    )}
                </div>
            </div>
        </div>
    );
}
