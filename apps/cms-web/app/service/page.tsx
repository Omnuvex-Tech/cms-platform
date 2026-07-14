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

type Lang = "az" | "en" | "ru";
type LocalizedString = Record<string, string>;
type LocalizedImages = Partial<Record<Lang, string[]>>;

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
        .replace(/&nbsp;/g, " ").replace(/&amp;/g, "and")
        .replace(/ə/g, "e").replace(/ğ/g, "g").replace(/ı/g, "i")
        .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .trim();
}


function normalizeImages(images: any): LocalizedImages {
    if (Array.isArray(images)) return images.length ? { az: images } : {};
    return images ?? {};
}


function normalizeMainImage(img: any): LocalizedImages {
    if (typeof img === "string") return img ? { az: [img] } : {};
    return normalizeImages(img);
}

function LangTabs({ active, onChange }: { active: Lang; onChange: (l: Lang) => void }) {
    return (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["az", "en", "ru"] as Lang[]).map((l) => (
                <button key={l} type="button" onClick={() => onChange(l)}
                    style={{
                        padding: "4px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                        border: "1.5px solid",
                        borderColor: active === l ? "#3b82f6" : "#333",
                        background: active === l ? "#1e3a5f" : "transparent",
                        color: active === l ? "#fff" : "#888",
                        cursor: "pointer",
                    }}>
                    {l.toUpperCase()}
                </button>
            ))}
        </div>
    );
}

function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const editor = useEditor({
        extensions: [StarterKit, Underline, Heading.configure({ levels: [1, 2, 3, 4, 5, 6] })],
        content: value,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    useEffect(() => {
        if (editor && editor.getHTML() !== value) {
            editor.commands.setContent(value || "");
        }
    }, [value]);

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
                        {value.toLowerCase().endsWith('.mp4') ? (
                            <video
                                src={toAbsUrl(value)}
                                className={styles.singleUploadPreview}
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                        ) : (
                            <img src={toAbsUrl(value)} alt="" className={styles.singleUploadPreview} />
                        )}
                        <button type="button" className={styles.imageRemoveBtn}
                            onClick={e => { e.stopPropagation(); onChange(""); }}>✕</button>
                    </div>
                ) : (
                    <div className={styles.imagePlaceholder}>
                        <span>🖼️</span><span>{label ?? "Şəkil seçin"}</span>
                        <small>{accept.includes("gif") ? "WebP / GIF" : "WebP"}</small>
                    </div>
                )}
            </div>
        </div>
    );
}

