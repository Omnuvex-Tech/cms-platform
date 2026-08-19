"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, toAbsUrl } from "@/lib/pulse-api";
import { Thumb } from "@/components/Thumb";
import styles from "@/styles/blog.module.css";

type Article = {
    id: string; slug: string; title: string | { az?: string; en?: string; ru?: string }; category: string | { az?: string; en?: string; ru?: string };
    date: string; coverImage?: string; excerpt?: string;
    published: boolean; featured: boolean;
    headerPositions?: string[]; headerOrder?: number;
    author?: { name: string }; keywords?: { name: string | { az?: string; en?: string; ru?: string } }[];
};

function getLocalizedName(value: any): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
        const val = value.az || value.en || value.ru;
        if (typeof val === "string") return val;
        const firstVal = Object.values(value).find(v => typeof v === "string");
        if (firstVal) return firstVal as string;
    }
    return "";
}

function formatArticleDate(date?: string): string {
    if (!date) return "—";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";

    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const year = parsed.getFullYear();
    return `${day}.${month}.${year}`;
}

export default function PulseArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try { setArticles(await apiFetch("/pulse/articles/all")); } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async () => {
        if (!deleteId) return;
        await apiFetch(`/pulse/articles/${deleteId}`, { method: "DELETE" });
        setDeleteId(null); load();
    };

    const togglePublished = async (a: Article) => {
        await apiFetch(`/pulse/articles/${a.id}`, {
            method: "PUT",
            body: JSON.stringify({ published: !a.published }),
        });
        load();
    };

    const positionBadge = (positions?: string[]) => {
        if (!positions || positions.length === 0) return null;
        const tone: Record<string, string | undefined> = {
            left: styles.posLeft,
            center: styles.posCenter,
            right: styles.posRight,
            week: styles.posWeek,
        };
        return (
            <div className={styles.posBadgeRow}>
                {positions.map(pos => (
                    <span key={pos} className={`${styles.posBadge} ${tone[pos] || styles.posOther}`}>
                        {pos === "week" ? "Həftə" : pos.toUpperCase()}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Pulse Məqalələri</h1>
                    <p className={styles.subtitle}>
                        Məqalələri yaradın, dərc edin və header bölmələrinə yerləşdirin.
                    </p>
                </div>
                <div className={styles.headerRight}>
                    <Link href="/pulse/new" className={styles.addBtn}>+ Yeni Məqalə</Link>
                </div>
            </div>
            {loading ? <div className={styles.empty}>Yüklənir...</div>
                : articles.length === 0 ? <div className={styles.empty}>Hələ məqalə yoxdur</div>
                    : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Başlıq</th>
                                        <th>Kateqoriya</th>
                                        <th>Müəllif</th>
                                        <th>Dərc tarixi</th>
                                        <th>Header</th>
                                        <th>Status</th>
                                        <th>Əməliyyatlar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {articles.map(a => (
                                        <tr key={a.id}>
                                            <td>
                                                <div className={styles.blogInfo}>
                                                    <Thumb
                                                        src={a.coverImage ? toAbsUrl(a.coverImage) : null}
                                                        className={styles.coverThumb}
                                                        fallbackClassName={styles.thumbFallback}
                                                    />
                                                    <div>
                                                        <div className={styles.blogTitle}>{getLocalizedName(a.title)}</div>
                                                        <div className={styles.blogSlug}>/{a.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className={styles.badgeTag}>{getLocalizedName(a.category)}</span></td>
                                            <td>{getLocalizedName(a.author?.name) || "—"}</td>
                                            <td>{formatArticleDate(a.date)}</td>
                                            <td>{positionBadge(a.headerPositions)}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${a.published ? styles.badgeVisible : styles.badgeHidden}`}>
                                                    {a.published ? "Dərc olunub" : "Qaralama"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <Link href={`/pulse/${a.id}`} className={styles.editBtn}>Düzəlt</Link>
                                                    <button className={`${styles.visBtn} ${a.published ? styles.visBtnHide : styles.visBtnShow}`}
                                                        onClick={() => togglePublished(a)}>
                                                        {a.published ? "Gizlət" : "Dərc et"}
                                                    </button>
                                                    <button className={styles.deleteBtn} onClick={() => setDeleteId(a.id)}>Sil</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
            {deleteId && (
                <div className={styles.overlay} onClick={() => setDeleteId(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}><h2>Silməyi təsdiq edin</h2>
                            <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button></div>
                        <div className={styles.modalBody}><p>Bu məqaləni silmək istədiyinizə əminsiniz?</p></div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Ləğv et</button>
                            <button className={styles.deleteConfirmBtn} onClick={handleDelete}>Sil</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
