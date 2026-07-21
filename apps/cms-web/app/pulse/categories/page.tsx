"use client";

import { useEffect, useState } from "react";
import { apiFetch, generateSlug } from "@/lib/pulse-api";
import styles from "@/styles/blog.module.css";

type Category = { id: string; name: string | { az?: string; en?: string; ru?: string }; slug: string };

function getLocalizedName(name: any, locale: "az" | "en" | "ru" = "az"): string {
    if (!name) return "";
    if (typeof name === "string") return name;
    if (typeof name === "object") {
        const val = name[locale] || name.az || name.en || name.ru;
        if (typeof val === "string") return val;
        const firstVal = Object.values(name).find(v => typeof v === "string");
        if (firstVal) return firstVal as string;
    }
    return "";
}

function toLocalizedCategoryName(name: string | { az?: string; en?: string; ru?: string } | undefined) {
    const base = getLocalizedName(name, "az");

    if (!name || typeof name === "string") {
        return { az: base, en: base, ru: base };
    }

    return {
        az: getLocalizedName(name, "az"),
        en: getLocalizedName(name, "en") || base,
        ru: getLocalizedName(name, "ru") || base,
    };
}

export default function PulseCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<Category | null>(null);
    const [nameAz, setNameAz] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [nameRu, setNameRu] = useState("");
    const [slug, setSlug] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try { setCategories(await apiFetch("/pulse/categories")); } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditItem(null);
        setNameAz("");
        setNameEn("");
        setNameRu("");
        setSlug("");
        setModalOpen(true);
    };

    const openEdit = (c: Category) => {
        const localized = toLocalizedCategoryName(c.name);
        setEditItem(c);
        setNameAz(localized.az);
        setNameEn(localized.en);
        setNameRu(localized.ru);
        setSlug(c.slug);
        setModalOpen(true);
    };

    const save = async () => {
        if (!nameAz.trim()) return;
        setSaving(true);
        try {
            const normalizedAz = nameAz.trim();
            const body = {
                name: {
                    az: normalizedAz,
                    en: nameEn.trim() || normalizedAz,
                    ru: nameRu.trim() || normalizedAz,
                },
                slug: slug || generateSlug(normalizedAz),
            };
            if (editItem) await apiFetch(`/pulse/categories/${editItem.id}`, { method: "PUT", body: JSON.stringify(body) });
            else await apiFetch("/pulse/categories", { method: "POST", body: JSON.stringify(body) });
            setModalOpen(false); load();
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await apiFetch(`/pulse/categories/${deleteId}`, { method: "DELETE" });
        setDeleteId(null); load();
    };

    return (
        <div>
            <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>Pulse Kateqoriyaları</h2>
                <button className={styles.addBtn} onClick={openCreate}>+ Yeni Layihə</button>
            </div>
            {loading ? <div className={styles.empty}>Yüklənir...</div>
                : categories.length === 0 ? <div className={styles.empty}>Hələ kateqoriya yoxdur</div>
                    : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead><tr><th>AZ</th><th>EN</th><th>RU</th><th>Slug</th><th>Əməliyyatlar</th></tr></thead>
                                <tbody>
                                    {categories.map(c => (
                                        <tr key={c.id}>
                                            <td><strong>{getLocalizedName(c.name, "az")}</strong></td>
                                            <td>{getLocalizedName(c.name, "en")}</td>
                                            <td>{getLocalizedName(c.name, "ru")}</td>
                                            <td><span className={styles.blogSlug}>/{c.slug}</span></td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button className={styles.editBtn} onClick={() => openEdit(c)}>Düzəlt</button>
                                                    <button className={styles.deleteBtn} onClick={() => setDeleteId(c.id)}>Sil</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
            {modalOpen && (
                <div className={styles.overlay} onClick={() => setModalOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editItem ? "Kateqoriyanı Düzəlt" : "Yeni Kateqoriya"}</h2>
                            <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.field}>
                                <label>Ad (AZ) *</label>
                                <input className={styles.input} value={nameAz} onChange={e => { setNameAz(e.target.value); if (!editItem) setSlug(generateSlug(e.target.value)); }} placeholder="Bloq" />
                            </div>
                            <div className={styles.field}>
                                <label>Ad (EN)</label>
                                <input className={styles.input} value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Blog" />
                            </div>
                            <div className={styles.field}>
                                <label>Ad (RU)</label>
                                <input className={styles.input} value={nameRu} onChange={e => setNameRu(e.target.value)} placeholder="Блог" />
                            </div>
                            <div className={styles.field}>
                                <label>Slug</label>
                                <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} placeholder="blog" />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Ləğv et</button>
                            <button className={styles.saveBtn} onClick={save} disabled={saving}>{saving ? "Saxlanır..." : "Saxla"}</button>
                        </div>
                    </div>
                </div>
            )}
            {deleteId && (
                <div className={styles.overlay} onClick={() => setDeleteId(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}><h2>Silməyi təsdiq edin</h2>
                            <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button></div>
                        <div className={styles.modalBody}><p>Bu kateqoriyanı silmək istədiyinizə əminsiniz?</p></div>
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
