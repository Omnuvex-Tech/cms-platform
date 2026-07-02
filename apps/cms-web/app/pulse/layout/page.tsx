"use client";

import { useEffect, useState } from "react";
import { apiFetch, toAbsUrl } from "@/lib/pulse-api";
import styles from "@/styles/blog.module.css";

type Article = { id: string; title: string | { az?: string; en?: string; ru?: string }; slug: string; coverImage?: string; headerPositions?: string[]; headerOrder?: number };
type Section = { position: string; label: string; color: string; bg: string; border: string };

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
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div className={styles.tabHeader} style={{ flexShrink: 0 }}>
                <h2 className={styles.tabTitle}>Pulse Layout İdarəetməsi</h2>
                {saving && <span style={{ color: "#ea580c", fontSize: 13 }}>Saxlanır...</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, flex: 1, minHeight: 0, overflow: "hidden" }}>
                {SECTIONS.map(sec => (
                    <div key={sec.position} className={styles.settingsCard} style={{ borderColor: sec.border, display: "flex", flexDirection: "column", overflow: "hidden", margin: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexShrink: 0 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: sec.color, flexShrink: 0 }} />
                            <h3 className={styles.settingsGroupTitle} style={{ margin: 0, flex: 1 }}>{sec.label}</h3>
                            <span style={{
                                fontSize: 12, fontWeight: 600, color: sec.color,
                                background: sec.bg, padding: "2px 10px", borderRadius: 12,
                            }}>
                                {getArticlesForPosition(sec.position).length}
                            </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", flex: 1, minHeight: 0 }}>
                            {getArticlesForPosition(sec.position).map((a, idx) => (
                                <div key={a.id} style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "8px 12px", background: "#f8fafc", borderRadius: 8,
                                    border: "1px solid #e2e8f0", flexShrink: 0,
                                }}>
                                    {a.coverImage && (
                                        <img src={toAbsUrl(a.coverImage)} alt="" style={{ width: 36, height: 28, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                                    )}
                                    <span style={{ fontSize: 12, color: "#94a3b8", minWidth: 20 }}>#{a.headerOrder || idx + 1}</span>
                                    <span style={{ flex: 1, fontSize: 13, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getLocalizedName(a.title)}</span>
                                    <button onClick={() => moveArticle(a.id, "up")} disabled={idx === 0}
                                        style={{ background: "none", border: "none", color: idx === 0 ? "#cbd5e1" : "#2563eb", cursor: idx === 0 ? "default" : "pointer", fontSize: 14, flexShrink: 0 }}>▲</button>
                                    <button onClick={() => moveArticle(a.id, "down")} disabled={idx === getArticlesForPosition(sec.position).length - 1}
                                        style={{ background: "none", border: "none", color: idx === getArticlesForPosition(sec.position).length - 1 ? "#cbd5e1" : "#2563eb", cursor: idx === getArticlesForPosition(sec.position).length - 1 ? "default" : "pointer", fontSize: 14, flexShrink: 0 }}>▼</button>
                                    <button onClick={() => removeArticle(a.id, sec.position)}
                                        style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 14, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>✕</button>
                                </div>
                            ))}
                            {getArticlesForPosition(sec.position).length === 0 && (
                                <div style={{ padding: 16, textAlign: "center", color: "#94a3b8", fontSize: 13, border: "1px dashed #e2e8f0", borderRadius: 8, flexShrink: 0 }}>
                                    Bu bölmədə məqalə yoxdur
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.settingsCard} style={{ marginTop: 16, flexShrink: 0, maxHeight: "220px", overflowY: "auto", margin: "16px 0 0" }}>
                <h3 className={styles.settingsGroupTitle}>Təyin edilməmiş məqalələr</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {getUnassigned().map(a => (
                        <div key={a.id} style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "8px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0",
                        }}>
                            {a.coverImage && (
                                <img src={toAbsUrl(a.coverImage)} alt="" style={{ width: 36, height: 28, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                            )}
                            <span style={{ flex: 1, fontSize: 13, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getLocalizedName(a.title)}</span>
                            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                                {SECTIONS.map(sec => (
                                    <button key={sec.position} onClick={() => assignArticle(a.id, sec.position)}
                                        style={{
                                            padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                                            background: sec.bg, color: sec.color, border: `1px solid ${sec.border}`,
                                            cursor: "pointer",
                                        }}>
                                        {sec.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {getUnassigned().length === 0 && (
                        <div style={{ padding: 16, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                            Bütün məqalələr təyin edilib
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
