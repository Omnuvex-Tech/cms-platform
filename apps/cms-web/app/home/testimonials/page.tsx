"use client";

import { useEffect, useRef, useState } from "react";
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
import styles from "@/styles/testimonials.module.css";

interface Testimonial {
    id: number;
    company: string;
    quote: string;
    name: string;
    role: string;
    image: string;
    order: number;
    altText: string;
}

interface Section {
    id: number;
    title: string;
    description: string;
    testimonials: Testimonial[];
}

const API = process.env.NEXT_PUBLIC_API_URL;

function toAbsoluteUrl(path: string): string {
    if (!path) return "";
    if (path.startsWith("blob:") || path.startsWith("http")) return path;
    return `${API}${path}`;
}

function getToken() {
    return document.cookie.split("access_token=")[1]?.split(";")[0] ?? "";
}

async function apiFetch(path: string, options?: RequestInit) {
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
            ...options?.headers,
        },
    });
    if (!res.ok) throw new Error("Xəta baş verdi");
    return res.json();
}

function SortableRow({
    t,
    index,
    onEdit,
    onDelete,
}: {
    t: Testimonial;
    index: number;
    onEdit: (t: Testimonial) => void;
    onDelete: (id: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: t.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? "#f0f7ff" : undefined,
    };

    return (
        <tr ref={setNodeRef} style={style}>
            <td className={styles.num}>
                <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
                {String(index + 1).padStart(2, "0")}
            </td>
            <td className={styles.company}>{t.company}</td>
            <td className={styles.quoteCell}>
                {t.quote.length > 60 ? t.quote.slice(0, 60) + "..." : t.quote}
            </td>
            <td>
                <div className={styles.authorCell}>
                    <img src={toAbsoluteUrl(t.image)} alt={t.name} className={styles.avatar} />
                    <div>
                        <p className={styles.authorName}>{t.name}</p>
                        <p className={styles.authorRole}>{t.role.slice(0, 40)}...</p>
                    </div>
                </div>
            </td>
            <td>
                <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => onEdit(t)}>Düzəlt</button>
                    <button className={styles.deleteBtn} onClick={() => onDelete(t.id)}>Sil</button>
                </div>
            </td>
        </tr>
    );
}

