"use client";

/**
 * Layihə kateqoriyalarının siyahısı.
 *
 * Quruluş master branch-dakı service/portfolio siyahı səhifələri ilə eynidir:
 * dnd-kit ilə sıralanan cədvəl + Düzəlt / Gizlət / Sil düymələri + modal forma.
 * Bütün stil CSS module-dan gəlir.
 */

import { useEffect, useState, useRef } from "react";
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    LangTabs, toLocalized, type Lang, type LocalizedString,
} from "@/components/RichEditor";
import { Thumb } from "@/components/Thumb";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import styles from "@/styles/layihelerimiz.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;

/* ────────────────────────────── köməkçilər ────────────────────────────── */

function getToken() {
    return document.cookie.split("access_token=")[1]?.split(";")[0] ?? "";
}

async function cmsApiFetch(path: string, options?: RequestInit) {
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
            ...options?.headers,
        },
    });
    if (!res.ok) {
        let message = "Xəta baş verdi";
        try {
            const err = await res.json();
            message = err?.message || err?.error || JSON.stringify(err);
        } catch {
            message = await res.text().catch(() => `HTTP ${res.status}`);
        }
        throw new Error(`[${res.status}] ${path}: ${message}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

/** Böyük şəkilləri yükləməzdən əvvəl webp-ə sıxır. */
async function prepareImageFile(file: File): Promise<File> {
    if (!file.type.startsWith("image/")) return file;

    const maxDimension = 1920;
    const quality = 0.85;

    let bitmap: ImageBitmap | null = null;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        return file;
    }

    try {
        const { width, height } = bitmap;
        if (!width || !height) return file;

        const scale = Math.min(1, maxDimension / Math.max(width, height));
        if (scale === 1 && file.type === "image/webp" && file.size <= 1_500_000) return file;

        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return file;

        ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/webp", quality);
        });
        if (!blob) return file;
        if (blob.size >= file.size) return file;

        const safeBaseName =
            (file.name || "image")
                .replace(/\.[^.]+$/, "")
                .replace(/[^\w\-]+/g, "_")
                .slice(0, 60) || "image";

        return new File([blob], `${safeBaseName}.webp`, { type: blob.type });
    } finally {
        bitmap.close();
    }
}

async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API}/layihelerimiz/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        const trimmed = text.trim();
        if (res.status === 413) {
            throw new Error(
                `Fayl çox böyük (HTTP 413). Server/proxy limitini artırın (nginx client_max_body_size). ${
                    trimmed ? `Cavab: ${trimmed.slice(0, 200)}` : ""
                }`.trim(),
            );
        }
        let message = `HTTP ${res.status}`;
        try {
            const json = trimmed ? JSON.parse(trimmed) : null;
            message = json?.message || json?.error || (typeof json === "string" ? json : message);
        } catch {
            if (trimmed) message = trimmed.slice(0, 200);
        }
        throw new Error(`Fayl yükləmə uğursuz: ${message}`);
    }
    return (await res.json()).url;
}

function toAbsUrl(path: string) {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${API}${path}`;
}

const lv = toLocalized;

/* ────────────────────────────────── tiplər ────────────────────────────── */

interface LayihelerimizCategory {
    id: string;
    title?: unknown;
    slug: string;
    image: string | null;
    brandImage: string | null;
    description: unknown;
    brand: unknown;
    brandTextColor: string | null;
    order: number;
    isVisible: boolean;
    banks: string | null;
    infrastructure: string | null;
    salesDepartment: string | null;
    createdAt?: string;
}

interface FormState {
    title: LocalizedString;
    slug: string;
    image: string;
    imageFile: File | null;
    imagePreview: string;
    brandImage: string;
    brandImageFile: File | null;
    brandImagePreview: string;
    description: LocalizedString;
    brand: LocalizedString;
    brandTextColor: string;
    order: number;
    isVisible: boolean;
    banks: string;
    infrastructure: string;
    salesDepartment: string;
}

const emptyForm: FormState = {
    title: { az: "", en: "", ru: "" },
    slug: "",
    image: "",
    imageFile: null,
    imagePreview: "",
    brandImage: "",
    brandImageFile: null,
    brandImagePreview: "",
    description: { az: "", en: "", ru: "" },
    brand: { az: "", en: "", ru: "" },
    brandTextColor: "white",
    order: 0,
    isVisible: true,
    banks: "",
    infrastructure: "",
    salesDepartment: "",
};

/* ─────────────────────────── sıralanan cədvəl sətri ───────────────────── */

function SortableRow({ item, onEdit, onToggle, onDelete }: {
    item: LayihelerimizCategory;
    onEdit: (item: LayihelerimizCategory) => void;
    onToggle: (item: LayihelerimizCategory) => void;
    onDelete: (item: LayihelerimizCategory) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: item.id });

    const title = lv(item.title).az || item.slug;
    const brand = lv(item.brand).az;

    return (
        <tr ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
            <td className={styles.num}>
                <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
            </td>
            <td>
                <div className={styles.serviceInfo}>
                    <Thumb
                        src={item.image ? toAbsUrl(item.image) : null}
                        className={styles.coverThumb}
                        fallbackClassName={styles.thumbFallback}
                    />
                    <div>
                        <div className={styles.serviceTitle}>{title}</div>
                        <div className={styles.serviceSlug}>/{item.slug}</div>
                    </div>
                </div>
            </td>
            <td>{brand && <span className={styles.badge}>{brand}</span>}</td>
            <td>
                <span className={`${styles.statusBadge} ${item.isVisible ? styles.badgeVisible : styles.badgeHidden}`}>
                    {item.isVisible ? "Görünür" : "Gizli"}
                </span>
            </td>
            <td>
                <div className={styles.actions}>
                    <button type="button" className={styles.editBtn} onClick={() => onEdit(item)}>Düzəlt</button>
                    <a className={styles.editBtn} href={`/layihelerimiz/${item.slug}`}>Bloklar</a>
                    <button type="button"
                        className={`${styles.visBtn} ${item.isVisible ? styles.visBtnHide : styles.visBtnShow}`}
                        onClick={() => onToggle(item)}>
                        {item.isVisible ? "Gizlət" : "Göstər"}
                    </button>
                    <button type="button" className={styles.deleteBtn} onClick={() => onDelete(item)}>Sil</button>
                </div>
            </td>
        </tr>
    );
}