function SortableImage({ id, src, onRemove }: { id: string; src: string; onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    return (
        <div ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            className={styles.imageItem}>
            <div className={styles.imageDragHandle} {...attributes} {...listeners}>⠿</div>
            <img src={toAbsUrl(src)} alt="" className={styles.imageThumb} />
            <button type="button" className={styles.imageRemoveBtn} onClick={onRemove}>✕</button>
        </div>
    );
}

function ImageUploadArea({ images, onChange, maxImages, activeLang, label, accept = "image/webp" }: {
    images: LocalizedImages;
    onChange: (imgs: LocalizedImages) => void;
    maxImages?: number;
    activeLang: Lang;
    label?: string;
    accept?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const sensors = useSensors(useSensor(PointerSensor));

    const currentList = images?.[activeLang] ?? [];

    const setLangImages = (list: string[]) => {
        onChange({ ...images, [activeLang]: list });
    };

    const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const base = currentList;
        const urls: string[] = [];
        for (const file of files) {
            if (maxImages && base.length + urls.length >= maxImages) break;
            const url = await uploadFile(file);
            urls.push(url);
        }
        setLangImages(maxImages === 1 ? urls.slice(-1) : [...base, ...urls]);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = currentList.findIndex((_, i) => `img-${i}` === active.id);
        const newIndex = currentList.findIndex((_, i) => `img-${i}` === over.id);
        setLangImages(arrayMove(currentList, oldIndex, newIndex));
    };

    const removeAt = (i: number) => {
        setLangImages(currentList.filter((_, idx) => idx !== i));
    };

    return (
        <div className={styles.field}>
            {label && <label>{label} ({activeLang.toUpperCase()})</label>}
            <div className={styles.imageUploadWrap}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={currentList.map((_, i) => `img-${i}`)} strategy={horizontalListSortingStrategy}>
                        <div className={styles.imageGrid}>
                            {currentList.map((img, i) => (
                                <SortableImage key={`img-${i}`} id={`img-${i}`} src={img} onRemove={() => removeAt(i)} />
                            ))}
                            {(!maxImages || currentList.length < maxImages) && (
                                <div className={styles.imageAddBtn} onClick={() => inputRef.current?.click()}>
                                    <span>+</span><small>{accept.includes("gif") ? "GIF/WebP əlavə et" : "WebP əlavə et"}</small>
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
            <input ref={inputRef} type="file" accept={accept} multiple={maxImages !== 1} style={{ display: "none" }} onChange={handleSelect} />
        </div>
    );
}

function SortableFeatureRow({ id, feature, activeLang, onChange, onRemove }: {
    id: string; feature: any; activeLang: Lang;
    onChange: (key: string, val: any) => void; onRemove: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    return (
        <div ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            className={styles.featureRow}>
            <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
            <input className={styles.input}
                value={feature.label?.[activeLang] || ""}
                placeholder="Feature mətni"
                onChange={e => onChange("label", { ...feature.label, [activeLang]: e.target.value })} />
            <button type="button" className={styles.removeBtn} onClick={onRemove}>✕</button>
        </div>
    );
}

// Section editorları — aktivLang prop qəbul edir
function LocalizedRichEditor({ value, lang, onChange }: {
    value: LocalizedString; lang: Lang; onChange: (v: LocalizedString) => void;
}) {
    return (
        <RichEditor
            value={value?.[lang] || ""}
            onChange={v => onChange({ ...value, [lang]: v })}
        />
    );
}

function HeroSectionEditor({ data, onChange, activeLang }: { data: any; onChange: (d: any) => void; activeLang: Lang }) {
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
            <div className={styles.field}><label>Badge ({activeLang.toUpperCase()})</label>
                <input className={styles.input}
                    value={data.badge?.[activeLang] || ""}
                    placeholder="Brendinq"
                    onChange={e => onChange({ ...data, badge: { ...data.badge, [activeLang]: e.target.value } })} />
            </div>
            <div className={styles.field}><label>Başlıq ({activeLang.toUpperCase()})</label>
                <LocalizedRichEditor value={data.title ?? {}} lang={activeLang}
                    onChange={v => onChange({ ...data, title: v })} />
            </div>
            <div className={styles.field}><label>Təsvir 1 ({activeLang.toUpperCase()})</label>
                <LocalizedRichEditor
                    value={{ [activeLang]: data.descriptions?.[0]?.[activeLang] || "" }}
                    lang={activeLang}
                    onChange={v => onChange({
                        ...data,
                        descriptions: [
                            { ...(data.descriptions?.[0] ?? {}), [activeLang]: v[activeLang] },
                            data.descriptions?.[1] ?? {}
                        ]
                    })} />
            </div>
            <div className={styles.field}><label>Təsvir 2 (optional) ({activeLang.toUpperCase()})</label>
                <LocalizedRichEditor
                    value={{ [activeLang]: data.descriptions?.[1]?.[activeLang] || "" }}
                    lang={activeLang}
                    onChange={v => onChange({
                        ...data,
                        descriptions: [
                            data.descriptions?.[0] ?? {},
                            { ...(data.descriptions?.[1] ?? {}), [activeLang]: v[activeLang] }
                        ]
                    })} />
            </div>
            <ImageUploadArea
                label="Hero şəkil"
                images={normalizeMainImage(data.heroImage)}
                onChange={imgs => onChange({ ...data, heroImage: imgs })}
                maxImages={1}
                activeLang={activeLang} />
            <div className={styles.field}><label>Hero şəkil alt mətn ({activeLang.toUpperCase()})</label>
                <input className={styles.input}
                    value={data.heroImageAlt?.[activeLang] || ""}
                    onChange={e => onChange({ ...data, heroImageAlt: { ...data.heroImageAlt, [activeLang]: e.target.value } })} />
            </div>
            <ImageUploadArea
                label="Alt şəkil"
                images={normalizeMainImage(data.bottomImage)}
                onChange={imgs => onChange({ ...data, bottomImage: imgs })}
                maxImages={1}
                activeLang={activeLang} />
            <div className={styles.field}><label>Alt şəkil alt mətn ({activeLang.toUpperCase()})</label>
                <input className={styles.input}
                    value={data.bottomImageAlt?.[activeLang] || ""}
                    onChange={e => onChange({ ...data, bottomImageAlt: { ...data.bottomImageAlt, [activeLang]: e.target.value } })} />
            </div>
            <div className={styles.field}><label>Quote mətni ({activeLang.toUpperCase()})</label>
                <LocalizedRichEditor value={data.quoteText ?? {}} lang={activeLang}
                    onChange={v => onChange({ ...data, quoteText: v })} />
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
        if (!['image/webp', 'image/svg+xml'].includes(file.type)) { alert("Yalnız WebP və ya SVG"); return; }
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
                <input ref={inputRef} type="file" accept="image/webp,image/svg+xml" style={{ display: "none" }} onChange={handleIconSelect} />
            </div>
            <input className={styles.inputSmall} value={stat.label ?? ""} placeholder="Label" onChange={e => onChange("label", e.target.value)} />
            <input className={styles.inputSmall} value={stat.value ?? ""} placeholder="Dəyər" onChange={e => onChange("value", e.target.value)} />
            <button type="button" className={styles.removeBtn} onClick={onRemove}>✕</button>
        </div>
    );
}

function ContentSectionEditor({ data, onChange, activeLang }: { data: any; onChange: (d: any) => void; activeLang: Lang }) {
    const items = data.items ?? [];

    const addItem = () => onChange({
        ...data, items: [...items, {
            number: "", badge: {}, title: {}, descriptions: [{}, {}],
            quote: {}, quoteImage: {}, subText: {}, image: {}, imageAlt: {}
        }]
    });
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
                            <input className={styles.input} value={item.number ?? ""} placeholder="01"
                                onChange={e => updateItem(i, "number", e.target.value)} />
                        </div>
                        <div className={styles.field}><label>Badge ({activeLang.toUpperCase()})</label>
                            <input className={styles.input}
                                value={item.badge?.[activeLang] || ""}
                                placeholder="Brendinq"
                                onChange={e => updateItem(i, "badge", { ...item.badge, [activeLang]: e.target.value })} />
                        </div>
                    </div>
                    <div className={styles.field}><label>Başlıq ({activeLang.toUpperCase()})</label>
                        <LocalizedRichEditor value={item.title ?? {}} lang={activeLang}
                            onChange={v => updateItem(i, "title", v)} />
                    </div>
                    <div className={styles.field}><label>Təsvir 1 ({activeLang.toUpperCase()})</label>
                        <LocalizedRichEditor
                            value={{ [activeLang]: item.descriptions?.[0]?.[activeLang] || "" }}
                            lang={activeLang}
                            onChange={v => updateItem(i, "descriptions", [
                                { ...(item.descriptions?.[0] ?? {}), [activeLang]: v[activeLang] },
                                item.descriptions?.[1] ?? {}
                            ])} />
                    </div>
                    <div className={styles.field}><label>Təsvir 2 (optional) ({activeLang.toUpperCase()})</label>
                        <LocalizedRichEditor
                            value={{ [activeLang]: item.descriptions?.[1]?.[activeLang] || "" }}
                            lang={activeLang}
                            onChange={v => updateItem(i, "descriptions", [
                                item.descriptions?.[0] ?? {},
                                { ...(item.descriptions?.[1] ?? {}), [activeLang]: v[activeLang] }
                            ])} />
                    </div>

                    {i === 0 && <>
                        <div className={styles.field}><label>Sitat mətni ({activeLang.toUpperCase()})</label>
                            <LocalizedRichEditor value={item.quote ?? {}} lang={activeLang}
                                onChange={v => updateItem(i, "quote", v)} />
                        </div>
                        <ImageUploadArea
                            label="Sitat şəkli"
                            images={normalizeMainImage(item.quoteImage)}
                            onChange={imgs => updateItem(i, "quoteImage", imgs)}
                            maxImages={1}
                            activeLang={activeLang} />
                        <div className={styles.field}><label>subText ({activeLang.toUpperCase()})</label>
                            <LocalizedRichEditor value={item.subText ?? {}} lang={activeLang}
                                onChange={v => updateItem(i, "subText", v)} />
                        </div>
                    </>}

                    {i !== 0 && <>
                        <ImageUploadArea
                            label="Alt şəkil"
                            images={normalizeMainImage(item.image)}
                            onChange={imgs => updateItem(i, "image", imgs)}
                            maxImages={1}
                            activeLang={activeLang} />
                        <div className={styles.field}><label>Alt mətn ({activeLang.toUpperCase()})</label>
                            <input className={styles.input}
                                value={item.imageAlt?.[activeLang] || ""}
                                onChange={e => updateItem(i, "imageAlt", { ...item.imageAlt, [activeLang]: e.target.value })} />
                        </div>
                        <div className={styles.field}><label>Button Yazısı ({activeLang.toUpperCase()})</label>
                            <input className={styles.input}
                                value={item.contactLabel?.[activeLang] || ""}
                                onChange={e => updateItem(i, "contactLabel", { ...item.contactLabel, [activeLang]: e.target.value })}
                                placeholder="Sorğu göndər" />
                        </div>
                    </>

                    }
                </div>
            ))}
            <button type="button" className={styles.addRowBtn} onClick={addItem}>+ Item əlavə et</button>
        </div>
    );
}

