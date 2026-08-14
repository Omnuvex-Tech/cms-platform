"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, uploadFile, toAbsUrl, generateSlug } from "@/lib/pulse-api";
import { LangInput } from "@/components/LangInput";
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RichEditor } from "@/components/RichEditor";
import styles from "@/styles/blog.module.css";

type Author = { id: string; name: string | { az?: string; en?: string; ru?: string }; slug: string };
type Keyword = { id: string; name: string | { az?: string; en?: string; ru?: string }; slug: string };
type Category = { id: string; name: string | { az?: string; en?: string; ru?: string }; slug: string };
type ArticleSummary = { id: string; slug: string; title: string | { az?: string; en?: string; ru?: string }; coverImage?: string; category?: string | { az?: string; en?: string; ru?: string } };

type LocalizedText = string | { az?: string; en?: string; ru?: string } | null | undefined;
type EditorLocale = "az" | "en" | "ru";

/**
 * Hər blokda olan ortaq sahələr.
 *   id        — dnd-kit üçün sabit açar. JSON-da saxlanılır, treva-web onu görməzdən gəlir.
 *   isVisible — false olduqda blok saytda render olunmur (master-dəki section məntiqi).
 */
type BlockCommon = { id?: string; isVisible?: boolean };

type Block = BlockCommon & (
    | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: LocalizedText }
    | { type: "paragraph"; text: LocalizedText }
    | { type: "image"; url: string; alt: LocalizedText; caption?: LocalizedText }
    | { type: "list"; ordered: boolean; items: LocalizedText[] }
    | { type: "faq"; question: LocalizedText; answer: LocalizedText }
    | { type: "quote"; text: LocalizedText; author?: LocalizedText }
    | { type: "video"; url: string }
    | { type: "gallery"; images: { url: string; alt: LocalizedText }[] }
);

const BLOCK_TYPES: { type: Block["type"]; label: string; icon: string }[] = [
    { type: "heading", label: "Başlıq", icon: "H" },
    { type: "paragraph", label: "Paraqraf", icon: "P" },
    { type: "image", label: "Şəkil", icon: "🖼" },
    { type: "list", label: "Siyahı", icon: "•" },
    { type: "faq", label: "FAQ", icon: "?" },
    { type: "quote", label: "Sitat", icon: "❝" },
    { type: "video", label: "Video", icon: "▶" },
    { type: "gallery", label: "Qalereya", icon: "⊞" },
];

const EDITOR_LANGS: { key: EditorLocale; label: string }[] = [
    { key: "az", label: "AZ" },
    { key: "en", label: "EN" },
    { key: "ru", label: "RU" },
];

function getLocalizedName(name: any): string {
    if (!name) return "";
    if (typeof name === "string") return name;
    if (typeof name === "object") {
        const val = name.az || name.en || name.ru;
        if (typeof val === "string") return val;
        const firstVal = Object.values(name).find(v => typeof v === "string");
        if (firstVal) return firstVal as string;
    }
    return "";
}

type LocalizedValue = Record<string, string>;

function toLocalizedValue(value: any): LocalizedValue {
    if (!value) return { az: "", en: "", ru: "" };
    if (typeof value === "string") return { az: value, en: value, ru: value };
    return {
        az: typeof value.az === "string" ? value.az : "",
        en: typeof value.en === "string" ? value.en : "",
        ru: typeof value.ru === "string" ? value.ru : "",
    };
}

function hasLocalizedValue(value: LocalizedValue): boolean {
    return Object.values(value).some((item) => item.trim().length > 0);
}

function toDateInputValue(value?: string | null): string {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getPrimaryLocalizedValue(value: LocalizedText): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    const entries = [value.az, value.en, value.ru, ...Object.values(value)]
        .map((entry) => String(entry ?? ""))
        .filter(Boolean);
    return entries[0] || "";
}