export default function TestimonialsPage() {
    const [section, setSection] = useState<Section | null>(null);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    // Section edit
    const [sectionTitle, setSectionTitle] = useState("");
    const [sectionDesc, setSectionDesc] = useState("");
    const [sectionSaving, setSectionSaving] = useState(false);

    // Testimonial modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<Testimonial | null>(null);
    const [company, setCompany] = useState("");
    const [quote, setQuote] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [image, setImage] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");
    const [altText, setAltText] = useState("");
    const [imageUploading, setImageUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [reordering, setReordering] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

    const load = async () => {
        setLoading(true);
        try {
            const data: Section = await apiFetch("/testimonials");
            if (data) {
                setSection(data);
                setSectionTitle(data.title);
                setSectionDesc(data.description);
                setTestimonials(data.testimonials);
            }
        } catch {
            setSection(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const saveSection = async () => {
        if (!sectionTitle.trim() || !sectionDesc.trim()) return;
        setSectionSaving(true);
        try {
            if (section) {
                await apiFetch(`/testimonials/section/${section.id}`, {
                    method: "PUT",
                    body: JSON.stringify({ title: sectionTitle, description: sectionDesc }),
                });
            } else {
                await apiFetch("/testimonials/section", {
                    method: "POST",
                    body: JSON.stringify({ title: sectionTitle, description: sectionDesc }),
                });
            }
            load();
        } finally {
            setSectionSaving(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = testimonials.findIndex((t) => t.id === active.id);
        const newIndex = testimonials.findIndex((t) => t.id === over.id);
        const newList = arrayMove(testimonials, oldIndex, newIndex);
        setTestimonials(newList);
        setReordering(true);
        try {
            await apiFetch("/testimonials/reorder", {
                method: "PATCH",
                body: JSON.stringify({ ids: newList.map((t) => t.id) }),
            });
        } finally {
            setReordering(false);
        }
    };

    // --- Image handlers ---
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "image/webp") {
            alert("Yalnız WebP formatında şəkil qəbul edilir (.webp)");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setImageFile(file);
        const localUrl = URL.createObjectURL(file);
        setImagePreview(localUrl);
    };


    const uploadImageIfNeeded = async (): Promise<string> => {
        // Yeni fayl seçilməyibsə mövcud URL-i qaytar
        if (!imageFile) return image;

        setImageUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", imageFile);

            const res = await fetch(`${API}/testimonials/upload`, {
                method: "POST",
                // Content-Type header-i ƏLAVƏ ETMƏ — browser multipart boundary-ni özü qoyur
                headers: { Authorization: `Bearer ${getToken()}` },
                body: formData,
            });
            if (!res.ok) throw new Error("Şəkil yükləmə uğursuz oldu");
            const data = await res.json();
            return data.url as string;
        } finally {
            setImageUploading(false);
        }
    };

    const resetImageState = () => {
        setImageFile(null);
        setImagePreview("");
        setImage("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const openCreate = () => {
        setEditItem(null);
        setCompany(""); setQuote(""); setName(""); setRole(""); setAltText("");
        resetImageState();
        setModalOpen(true);
    };

    const openEdit = (t: Testimonial) => {
        setEditItem(t);
        setCompany(t.company);
        setQuote(t.quote);
        setName(t.name);
        setRole(t.role);
        setImage(t.image);
        setImageFile(null);
        setImagePreview(t.image);
        setAltText(t.altText ?? "");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditItem(null);
    };

    const saveTestimonial = async () => {
        if (!company.trim() || !quote.trim() || !name.trim()) return;
        setSaving(true);
        try {
            const imageUrl = await uploadImageIfNeeded();
            if (editItem) {
                await apiFetch(`/testimonials/${editItem.id}`, {
                    method: "PUT",
                    body: JSON.stringify({ company, quote, name, role, image: imageUrl, altText }),
                });
            } else {
                await apiFetch("/testimonials", {
                    method: "POST",
                    body: JSON.stringify({
                        company,
                        quote,
                        name,
                        role,
                        image: imageUrl,
                        sectionId: section!.id,
                    }),
                });
            }
            closeModal();
            load();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await apiFetch(`/testimonials/${deleteId}`, { method: "DELETE" });
        setDeleteId(null);
        load();
    };

    if (loading) return <div className={styles.page}><div className={styles.empty}>Yüklənir...</div></div>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Müştəri Rəyləri</h1>
                    <p className={styles.subtitle}>Testimonialları idarə edin</p>
                </div>
                {section && (
                    <div className={styles.headerRight}>
                        {reordering && <span className={styles.reorderingText}>Saxlanır...</span>}
                        <button className={styles.addBtn} onClick={openCreate}>+ Yeni Testimonial</button>
                    </div>
                )}
            </div>

            {/* Section məlumatları */}
            <div className={styles.sectionCard}>
                <h2 className={styles.sectionCardTitle}>Bölmə Məlumatları</h2>
                <div className={styles.sectionFields}>
                    <div className={styles.field}>
                        <label>Başlıq</label>
                        <input
                            className={styles.input}
                            value={sectionTitle}
                            onChange={(e) => setSectionTitle(e.target.value)}
                            placeholder="Müştəri Rəyləri"
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Təsvir</label>
                        <textarea
                            className={styles.textarea}
                            value={sectionDesc}
                            onChange={(e) => setSectionDesc(e.target.value)}
                            placeholder="Bölmə təsviri..."
                            rows={3}
                        />
                    </div>
                </div>
                <div className={styles.sectionFooter}>
                    <button
                        className={styles.saveBtn}
                        onClick={saveSection}
                        disabled={sectionSaving}
                    >
                        {sectionSaving ? "Saxlanır..." : section ? "Yenilə" : "Yarat"}
                    </button>
                </div>
            </div>

            {/* Testimonials cədvəli */}
            {section && (
                <div className={styles.tableWrap}>
                    {testimonials.length === 0 ? (
                        <div className={styles.empty}>Hələ testimonial əlavə edilməyib</div>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Şirkət</th>
                                        <th>Sitat</th>
                                        <th>Müəllif</th>
                                        <th>Əməliyyatlar</th>
                                    </tr>
                                </thead>
                                <SortableContext items={testimonials.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                                    <tbody>
                                        {testimonials.map((t, i) => (
                                            <SortableRow key={t.id} t={t} index={i} onEdit={openEdit} onDelete={setDeleteId} />
                                        ))}
                                    </tbody>
                                </SortableContext>
                            </table>
                        </DndContext>
                    )}
                </div>
            )}

            {/* Testimonial Modal */}
            {modalOpen && (
                <div className={styles.overlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editItem ? "Testimonial Düzəlt" : "Yeni Testimonial"}</h2>
                            <button className={styles.closeBtn} onClick={closeModal}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.field}>
                                <label>Şirkət</label>
                                <input
                                    className={styles.input}
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="MAZDA"
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Sitat</label>
                                <textarea
                                    className={styles.textarea}
                                    value={quote}
                                    onChange={(e) => setQuote(e.target.value)}
                                    placeholder="Rəy mətni..."
                                    rows={3}
                                />
                            </div>
                            <div className={styles.twoCol}>
                                <div className={styles.field}>
                                    <label>Ad Soyad</label>
                                    <input
                                        className={styles.input}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Aşur Cəbiyev"
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Vəzifə</label>
                                    <input
                                        className={styles.input}
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        placeholder="CEO @ Company"
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Şəkil</label>

                                <input
                                    ref={fileInputRef}
                                    id="imageFileInput"
                                    type="file"
                                    accept="image/webp"
                                    style={{ display: "none" }}
                                    onChange={handleImageSelect}
                                />
                                <div
                                    className={styles.imageUploadArea}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <>
                                            <img src={toAbsoluteUrl(imagePreview)} alt="preview" className={styles.imagePreview} />
                                            <span className={styles.imageChangeHint}>
                                                Dəyişmək üçün klik et
                                            </span>
                                        </>
                                    ) : (
                                        <div className={styles.imagePlaceholder}>
                                            <span>🖼️</span>
                                            <span>Şəkil seçin</span>
                                            <small>JPG, PNG, WEBP • maks 2MB</small>
                                        </div>
                                    )}
                                </div>

                                {imageUploading && (
                                    <p className={styles.uploadingText}>Şəkil yüklənir...</p>
                                )}
                            </div>
                            <div className={styles.field}>
                                <label>Şəkil Alt Text <small>(SEO üçün)</small></label>
                                <input
                                    className={styles.input}
                                    value={altText}
                                    onChange={(e) => setAltText(e.target.value)}
                                    placeholder="Məsələn: Aşur Cəbiyev, MAZDA CEO portreti"
                                />
                            </div>

                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={closeModal}>Ləğv et</button>
                            <button
                                className={styles.saveBtn}
                                onClick={saveTestimonial}
                                disabled={saving || imageUploading}
                            >
                                {saving ? "Saxlanır..." : imageUploading ? "Şəkil yüklənir..." : "Saxla"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Silmə təsdiq modalı */}
            {deleteId && (
                <div className={styles.overlay} onClick={() => setDeleteId(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Silməyi təsdiq edin</h2>
                            <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Bu testimonialı silmək istədiyinizə əminsiniz?</p>
                        </div>
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