function QuoteSectionEditor({ data, onChange, activeLang }: { data: any; onChange: (d: any) => void; activeLang: Lang }) {
    return (
        <div className={styles.sectionFields}>
            <div className={styles.twoCol}>
                <div className={styles.field}><label>Nömrə</label>
                    <input className={styles.input} value={data.number ?? ""} placeholder="03"
                        onChange={e => onChange({ ...data, number: e.target.value })} />
                </div>
                <div className={styles.field}><label>Badge ({activeLang.toUpperCase()})</label>
                    <input className={styles.input}
                        value={data.badge?.[activeLang] || ""}
                        onChange={e => onChange({ ...data, badge: { ...data.badge, [activeLang]: e.target.value } })} />
                </div>
            </div>
            <div className={styles.field}><label>Başlıq ({activeLang.toUpperCase()})</label>
                <LocalizedRichEditor value={data.title ?? {}} lang={activeLang}
                    onChange={v => onChange({ ...data, title: v })} />
            </div>
            {[0, 1, 2].map(idx => (
                <div key={idx} className={styles.field}>
                    <label>Təsvir {idx + 1}{idx > 0 ? " (optional)" : ""} ({activeLang.toUpperCase()})</label>
                    <LocalizedRichEditor
                        value={{ [activeLang]: data.descriptions?.[idx]?.[activeLang] || "" }}
                        lang={activeLang}
                        onChange={v => {
                            const descs = [...(data.descriptions ?? [{}, {}, {}])];
                            descs[idx] = { ...(descs[idx] ?? {}), [activeLang]: v[activeLang] };
                            onChange({ ...data, descriptions: descs });
                        }} />
                </div>
            ))}
            <div className={styles.field}><label>Sitat mətni ({activeLang.toUpperCase()})</label>
                <LocalizedRichEditor value={data.quoteText ?? {}} lang={activeLang}
                    onChange={v => onChange({ ...data, quoteText: v })} />
            </div>
            <ImageUploadArea
                label="Sitat şəkli"
                images={normalizeMainImage(data.quoteImage)}
                onChange={imgs => onChange({ ...data, quoteImage: imgs })}
                maxImages={1}
                activeLang={activeLang} />
            <div className={styles.field}><label>Sitat şəkil alt mətn ({activeLang.toUpperCase()})</label>
                <input className={styles.input}
                    value={data.quoteImageAlt?.[activeLang] || ""}
                    onChange={e => onChange({ ...data, quoteImageAlt: { ...data.quoteImageAlt, [activeLang]: e.target.value } })} />
            </div>
        </div>
    );
}