function normalizeLocalizedText(value: LocalizedText): { az: string; en: string; ru: string } {
    if (!value) return { az: "", en: "", ru: "" };
    if (typeof value === "string") return { az: value, en: value, ru: value };
    const az = typeof value.az === "string" ? value.az : "";
    const en = typeof value.en === "string" ? value.en : "";
    const ru = typeof value.ru === "string" ? value.ru : "";
    const fallback = az || en || ru || getPrimaryLocalizedValue(value);
    return {
        az: az || fallback,
        en: en || az || fallback,
        ru: ru || az || fallback,
    };
}

function setLocalizedText(value: LocalizedText, locale: EditorLocale, nextValue: string): { az: string; en: string; ru: string } {
    const current = normalizeLocalizedText(value);
    const updated = nextValue ?? "";

    if (locale === "az") {
        return {
            az: updated,
            en: current.en?.trim() ? current.en : updated,
            ru: current.ru?.trim() ? current.ru : updated,
        };
    }

    return {
        ...current,
        [locale]: updated,
    };
}

/** dnd-kit-in sabit açara ehtiyacı var; id-si olmayan köhnə bloklara birini veririk. */
function makeBlockId() {
    return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function withBlockIds(input: Block[]): Block[] {
    return (input || []).map(block => (block.id ? block : { ...block, id: makeBlockId() }));
}

function normalizeBlocks(input: Block[]): any[] {
    return (input || []).map((block) => {
        switch (block.type) {
            case "heading":
                return { ...block, text: normalizeLocalizedText(block.text) };
            case "paragraph":
                return { ...block, text: normalizeLocalizedText(block.text) };
            case "image":
                return {
                    ...block,
                    alt: normalizeLocalizedText(block.alt),
                    ...(block.caption !== undefined ? { caption: normalizeLocalizedText(block.caption) } : {}),
                };
            case "list":
                return { ...block, items: (block.items || []).map((item) => normalizeLocalizedText(item)) };
            case "faq":
                return {
                    ...block,
                    question: normalizeLocalizedText(block.question),
                    answer: normalizeLocalizedText(block.answer),
                };
            case "quote":
                return {
                    ...block,
                    text: normalizeLocalizedText(block.text),
                    ...(block.author !== undefined ? { author: normalizeLocalizedText(block.author) } : {}),
                };
            case "video":
                return block;
            case "gallery":
                return {
                    ...block,
                    images: (block.images || []).map((img) => ({
                        url: img.url,
                        alt: normalizeLocalizedText(img.alt),
                    })),
                };
        }
    });
}

/**
 * Paraqraf redaktoru.
 *
 * Əvvəl xam `contentEditable` + `range.surroundContents()` idi — seçim sərhədləri
 * element sərhədini kəsəndə sükutla uğursuz olurdu və geri-al (undo) yox idi.
 * İndi master branch-dakı kimi Tiptap işlədirik.
 */
function ParagraphEditor({ block, locale, onChange }: {
    block: Block & { type: "paragraph" }; locale: EditorLocale; onChange: (b: Block) => void;
}) {
    const text = normalizeLocalizedText(block.text);
    return (
        <div className={styles.field}>
            <label>Paraqraf mətni</label>
            <RichEditor
                styles={styles}
                value={text[locale] || ""}
                onChange={v => onChange({ ...block, text: setLocalizedText(block.text, locale, v) })}
            />
        </div>
    );
}

function BlockItem({ block, index, locale, onChange, onRemove }: {
    block: Block; index: number; onChange: (b: Block) => void; onRemove: () => void;
    locale: EditorLocale;
}) {
    const [uploading, setUploading] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: block.id ?? `idx-${index}` });
    const hidden = block.isVisible === false;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadFile(file);
            if (block.type === "image") onChange({ ...block, url });
            else if (block.type === "gallery") {
                const newImages = [...block.images, { url, alt: { az: "", en: "", ru: "" } }];
                onChange({ ...block, images: newImages });
            }
        } catch (err: any) { alert(err.message); }
        finally { setUploading(false); }
    };

    const renderFields = () => {
        switch (block.type) {
            case "heading":
                return (
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Başlıq mətni</label>
                            <input className={styles.input} value={normalizeLocalizedText(block.text)[locale] || ""}
                                onChange={e => onChange({ ...block, text: setLocalizedText(block.text, locale, e.target.value) })} placeholder="Başlıq" />
                        </div>
                        <div className={styles.field}>
                            <label>Səviyyə</label>
                            <select className={styles.input} value={block.level}
                                 onChange={e => onChange({ ...block, level: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })}>
                                <option value={1}>H1</option>
                                <option value={2}>H2</option>
                                <option value={3}>H3</option>
                                <option value={4}>H4</option>
                                <option value={5}>H5</option>
                                <option value={6}>H6</option>
                            </select>
                        </div>
                    </div>
                );
            case "paragraph":
                return <ParagraphEditor block={block} locale={locale} onChange={onChange} />;
            case "image":
                return (
                    <div className={styles.field}>
                        <label>Şəkil</label>
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                                <input className={styles.input} value={block.url}
                                    onChange={e => onChange({ ...block, url: e.target.value })} placeholder="Şəkil URL və ya yükləyin" />
                                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                                    <input className={styles.input} value={normalizeLocalizedText(block.alt)[locale] || ""}
                                        onChange={e => onChange({ ...block, alt: setLocalizedText(block.alt, locale, e.target.value) })} placeholder="Alt text" style={{ flex: 1 }} />
                                    <input className={styles.input} value={normalizeLocalizedText(block.caption || "")[locale] || ""}
                                        onChange={e => onChange({ ...block, caption: setLocalizedText(block.caption, locale, e.target.value) })} placeholder="Caption (ixtiyari)" style={{ flex: 1 }} />
                                </div>
                            </div>
                            <div>
                                <input type="file" accept="image/*" style={{ display: "none" }} id={`img-${index}`} onChange={handleImageUpload} />
                                <label htmlFor={`img-${index}`} style={{
                                    display: "inline-block", padding: "8px 16px", borderRadius: 6, border: "1px solid #e2e8f0",
                                    cursor: "pointer", fontSize: 13, background: "#fff",
                                }}>{uploading ? "Yüklənir..." : "Yüklə"}</label>
                            </div>
                        </div>
                        {block.url && (
                            <img src={toAbsUrl(block.url)} alt={getPrimaryLocalizedValue(block.alt)} style={{ maxWidth: 200, maxHeight: 120, borderRadius: 6, marginTop: 8 }} />
                        )}
                    </div>
                );
            case "list":
                return (
                    <div className={styles.field}>
                        <label>
                            Siyahı elementləri
                            <button
                                type="button"
                                onClick={() => onChange({ ...block, ordered: !block.ordered })}
                                style={{
                                    marginLeft: 12,
                                    padding: "2px 10px",
                                    borderRadius: 4,
                                    border: "1px solid #cbd5e1",
                                    background: block.ordered ? "#2563eb" : "#f1f5f9",
                                    color: block.ordered ? "#fff" : "#475569",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 600,
                                }}
                            >
                                {block.ordered ? "1. 2. 3." : "• • •"}
                            </button>
                        </label>
                        {block.items.map((item, i) => (
                            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                                <input className={styles.input} value={normalizeLocalizedText(item)[locale] || ""}
                                    onChange={e => {
                                        const newItems = [...block.items];
                                        newItems[i] = setLocalizedText(item, locale, e.target.value);
                                        onChange({ ...block, items: newItems });
                                    }} placeholder={`Element ${i + 1}`} />
                                <button type="button" onClick={() => {
                                    const newItems = block.items.filter((_, idx) => idx !== i);
                                    onChange({ ...block, items: newItems });
                                }} style={{ padding: "4px 8px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 4, cursor: "pointer" }}>Sil</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => onChange({ ...block, items: [...block.items, { az: "", en: "", ru: "" }] })}
                            style={{ padding: "6px 12px", border: "1px dashed #cbd5e1", borderRadius: 6, background: "#f8fafc", cursor: "pointer", fontSize: 13 }}>+ Element əlavə et</button>
                    </div>
                );
            case "faq":
                return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div className={styles.field}>
                            <label>Sual</label>
                            <input className={styles.input} value={normalizeLocalizedText(block.question)[locale] || ""}
                                onChange={e => onChange({ ...block, question: setLocalizedText(block.question, locale, e.target.value) })} placeholder="Sualı yazın" />
                        </div>
                        <div className={styles.field}>
                            <label>Cavab</label>
                            <textarea className={styles.input} rows={3} value={normalizeLocalizedText(block.answer)[locale] || ""}
                                onChange={e => onChange({ ...block, answer: setLocalizedText(block.answer, locale, e.target.value) })} placeholder="Cavabı yazın" />
                        </div>
                    </div>
                );
            case "quote":
                return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div className={styles.field}>
                            <label>Sitat mətni</label>
                            <textarea className={styles.input} rows={2} value={normalizeLocalizedText(block.text)[locale] || ""}
                                onChange={e => onChange({ ...block, text: setLocalizedText(block.text, locale, e.target.value) })} placeholder="Sitatı yazın" />
                        </div>
                        <div className={styles.field}>
                            <label>Müəllif (ixtiyari)</label>
                            <input className={styles.input} value={normalizeLocalizedText(block.author || "")[locale] || ""}
                                onChange={e => onChange({ ...block, author: setLocalizedText(block.author, locale, e.target.value) })} placeholder="Müəllif adı" />
                        </div>
                    </div>
                );
            case "video":
                return (
                    <div className={styles.field}>
                        <label>Video embed URL (YouTube, Vimeo)</label>
                        <input className={styles.input} value={block.url}
                            onChange={e => onChange({ ...block, url: e.target.value })} placeholder="https://www.youtube.com/embed/..." />
                        {block.url && (
                            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 8, marginTop: 8 }}>
                                <iframe src={block.url} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }} allowFullScreen />
                            </div>
                        )}
                    </div>
                );
            case "gallery":
                return (
                    <div className={styles.field}>
                        <label>Qalereya şəkilləri</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                            {block.images.map((img, i) => (
                                <div key={i} style={{ position: "relative", width: 120 }}>
                                    <img src={toAbsUrl(img.url)} alt={getPrimaryLocalizedValue(img.alt)} style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 6 }} />
                                    <input className={styles.input} value={normalizeLocalizedText(img.alt)[locale] || ""} placeholder="Alt"
                                        onChange={e => {
                                            const newImages = [...block.images];
                                            const current = newImages[i]!;
                                            newImages[i] = { url: current.url || "", alt: setLocalizedText(current.alt, locale, e.target.value) };
                                            onChange({ ...block, images: newImages });
                                        }} style={{ fontSize: 11, marginTop: 2 }} />
                                    <button type="button" onClick={() => {
                                        const newImages = block.images.filter((_, idx) => idx !== i);
                                        onChange({ ...block, images: newImages });
                                    }} style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 11 }}>✕</button>
                                </div>
                            ))}
                        </div>
                        <input type="file" accept="image/*" style={{ display: "none" }} id={`gallery-${index}`} onChange={handleImageUpload} />
                        <label htmlFor={`gallery-${index}`} style={{
                            display: "inline-block", padding: "6px 14px", border: "1px dashed #cbd5e1", borderRadius: 6,
                            cursor: "pointer", fontSize: 13, background: "#f8fafc",
                        }}>{uploading ? "Yüklənir..." : "+ Şəkil əlavə et"}</label>
                    </div>
                );
        }
    };

    const blockLabel = BLOCK_TYPES.find(b => b.type === block.type);

    return (
        <div
            ref={setNodeRef}
            className={styles.sectionBlock}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.5 : hidden ? 0.5 : 1,
            }}
        >
            <div className={styles.sectionBlockHeader}>
                <div className={styles.sectionBlockLeft}>
                    <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
                    <span className={styles.sectionTypeTag}>{blockLabel?.icon} {blockLabel?.label}</span>
                    <span className={styles.sectionIndex}>#{index + 1}</span>
                </div>
                <div className={styles.sectionBlockRight}>
                    <button type="button"
                        className={hidden ? styles.inactiveToggle : styles.activeToggle}
                        onClick={() => onChange({ ...block, isVisible: hidden })}>
                        {hidden ? "Gizli" : "Görünür"}
                    </button>
                    <button type="button" className={styles.deleteBtn} onClick={onRemove}>Sil</button>
                </div>
            </div>
            <div className={styles.sectionFields}>
                {renderFields()}
            </div>
        </div>
    );
}

