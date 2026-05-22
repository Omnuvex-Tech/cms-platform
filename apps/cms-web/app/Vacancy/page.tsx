"use client";

import { useEffect, useState } from "react";
import {
    DndContext, closestCenter, PointerSensor,
    useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext, verticalListSortingStrategy,
    useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/vacancy.module.css";

type BulletType = "BULLET" | "NUMBERED" | "DASH";
type ModalTab = "main" | "detail";

interface VacancyCategory { id: number; name: string; order: number; }
interface Vacancy {
    id: number; title: string; slug: string; tags: string[];
    isNew: boolean; newLabel: string | null; isVisible: boolean;
    order: number; categoryId: number; category: VacancyCategory;
    startDate: string | null; isStartDateVisible: boolean;
    closingDate: string | null; isDateVisible: boolean; aboutRole: string | null; skills: string[];
    responsible: string[]; responsibleType: BulletType;
    requirements: string[]; requirementsType: BulletType;
}

const API = process.env.NEXT_PUBLIC_API_URL;

function getToken() { return document.cookie.split("access_token=")[1]?.split(";")[0] ?? ""; }

function generateSlug(title: string) {
    return title
        .toLowerCase()
        .replace(/ə/g, "e").replace(/ğ/g, "g").replace(/ı/g, "i")
        .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-").trim();
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
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

// ─── Sortable Category Row ───────────────────────────────
function SortableCategoryRow({ cat, index, onEdit, onDelete }: {
    cat: VacancyCategory; index: number;
    onEdit: (c: VacancyCategory) => void;
    onDelete: (id: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
    return (
        <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
            <td className={styles.num}>
                <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
                {String(index + 1).padStart(2, "0")}
            </td>
            <td>{cat.name}</td>
            <td>
                <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => onEdit(cat)}>Düzəlt</button>
                    <button className={styles.deleteBtn} onClick={() => onDelete(cat.id)}>Sil</button>
                </div>
            </td>
        </tr>
    );
}

// ─── Sortable Vacancy Row ────────────────────────────────
function SortableVacancyRow({ v, index, onEdit, onDelete, onToggleVisibility, onToggleNew }: {
    v: Vacancy; index: number;
    onEdit: (v: Vacancy) => void; onDelete: (id: number) => void;
    onToggleVisibility: (id: number, val: boolean) => void;
    onToggleNew: (id: number, val: boolean) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: v.id });
    return (
        <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
            <td className={styles.num}>
                <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
                {String(index + 1).padStart(2, "0")}
            </td>
            <td>
                <div>
                    <div>{v.title}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>/{v.slug}</div>
                </div>
            </td>
            <td>{v.category.name}</td>
            <td>
                <div className={styles.tagsCell}>
                    {v.tags.slice(0, 2).map((tag, i) => <span key={i} className={styles.tag}>{tag}</span>)}
                    {v.tags.length > 2 && <span className={styles.tag}>+{v.tags.length - 2}</span>}
                </div>
            </td>
            <td>
                <span className={v.newLabel ? styles.activeToggle : styles.inactiveToggle}>
                    {v.newLabel || "—"}
                </span>
            </td>
            <td>
                <button
                    className={v.isVisible ? styles.activeToggle : styles.inactiveToggle}
                    onClick={() => onToggleVisibility(v.id, !v.isVisible)}>
                    {v.isVisible ? "Görünür" : "Gizli"}
                </button>
            </td>
            <td>
                <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => onEdit(v)}>Düzəlt</button>
                    <button className={styles.deleteBtn} onClick={() => onDelete(v.id)}>Sil</button>
                </div>
            </td>
        </tr>
    );
}

// ─── Tag Input ───────────────────────────────────────────
function TagInput({ label, items, setItems, placeholder, large }: {
    label: string; items: string[];
    setItems: (v: string[]) => void; placeholder?: string; large?: boolean;
}) {
    const [input, setInput] = useState("");
    const add = () => {
        const t = input.trim();
        if (!t) return;
        setItems([...items, t]);
        setInput("");
    };
    return (
        <div className={styles.field}>
            <label>{label}</label>
            <div className={styles.tagInputRow}>
                {large ? (
                    <textarea
                        className={`${styles.input} ${styles.textarea}`}
                        rows={3}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); add(); } }}
                        placeholder={placeholder ?? "Enter ilə əlavə et"}
                    />
                ) : (
                    <input
                        className={styles.input}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
                        placeholder={placeholder ?? "Enter ilə əlavə et"}
                    />
                )}
                <button className={styles.addTagBtn} type="button" onClick={add}>+</button>
            </div>
            {items.length > 0 && (
                <div className={styles.tagList}>
                    {items.map((item, i) => (
                        <span key={i} className={styles.tagChip}>
                            {item}
                            <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>✕</button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Vacancy Modal ───────────────────────────────────────
function VacancyModal({ open, onClose, editVac, categories, onSaved }: {
    open: boolean; onClose: () => void;
    editVac: Vacancy | null; categories: VacancyCategory[];
    onSaved: () => void;
}) {
    const [tab, setTab] = useState<ModalTab>("main");
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [tags, setTags] = useState<string[]>([]);
    const [newLabel, setNewLabel] = useState("");
    const [isVisible, setIsVisible] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [isStartDateVisible, setIsStartDateVisible] = useState(true);
    const [closingDate, setClosingDate] = useState("");
    const [isDateVisible, setIsDateVisible] = useState(true);
    const [aboutRole, setAboutRole] = useState("");
    const [responsible, setResponsible] = useState<string[]>([]);
    const [responsibleType, setResponsibleType] = useState<BulletType>("BULLET");
    const [requirements, setRequirements] = useState<string[]>([]);
    const [requirementsType, setRequirementsType] = useState<BulletType>("BULLET");

    useEffect(() => {
        if (!open) return;
        setTab("main");
        if (editVac) {
            setTitle(editVac.title);
            setSlug(editVac.slug ?? "");
            setCategoryId(editVac.categoryId);
            setTags(editVac.tags);
            setNewLabel(editVac.newLabel ?? "");
            setIsVisible(editVac.isVisible);
            setStartDate(editVac.startDate ? editVac.startDate.slice(0, 10) : "");
            setIsStartDateVisible(editVac.isStartDateVisible);
            setClosingDate(editVac.closingDate ? editVac.closingDate.slice(0, 10) : "");
            setIsDateVisible(editVac.isDateVisible);
            setAboutRole(editVac.aboutRole ?? "");
            setResponsible(editVac.responsible);
            setResponsibleType(editVac.responsibleType);
            setRequirements(editVac.requirements);
            setRequirementsType(editVac.requirementsType);
        } else {
            setTitle(""); setSlug(""); setCategoryId(""); setTags([]);
            setNewLabel(""); setIsVisible(true);
            setStartDate(""); setIsStartDateVisible(true);
            setClosingDate(""); setIsDateVisible(true);
            setAboutRole("");
            setResponsible([]); setResponsibleType("BULLET");
            setRequirements([]); setRequirementsType("BULLET");
        }
    }, [open, editVac]);

    const handleTitleChange = (val: string) => {
        setTitle(val);
        setSlug(generateSlug(val));
    };

    const save = async () => {
        if (!title.trim() || !categoryId) return;
        setSaving(true);
        try {
            const body = {
                title,
                slug,
                categoryId: Number(categoryId),
                tags,
                skills: tags,
                newLabel: newLabel || null,
                isNew: !!newLabel,
                isVisible,
                startDate: startDate || null,
                isStartDateVisible,
                closingDate: closingDate || null,
                isDateVisible,
                aboutRole: aboutRole || null,
                responsible,
                responsibleType,
                requirements,
                requirementsType,
            };
            if (editVac) {
                await apiFetch(`/vacancy/${editVac.id}`, { method: "PUT", body: JSON.stringify(body) });
            } else {
                await apiFetch("/vacancy", { method: "POST", body: JSON.stringify(body) });
            }
            onSaved();
            onClose();
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    const bulletOptions = [
        { value: "BULLET", label: "• Nöqtəli" },
        { value: "NUMBERED", label: "1. Nömrəli" },
        { value: "DASH", label: "- Tire" },
    ];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{editVac ? "Vakansiyanı Düzəlt" : "Yeni Vakansiya"}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.modalTabs}>
                    <button className={tab === "main" ? styles.tabActive : styles.tabInactive}
                        onClick={() => setTab("main")}>Əsas məlumat</button>
                    <button className={tab === "detail" ? styles.tabActive : styles.tabInactive}
                        onClick={() => setTab("detail")}>Detail səhifəsi</button>
                </div>

                <div className={styles.modalBody}>
                    {tab === "main" && (
                        <>
                            <div className={styles.twoCol}>
                                <div className={styles.field}>
                                    <label>Başlıq *</label>
                                    <input className={styles.input} value={title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        placeholder="Senior UI/UX Designer" />
                                </div>
                                <div className={styles.field}>
                                    <label>Slug</label>
                                    <input className={styles.input} value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="senior-ui-ux-designer" />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Kateqoriya *</label>
                                <select className={styles.input} value={categoryId}
                                    onChange={(e) => setCategoryId(Number(e.target.value))}>
                                    <option value="">Seçin...</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <TagInput label="Taqlər / Skills" items={tags} setItems={setTags}
                                placeholder="Full time, Remote, Senior level..." />

                            <div className={styles.field}>
                                <label>Badge mətni <span className={styles.hint}>(boş olsa badge görünməz)</span></label>
                                <input className={styles.input} value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    placeholder="NEW, Açıqdır, Tezliklə..." />
                            </div>

                            <div className={styles.twoCol}>
                                <div className={styles.field}>
                                    <label>Başlama tarixi</label>
                                    <input type="date" className={styles.input} value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label>Başlama tarixini göstər</label>
                                    <button className={isStartDateVisible ? styles.activeToggle : styles.inactiveToggle}
                                        onClick={() => setIsStartDateVisible(!isStartDateVisible)}>
                                        {isStartDateVisible ? "Görünür" : "Gizli"}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.twoCol}>
                                <div className={styles.field}>
                                    <label>Bağlanma tarixi</label>
                                    <input type="date" className={styles.input} value={closingDate}
                                        onChange={(e) => setClosingDate(e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label>Bağlanma tarixini göstər</label>
                                    <button className={isDateVisible ? styles.activeToggle : styles.inactiveToggle}
                                        onClick={() => setIsDateVisible(!isDateVisible)}>
                                        {isDateVisible ? "Görünür" : "Gizli"}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Vakansiya görünüşü</label>
                                <button className={isVisible ? styles.activeToggle : styles.inactiveToggle}
                                    onClick={() => setIsVisible(!isVisible)}>
                                    {isVisible ? "Görünür" : "Gizli"}
                                </button>
                            </div>
                        </>
                    )}

                    {tab === "detail" && (
                        <>
                            <div className={styles.field}>
                                <label>About the Role</label>
                                <textarea className={styles.textarea} rows={5} value={aboutRole}
                                    onChange={(e) => setAboutRole(e.target.value)}
                                    placeholder="Vakansiya haqqında ümumi məlumat..." />
                            </div>
                            <div className={styles.field}>
                                <label>Responsible — siyahı tipi</label>
                                <select className={styles.input} value={responsibleType}
                                    onChange={(e) => setResponsibleType(e.target.value as BulletType)}>
                                    {bulletOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <TagInput label="Responsible" items={responsible} setItems={setResponsible}
                                placeholder="Item əlavə et... (Enter ilə)" large />
                            <div className={styles.field}>
                                <label>Requirements — siyahı tipi</label>
                                <select className={styles.input} value={requirementsType}
                                    onChange={(e) => setRequirementsType(e.target.value as BulletType)}>
                                    {bulletOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <TagInput label="Requirements" items={requirements} setItems={setRequirements}
                                placeholder="Item əlavə et... (Enter ilə)" large />
                        </>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Ləğv et</button>
                    <button className={styles.saveBtn} onClick={save} disabled={saving}>
                        {saving ? "Saxlanır..." : "Saxla"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────
export default function VacancyPage() {
    const [loading, setLoading] = useState(true);
    const [headerTitle, setHeaderTitle] = useState("");
    const [headerSaving, setHeaderSaving] = useState(false);
    const [categories, setCategories] = useState<VacancyCategory[]>([]);
    const [catModalOpen, setCatModalOpen] = useState(false);
    const [editCat, setEditCat] = useState<VacancyCategory | null>(null);
    const [catName, setCatName] = useState("");
    const [catSaving, setCatSaving] = useState(false);
    const [deleteCatId, setDeleteCatId] = useState<number | null>(null);
    const [catReordering, setCatReordering] = useState(false);
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [vacModalOpen, setVacModalOpen] = useState(false);
    const [editVac, setEditVac] = useState<Vacancy | null>(null);
    const [deleteVacId, setDeleteVacId] = useState<number | null>(null);
    const [vacReordering, setVacReordering] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

    const load = async () => {
        setLoading(true);
        try {
            const [headerData, catsData, vacsData] = await Promise.all([
                apiFetch("/vacancy/header"),
                apiFetch("/vacancy/categories"),
                apiFetch("/vacancy"),
            ]);
            setHeaderTitle(headerData?.title ?? "");
            setCategories(catsData ?? []);
            setVacancies(vacsData ?? []);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const saveHeader = async () => {
        if (!headerTitle.trim()) return;
        setHeaderSaving(true);
        try {
            await apiFetch("/vacancy/header", { method: "PUT", body: JSON.stringify({ title: headerTitle }) });
        } finally { setHeaderSaving(false); }
    };

    const handleCatDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const newList = arrayMove(categories,
            categories.findIndex((c) => c.id === active.id),
            categories.findIndex((c) => c.id === over.id));
        setCategories(newList);
        setCatReordering(true);
        try {
            await apiFetch("/vacancy/categories/reorder", {
                method: "PUT",
                body: JSON.stringify({ items: newList.map((c, i) => ({ id: c.id, order: i })) }),
            });
        } finally { setCatReordering(false); }
    };

    const handleVacDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const newList = arrayMove(vacancies,
            vacancies.findIndex((v) => v.id === active.id),
            vacancies.findIndex((v) => v.id === over.id));
        setVacancies(newList);
        setVacReordering(true);
        try {
            await apiFetch("/vacancy/reorder", {
                method: "PUT",
                body: JSON.stringify({ items: newList.map((v, i) => ({ id: v.id, order: i })) }),
            });
        } finally { setVacReordering(false); }
    };

    const saveCat = async () => {
        if (!catName.trim()) return;
        setCatSaving(true);
        try {
            if (editCat) {
                await apiFetch(`/vacancy/categories/${editCat.id}`, { method: "PUT", body: JSON.stringify({ name: catName }) });
            } else {
                await apiFetch("/vacancy/categories", { method: "POST", body: JSON.stringify({ name: catName }) });
            }
            setCatModalOpen(false); load();
        } finally { setCatSaving(false); }
    };

    const handleDeleteCat = async () => {
        if (!deleteCatId) return;
        await apiFetch(`/vacancy/categories/${deleteCatId}`, { method: "DELETE" });
        setDeleteCatId(null); load();
    };

    const handleDeleteVac = async () => {
        if (!deleteVacId) return;
        await apiFetch(`/vacancy/${deleteVacId}`, { method: "DELETE" });
        setDeleteVacId(null); load();
    };

    const toggleVisibility = async (id: number, val: boolean) => {
        setVacancies((prev) => prev.map((v) => v.id === id ? { ...v, isVisible: val } : v));
        await apiFetch(`/vacancy/${id}/visibility`, { method: "PATCH", body: JSON.stringify({ isVisible: val }) });
    };

    const toggleNew = async (id: number, val: boolean) => {
        setVacancies((prev) => prev.map((v) => v.id === id ? { ...v, isNew: val } : v));
        await apiFetch(`/vacancy/${id}/new`, { method: "PATCH", body: JSON.stringify({ isNew: val }) });
    };

    if (loading) return <div className={styles.page}><div className={styles.empty}>Yüklənir...</div></div>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Vakansiyalar</h1>
                    <p className={styles.subtitle}>Vakansiya səhifəsini idarə edin</p>
                </div>
            </div>

            <div className={styles.sectionCard}>
                <h2 className={styles.sectionCardTitle}>Səhifə Başlığı</h2>
                <div className={styles.field}>
                    <label>Başlıq</label>
                    <input className={styles.input} value={headerTitle}
                        onChange={(e) => setHeaderTitle(e.target.value)} placeholder="Vakansiyalar" />
                </div>
                <div className={styles.sectionFooter}>
                    <button className={styles.saveBtn} onClick={saveHeader} disabled={headerSaving}>
                        {headerSaving ? "Saxlanır..." : "Yadda saxla"}
                    </button>
                </div>
            </div>

            <div className={styles.sectionCard}>
                <div className={styles.sectionCardHeader}>
                    <h2 className={styles.sectionCardTitle}>Kateqoriyalar</h2>
                    <div className={styles.headerRight}>
                        {catReordering && <span className={styles.reorderingText}>Saxlanır...</span>}
                        <button className={styles.addBtn}
                            onClick={() => { setEditCat(null); setCatName(""); setCatModalOpen(true); }}>
                            + Yeni Kateqoriya
                        </button>
                    </div>
                </div>
                {categories.length === 0 ? (
                    <div className={styles.empty}>Hələ kateqoriya yoxdur</div>
                ) : (
                    <div className={styles.tableWrap}>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCatDragEnd}>
                            <table className={styles.table}>
                                <thead><tr><th>#</th><th>Ad</th><th>Əməliyyatlar</th></tr></thead>
                                <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                                    <tbody>
                                        {categories.map((cat, i) => (
                                            <SortableCategoryRow key={cat.id} cat={cat} index={i}
                                                onEdit={(c) => { setEditCat(c); setCatName(c.name); setCatModalOpen(true); }}
                                                onDelete={setDeleteCatId} />
                                        ))}
                                    </tbody>
                                </SortableContext>
                            </table>
                        </DndContext>
                    </div>
                )}
            </div>

            <div className={styles.sectionCard}>
                <div className={styles.sectionCardHeader}>
                    <h2 className={styles.sectionCardTitle}>Vakansiyalar</h2>
                    <div className={styles.headerRight}>
                        {vacReordering && <span className={styles.reorderingText}>Saxlanır...</span>}
                        <button className={styles.addBtn}
                            onClick={() => { setEditVac(null); setVacModalOpen(true); }}>
                            + Yeni Vakansiya
                        </button>
                    </div>
                </div>
                {vacancies.length === 0 ? (
                    <div className={styles.empty}>Hələ vakansiya yoxdur</div>
                ) : (
                    <div className={styles.tableWrap}>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleVacDragEnd}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>#</th><th>Başlıq</th><th>Kateqoriya</th>
                                        <th>Taqlər</th><th>Badge</th><th>Görünüş</th><th>Əməliyyatlar</th>
                                    </tr>
                                </thead>
                                <SortableContext items={vacancies.map((v) => v.id)} strategy={verticalListSortingStrategy}>
                                    <tbody>
                                        {vacancies.map((v, i) => (
                                            <SortableVacancyRow key={v.id} v={v} index={i}
                                                onEdit={(vac) => { setEditVac(vac); setVacModalOpen(true); }}
                                                onDelete={setDeleteVacId}
                                                onToggleVisibility={toggleVisibility}
                                                onToggleNew={toggleNew} />
                                        ))}
                                    </tbody>
                                </SortableContext>
                            </table>
                        </DndContext>
                    </div>
                )}
            </div>

            <VacancyModal
                open={vacModalOpen}
                onClose={() => setVacModalOpen(false)}
                editVac={editVac}
                categories={categories}
                onSaved={load}
            />

            {catModalOpen && (
                <div className={styles.overlay} onClick={() => setCatModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editCat ? "Kateqoriyanı Düzəlt" : "Yeni Kateqoriya"}</h2>
                            <button className={styles.closeBtn} onClick={() => setCatModalOpen(false)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.field}>
                                <label>Ad</label>
                                <input className={styles.input} value={catName}
                                    onChange={(e) => setCatName(e.target.value)} placeholder="SMM, Motion..." />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setCatModalOpen(false)}>Ləğv et</button>
                            <button className={styles.saveBtn} onClick={saveCat} disabled={catSaving}>
                                {catSaving ? "Saxlanır..." : "Saxla"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteCatId && (
                <div className={styles.overlay} onClick={() => setDeleteCatId(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Kateqoriyanı sil</h2>
                            <button className={styles.closeBtn} onClick={() => setDeleteCatId(null)}>✕</button>
                        </div>
                        <div className={styles.modalBody}><p>Bu kateqoriyanı silmək istədiyinizə əminsiniz?</p></div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setDeleteCatId(null)}>Ləğv et</button>
                            <button className={styles.deleteConfirmBtn} onClick={handleDeleteCat}>Sil</button>
                        </div>
                    </div>
                </div>
            )}

            {deleteVacId && (
                <div className={styles.overlay} onClick={() => setDeleteVacId(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Vakansiyanı sil</h2>
                            <button className={styles.closeBtn} onClick={() => setDeleteVacId(null)}>✕</button>
                        </div>
                        <div className={styles.modalBody}><p>Bu vakansiyanı silmək istədiyinizə əminsiniz?</p></div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setDeleteVacId(null)}>Ləğv et</button>
                            <button className={styles.deleteConfirmBtn} onClick={handleDeleteVac}>Sil</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}