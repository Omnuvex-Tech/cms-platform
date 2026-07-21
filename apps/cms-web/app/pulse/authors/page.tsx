"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch, uploadFile, toAbsUrl, generateSlug } from "@/lib/pulse-api";
import styles from "@/styles/blog.module.css";

type LocalizedValue = string | { az?: string; en?: string; ru?: string };
type Author = { id: string; name: LocalizedValue; slug: string; title?: LocalizedValue; linkedin?: string; avatar?: string; description?: LocalizedValue };

const PULSE_UPLOAD_PREFIX = "/uploads/pulse/";

function normalizePulseAvatar(avatar?: string | null) {
    if (!avatar) return "";
    return avatar.startsWith(PULSE_UPLOAD_PREFIX) ? avatar : "";
}

function getLocalizedValue(value: LocalizedValue | undefined, locale: "az" | "en" | "ru" = "az"): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[locale] || value.az || value.en || value.ru || Object.values(value)[0] || "";
}

function toLocalizedFields(value: LocalizedValue | undefined) {
    const base = getLocalizedValue(value, "az");

    if (!value || typeof value === "string") {
        return { az: base, en: base, ru: base };
    }

    return {
        az: getLocalizedValue(value, "az"),
        en: getLocalizedValue(value, "en") || base,
        ru: getLocalizedValue(value, "ru") || base,
    };
}