export default function PulseArticleEditPage() {
    const { id } = useParams();
    const router = useRouter();
    const isNew = id === "new";

    const [title, setTitle] = useState<LocalizedValue>({ az: "", en: "", ru: "" });
    const [slug, setSlug] = useState("");
    const [category, setCategory] = useState<LocalizedValue>({ az: "", en: "", ru: "" });
    const [excerpt, setExcerpt] = useState<LocalizedValue>({ az: "", en: "", ru: "" });
    const [publishDate, setPublishDate] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [authorId, setAuthorId] = useState("");
    const [published, setPublished] = useState(false);
    const [featured, setFeatured] = useState(false);
    const [headerPositions, setHeaderPositions] = useState<string[]>([]);
    const [headerOrder, setHeaderOrder] = useState<number>(0);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [blockLocale, setBlockLocale] = useState<EditorLocale>("az");
    const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
    const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
    const [authorType, setAuthorType] = useState<"existing" | "custom">("existing");
    const [customAuthorName, setCustomAuthorName] = useState("");

    const [authors, setAuthors] = useState<Author[]>([]);
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [allArticles, setAllArticles] = useState<ArticleSummary[]>([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(!isNew);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        Promise.all([apiFetch("/pulse/authors"), apiFetch("/pulse/keywords"), apiFetch("/pulse/categories"), apiFetch("/pulse/articles/all")])
            .then(([a, k, c, articles]) => {
                setAuthors(a); setKeywords(k); setCategories(c);
                setAllArticles(articles.map((art: any) => ({
                    id: art.id, slug: art.slug,
                    title: art.title,
                    coverImage: art.coverImage,
                    category: art.category,
                })));
            });
        if (!isNew) {
            apiFetch(`/pulse/articles/${id}`).then(a => {
                setTitle(toLocalizedValue(a.title));
                setSlug(a.slug);
                setCategory(toLocalizedValue(a.category));
                setExcerpt(toLocalizedValue(a.excerpt));
                setPublishDate(toDateInputValue(a.date || a.createdAt));
                setCoverImage(a.coverImage || "");
                setAuthorId(a.authorId || ""); setPublished(a.published);
                setFeatured(a.featured); setHeaderPositions(Array.isArray(a.headerPositions) ? a.headerPositions : []);
                setHeaderOrder(a.headerOrder || 0);
                setSelectedKeywords(a.keywords?.map((k: any) => k.id) || []);
                setBlocks(Array.isArray(a.blocks) ? withBlockIds(normalizeBlocks(a.blocks as Block[]) as Block[]) : []);
                setSelectedArticleIds(a.selectedArticles?.map((s: any) => s.id) || []);
                setSocialLinks(a.socialLinks || {});
                setCustomAuthorName(a.socialLinks?.name || "");
                if (a.authorId) setAuthorType("existing");
                else if (a.socialLinks) setAuthorType("custom");
            }).finally(() => setLoading(false));
        }
    }, [id, isNew]);

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await uploadFile(file);
        setCoverImage(url);
        if (fileRef.current) fileRef.current.value = "";
    };

    const addBlock = (type: Block["type"]) => {
        let newBlock: Block;
        switch (type) {
            case "heading": newBlock = { type: "heading", level: 2, text: { az: "", en: "", ru: "" } }; break;
            case "paragraph": newBlock = { type: "paragraph", text: { az: "", en: "", ru: "" } }; break;
            case "image": newBlock = { type: "image", url: "", alt: { az: "", en: "", ru: "" } }; break;
            case "list": newBlock = { type: "list", ordered: false, items: [{ az: "", en: "", ru: "" }] }; break;
            case "faq": newBlock = { type: "faq", question: { az: "", en: "", ru: "" }, answer: { az: "", en: "", ru: "" } }; break;
            case "quote": newBlock = { type: "quote", text: { az: "", en: "", ru: "" }, author: { az: "", en: "", ru: "" } }; break;
            case "video": newBlock = { type: "video", url: "" }; break;
            case "gallery": newBlock = { type: "gallery", images: [] }; break;
        }
        setBlocks(prev => [...prev, { ...newBlock!, id: makeBlockId(), isVisible: true }]);
    };

    const updateBlock = useCallback((index: number, block: Block) => {
        setBlocks(prev => { const next = [...prev]; next[index] = block; return next; });
    }, []);

    const removeBlock = useCallback((index: number) => {
        setBlocks(prev => prev.filter((_, i) => i !== index));
    }, []);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleBlockDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setBlocks(prev => {
            const from = prev.findIndex(b => b.id === active.id);
            const to = prev.findIndex(b => b.id === over.id);
            if (from < 0 || to < 0) return prev;
            return arrayMove(prev, from, to);
        });
    }, []);

    const save = async () => {
        if (!hasLocalizedValue(title) || !slug.trim() || !hasLocalizedValue(category)) return;
        setSaving(true);
        try {
            const body = {
                title,
                slug,
                category,
                excerpt: hasLocalizedValue(excerpt) ? excerpt : null,
                ...(publishDate ? { date: publishDate } : {}),
                coverImage: coverImage || null,
                authorId: authorType === "existing" ? (authorId || null) : null,
                published, featured,
                headerPositions,
                headerOrder: headerOrder || null,
                blocks: normalizeBlocks(blocks),
                socialLinks: authorType === "custom" ? {
                    ...socialLinks,
                    ...(customAuthorName ? { name: customAuthorName } : {}),
                } : undefined,
                keywordIds: selectedKeywords,
                selectedArticleIds,
            };
            if (isNew) await apiFetch("/pulse/articles", { method: "POST", body: JSON.stringify(body) });
            else await apiFetch(`/pulse/articles/${id}`, { method: "PUT", body: JSON.stringify(body) });
            router.push("/pulse");
        } catch (e: any) { alert(e.message); }
        finally { setSaving(false); }
    };

    const toggleKeyword = (kid: string) => {
        setSelectedKeywords(prev => prev.includes(kid) ? prev.filter(k => k !== kid) : [...prev, kid]);
    };

    const toggleSelectedArticle = (aid: string) => {
        setSelectedArticleIds(prev => {
            if (prev.includes(aid)) return prev.filter(id => id !== aid);
            if (prev.length >= 4) return prev;
            return [...prev, aid];
        });
    };

    const availableArticles = allArticles.filter(a => a.id !== id);

    if (loading) return <div className={styles.empty}>Yüklənir...</div>;

    return (
        <div>
            <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>{isNew ? "Yeni Məqalə" : "Məqaləni Düzəlt"}</h2>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className={styles.cancelBtn} onClick={() => router.push("/pulse")}>Ləğv et</button>
                    <button className={styles.saveBtn} onClick={save} disabled={saving}>{saving ? "Saxlanır..." : "Saxla"}</button>
                </div>
            </div>

            <div className={styles.settingsCard}>
                <h3 className={styles.settingsGroupTitle}>Əsas məlumatlar</h3>
                <div className={styles.twoCol}>
                    <div className={styles.field}>
                        <LangInput
                            label="Başlıq *"
                            value={title}
                            onChange={(value) => {
                                setTitle(value);
                                if (!isNew) {
                                    setSlug(generateSlug(value.az || value.en || value.ru || ""));
                                }
                            }}
                            placeholder="Məqalə başlığı"
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Slug *</label>
                        <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} placeholder="meqale-basligi" />
                    </div>
                </div>
                <div className={styles.twoCol}>
                    <div className={styles.field}>
                        <label>Kateqoriya *</label>
                        <select
                            className={styles.input}
                            value={(() => {
                                const currentName = getLocalizedName(category);
                                const found = categories.find((c) => getLocalizedName(c.name) === currentName);
                                return found?.id || "";
                            })()}
                            onChange={e => {
                                const selected = categories.find(c => c.id === e.target.value);
                                if (selected) setCategory(toLocalizedValue(selected.name));
                                else setCategory({ az: "", en: "", ru: "" });
                            }}
                        >
                            <option value="">Seçin...</option>
                            {categories.map(c => {
                                const catName = typeof c.name === "string" ? c.name : (c.name?.az || Object.values(c.name)[0] || "");
                                return <option key={c.id} value={c.id}>{catName}</option>;
                            })}
                        </select>
                    </div>
                    <div className={styles.field}>
                        <label>Müəllif</label>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                            <button type="button" onClick={() => setAuthorType("existing")}
                                style={{
                                    padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                                    border: "1.5px solid", fontWeight: authorType === "existing" ? 600 : 400,
                                    borderColor: authorType === "existing" ? "#2563eb" : "#e2e8f0",
                                    background: authorType === "existing" ? "#2563eb" : "transparent",
                                    color: authorType === "existing" ? "#fff" : "#64748b",
                                }}>Mövcud müəllif</button>
                            <button type="button" onClick={() => setAuthorType("custom")}
                                style={{
                                    padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                                    border: "1.5px solid", fontWeight: authorType === "custom" ? 600 : 400,
                                    borderColor: authorType === "custom" ? "#2563eb" : "#e2e8f0",
                                    background: authorType === "custom" ? "#2563eb" : "transparent",
                                    color: authorType === "custom" ? "#fff" : "#64748b",
                                }}>Xüsusi + Sosial media</button>
                        </div>
                        {authorType === "existing" ? (
                            <select className={styles.input} value={authorId} onChange={e => setAuthorId(e.target.value)}>
                                <option value="">Seçin...</option>
                                {authors.map(a => <option key={a.id} value={a.id}>{getLocalizedName(a.name)}</option>)}
                            </select>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <input className={styles.input} value={customAuthorName}
                                    onChange={e => setCustomAuthorName(e.target.value)} placeholder="Müəllif adı" />
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                                    {[
                                        { key: "facebook", icon: "f", color: "#1877F2", label: "Facebook" },
                                        { key: "instagram", icon: "📷", color: "#E4405F", label: "Instagram" },
                                        { key: "tiktok", icon: "♪", color: "#000000", label: "TikTok" },
                                        { key: "website", icon: "🌐", color: "#4A90D9", label: "Vebsayt" },
                                    ].map(platform => (
                                        <div key={platform.key} style={{ display: "flex", alignItems: "center", gap: 4, flex: "1 1 180px" }}>
                                            <span title={platform.label} style={{
                                                width: 28, height: 28, borderRadius: "50%",
                                                background: platform.color, color: "#fff",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 12, fontWeight: 700, flexShrink: 0,
                                            }}>{platform.icon}</span>
                                            <input className={styles.input}
                                                value={socialLinks[platform.key] || ""}
                                                onChange={e => setSocialLinks(prev => ({ ...prev, [platform.key]: e.target.value }))}
                                                placeholder={`${platform.label} URL`} style={{ flex: 1, fontSize: 12 }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.field}>
                    <LangInput
                        label="Qısa məzmun"
                        value={excerpt}
                        onChange={setExcerpt}
                        type="textarea"
                        placeholder="Məqalənin qısa təsviri"
                    />
                </div>

                <div className={styles.field}>
                    <label>Dərc olunma tarixi</label>
                    <input
                        type="date"
                        className={styles.input}
                        value={publishDate}
                        onChange={e => setPublishDate(e.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <label>Örtük şəkli</label>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverUpload} />
                    <div onClick={() => fileRef.current?.click()} style={{ cursor: "pointer", border: "1px dashed #cbd5e1", borderRadius: 8, padding: 16, textAlign: "center", background: "#f8fafc" }}>
                        {coverImage ? <img src={toAbsUrl(coverImage)} alt="" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 6 }} /> : <span style={{ color: "#94a3b8", fontSize: 14 }}>Şəkil yüklə</span>}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} /> Dərc olunub
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} /> Seçilmiş
                    </label>
                </div>
            </div>

            <div className={styles.settingsCard}>
                <h3 className={styles.settingsGroupTitle}>Açar sözlər</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {keywords.map(k => (
                        <button key={k.id} type="button"
                            onClick={() => toggleKeyword(k.id)}
                            style={{
                                padding: "4px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                                border: "1.5px solid",
                                borderColor: selectedKeywords.includes(k.id) ? "#2563eb" : "#e2e8f0",
                                background: selectedKeywords.includes(k.id) ? "#2563eb" : "transparent",
                                color: selectedKeywords.includes(k.id) ? "#fff" : "#64748b",
                            }}>
                            {getLocalizedName(k.name)}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.settingsCard}>
                <h3 className={styles.settingsGroupTitle}>Seçilmiş məqalələr <span style={{ fontWeight: 400, fontSize: 13, color: "#94a3b8" }}>({selectedArticleIds.length}/4)</span></h3>
                {selectedArticleIds.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                        {selectedArticleIds.map(aid => {
                            const art = allArticles.find(a => a.id === aid);
                            if (!art) return null;
                            const artTitle = getLocalizedName(art.title);
                            const artCat = getLocalizedName(art.category);
                            return (
                                <div key={aid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", border: "1.5px solid #2563eb", borderRadius: 8, background: "#eff6ff" }}>
                                    {art.coverImage && <img src={toAbsUrl(art.coverImage)} alt="" style={{ width: 48, height: 32, objectFit: "cover", borderRadius: 4 }} />}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{artTitle}</div>
                                        {artCat && <div style={{ fontSize: 11, color: "#64748b" }}>{artCat}</div>}
                                    </div>
                                    <button type="button" onClick={() => toggleSelectedArticle(aid)}
                                        style={{ padding: "4px 10px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, flexShrink: 0 }}>Sil</button>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {availableArticles.map(art => {
                        const isSelected = selectedArticleIds.includes(art.id);
                        const artTitle = getLocalizedName(art.title);
                        return (
                            <button key={art.id} type="button" disabled={!isSelected && selectedArticleIds.length >= 4}
                                onClick={() => toggleSelectedArticle(art.id)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 6, fontSize: 13, cursor: isSelected || selectedArticleIds.length < 4 ? "pointer" : "not-allowed",
                                    border: "1.5px solid",
                                    borderColor: isSelected ? "#2563eb" : "#e2e8f0",
                                    background: isSelected ? "#2563eb" : "#fff",
                                    color: isSelected ? "#fff" : "#475569",
                                    opacity: !isSelected && selectedArticleIds.length >= 4 ? 0.5 : 1,
                                }}>
                                {art.coverImage && <img src={toAbsUrl(art.coverImage)} alt="" style={{ width: 28, height: 20, objectFit: "cover", borderRadius: 3 }} />}
                                {artTitle.length > 40 ? artTitle.slice(0, 40) + "..." : artTitle}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.settingsCard}>
                <h3 className={styles.settingsGroupTitle}>Məzmun blokları</h3>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    {EDITOR_LANGS.map((lang) => (
                        <button
                            key={lang.key}
                            type="button"
                            onClick={() => setBlockLocale(lang.key)}
                            style={{
                                padding: "6px 14px",
                                borderRadius: 999,
                                border: "1.5px solid",
                                borderColor: blockLocale === lang.key ? "#2563eb" : "#e2e8f0",
                                background: blockLocale === lang.key ? "#2563eb" : "#fff",
                                color: blockLocale === lang.key ? "#fff" : "#475569",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                            }}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBlockDragEnd}>
                    <SortableContext items={blocks.map((b, i) => b.id ?? `idx-${i}`)} strategy={verticalListSortingStrategy}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {blocks.map((block, i) => (
                                <BlockItem
                                    key={`${block.id ?? i}-${blockLocale}`} block={block} index={i} locale={blockLocale}
                                    onChange={b => updateBlock(i, b)}
                                    onRemove={() => removeBlock(i)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <div className={styles.addSectionRow} style={{ marginTop: 12 }}>
                    {BLOCK_TYPES.map(bt => (
                        <button key={bt.type} type="button" className={styles.addSectionBtn} onClick={() => addBlock(bt.type)}>
                            {bt.icon} {bt.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