/* ────────────────────────────────── səhifə ────────────────────────────── */

export default function LayihelerimizPage() {
    const [items, setItems] = useState<LayihelerimizCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [reordering, setReordering] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<LayihelerimizCategory | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeLang, setActiveLang] = useState<Lang>("az");

    const [form, setForm] = useState(emptyForm);
    const [imageUploading, setImageUploading] = useState(false);
    const [brandImageUploading, setBrandImageUploading] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState<LayihelerimizCategory | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const brandFileInputRef = useRef<HTMLInputElement>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const load = async () => {
        setLoading(true);
        try {
            const data: LayihelerimizCategory[] = await cmsApiFetch("/layihelerimiz/categories");
            data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setItems(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const from = items.findIndex(i => i.id === active.id);
        const to = items.findIndex(i => i.id === over.id);
        if (from < 0 || to < 0) return;

        // Optimistik yeniləmə: siyahı dərhal sürüşür, server arxada yazır.
        const next = arrayMove(items, from, to);
        setItems(next);
        setReordering(true);
        try {
            await cmsApiFetch("/layihelerimiz/categories/reorder", {
                method: "PATCH",
                body: JSON.stringify({ ids: next.map(i => i.id) }),
            });
        } catch (e: unknown) {
            alert("Sıra saxlanmadı: " + (e instanceof Error ? e.message : String(e)));
            load();
        } finally {
            setReordering(false);
        }
    };

    const openNew = () => {
        setEditingItem(null);
        setIsNew(true);
        setForm({ ...emptyForm });
        setModalOpen(true);
    };

    const openEdit = (item: LayihelerimizCategory) => {
        setEditingItem(item);
        setIsNew(false);
        setForm({
            title: lv(item.title),
            slug: item.slug,
            image: item.image || "",
            imageFile: null,
            imagePreview: item.image ? toAbsUrl(item.image) : "",
            brandImage: item.brandImage || "",
            brandImageFile: null,
            brandImagePreview: item.brandImage ? toAbsUrl(item.brandImage) : "",
            description: lv(item.description),
            brand: lv(item.brand),
            brandTextColor: item.brandTextColor || "white",
            order: item.order ?? 0,
            isVisible: item.isVisible ?? true,
            banks: item.banks || "",
            infrastructure: item.infrastructure || "",
            salesDepartment: item.salesDepartment || "",
        });
        setModalOpen(true);
    };

    const pickImage = (
        e: React.ChangeEvent<HTMLInputElement>,
        kind: "image" | "brandImage",
        inputRef: React.RefObject<HTMLInputElement | null>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!["image/webp", "image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
            alert("Yalnız WebP, JPEG və PNG formatları qəbul edilir");
            if (inputRef.current) inputRef.current.value = "";
            return;
        }
        void (async () => {
            const prepared = await prepareImageFile(file);
            setForm(f => kind === "image"
                ? { ...f, imageFile: prepared, imagePreview: URL.createObjectURL(prepared) }
                : { ...f, brandImageFile: prepared, brandImagePreview: URL.createObjectURL(prepared) });
        })();
    };

    const clearImage = (kind: "image" | "brandImage") => {
        setForm(f => kind === "image"
            ? { ...f, image: "", imageFile: null, imagePreview: "" }
            : { ...f, brandImage: "", brandImageFile: null, brandImagePreview: "" });
        const ref = kind === "image" ? fileInputRef : brandFileInputRef;
        if (ref.current) ref.current.value = "";
    };

    const toggleVisibility = async (item: LayihelerimizCategory) => {
        try {
            await cmsApiFetch(`/layihelerimiz/categories/${item.id}`, {
                method: "PATCH",
                body: JSON.stringify({ isVisible: !item.isVisible }),
            });
            load();
        } catch (e: unknown) {
            alert("Xəta: " + (e instanceof Error ? e.message : String(e)));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let imageUrl = form.image;
            if (form.imageFile) {
                setImageUploading(true);
                imageUrl = await uploadFile(form.imageFile);
                setImageUploading(false);
            }

            let brandImageUrl = form.brandImage;
            if (form.brandImageFile) {
                setBrandImageUploading(true);
                brandImageUrl = await uploadFile(form.brandImageFile);
                setBrandImageUploading(false);
            }

            const filled = (v: LocalizedString) => (v.az || v.en || v.ru) ? v : null;

            const payload: Record<string, unknown> = {
                title: filled(form.title),
                image: imageUrl || null,
                brandImage: brandImageUrl || null,
                description: filled(form.description),
                brand: filled(form.brand),
                brandTextColor: form.brandTextColor,
                order: form.order,
                isVisible: form.isVisible,
                banks: form.banks || null,
                infrastructure: form.infrastructure || null,
                salesDepartment: form.salesDepartment || null,
            };
            if (form.slug) payload.slug = form.slug;

            if (isNew) {
                await cmsApiFetch("/layihelerimiz/categories", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
            } else if (editingItem) {
                await cmsApiFetch(`/layihelerimiz/categories/${editingItem.id}`, {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                });
            }

            setModalOpen(false);
            load();
        } catch (e: unknown) {
            alert("Xəta: " + (e instanceof Error ? e.message : String(e)));
        } finally {
            setSaving(false);
            setImageUploading(false);
            setBrandImageUploading(false);
        }
    };

    const handleDelete = async () => {
        const item = confirmTarget;
        if (!item) return;
        setDeleting(true);
        try {
            await cmsApiFetch(`/layihelerimiz/categories/${item.id}`, { method: "DELETE" });
            setConfirmTarget(null);
            load();
        } catch (e: unknown) {
            alert("Xəta: " + (e instanceof Error ? e.message : String(e)));
        } finally {
            setDeleting(false);
        }
    };

    const saveLabel = saving
        ? "Saxlanılır..."
        : imageUploading
            ? "Şəkil yüklənir..."
            : brandImageUploading
                ? "Brend şəkli yüklənir..."
                : "Saxla";

    const uploadArea = (kind: "image" | "brandImage") => {
        const isCover = kind === "image";
        const preview = isCover ? form.imagePreview : form.brandImagePreview;
        const ref = isCover ? fileInputRef : brandFileInputRef;
        return (
            <>
                <input ref={ref} type="file" accept="image/webp,image/jpeg,image/png" hidden
                    onChange={e => pickImage(e, kind, ref)} />
                <div className={styles.singleUploadArea} onClick={() => ref.current?.click()}>
                    {preview ? (
                        <div className={styles.singleUploadPreviewWrap}>
                            <img src={preview} alt="" className={styles.singleUploadPreview} />
                            <button type="button" className={styles.imageRemoveBtn}
                                onClick={e => { e.stopPropagation(); clearImage(kind); }}>✕</button>
                        </div>
                    ) : (
                        <div className={styles.imagePlaceholder}>
                            {isCover ? "Şəkil yükləmək üçün klikləyin" : "Brend loqosu yüklə"}
                            <br />
                            <small>WebP, JPEG, PNG</small>
                        </div>
                    )}
                </div>
            </>
        );
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Layihələrimiz</h1>
                    <p className={styles.subtitle}>
                        Layihələri buradan idarə edin. Sıranı sürükləyərək dəyişə bilərsiniz.
                        {reordering && <span className={styles.reorderingText}> Sıra saxlanılır...</span>}
                    </p>
                </div>
                <div className={styles.headerRight}>
                    <button type="button" className={styles.saveBtn} onClick={openNew}>+ Yeni Layihə</button>
                </div>
            </div>

            {loading ? (
                <p className={styles.empty}>Yüklənir...</p>
            ) : items.length === 0 ? (
                <div className={styles.empty}>
                    <p>Hələ heç bir layihə yoxdur</p>
                    <p>Yuxarıdakı &quot;Yeni Layihə&quot; düyməsinə klikləyin</p>
                </div>
            ) : (
                <div className={styles.tableWrap}>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th />
                                        <th>Layihə</th>
                                        <th>Brend</th>
                                        <th>Status</th>
                                        <th>Əməliyyatlar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <SortableRow key={item.id} item={item}
                                            onEdit={openEdit}
                                            onToggle={toggleVisibility}
                                            onDelete={setConfirmTarget} />
                                    ))}
                                </tbody>
                            </table>
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            {modalOpen && (
                <div className={styles.overlay} onClick={() => setModalOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{isNew ? "Yeni Layihə" : "Layihəni Düzəlt"}</h2>
                            <LangTabs styles={styles} active={activeLang} onChange={setActiveLang} />
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.field}>
                                <label>Başlıq ({activeLang.toUpperCase()})</label>
                                <input className={styles.input} value={form.title[activeLang] ?? ""}
                                    onChange={e => setForm(f => ({ ...f, title: { ...f.title, [activeLang]: e.target.value } }))} />
                            </div>

                            <div className={styles.field}>
                                <label>Slug</label>
                                <input className={styles.input} value={form.slug} placeholder="avtomatik yaranacaq"
                                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                            </div>

                            <div className={styles.field}>
                                <label>Şəkil</label>
                                {uploadArea("image")}
                            </div>

                            <div className={styles.field}>
                                <label>Brend şəkli</label>
                                {uploadArea("brandImage")}
                            </div>

                            <div className={styles.field}>
                                <label>Təsvir ({activeLang.toUpperCase()})</label>
                                <textarea className={styles.textarea} rows={3}
                                    value={form.description[activeLang] ?? ""}
                                    placeholder="Qısa təsvir"
                                    onChange={e => setForm(f => ({ ...f, description: { ...f.description, [activeLang]: e.target.value } }))} />
                            </div>

                            <div className={styles.field}>
                                <label>Brend ({activeLang.toUpperCase()})</label>
                                <input className={styles.input} value={form.brand[activeLang] ?? ""}
                                    placeholder="Reportage."
                                    onChange={e => setForm(f => ({ ...f, brand: { ...f.brand, [activeLang]: e.target.value } }))} />
                            </div>

                            <div className={styles.twoCol}>
                                <div className={styles.field}>
                                    <label>Brend mətn rəngi</label>
                                    {/* İki seçim üçün dropdown əvəzinə segmented control:
                                        hər iki variant və onların real rəngi eyni anda görünür. */}
                                    <div className={styles.swatchGroup} role="radiogroup" aria-label="Brend mətn rəngi">
                                        {([
                                            { value: "white", label: "Ağ", dot: styles.swatchWhite },
                                            { value: "black", label: "Qara", dot: styles.swatchBlack },
                                        ] as const).map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                role="radio"
                                                aria-checked={form.brandTextColor === opt.value}
                                                className={`${styles.swatchOption} ${form.brandTextColor === opt.value ? styles.swatchOptionActive : ""}`}
                                                onClick={() => setForm(f => ({ ...f, brandTextColor: opt.value }))}
                                            >
                                                <span className={`${styles.swatchDot} ${opt.dot}`} />
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.field}>
                                    <label>Sıra</label>
                                    <input className={styles.input} type="number" value={form.order}
                                        onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Görünürlük</label>
                                <button type="button"
                                    className={form.isVisible ? styles.activeToggle : styles.inactiveToggle}
                                    onClick={() => setForm(f => ({ ...f, isVisible: !f.isVisible }))}>
                                    {form.isVisible ? "Görünür" : "Gizli"}
                                </button>
                            </div>

                            <div className={styles.field}>
                                <label>Banklar</label>
                                <input className={styles.input} value={form.banks}
                                    placeholder="Kapital Bank, Pasha Bank"
                                    onChange={e => setForm(f => ({ ...f, banks: e.target.value }))} />
                            </div>

                            <div className={styles.field}>
                                <label>İnfrastruktur</label>
                                <input className={styles.input} value={form.infrastructure}
                                    placeholder="Hovuz, İdman zalı, Parkinq"
                                    onChange={e => setForm(f => ({ ...f, infrastructure: e.target.value }))} />
                            </div>

                            <div className={styles.field}>
                                <label>Satış şöbəsi</label>
                                <input className={styles.input} value={form.salesDepartment}
                                    placeholder="+994 50 123 45 67"
                                    onChange={e => setForm(f => ({ ...f, salesDepartment: e.target.value }))} />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Ləğv et</button>
                            <button type="button" className={styles.saveBtn}
                                disabled={saving || imageUploading || brandImageUploading}
                                onClick={handleSave}>
                                {saveLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={confirmTarget !== null}
                message="Bu layihə silinəcək:"
                subject={confirmTarget ? (lv(confirmTarget.title).az || confirmTarget.slug) : undefined}
                busy={deleting}
                onConfirm={handleDelete}
                onCancel={() => setConfirmTarget(null)}
            />
        </div>
    );
}