export default function PulseAuthorsPage() {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<Author | null>(null);
    const [nameAz, setNameAz] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [nameRu, setNameRu] = useState("");
    const [slug, setSlug] = useState("");
    const [titleAz, setTitleAz] = useState("");
    const [titleEn, setTitleEn] = useState("");
    const [titleRu, setTitleRu] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [avatar, setAvatar] = useState("");
    const [descriptionAz, setDescriptionAz] = useState("");
    const [descriptionEn, setDescriptionEn] = useState("");
    const [descriptionRu, setDescriptionRu] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const load = async () => {
        setLoading(true);
        try { setAuthors(await apiFetch("/pulse/authors")); } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditItem(null);
        setNameAz(""); setNameEn(""); setNameRu("");
        setSlug("");
        setTitleAz(""); setTitleEn(""); setTitleRu("");
        setLinkedin("");
        setAvatar("");
        setDescriptionAz(""); setDescriptionEn(""); setDescriptionRu("");
        setModalOpen(true);
    };

    const openEdit = (a: Author) => {
        const localizedName = toLocalizedFields(a.name);
        const localizedTitle = toLocalizedFields(a.title);
        const localizedDescription = toLocalizedFields(a.description);

        setEditItem(a);
        setNameAz(localizedName.az);
        setNameEn(localizedName.en);
        setNameRu(localizedName.ru);
        setSlug(a.slug);
        setTitleAz(localizedTitle.az);
        setTitleEn(localizedTitle.en);
        setTitleRu(localizedTitle.ru);
        setLinkedin(a.linkedin || "");
        setAvatar(normalizePulseAvatar(a.avatar));
        setDescriptionAz(localizedDescription.az);
        setDescriptionEn(localizedDescription.en);
        setDescriptionRu(localizedDescription.ru);
        setModalOpen(true);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatar(await uploadFile(file));
    };

    const save = async () => {
        if (!nameAz.trim()) return;
        setSaving(true);
        try {
            const normalizedName = nameAz.trim();
            const normalizedTitleAz = titleAz.trim();
            const normalizedDescriptionAz = descriptionAz.trim();
            const body = {
                name: {
                    az: normalizedName,
                    en: nameEn.trim() || normalizedName,
                    ru: nameRu.trim() || normalizedName,
                },
                slug: slug || generateSlug(normalizedName),
                ...(normalizedTitleAz && {
                    title: {
                        az: normalizedTitleAz,
                        en: titleEn.trim() || normalizedTitleAz,
                        ru: titleRu.trim() || normalizedTitleAz,
                    },
                }),
                linkedin: linkedin || undefined,
                avatar: normalizePulseAvatar(avatar) || undefined,
                ...(normalizedDescriptionAz && {
                    description: {
                        az: normalizedDescriptionAz,
                        en: descriptionEn.trim() || normalizedDescriptionAz,
                        ru: descriptionRu.trim() || normalizedDescriptionAz,
                    },
                }),
            };
            if (editItem) await apiFetch(`/pulse/authors/${editItem.id}`, { method: "PUT", body: JSON.stringify(body) });
            else await apiFetch("/pulse/authors", { method: "POST", body: JSON.stringify(body) });
            setModalOpen(false); load();
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await apiFetch(`/pulse/authors/${deleteId}`, { method: "DELETE" });
        setDeleteId(null); load();
    };

    return (
        <div>
            <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>Pulse Müəllifləri</h2>
                <button className={styles.addBtn} onClick={openCreate}>+ Yeni Müəllif</button>
            </div>
            {loading ? <div className={styles.empty}>Yüklənir...</div>
                : authors.length === 0 ? <div className={styles.empty}>Hələ müəllif yoxdur</div>
                    : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead><tr><th>Şəkil</th><th>AZ</th><th>EN</th><th>RU</th><th>Slug</th><th>Vəzifə (AZ)</th><th>Əməliyyatlar</th></tr></thead>
                                <tbody>
                                    {authors.map(a => (
                                        <tr key={a.id}>
                                            <td>{a.avatar && <img src={toAbsUrl(a.avatar)} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />}</td>
                                            <td><strong>{getLocalizedValue(a.name, "az")}</strong></td>
                                            <td>{getLocalizedValue(a.name, "en")}</td>
                                            <td>{getLocalizedValue(a.name, "ru")}</td>
                                            <td><span className={styles.blogSlug}>/{a.slug}</span></td>
                                            <td>{getLocalizedValue(a.title, "az") || "—"}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button className={styles.editBtn} onClick={() => openEdit(a)}>Düzəlt</button>
                                                    <button className={styles.deleteBtn} onClick={() => setDeleteId(a.id)}>Sil</button>
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
                            <h2>{editItem ? "Müəllifi Düzəlt" : "Yeni Müəllif"}</h2>
                            <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.field}>
                                <label>Ad (AZ) *</label>
                                <input className={styles.input} value={nameAz} onChange={e => { setNameAz(e.target.value); if (!editItem) setSlug(generateSlug(e.target.value)); }} />
                            </div>
                            <div className={styles.field}>
                                <label>Ad (EN)</label>
                                <input className={styles.input} value={nameEn} onChange={e => setNameEn(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label>Ad (RU)</label>
                                <input className={styles.input} value={nameRu} onChange={e => setNameRu(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label>Slug</label>
                                <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label>Vəzifə (AZ)</label>
                                <input className={styles.input} value={titleAz} onChange={e => setTitleAz(e.target.value)} placeholder="Baş redaktor" />
                            </div>
                            <div className={styles.field}>
                                <label>Vəzifə (EN)</label>
                                <input className={styles.input} value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Editor in Chief" />
                            </div>
                            <div className={styles.field}>
                                <label>Vəzifə (RU)</label>
                                <input className={styles.input} value={titleRu} onChange={e => setTitleRu(e.target.value)} placeholder="Главный редактор" />
                            </div>
                            <div className={styles.field}>
                                <label>LinkedIn linki</label>
                                <input className={styles.input} value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
                            </div>
                            <div className={styles.field}>
                                <label>Şəkil</label>
                                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
                                <div onClick={() => fileRef.current?.click()} style={{ cursor: "pointer", border: "1px dashed #444", borderRadius: 8, padding: 12, textAlign: "center" }}>
                                    {avatar ? <img src={toAbsUrl(avatar)} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} /> : <span style={{ color: "#888" }}>Şəkil yüklə</span>}
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label>Təsvir (AZ)</label>
                                <textarea className={styles.input} rows={3} value={descriptionAz} onChange={e => setDescriptionAz(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label>Təsvir (EN)</label>
                                <textarea className={styles.input} rows={3} value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label>Təsvir (RU)</label>
                                <textarea className={styles.input} rows={3} value={descriptionRu} onChange={e => setDescriptionRu(e.target.value)} />
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
                        <div className={styles.modalBody}><p>Bu müəllifi silmək istədiyinizə əminsiniz?</p></div>
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
