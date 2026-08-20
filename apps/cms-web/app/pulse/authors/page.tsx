"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch, uploadFile, toAbsUrl, generateSlug } from "@/lib/pulse-api";
import { Avatar } from "@/components/Avatar";
import { LocaleChips } from "@/components/LocaleChips";
import styles from "@/styles/blog.module.css";

type LocalizedValue = string | { az?: string; en?: string; ru?: string };
type Author = { id: string; name: LocalizedValue; slug: string; title?: LocalizedValue; linkedin?: string; avatar?: string; description?: LocalizedValue; isVisible?: boolean; featured?: boolean };

const PULSE_UPLOAD_PREFIX = "/uploads/pulse/";

function normalizePulseAvatar(avatar?: string | null) {
    if (!avatar) return "";
    return avatar.startsWith(PULSE_UPLOAD_PREFIX) ? avatar : "";
}

function getLocalizedValue(value: any, locale: "az" | "en" | "ru" = "az"): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
        const val = value[locale] || value.az || value.en || value.ru;
        if (typeof val === "string") return val;
        const firstVal = Object.values(value).find(v => typeof v === "string");
        if (firstVal) return firstVal as string;
    }
    return "";
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
    const [isVisible, setIsVisible] = useState(true);
    const [featured, setFeatured] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const load = async () => {
        setLoading(true);
        // Admin bütün siyahını görür; sayt yalnız görünənləri alır.
        try { setAuthors(await apiFetch("/pulse/authors?includeHidden=true")); } finally { setLoading(false); }
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
        setIsVisible(true);
        setFeatured(false);
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
        setIsVisible(a.isVisible !== false);
        setFeatured(a.featured === true);
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
                isVisible,
                featured,
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
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Pulse Müəllifləri</h1>
                    <p className={styles.subtitle}>
                        Məqalələrə təyin olunan müəllif profillərini idarə edin.
                    </p>
                </div>
                <div className={styles.headerRight}>
                    <button className={styles.addBtn} onClick={openCreate}>+ Yeni Müəllif</button>
                </div>
            </div>
            {loading ? <div className={styles.empty}>Yüklənir...</div>
                : authors.length === 0 ? <div className={styles.empty}>Hələ müəllif yoxdur</div>
                    : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead><tr><th>Müəllif</th><th>Vəzifə</th><th>Saytda</th><th>Tərcümələr</th><th>Əməliyyatlar</th></tr></thead>
                                <tbody>
                                    {authors.map(a => (
                                        <tr key={a.id}>
                                            <td>
                                                <div className={styles.blogInfo}>
                                                    <Avatar
                                                        src={a.avatar ? toAbsUrl(a.avatar) : null}
                                                        name={getLocalizedValue(a.name, "az")}
                                                        className={styles.avatar}
                                                        imgClassName={styles.avatarImg}
                                                    />
                                                    <div className={styles.cellStack}>
                                                        <span className={styles.cellMain}>{getLocalizedValue(a.name, "az")}</span>
                                                        <span className={styles.cellSub}>/{a.slug}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{getLocalizedValue(a.title, "az") || "—"}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <span className={`${styles.statusBadge} ${a.isVisible === false ? styles.badgeHidden : styles.badgeVisible}`}>
                                                        {a.isVisible === false ? "Gizli" : "Görünür"}
                                                    </span>
                                                    {a.featured && (
                                                        <span className={`${styles.statusBadge} ${styles.toneBlue}`}>Seçilmiş</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <LocaleChips
                                                    value={a.name}
                                                    className={styles.localeChips}
                                                    chipClassName={styles.localeChip}
                                                    onClassName={styles.localeOn}
                                                    offClassName={styles.localeOff}
                                                />
                                            </td>
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
                                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
                                <div className={styles.coverRow}>
                                    <div className={styles.coverBox} onClick={() => fileRef.current?.click()}>
                                        {avatar ? (
                                            <>
                                                <img src={toAbsUrl(avatar)} alt="" />
                                                <span>Dəyişdir</span>
                                            </>
                                        ) : (
                                            <span>Şəkil yüklə</span>
                                        )}
                                    </div>
                                    <p className={styles.coverNote}>
                                        Kvadrat şəkil daha yaxşı görünür. Siyahıda və məqalə altında istifadə olunur.
                                    </p>
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label>Təsvir (AZ)</label>
                                <textarea className={styles.textarea} rows={3} value={descriptionAz} onChange={e => setDescriptionAz(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label>Təsvir (EN)</label>
                                <textarea className={styles.textarea} rows={3} value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label>Təsvir (RU)</label>
                                <textarea className={styles.textarea} rows={3} value={descriptionRu} onChange={e => setDescriptionRu(e.target.value)} />
                            </div>

                            {/* Saytdakı "İlham verən komanda" bölməsinə təsir edir. */}
                            <div className={styles.checkRow}>
                                <label className={styles.checkLabel}>
                                    <input
                                        type="checkbox"
                                        checked={isVisible}
                                        onChange={e => setIsVisible(e.target.checked)}
                                    />
                                    Saytda görünsün
                                </label>
                                <label className={styles.checkLabel}>
                                    <input
                                        type="checkbox"
                                        checked={featured}
                                        onChange={e => setFeatured(e.target.checked)}
                                    />
                                    Seçilmiş (əvvəldə göstərilsin)
                                </label>
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
