"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, toAbsUrl } from "@/lib/pulse-api";
import styles from "@/styles/blog.module.css";

type Article = {
    id: string; slug: string; title: string | { az?: string; en?: string; ru?: string }; category: string | { az?: string; en?: string; ru?: string };
    date: string; coverImage?: string; excerpt?: string;
    published: boolean; featured: boolean;
    headerPosition?: string; headerOrder?: number;
    author?: { name: string }; keywords?: { name: string }[];
};

function getLocalizedName(value: string | { az?: string; en?: string; ru?: string } | undefined): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value.az || Object.values(value)[0] || "";
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

    const positionBadge = (pos?: string) => {
        if (!pos) return null;
        const colors: Record<string, string> = { left: "#3b82f6", center: "#10b981", right: "#f59e0b", week: "#8b5cf6" };
        return (
            <span style={{
                display: "inline-block", padding: "2px 8px", borderRadius: 4,
                fontSize: 11, fontWeight: 600, color: "#fff",
                background: colors[pos] || "#6b7280",
            }}>
                {pos === "week" ? "Həftə" : pos.toUpperCase()}
            </span>
        );
    };

    return (
        <div>
            <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>Pulse Məqalələri</h2>
                <Link href="/pulse/new" className={styles.addBtn}>+ Yeni Məqalə</Link>
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
                                                    {a.coverImage && (
                                                        <img src={toAbsUrl(a.coverImage)} alt="" className={styles.coverThumb} />
                                                    )}
                                                    <div>
                                                        <div className={styles.blogTitle}>{getLocalizedName(a.title)}</div>
                                                        <div className={styles.blogSlug}>/{a.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className={styles.badgeTag}>{getLocalizedName(a.category)}</span></td>
                                            <td>{a.author?.name || "—"}</td>
                                            <td>{positionBadge(a.headerPosition)}</td>
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
