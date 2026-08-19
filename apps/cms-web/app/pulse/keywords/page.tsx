"use client";

import { useEffect, useState } from "react";
import { apiFetch, generateSlug } from "@/lib/pulse-api";
import { LocaleChips } from "@/components/LocaleChips";
import styles from "@/styles/blog.module.css";

type LocalizedName = string | { az?: string; en?: string; ru?: string };
type Keyword = { id: string; name: LocalizedName; slug: string };

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

function toLocalizedKeywordName(name: LocalizedName | undefined) {
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

export default function PulseKeywordsPage() {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<Keyword | null>(null);
    const [nameAz, setNameAz] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [nameRu, setNameRu] = useState("");
    const [slug, setSlug] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try { setKeywords(await apiFetch("/pulse/keywords")); } finally { setLoading(false); }
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

    const openEdit = (k: Keyword) => {
        const localized = toLocalizedKeywordName(k.name);
        setEditItem(k);
        setNameAz(localized.az);
        setNameEn(localized.en);
        setNameRu(localized.ru);
        setSlug(k.slug);
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
            if (editItem) await apiFetch(`/pulse/keywords/${editItem.id}`, { method: "PUT", body: JSON.stringify(body) });
            else await apiFetch("/pulse/keywords", { method: "POST", body: JSON.stringify(body) });
            setModalOpen(false); load();
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await apiFetch(`/pulse/keywords/${deleteId}`, { method: "DELETE" });
        setDeleteId(null); load();
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Pulse Açar Sözləri</h1>
                    <p className={styles.subtitle}>
                        Məqalələrə əlavə olunan açar sözləri idarə edin.
                    </p>
                </div>
                <div className={styles.headerRight}>
                    <button className={styles.addBtn} onClick={openCreate}>+ Yeni Açar söz</button>
                </div>
            </div>
            {loading ? <div className={styles.empty}>Yüklənir...</div>
                : keywords.length === 0 ? <div className={styles.empty}>Hələ açar söz yoxdur</div>
                    : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead><tr><th>Açar söz</th><th>Tərcümələr</th><th>Əməliyyatlar</th></tr></thead>
                                <tbody>
                                    {keywords.map(k => (
                                        <tr key={k.id}>
                                            <td>
                                                <div className={styles.cellStack}>
                                                    <span className={styles.cellMain}>{getLocalizedName(k.name, "az")}</span>
                                                    <span className={styles.cellSub}>/{k.slug}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <LocaleChips
                                                    value={k.name}
                                                    className={styles.localeChips}
                                                    chipClassName={styles.localeChip}
                                                    onClassName={styles.localeOn}
                                                    offClassName={styles.localeOff}
                                                />
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button className={styles.editBtn} onClick={() => openEdit(k)}>Düzəlt</button>
                                                    <button className={styles.deleteBtn} onClick={() => setDeleteId(k.id)}>Sil</button>
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
                            <h2>{editItem ? "Açar sözü Düzəlt" : "Yeni Açar söz"}</h2>
                            <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.field}>
                                <label>Ad (AZ) *</label>
                                <input className={styles.input} value={nameAz} onChange={e => {
                                    setNameAz(e.target.value);
                                    if (!editItem) setSlug(generateSlug(e.target.value));
                                }} placeholder="Texnologiya" />
                            </div>
                            <div className={styles.field}>
                                <label>Ad (EN)</label>
                                <input className={styles.input} value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Technology" />
                            </div>
                            <div className={styles.field}>
                                <label>Ad (RU)</label>
                                <input className={styles.input} value={nameRu} onChange={e => setNameRu(e.target.value)} placeholder="Технология" />
                            </div>
                            <div className={styles.field}>
                                <label>Slug</label>
                                <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} placeholder="texnologiya" />
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
                        <div className={styles.modalBody}><p>Bu açar sözü silmək istədiyinizə əminsiniz?</p></div>
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
