"use client";

import { useEffect, useState, useRef } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { apiFetch, uploadFile, toAbsUrl, generateSlug } from "@/lib/pulse-api";
import { Avatar } from "@/components/Avatar";
import { LocaleChips } from "@/components/LocaleChips";
import styles from "@/styles/blog.module.css";

type LocalizedValue = string | { az?: string; en?: string; ru?: string };
type Author = { id: string; name: LocalizedValue; slug: string; title?: LocalizedValue; linkedin?: string; avatar?: string; description?: LocalizedValue; isVisible?: boolean; order?: number };

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

/**
 * Sürüşdürülə bilən komanda sətri.
 *
 * Sürüşdürmə yalnız tutacaqdan (⠿) işləyir — bütün sətir sürüşdürmə sahəsi
 * olsaydı, "Düzəlt"/"Sil" düymələrinə toxunmaq da sürüşdürmə kimi başlayardı.
 */
function SortableAuthorRow({
    author,
    index,
    onEdit,
    onToggleVisibility,
    onDelete,
}: {
    author: Author;
    index: number;
    onEdit: (a: Author) => void;
    onToggleVisibility: (a: Author) => void;
    onDelete: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: author.id });

    const hidden = author.isVisible === false;

    return (
        <tr
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.5 : 1,
            }}
        >
            <td className={styles.num}>
                <span className={styles.dragHandle} {...attributes} {...listeners} title="Sürüşdür">
                    ⠿
                </span>
                {String(index + 1).padStart(2, "0")}
            </td>
            <td>
                <div className={styles.blogInfo}>
                    <Avatar
                        src={author.avatar ? toAbsUrl(author.avatar) : null}
                        name={getLocalizedValue(author.name, "az")}
                        className={styles.avatar}
                        imgClassName={styles.avatarImg}
                    />
                    <div className={styles.cellStack}>
                        <span className={styles.cellMain}>{getLocalizedValue(author.name, "az")}</span>
                        <span className={styles.cellSub}>/{author.slug}</span>
                    </div>
                </div>
            </td>
            <td>{getLocalizedValue(author.title, "az") || "—"}</td>
            <td>
                <span className={`${styles.statusBadge} ${hidden ? styles.badgeHidden : styles.badgeVisible}`}>
                    {hidden ? "Gizli" : "Görünür"}
                </span>
            </td>
            <td>
                <LocaleChips
                    value={author.name}
                    className={styles.localeChips}
                    chipClassName={styles.localeChip}
                    onClassName={styles.localeOn}
                    offClassName={styles.localeOff}
                />
            </td>
            <td>
                <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => onEdit(author)}>Düzəlt</button>
                    <button
                        className={`${styles.visBtn} ${hidden ? styles.visBtnShow : styles.visBtnHide}`}
                        onClick={() => onToggleVisibility(author)}
                    >
                        {hidden ? "Göstər" : "Gizlət"}
                    </button>
                    <button className={styles.deleteBtn} onClick={() => onDelete(author.id)}>Sil</button>
                </div>
            </td>
        </tr>
    );
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
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [reordering, setReordering] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const sensors = useSensors(useSensor(PointerSensor));

    const load = async () => {
        setLoading(true);
        // Admin bütün siyahını görür; sayt yalnız görünənləri alır.
        try { setAuthors(await apiFetch("/pulse/authors?includeHidden=true")); } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    /**
     * Sıra dərhal ekranda dəyişir, sonra serverə yazılır — şəbəkə gözləntisi
     * sürüşdürməni ləng göstərməsin. Yazı alınmasa siyahı serverdən yenidən
     * yüklənir ki, ekranda saxlanılmamış sıra qalmasın.
     */
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = authors.findIndex(a => a.id === active.id);
        const newIndex = authors.findIndex(a => a.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const next = arrayMove(authors, oldIndex, newIndex);
        setAuthors(next);
        setReordering(true);
        try {
            await apiFetch("/pulse/authors/reorder", {
                method: "PATCH",
                body: JSON.stringify({ ids: next.map(a => a.id) }),
            });
        } catch (err: any) {
            alert(err?.message ?? "Sıralama saxlanılarkən xəta baş verdi");
            load();
        } finally {
            setReordering(false);
        }
    };

    /** Siyahıdan birbaşa gizlətmək/göstərmək — işdən ayrılan üzv üçün. */
    const toggleVisibility = async (author: Author) => {
        const nextVisible = author.isVisible === false;
        setAuthors(prev => prev.map(a => (a.id === author.id ? { ...a, isVisible: nextVisible } : a)));
        try {
            await apiFetch(`/pulse/authors/${author.id}`, {
                method: "PUT",
                body: JSON.stringify({ isVisible: nextVisible }),
            });
        } catch (err: any) {
            alert(err?.message ?? "Dəyişiklik saxlanılmadı");
            load();
        }
    };

    const openCreate = () => {
        setEditItem(null);
        setNameAz(""); setNameEn(""); setNameRu("");
        setSlug("");
        setTitleAz(""); setTitleEn(""); setTitleRu("");
        setLinkedin("");
        setAvatar("");
        setDescriptionAz(""); setDescriptionEn(""); setDescriptionRu("");
        setIsVisible(true);
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
                        Sıra saytdakı «Komandamızla tanış olun» bölməsində eyni
                        ardıcıllıqla görünür — dəyişmək üçün sətri ⠿ ilə sürüşdürün.
                    </p>
                </div>
                <div className={styles.headerRight}>
                    {reordering && <span className={styles.reorderingText}>Sıra saxlanılır...</span>}
                    <button className={styles.addBtn} onClick={openCreate}>+ Yeni Müəllif</button>
                </div>
            </div>
            {loading ? <div className={styles.empty}>Yüklənir...</div>
                : authors.length === 0 ? <div className={styles.empty}>Hələ müəllif yoxdur</div>
                    : (
                        <div className={styles.tableWrap}>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <table className={styles.table}>
                                    <thead><tr><th>Sıra</th><th>Müəllif</th><th>Vəzifə</th><th>Saytda</th><th>Tərcümələr</th><th>Əməliyyatlar</th></tr></thead>
                                    <tbody>
                                        <SortableContext
                                            items={authors.map(a => a.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {authors.map((a, index) => (
                                                <SortableAuthorRow
                                                    key={a.id}
                                                    author={a}
                                                    index={index}
                                                    onEdit={openEdit}
                                                    onToggleVisibility={toggleVisibility}
                                                    onDelete={setDeleteId}
                                                />
                                            ))}
                                        </SortableContext>
                                    </tbody>
                                </table>
                            </DndContext>
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

                            {/* Saytdakı komanda bölməsinə təsir edir. Sıra siyahıda
                                sürüşdürməklə təyin olunur. */}
                            <div className={styles.checkRow}>
                                <label className={styles.checkLabel}>
                                    <input
                                        type="checkbox"
                                        checked={isVisible}
                                        onChange={e => setIsVisible(e.target.checked)}
                                    />
                                    Saytda görünsün
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
