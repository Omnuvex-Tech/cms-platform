"use client";

import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import {
    DndContext, closestCenter, PointerSensor,
    useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext, verticalListSortingStrategy,
    useSortable, arrayMove, horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/service.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;

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

async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API}/services/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
    });
    if (!res.ok) throw new Error("Fayl yükləmə uğursuz");
    const data = await res.json();
    return data.url;
}

function toAbsUrl(path: string) {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${API}${path}`;
}

function generateSlug(title: string) {
    return title
        .toLowerCase()
        .replace(/<[^>]*>/g, "")
        .replace(/ə/g, "e").replace(/ğ/g, "g").replace(/ı/g, "i")
        .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-").trim();
}

function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const editor = useEditor({
        extensions: [StarterKit, Underline, Heading.configure({ levels: [1, 2, 3, 4, 5, 6] })],
        content: value,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    return (
        <div className={styles.richEditor}>
            <div className={styles.richToolbar}>
                {[
                    { label: <b>B</b>, action: () => editor?.chain().focus().toggleBold().run(), key: "bold" },
                    { label: <i>I</i>, action: () => editor?.chain().focus().toggleItalic().run(), key: "italic" },
                    { label: <u>U</u>, action: () => editor?.chain().focus().toggleUnderline().run(), key: "underline" },
                ].map(({ label, action, key }) => (
                    <button key={key} type="button"
                        className={editor?.isActive(key) ? styles.toolbarBtnActive : styles.toolbarBtn}
                        onClick={action}>{label}</button>
                ))}
                <div className={styles.toolbarDivider} />
                {([1, 2, 3, 4, 5, 6] as const).map(level => (
                    <button key={level} type="button"
                        className={editor?.isActive("heading", { level }) ? styles.toolbarBtnActive : styles.toolbarBtn}
                        onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}>
                        H{level}
                    </button>
                ))}
                <button type="button"
                    className={editor?.isActive("paragraph") ? styles.toolbarBtnActive : styles.toolbarBtn}
                    onClick={() => editor?.chain().focus().setParagraph().run()}>P</button>
            </div>
            <EditorContent editor={editor} className={styles.richContent} />
        </div>
    );
}

function SingleImageUpload({ value, onChange, accept = "image/webp", label }: {
    value: string; onChange: (url: string) => void; accept?: string; label?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.match(/image\/(webp|gif)/)) { alert("Yalnız WebP və ya GIF"); return; }
        const url = await uploadFile(file);
        onChange(url);
        if (inputRef.current) inputRef.current.value = "";
    };
    return (
        <div className={styles.field}>
            {label && <label>{label}</label>}
            <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={handleSelect} />
            <div className={styles.singleUploadArea} onClick={() => inputRef.current?.click()}>
                {value ? (
                    <div className={styles.singleUploadPreviewWrap}>
                        <img src={toAbsUrl(value)} alt="" className={styles.singleUploadPreview} />
                        <button type="button" className={styles.imageRemoveBtn}
                            onClick={e => { e.stopPropagation(); onChange(""); }}>✕</button>
                    </div>
                ) : (
                    <div className={styles.imagePlaceholder}>
                        <span>🖼️</span><span>{label ?? "Şəkil seçin"}</span><small>{accept.includes("gif") ? "WebP / GIF" : "WebP"}</small>
                    </div>
                )}
            </div>
        </div>
    );
}

function SortableFeatureRow({ id, feature, onChange, onRemove }: {
    id: string; feature: any;
    onChange: (key: string, val: string) => void; onRemove: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    return (
        <div ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            className={styles.featureRow}>
            <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
            <input className={styles.input} value={feature.label ?? ""} placeholder="Feature mətni"
                onChange={e => onChange("label", e.target.value)} />
            <button type="button" className={styles.removeBtn} onClick={onRemove}>✕</button>
        </div>
    );
}

function HeroSectionEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    const stats = data.stats ?? [];
    const sensors = useSensors(useSensor(PointerSensor));

    const addStat = () => onChange({ ...data, stats: [...stats, { label: "", value: "", icon: "" }] });
    const removeStat = (i: number) => onChange({ ...data, stats: stats.filter((_: any, idx: number) => idx !== i) });
    const updateStat = (i: number, key: string, val: string) => {
        const arr = [...stats]; arr[i] = { ...arr[i], [key]: val };
        onChange({ ...data, stats: arr });
    };

    const handleStatDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oi = stats.findIndex((_: any, i: number) => `stat-${i}` === active.id);
        const ni = stats.findIndex((_: any, i: number) => `stat-${i}` === over.id);
        onChange({ ...data, stats: arrayMove(stats, oi, ni) });
    };

    return (
        <div className={styles.sectionFields}>
            <div className={styles.field}><label>Badge</label>
                <input className={styles.input} value={data.badge ?? ""} placeholder="Brendinq"
                    onChange={e => onChange({ ...data, badge: e.target.value })} />
            </div>
            <div className={styles.field}><label>Başlıq</label>
                <RichEditor value={data.title ?? ""} onChange={v => onChange({ ...data, title: v })} />
            </div>
            <div className={styles.field}><label>Təsvir 1</label>
                <RichEditor value={data.descriptions?.[0] ?? ""} onChange={v => onChange({ ...data, descriptions: [v, data.descriptions?.[1] ?? ""] })} />
            </div>
            <div className={styles.field}><label>Təsvir 2(optional)</label>
                <RichEditor value={data.descriptions?.[1] ?? ""} onChange={v => onChange({ ...data, descriptions: [data.descriptions?.[0] ?? "", v] })} />
            </div>
            <SingleImageUpload label="Hero şəkil (yuxarı)" value={data.heroImage ?? ""} onChange={v => onChange({ ...data, heroImage: v })} />
            <div className={styles.field}><label>Hero şəkil alt mətn</label>
                <input className={styles.input} value={data.heroImageAlt ?? ""} onChange={e => onChange({ ...data, heroImageAlt: e.target.value })} />
            </div>
            <SingleImageUpload label="Alt şəkil (aşağı)" value={data.bottomImage ?? ""} onChange={v => onChange({ ...data, bottomImage: v })} />
            <div className={styles.field}><label>Alt şəkilin alt mətni</label>
                <input className={styles.input} value={data.bottomImageAlt ?? ""} onChange={e => onChange({ ...data, bottomImageAlt: e.target.value })} />
            </div>
            <div className={styles.field}><label>Quote mətni</label>
                <RichEditor value={data.quoteText ?? ""} onChange={v => onChange({ ...data, quoteText: v })} />
            </div>
            <div className={styles.field}>
                <label>Statistikalar <small>(sürüşdürüb sırala)</small></label>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleStatDragEnd}>
                    <SortableContext items={stats.map((_: any, i: number) => `stat-${i}`)} strategy={verticalListSortingStrategy}>
                        {stats.map((stat: any, i: number) => (
                            <SortableStatRow key={`stat-${i}`} id={`stat-${i}`} stat={stat}
                                onChange={(key, val) => updateStat(i, key, val)}
                                onRemove={() => removeStat(i)} />
                        ))}
                    </SortableContext>
                </DndContext>
                <button type="button" className={styles.addRowBtn} onClick={addStat}>+ Stat əlavə et</button>
            </div>
        </div>
    );
}

function SortableStatRow({ id, stat, onChange, onRemove }: {
    id: string; stat: any;
    onChange: (key: string, val: string) => void; onRemove: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const inputRef = useRef<HTMLInputElement>(null);

    const handleIconSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!['image/webp', 'image/svg+xml'].includes(file.type)) {
            alert("Yalnız WebP və ya SVG"); return;
        }
        const url = await uploadFile(file);
        onChange("icon", url);
    };
    return (
        <div ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            className={styles.statRow}>
            <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
            <div className={styles.statIconWrap} onClick={() => inputRef.current?.click()}>
                {stat.icon ? <img src={toAbsUrl(stat.icon)} alt="" className={styles.statIcon} /> : <span className={styles.statIconPlaceholder}>+</span>}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/webp,image/svg+xml"
                    style={{ display: "none" }}
                    onChange={handleIconSelect}
                />            </div>
            <input className={styles.inputSmall} value={stat.label ?? ""} placeholder="Label" onChange={e => onChange("label", e.target.value)} />
            <input className={styles.inputSmall} value={stat.value ?? ""} placeholder="Dəyər" onChange={e => onChange("value", e.target.value)} />
            <button type="button" className={styles.removeBtn} onClick={onRemove}>✕</button>
        </div>
    );
}

function ContentSectionEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    const items = data.items ?? [];

    const addItem = () => onChange({ ...data, items: [...items, { number: "", badge: "", title: "", descriptions: [], quote: "", quoteImage: "", subText: "", image: "", imageAlt: "" }] });
    const removeItem = (i: number) => onChange({ ...data, items: items.filter((_: any, idx: number) => idx !== i) });
    const updateItem = (i: number, key: string, val: any) => {
        const arr = [...items]; arr[i] = { ...arr[i], [key]: val };
        onChange({ ...data, items: arr });
    };

    return (
        <div className={styles.sectionFields}>
            {items.map((item: any, i: number) => (
                <div key={i} className={styles.contentItemBlock}>
                    <div className={styles.contentItemHeader}>
                        <span className={styles.contentItemLabel}>Item #{i + 1}</span>
                        <button type="button" className={styles.removeBtn} onClick={() => removeItem(i)}>✕</button>
                    </div>
                    <div className={styles.twoCol}>
                        <div className={styles.field}><label>Nömrə</label>
                            <input className={styles.input} value={item.number ?? ""} placeholder="01" onChange={e => updateItem(i, "number", e.target.value)} />
                        </div>
                        <div className={styles.field}><label>Badge</label>
                            <input className={styles.input} value={item.badge ?? ""} placeholder="Brendinq" onChange={e => updateItem(i, "badge", e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.field}><label>Başlıq</label>
                        <RichEditor value={item.title ?? ""} onChange={v => updateItem(i, "title", v)} />
                    </div>
                    <div className={styles.field}><label>Təsvir 1</label>
                        <RichEditor value={item.descriptions?.[0] ?? ""} onChange={v => updateItem(i, "descriptions", [v, item.descriptions?.[1] ?? ""])} />
                    </div>
                    <div className={styles.field}><label>Təsvir 2 (optional)</label>
                        <RichEditor value={item.descriptions?.[1] ?? ""} onChange={v => updateItem(i, "descriptions", [item.descriptions?.[0] ?? "", v])} />
                    </div>

                    {i === 0 && <>
                        <div className={styles.field}><label>Sitat mətni</label>
                            <RichEditor value={item.quote ?? ""} onChange={v => updateItem(i, "quote", v)} />
                        </div>
                        <SingleImageUpload label="Sitat şəkli" value={item.quoteImage ?? ""} onChange={v => updateItem(i, "quoteImage", v)} />
                        <div className={styles.field}><label>Kiçik sitat (subText)</label>
                            <RichEditor value={item.subText ?? ""} onChange={v => updateItem(i, "subText", v)} />
                        </div>
                    </>}

                    {i !== 0 && <>
                        <SingleImageUpload label="Alt şəkil" value={item.image ?? ""} onChange={v => updateItem(i, "image", v)} />
                        <div className={styles.field}><label>Alt mətni</label>
                            <input className={styles.input} value={item.imageAlt ?? ""} onChange={e => updateItem(i, "imageAlt", e.target.value)} />
                        </div>
                    </>}
                </div>
            ))}
            <button type="button" className={styles.addRowBtn} onClick={addItem}>+ Item əlavə et</button>
        </div>
    );
}

function QuoteSectionEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    return (
        <div className={styles.sectionFields}>
            <div className={styles.twoCol}>
                <div className={styles.field}><label>Nömrə</label>
                    <input className={styles.input} value={data.number ?? ""} placeholder="03" onChange={e => onChange({ ...data, number: e.target.value })} />
                </div>
                <div className={styles.field}><label>Badge</label>
                    <input className={styles.input} value={data.badge ?? ""} onChange={e => onChange({ ...data, badge: e.target.value })} />
                </div>
            </div>
            <div className={styles.field}><label>Başlıq</label>
                <RichEditor value={data.title ?? ""} onChange={v => onChange({ ...data, title: v })} />
            </div>
            <div className={styles.field}><label>Təsvir 1</label>
                <RichEditor value={data.descriptions?.[0] ?? ""} onChange={v => onChange({ ...data, descriptions: [v, data.descriptions?.[1] ?? "", data.descriptions?.[2] ?? ""] })} />
            </div>
            <div className={styles.field}><label>Təsvir 2(optional)</label>
                <RichEditor value={data.descriptions?.[1] ?? ""} onChange={v => onChange({ ...data, descriptions: [data.descriptions?.[0] ?? "", v, data.descriptions?.[2] ?? ""] })} />
            </div>
            <div className={styles.field}><label>Təsvir 3(optional)</label>
                <RichEditor value={data.descriptions?.[2] ?? ""} onChange={v => onChange({ ...data, descriptions: [data.descriptions?.[0] ?? "", data.descriptions?.[1] ?? "", v] })} />
            </div>
            <div className={styles.field}><label>Sitat mətni</label>
                <RichEditor value={data.quoteText ?? ""} onChange={v => onChange({ ...data, quoteText: v })} />
            </div>
            <SingleImageUpload label="Sitat şəkli" value={data.quoteImage ?? ""} onChange={v => onChange({ ...data, quoteImage: v })} />
            <div className={styles.field}><label>Sitat şəkil alt mətn</label>
                <input className={styles.input} value={data.quoteImageAlt ?? ""} onChange={e => onChange({ ...data, quoteImageAlt: e.target.value })} />
            </div>
        </div>
    );
}

function OverlaySectionEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    return (
        <div className={styles.sectionFields}>
            <div className={styles.field}><label>Badge</label>
                <input className={styles.input} value={data.badge ?? ""} onChange={e => onChange({ ...data, badge: e.target.value })} />
            </div>
            <div className={styles.field}><label>Başlıq</label>
                <RichEditor value={data.title ?? ""} onChange={v => onChange({ ...data, title: v })} />
            </div>
            <SingleImageUpload label="Şəkil" value={data.image ?? ""} onChange={v => onChange({ ...data, image: v })} />
            <div className={styles.field}><label>Şəkil alt mətn</label>
                <input className={styles.input} value={data.imageAlt ?? ""} onChange={e => onChange({ ...data, imageAlt: e.target.value })} />
            </div>
            <div className={styles.field}><label>Təsvir 1</label>
                <RichEditor value={data.descriptions?.[0] ?? ""} onChange={v => onChange({ ...data, descriptions: [v, data.descriptions?.[1] ?? ""] })} />
            </div>
            <div className={styles.field}><label>Təsvir 2(optional)</label>
                <RichEditor value={data.descriptions?.[1] ?? ""} onChange={v => onChange({ ...data, descriptions: [data.descriptions?.[0] ?? "", v] })} />
            </div>
        </div>
    );
}

const SECTION_TYPES = [
    { type: "hero", label: "Hero" },
    { type: "content", label: "Content" },
    { type: "quote", label: "Quote" },
    { type: "overlay", label: "Overlay" },
];

function SectionEditor({ section, index, onChange, onRemove }: {
    section: any; index: number;
    onChange: (d: any) => void; onRemove: () => void;
}) {
    const [open, setOpen] = useState(true);

    const renderEditor = () => {
        switch (section.type) {
            case "hero": return <HeroSectionEditor data={section} onChange={onChange} />;
            case "content": return <ContentSectionEditor data={section} onChange={onChange} />;
            case "quote": return <QuoteSectionEditor data={section} onChange={onChange} />;
            case "overlay": return <OverlaySectionEditor data={section} onChange={onChange} />;
            default: return null;
        }
    };

    return (
        <div className={styles.sectionBlock}>
            <div className={styles.sectionBlockHeader}>
                <div className={styles.sectionBlockLeft}>
                    <span className={styles.sectionTypeTag}>{section.type.toUpperCase()}</span>
                    <span className={styles.sectionIndex}>#{index + 1}</span>
                </div>
                <div className={styles.sectionBlockRight}>
                    <button type="button" className={styles.toggleBtn} onClick={() => setOpen(o => !o)}>
                        {open ? "Bağla" : "Aç"}
                    </button>
                    <button type="button" className={styles.removeBtn} onClick={onRemove}>Sil</button>
                </div>
            </div>
            {open && renderEditor()}
        </div>
    );
}

function SortableRow({ s, onEdit, onToggle, onDelete }: {
    s: any; onEdit: (s: any) => void;
    onToggle: (s: any) => void; onDelete: (id: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.id });
    return (
        <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
            <td className={styles.num}>
                <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
            </td>
            <td>
                <div className={styles.serviceInfo}>
                    {s.image && <img src={toAbsUrl(s.image)} alt={s.imageAlt ?? ""} className={styles.coverThumb} />}
                    <div>
                        <div className={styles.serviceTitle} dangerouslySetInnerHTML={{ __html: s.title }} />
                        <div className={styles.serviceSlug}>/{s.slug}</div>
                    </div>
                </div>
            </td>
            <td><span className={styles.badge}>{s.badge}</span></td>
            <td>
                <span className={`${styles.statusBadge} ${s.isVisible ? styles.badgeVisible : styles.badgeHidden}`}>
                    {s.isVisible ? "Görünür" : "Gizli"}
                </span>
            </td>
            <td>
                <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => onEdit(s)}>Düzəlt</button>
                    <button className={`${styles.visBtn} ${s.isVisible ? styles.visBtnHide : styles.visBtnShow}`} onClick={() => onToggle(s)}>
                        {s.isVisible ? "Gizlət" : "Göstər"}
                    </button>
                    <button className={styles.deleteBtn} onClick={() => onDelete(s.id)}>Sil</button>
                </div>
            </td>
        </tr>
    );
}

export default function ServicePage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [reordering, setReordering] = useState(false);

    const [number, setNumber] = useState("");
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [badge, setBadge] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [imageAlt, setImageAlt] = useState("");
    const [gif, setGif] = useState("");
    const [features, setFeatures] = useState<any[]>([]);
    const [portfolioButtonText, setPortfolioButtonText] = useState("");
    const [portfolioButtonLink, setPortfolioButtonLink] = useState("");
    const [portfolioButtonNewTab, setPortfolioButtonNewTab] = useState(false);
    const [detailButtonText, setDetailButtonText] = useState("");
    const [detailButtonLink, setDetailButtonLink] = useState("");
    const [detailButtonNewTab, setDetailButtonNewTab] = useState(false);
    const [sections, setSections] = useState<any[]>([]);

    const sensors = useSensors(useSensor(PointerSensor));

    const load = async () => {
        setLoading(true);
        try {
            const data = await apiFetch("/services");
            setServices(data);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const resetForm = () => {
        setNumber(""); setTitle(""); setSlug(""); setBadge(""); setDescription("");
        setImage(""); setImageAlt(""); setGif(""); setFeatures([]);
        setPortfolioButtonText(""); setPortfolioButtonLink(""); setPortfolioButtonNewTab(false);
        setDetailButtonText(""); setDetailButtonLink(""); setDetailButtonNewTab(false);
        setSections([]);
    };

    const openCreate = () => { setEditItem(null); resetForm(); setDrawerOpen(true); };

    const openEdit = (s: any) => {
        setEditItem(s);
        setNumber(s.number ?? ""); setTitle(s.title ?? ""); setSlug(s.slug ?? "");
        setBadge(s.badge ?? ""); setDescription(s.description ?? "");
        setImage(s.image ?? ""); setImageAlt(s.imageAlt ?? ""); setGif(s.gif ?? "");
        setFeatures(s.features ?? []);
        setPortfolioButtonText(s.portfolioButtonText ?? ""); setPortfolioButtonLink(s.portfolioButtonLink ?? "");
        setPortfolioButtonNewTab(s.portfolioButtonNewTab ?? false);
        setDetailButtonText(s.detailButtonText ?? ""); setDetailButtonLink(s.detailButtonLink ?? "");
        setDetailButtonNewTab(s.detailButtonNewTab ?? false);
        setSections(s.sections ?? []);
        setDrawerOpen(true);
    };

    const closeDrawer = () => { setDrawerOpen(false); setEditItem(null); };

    const handleTitleChange = (val: string) => {
        setTitle(val);
        setSlug(generateSlug(val));
    };

    const addFeature = () => setFeatures(prev => [...prev, { label: "" }]);
    const updateFeature = (i: number, key: string, val: string) => {
        setFeatures(prev => { const arr = [...prev]; arr[i] = { ...arr[i], [key]: val }; return arr; });
    };
    const removeFeature = (i: number) => setFeatures(prev => prev.filter((_, idx) => idx !== i));

    const handleFeatureDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oi = features.findIndex((_, i) => `feat-${i}` === active.id);
        const ni = features.findIndex((_, i) => `feat-${i}` === over.id);
        setFeatures(prev => arrayMove(prev, oi, ni));
    };

    const addSection = (type: string) => setSections(prev => [...prev, { type }]);
    const updateSection = (i: number, data: any) => setSections(prev => { const arr = [...prev]; arr[i] = data; return arr; });
    const removeSection = (i: number) => setSections(prev => prev.filter((_, idx) => idx !== i));
    const save = async () => {
        if (!title || !slug) return;
        setSaving(true);
        try {
            const payload = {
                number, title, slug, badge, description, image, imageAlt,
                gif: gif || null, features, sections,
                portfolioButtonText: portfolioButtonText || null,
                portfolioButtonLink: portfolioButtonLink || null,
                portfolioButtonNewTab,
                detailButtonText: detailButtonText || null,
                detailButtonLink: detailButtonLink || null,
                detailButtonNewTab,
            };
            if (editItem) {
                await apiFetch(`/services/${editItem.id}`, { method: "PUT", body: JSON.stringify(payload) });
            } else {
                await apiFetch("/services", { method: "POST", body: JSON.stringify(payload) });
            }
            closeDrawer(); load();
        } finally { setSaving(false); }
    };

    const toggleVisibility = async (s: any) => {
        try {
            await apiFetch(`/services/${s.id}/visibility`, {
                method: "PATCH", body: JSON.stringify({ isVisible: !s.isVisible }),
            });
            load();
        } catch (e) { console.error(e); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await apiFetch(`/services/${deleteId}`, { method: "DELETE" });
        setDeleteId(null); load();
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oi = services.findIndex(s => s.id === active.id);
        const ni = services.findIndex(s => s.id === over.id);
        const newList = arrayMove(services, oi, ni);
        setServices(newList);
        setReordering(true);
        try {
            await apiFetch("/services/reorder", { method: "PATCH", body: JSON.stringify({ ids: newList.map(s => s.id) }) });
        } finally { setReordering(false); }
    };

    const usedTypes = sections.map(s => s.type);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Xidmətlər</h1>
                    <p className={styles.subtitle}>Xidmətləri idarə edin</p>
                </div>
                <div className={styles.headerRight}>
                    {reordering && <span className={styles.reorderingText}>Saxlanır...</span>}
                    <button className={styles.addBtn} onClick={openCreate}>+ Yeni Xidmət</button>
                </div>
            </div>

            <div className={styles.tableWrap}>
                {loading ? <div className={styles.empty}>Yüklənir...</div>
                    : services.length === 0 ? <div className={styles.empty}>Hələ xidmət əlavə edilməyib</div>
                        : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <table className={styles.table}>
                                    <thead><tr><th></th><th>Xidmət</th><th>Badge</th><th>Status</th><th>Əməliyyatlar</th></tr></thead>
                                    <SortableContext items={services.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                        <tbody>
                                            {services.map(s => (
                                                <SortableRow key={s.id} s={s} onEdit={openEdit} onToggle={toggleVisibility} onDelete={setDeleteId} />
                                            ))}
                                        </tbody>
                                    </SortableContext>
                                </table>
                            </DndContext>
                        )}
            </div>

            {drawerOpen && (
                <div className={styles.fullDrawer}>
                    <div className={styles.fullDrawerHeader}>
                        <h2>{editItem ? "Xidmət Düzəlt" : "Yeni Xidmət"}</h2>
                        <div className={styles.fullDrawerHeaderRight}>
                            <button className={styles.cancelBtn} onClick={closeDrawer}>Ləğv et</button>
                            <button className={styles.saveBtn} onClick={save} disabled={saving}>
                                {saving ? "Saxlanır..." : "Saxla"}
                            </button>
                        </div>
                    </div>

                    <div className={styles.fullDrawerBody}>
                        <div className={styles.fullDrawerSection}>
                            <h3 className={styles.drawerSectionTitle}>Əsas Məlumatlar</h3>
                            <div className={styles.twoCol}>
                                <div className={styles.field}><label>Nömrə</label>
                                    <input className={styles.input} value={number} onChange={e => setNumber(e.target.value)} placeholder="01" />
                                </div>
                                <div className={styles.field}><label>Badge</label>
                                    <input className={styles.input} value={badge} onChange={e => setBadge(e.target.value)} placeholder="Brendinq" />
                                </div>
                            </div>
                            <div className={styles.field}><label>Başlıq</label>
                                <RichEditor value={title} onChange={handleTitleChange} />
                            </div>
                            <div className={styles.twoCol}>
                                <div className={styles.field}><label>Slug</label>
                                    <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} placeholder="brendinq" />
                                </div>
                            </div>
                            <div className={styles.field}><label>Qısa təsvir</label>
                                <RichEditor value={description} onChange={setDescription} />
                            </div>
                            <SingleImageUpload label="Şəkil (WebP)" value={image} onChange={setImage} />
                            <div className={styles.field}><label>Şəkil alt mətn</label>
                                <input className={styles.input} value={imageAlt} onChange={e => setImageAlt(e.target.value)} />
                            </div>
                            <SingleImageUpload label="GIF (hover-da görünür, optional)" value={gif} onChange={setGif} accept="image/gif,image/webp" />
                        </div>

                        <div className={styles.fullDrawerSection}>
                            <h3 className={styles.drawerSectionTitle}>Features</h3>
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFeatureDragEnd}>
                                <SortableContext items={features.map((_, i) => `feat-${i}`)} strategy={verticalListSortingStrategy}>
                                    {features.map((feat, i) => (
                                        <SortableFeatureRow key={`feat-${i}`} id={`feat-${i}`} feature={feat}
                                            onChange={(key, val) => updateFeature(i, key, val)}
                                            onRemove={() => removeFeature(i)} />
                                    ))}
                                </SortableContext>
                            </DndContext>
                            <button type="button" className={styles.addRowBtn} onClick={addFeature}>+ Feature əlavə et</button>
                        </div>

                        <div className={styles.fullDrawerSection}>
                            <h3 className={styles.drawerSectionTitle}>Buttonlar</h3>
                            <div className={styles.twoCol}>
                                <div className={styles.field}><label>Portfolio button mətni</label>
                                    <input className={styles.input} value={portfolioButtonText} onChange={e => setPortfolioButtonText(e.target.value)} placeholder="Portfolio" />
                                </div>
                                <div className={styles.field}><label>Portfolio button linki</label>
                                    <input className={styles.input} value={portfolioButtonLink} onChange={e => setPortfolioButtonLink(e.target.value)} placeholder="/portfolio" />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label>Portfolio button tab</label>
                                <button
                                    type="button"
                                    className={portfolioButtonNewTab ? styles.activeToggle : styles.inactiveToggle}
                                    onClick={() => setPortfolioButtonNewTab(!portfolioButtonNewTab)}>
                                    {portfolioButtonNewTab ? "Yeni tab" : "Eyni tab"}
                                </button>
                            </div>
                            <div className={styles.twoCol}>
                                <div className={styles.field}><label>Daha Ətraflı button mətni</label>
                                    <input className={styles.input} value={detailButtonText} onChange={e => setDetailButtonText(e.target.value)} placeholder="Daha Ətraflı" />
                                </div>
                                <div className={styles.field}><label>Daha Ətraflı button linki</label>
                                    <input className={styles.input} value={detailButtonLink} onChange={e => setDetailButtonLink(e.target.value)} placeholder={`/service/${slug}`} />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label>Daha Ətraflı button tab</label>
                                <button
                                    type="button"
                                    className={detailButtonNewTab ? styles.activeToggle : styles.inactiveToggle}
                                    onClick={() => setDetailButtonNewTab(!detailButtonNewTab)}>
                                    {detailButtonNewTab ? "Yeni tab" : "Eyni tab"}
                                </button>
                            </div>
                        </div>
                        <div className={styles.fullDrawerSection}>
                            <h3 className={styles.drawerSectionTitle}>Detail Səhifəsi Sectionları</h3>
                            {sections.map((section, i) => (
                                <SectionEditor key={`section-${i}-${section.type}`} section={section} index={i}
                                    onChange={data => updateSection(i, data)} onRemove={() => removeSection(i)} />
                            ))}
                            <div className={styles.addSectionRow}>
                                {SECTION_TYPES.filter(({ type }) => !usedTypes.includes(type)).map(({ type, label }) => (
                                    <button key={type} type="button" className={styles.addSectionBtn} onClick={() => addSection(type)}>
                                        + {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {deleteId && (
                <div className={styles.overlay} onClick={() => setDeleteId(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Silməyi təsdiq edin</h2>
                            <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button>
                        </div>
                        <div className={styles.modalBody}><p>Bu xidməti silmək istədiyinizə əminsiniz?</p></div>
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