function OverlaySectionEditor({ data, onChange, activeLang }: { data: any; onChange: (d: any) => void; activeLang: Lang }) {
    return (
        <div className={styles.sectionFields}>
            <div className={styles.field}><label>Badge ({activeLang.toUpperCase()})</label>
                <input className={styles.input}
                    value={data.badge?.[activeLang] || ""}
                    onChange={e => onChange({ ...data, badge: { ...data.badge, [activeLang]: e.target.value } })} />
            </div>
            <div className={styles.field}><label>Başlıq ({activeLang.toUpperCase()})</label>
                <LocalizedRichEditor value={data.title ?? {}} lang={activeLang}
                    onChange={v => onChange({ ...data, title: v })} />
            </div>
            <ImageUploadArea
                label="Şəkil"
                images={normalizeMainImage(data.image)}
                onChange={imgs => onChange({ ...data, image: imgs })}
                maxImages={1}
                activeLang={activeLang} />
            <div className={styles.field}><label>Şəkil alt mətn ({activeLang.toUpperCase()})</label>
                <input className={styles.input}
                    value={data.imageAlt?.[activeLang] || ""}
                    onChange={e => onChange({ ...data, imageAlt: { ...data.imageAlt, [activeLang]: e.target.value } })} />
            </div>
            {[0, 1].map(idx => (
                <div key={idx} className={styles.field}>
                    <label>Təsvir {idx + 1}{idx > 0 ? " (optional)" : ""} ({activeLang.toUpperCase()})</label>
                    <LocalizedRichEditor
                        value={{ [activeLang]: data.descriptions?.[idx]?.[activeLang] || "" }}
                        lang={activeLang}
                        onChange={v => {
                            const descs = [...(data.descriptions ?? [{}, {}])];
                            descs[idx] = { ...(descs[idx] ?? {}), [activeLang]: v[activeLang] };
                            onChange({ ...data, descriptions: descs });
                        }} />
                </div>
            ))}
        </div>
    );
}

const SECTION_TYPES = [
    { type: "hero", label: "Hero" },
    { type: "content", label: "Content" },
    { type: "quote", label: "Quote" },
    { type: "overlay", label: "Overlay" },
];

function SectionEditor({ section, index, activeLang, onChange, onRemove }: {
    section: any; index: number; activeLang: Lang;
    onChange: (d: any) => void; onRemove: () => void;
}) {
    const [open, setOpen] = useState(true);

    const renderEditor = () => {
        switch (section.type) {
            case "hero": return <HeroSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
            case "content": return <ContentSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
            case "quote": return <QuoteSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
            case "overlay": return <OverlaySectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
            default: return null;
        }
    };

    return (
        <div className={styles.sectionBlock} style={{ opacity: section.isVisible === false ? 0.5 : 1 }}>
            <div className={styles.sectionBlockHeader}>
                <div className={styles.sectionBlockLeft}>
                    <span className={styles.sectionTypeTag}>{section.type.toUpperCase()}</span>
                    <span className={styles.sectionIndex}>#{index + 1}</span>
                </div>
                <div className={styles.sectionBlockRight}>
                    <button
                        type="button"
                        className={section.isVisible === false ? styles.inactiveTogggle : styles.activeTogggle}
                        onClick={() => onChange({ ...section, isVisible: section.isVisible === false ? true : false })}
                    >
                        {section.isVisible === false ? "Gizli" : "Görünür"}
                    </button>
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
    const titleAz = typeof s.title === "object" ? (s.title?.az || "") : (s.title || "");
    const badgeAz = typeof s.badge === "object" ? (s.badge?.az || "") : (s.badge || "");
    return (
        <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
            <td className={styles.num}>
                <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
            </td>
            <td>
                <div className={styles.serviceInfo}>
                    {s.image && <img src={toAbsUrl(s.image)} alt="" className={styles.coverThumb} />}
                    <div>
                        <div className={styles.serviceTitle} dangerouslySetInnerHTML={{ __html: titleAz }} />
                        <div className={styles.serviceSlug}>/{s.slug}</div>
                    </div>
                </div>
            </td>
            <td><span className={styles.badge}>{badgeAz}</span></td>
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
    const [activeLang, setActiveLang] = useState<Lang>("az");

    const [number, setNumber] = useState("");
    const [title, setTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [slug, setSlug] = useState("");
    const [badge, setBadge] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [description, setDescription] = useState<LocalizedString>({ az: "", en: "", ru: "" });
   const [image, setImage] = useState("");
    const [imageAlt, setImageAlt] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [homeCoverImage, setHomeCoverImage] = useState("");
    const [gif, setGif] = useState("");
    const [features, setFeatures] = useState<any[]>([]);
    const [portfolioButtonText, setPortfolioButtonText] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [portfolioButtonLink, setPortfolioButtonLink] = useState("");
    const [portfolioButtonNewTab, setPortfolioButtonNewTab] = useState(false);
    const [detailButtonText, setDetailButtonText] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [seoTitle, setSeoTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [seoDescription, setSeoDescription] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [seoKeywords, setSeoKeywords] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [detailButtonLink, setDetailButtonLink] = useState("");
    const [detailButtonNewTab, setDetailButtonNewTab] = useState(false);
    const [sections, setSections] = useState<any[]>([]);
    const [schemaText, setSchemaText] = useState("");
    const [schemaError, setSchemaError] = useState<string | null>(null);
    const [schemaGenerating, setSchemaGenerating] = useState(false);
    const [schemaSaving, setSchemaSaving] = useState(false);
    const [schemaSaveStatus, setSchemaSaveStatus] = useState<"idle" | "success" | "error">("idle");

    const sensors = useSensors(useSensor(PointerSensor));

    const load = async () => {
        setLoading(true);
        try {
            const data = await apiFetch("/services");
            setServices(data);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (editItem) {
            setSchemaText(editItem.schema?.[activeLang] ? JSON.stringify(editItem.schema[activeLang], null, 2) : "");
            setSchemaError(null);
        }
    }, [activeLang]);

    const resetForm = () => {
        setNumber(""); setTitle({ az: "", en: "", ru: "" }); setSlug("");
        setBadge({ az: "", en: "", ru: "" });
        setDescription({ az: "", en: "", ru: "" });
        setImage(""); setImageAlt({ az: "", en: "", ru: "" }); setHomeCoverImage(""); setGif("");
        setFeatures([]);
        setPortfolioButtonText({ az: "", en: "", ru: "" });
        setPortfolioButtonLink(""); setPortfolioButtonNewTab(false);
        setDetailButtonText({ az: "", en: "", ru: "" });
        setSeoTitle({ az: "", en: "", ru: "" });
        setSeoDescription({ az: "", en: "", ru: "" });
        setSeoKeywords({ az: "", en: "", ru: "" });
        setDetailButtonLink(""); setDetailButtonNewTab(false);
        setSections([]);
        setSchemaText("");
    };

    const openCreate = () => { setEditItem(null); resetForm(); setDrawerOpen(true); };

    const openEdit = (s: any) => {
        setEditItem(s);
        setNumber(s.number ?? "");
        setTitle(s.title ?? { az: "", en: "", ru: "" });
        setSlug(s.slug ?? "");
        setBadge(s.badge ?? { az: "", en: "", ru: "" });
        setDescription(s.description ?? { az: "", en: "", ru: "" });
        setImage(s.image ?? "");
        setImageAlt(s.imageAlt ?? { az: "", en: "", ru: "" });
        setHomeCoverImage(s.homeCoverImage ?? "");
        setGif(s.gif ?? "");
        const normalizedFeatures = (s.features ?? []).map((f: any) => ({
            ...f,
            label: typeof f.label === "string"
                ? { az: f.label, en: "", ru: "" }
                : (f.label ?? { az: "", en: "", ru: "" }),
        }));
        setFeatures(normalizedFeatures);

        setPortfolioButtonText(s.portfolioButtonText ?? { az: "", en: "", ru: "" });
        setPortfolioButtonLink(s.portfolioButtonLink ?? "");
        setPortfolioButtonNewTab(s.portfolioButtonNewTab ?? false);
        setDetailButtonText(s.detailButtonText ?? { az: "", en: "", ru: "" });
        setSeoTitle(s.seoTitle ?? { az: "", en: "", ru: "" });
        setSeoDescription(s.seoDescription ?? { az: "", en: "", ru: "" });
        setSeoKeywords(s.seoKeywords ?? { az: "", en: "", ru: "" });
        setDetailButtonLink(s.detailButtonLink ?? "");
        setDetailButtonNewTab(s.detailButtonNewTab ?? false);
        setSchemaText(s.schema?.[activeLang] ? JSON.stringify(s.schema[activeLang], null, 2) : "");
        setSections(s.sections ?? []);
        setDrawerOpen(true);
    };

    const closeDrawer = () => { setDrawerOpen(false); setEditItem(null); };

    const handleTitleChange = (val: LocalizedString) => {
        setTitle(val);
        setSlug(generateSlug(val.az || ""));
    };

    const addFeature = () => setFeatures(prev => [...prev, { label: { az: "", en: "", ru: "" } }]);
    const updateFeature = (i: number, key: string, val: any) => {
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

    const addSection = (type: string) => setSections(prev => [...prev, { type, isVisible: true }]);
    const updateSection = (i: number, data: any) => setSections(prev => { const arr = [...prev]; arr[i] = data; return arr; });
    const removeSection = (i: number) => setSections(prev => prev.filter((_, idx) => idx !== i));

    const generateSchema = async () => {
        if (!editItem) return;
        setSchemaGenerating(true);
        setSchemaError(null);
        try {
            const generated = await apiFetch(`/services/${editItem.id}/schema/preview`);
            setSchemaText(JSON.stringify(generated[activeLang], null, 2));
        } catch {
            setSchemaError("Schema yaradılarkən xəta baş verdi");
        } finally {
            setSchemaGenerating(false);
        }
    };

    const handleSchemaChange = (val: string) => {
        setSchemaText(val);
        setSchemaError(null);
        try {
            if (val.trim()) JSON.parse(val);
        } catch {
            setSchemaError("JSON formatı səhvdir");
        }
    };

    const saveSchema = async () => {
        if (!editItem || schemaError) return;
        setSchemaSaving(true);
        setSchemaSaveStatus("idle");
        try {
            let parsed = null;
            if (schemaText.trim()) parsed = JSON.parse(schemaText);
            const current = editItem.schema ?? {};
            const updatedSchema = { ...current, [activeLang]: parsed };
            await apiFetch(`/services/${editItem.id}/schema`, {
                method: "PATCH",
                body: JSON.stringify({ schema: updatedSchema }),
            });
            setEditItem((prev: any) => ({ ...prev, schema: updatedSchema }));
            setSchemaSaveStatus("success");
        } catch {
            setSchemaSaveStatus("error");
        } finally {
            setSchemaSaving(false);
            setTimeout(() => setSchemaSaveStatus("idle"), 3000);
        }
    };

    const save = async () => {
        if (!title.az || !slug) return;
        setSaving(true);
        try {
           const payload = {
                number, title, slug, badge, description, image, imageAlt,
                homeCoverImage: homeCoverImage || null,
                gif: gif || null, features, sections,
                portfolioButtonText,
                portfolioButtonLink: portfolioButtonLink || null,
                portfolioButtonNewTab,
                detailButtonText,
                detailButtonLink: detailButtonLink || null,
                detailButtonNewTab, seoTitle, seoDescription, seoKeywords,
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
        await apiFetch(`/services/${s.id}/visibility`, {
            method: "PATCH", body: JSON.stringify({ isVisible: !s.isVisible }),
        });
        load();
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
                        <LangTabs active={activeLang} onChange={setActiveLang} />

                        <div className={styles.fullDrawerSection}>
                            <h3 className={styles.drawerSectionTitle}>Əsas Məlumatlar</h3>
                            <div className={styles.twoCol}>
                                <div className={styles.field}><label>Nömrə</label>
                                    <input className={styles.input} value={number}
                                        onChange={e => setNumber(e.target.value)} placeholder="01" />
                                </div>
                                <div className={styles.field}><label>Badge ({activeLang.toUpperCase()})</label>
                                    <input className={styles.input}
                                        value={badge[activeLang] || ""}
                                        onChange={e => setBadge(prev => ({ ...prev, [activeLang]: e.target.value }))}
                                        placeholder="Brendinq" />
                                </div>
                            </div>
                            <div className={styles.field}><label>Başlıq ({activeLang.toUpperCase()})</label>
                                <LocalizedRichEditor value={title} lang={activeLang}
                                    onChange={v => handleTitleChange(v)} />
                            </div>
                            <div className={styles.twoCol}>
                                <div className={styles.field}><label>Slug</label>
                                    <input className={styles.input} value={slug}
                                        onChange={e => setSlug(e.target.value)} placeholder="brendinq" />
                                </div>
                            </div>
                            <div className={styles.field}><label>Qısa təsvir ({activeLang.toUpperCase()})</label>
                                <LocalizedRichEditor value={description} lang={activeLang}
                                    onChange={setDescription} />
                            </div>
                          <SingleImageUpload label="Şəkil (WebP)" value={image} onChange={setImage} />
                            <div className={styles.field}><label>Şəkil alt mətn ({activeLang.toUpperCase()})</label>
                                <input className={styles.input}
                                    value={imageAlt[activeLang] || ""}
                                    onChange={e => setImageAlt(prev => ({ ...prev, [activeLang]: e.target.value }))} />
                            </div>
                            <SingleImageUpload label="Home səhifə üçün Cover şəkil (optional)" value={homeCoverImage} onChange={setHomeCoverImage} />
                            <SingleImageUpload label="GIF (optional)" value={gif} onChange={setGif} accept="image/gif,image/webp,video/mp4" />
                        </div>

                        <div className={styles.fullDrawerSection}>
                            <h3 className={styles.drawerSectionTitle}>Features</h3>
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFeatureDragEnd}>
                                <SortableContext items={features.map((_, i) => `feat-${i}`)} strategy={verticalListSortingStrategy}>
                                    {features.map((feat, i) => (
                                        <SortableFeatureRow key={`feat-${i}`} id={`feat-${i}`}
                                            feature={feat} activeLang={activeLang}
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
                                <div className={styles.field}><label>Portfolio button mətni ({activeLang.toUpperCase()})</label>
                                    <input className={styles.input}
                                        value={portfolioButtonText[activeLang] || ""}
                                        onChange={e => setPortfolioButtonText(prev => ({ ...prev, [activeLang]: e.target.value }))}
                                        placeholder="Portfolio" />
                                </div>
                                <div className={styles.field}><label>Portfolio button linki</label>
                                    <input className={styles.input} value={portfolioButtonLink}
                                        onChange={e => setPortfolioButtonLink(e.target.value)} placeholder="/portfolio" />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label>Portfolio button tab</label>
                                <button type="button"
                                    className={portfolioButtonNewTab ? styles.activeToggle : styles.inactiveToggle}
                                    onClick={() => setPortfolioButtonNewTab(!portfolioButtonNewTab)}>
                                    {portfolioButtonNewTab ? "Yeni tab" : "Eyni tab"}
                                </button>
                            </div>
                            <div className={styles.twoCol}>
                                <div className={styles.field}><label>Daha Ətraflı button mətni ({activeLang.toUpperCase()})</label>
                                    <input className={styles.input}
                                        value={detailButtonText[activeLang] || ""}
                                        onChange={e => setDetailButtonText(prev => ({ ...prev, [activeLang]: e.target.value }))}
                                        placeholder="Daha Ətraflı" />
                                </div>
                                <div className={styles.field}><label>Daha Ətraflı button linki</label>
                                    <input className={styles.input} value={detailButtonLink}
                                        onChange={e => setDetailButtonLink(e.target.value)}
                                        placeholder={`/service/${slug}`} />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label>Daha Ətraflı button tab</label>
                                <button type="button"
                                    className={detailButtonNewTab ? styles.activeToggle : styles.inactiveToggle}
                                    onClick={() => setDetailButtonNewTab(!detailButtonNewTab)}>
                                    {detailButtonNewTab ? "Yeni tab" : "Eyni tab"}
                                </button>
                            </div>
                        </div>

                        <div className={styles.fullDrawerSection}>
                            <h3 className={styles.drawerSectionTitle}>Detail Səhifəsi Sectionları</h3>
                            {sections.map((section, i) => (
                                <SectionEditor key={`section-${i}-${section.type}`}
                                    section={section} index={i} activeLang={activeLang}
                                    onChange={data => updateSection(i, data)}
                                    onRemove={() => removeSection(i)} />
                            ))}
                            <div className={styles.addSectionRow}>
                                {SECTION_TYPES.filter(({ type }) => !usedTypes.includes(type)).map(({ type, label }) => (
                                    <button key={type} type="button" className={styles.addSectionBtn}
                                        onClick={() => addSection(type)}>
                                        + {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={styles.fullDrawerSection}>
                            <h3 className={styles.drawerSectionTitle}>SEO</h3>
                            <div className={styles.field}>
                                <label>SEO Title ({activeLang.toUpperCase()})</label>
                                <input
                                    className={styles.input}
                                    value={seoTitle[activeLang] || ""}
                                    onChange={e => setSeoTitle(prev => ({ ...prev, [activeLang]: e.target.value }))}
                                    placeholder={`SEO başlığı (${activeLang})`}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>SEO Description ({activeLang.toUpperCase()})</label>
                                <textarea
                                    className={styles.input}
                                    rows={3}
                                    value={seoDescription[activeLang] || ""}
                                    onChange={e => setSeoDescription(prev => ({ ...prev, [activeLang]: e.target.value }))}
                                    placeholder={`Qısa açıqlama (${activeLang})`}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>SEO Keywords ({activeLang.toUpperCase()})</label>
                                <input
                                    className={styles.input}
                                    value={seoKeywords[activeLang] || ""}
                                    onChange={e => setSeoKeywords(prev => ({ ...prev, [activeLang]: e.target.value }))}
                                    placeholder={`açar söz 1, açar söz 2 (${activeLang})`}
                                />
                            </div>
                        </div>

                        {editItem && (
                            <div className={styles.fullDrawerSection}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                    <h3 className={styles.drawerSectionTitle} style={{ marginBottom: 0 }}>
                                        JSON-LD Schema ({activeLang.toUpperCase()})
                                    </h3>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button type="button" onClick={generateSchema} disabled={schemaGenerating}
                                            style={{ padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "1.5px solid #3b82f6", background: "#1e3a5f", color: "#fff", cursor: "pointer" }}>
                                            {schemaGenerating ? "Yaradılır..." : "⚡ Generate Et"}
                                        </button>
                                        <button type="button" onClick={saveSchema} disabled={schemaSaving || !!schemaError}
                                            style={{ padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "1.5px solid #16a34a", background: "#14532d", color: "#fff", cursor: "pointer" }}>
                                            {schemaSaving ? "Saxlanır..." : "Saxla"}
                                        </button>
                                    </div>
                                </div>
                                {schemaSaveStatus === "success" && <p style={{ color: "#16a34a", fontSize: 13, marginBottom: 8 }}>✓ Schema saxlanıldı</p>}
                                {schemaSaveStatus === "error" && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 8 }}>✕ Xəta baş verdi</p>}
                                <div className={styles.field}>
                                    <textarea
                                        className={styles.input}
                                        rows={14}
                                        value={schemaText}
                                        placeholder='{"@context": "https://schema.org", ...}'
                                        onChange={(e) => handleSchemaChange(e.target.value)}
                                        style={{ fontFamily: "monospace", fontSize: 12 }}
                                    />
                                </div>
                                {schemaError && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 4 }}>⚠ {schemaError}</p>}
                            </div>
                        )}
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