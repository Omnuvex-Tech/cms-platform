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
import ed from "@/styles/pulseEditor.module.css";

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
                        <div className={ed.imageRow}>
                            <div className={ed.grow}>
                                <input className={styles.input} value={block.url}
                                    onChange={e => onChange({ ...block, url: e.target.value })} placeholder="Şəkil URL və ya yükləyin" />
                                <div className={ed.imageMetaRow}>
                                    <input className={styles.input} value={normalizeLocalizedText(block.alt)[locale] || ""}
                                        onChange={e => onChange({ ...block, alt: setLocalizedText(block.alt, locale, e.target.value) })} placeholder="Alt text" />
                                    <input className={styles.input} value={normalizeLocalizedText(block.caption || "")[locale] || ""}
                                        onChange={e => onChange({ ...block, caption: setLocalizedText(block.caption, locale, e.target.value) })} placeholder="Caption (ixtiyari)" />
                                </div>
                            </div>
                            <div>
                                <input type="file" accept="image/*" hidden id={`img-${index}`} onChange={handleImageUpload} />
                                <label htmlFor={`img-${index}`} className={ed.uploadLabel}>
                                    {uploading ? "Yüklənir..." : "Yüklə"}
                                </label>
                            </div>
                        </div>
                        {block.url && (
                            <img src={toAbsUrl(block.url)} alt={getPrimaryLocalizedValue(block.alt)} className={ed.blockPreview} />
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
                                className={block.ordered ? ed.orderedToggleActive : ed.orderedToggle}
                            >
                                {block.ordered ? "1. 2. 3." : "• • •"}
                            </button>
                        </label>
                        {block.items.map((item, i) => (
                            <div key={i} className={ed.listRow}>
                                <input className={styles.input} value={normalizeLocalizedText(item)[locale] || ""}
                                    onChange={e => {
                                        const newItems = [...block.items];
                                        newItems[i] = setLocalizedText(item, locale, e.target.value);
                                        onChange({ ...block, items: newItems });
                                    }} placeholder={`Element ${i + 1}`} />
                                <button type="button" onClick={() => {
                                    const newItems = block.items.filter((_, idx) => idx !== i);
                                    onChange({ ...block, items: newItems });
                                }} className={ed.smallDeleteBtn}>Sil</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => onChange({ ...block, items: [...block.items, { az: "", en: "", ru: "" }] })}
                            className={ed.dashedBtn}>+ Element əlavə et</button>
                    </div>
                );
            case "faq":
                return (
                    <div className={ed.stack}>
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
                    <div className={ed.stack}>
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
                            <div className={ed.videoWrap}>
                                <iframe src={block.url} className={ed.videoFrame} allowFullScreen />
                            </div>
                        )}
                    </div>
                );
            case "gallery":
                return (
                    <div className={styles.field}>
                        <label>Qalereya şəkilləri</label>
                        <div className={ed.galleryGrid}>
                            {block.images.map((img, i) => (
                                <div key={i} className={ed.galleryItem}>
                                    <img src={toAbsUrl(img.url)} alt={getPrimaryLocalizedValue(img.alt)} className={ed.galleryThumb} />
                                    <input className={styles.input} value={normalizeLocalizedText(img.alt)[locale] || ""} placeholder="Alt"
                                        onChange={e => {
                                            const newImages = [...block.images];
                                            const current = newImages[i]!;
                                            newImages[i] = { url: current.url || "", alt: setLocalizedText(current.alt, locale, e.target.value) };
                                            onChange({ ...block, images: newImages });
                                        }} />
                                    <button type="button" onClick={() => {
                                        const newImages = block.images.filter((_, idx) => idx !== i);
                                        onChange({ ...block, images: newImages });
                                    }} className={ed.galleryRemove}>✕</button>
                                </div>
                            ))}
                        </div>
                        <input type="file" accept="image/*" hidden id={`gallery-${index}`} onChange={handleImageUpload} />
                        <label htmlFor={`gallery-${index}`} className={ed.galleryAddLabel}>
                            {uploading ? "Yüklənir..." : "+ Şəkil əlavə et"}
                        </label>
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
                <div className={ed.row}>
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
                        <div className={ed.langRow}>
                            <button type="button" onClick={() => setAuthorType("existing")}
                                className={authorType === "existing" ? ed.chipActive : ed.chip}>
                                Mövcud müəllif
                            </button>
                            <button type="button" onClick={() => setAuthorType("custom")}
                                className={authorType === "custom" ? ed.chipActive : ed.chip}>
                                Xüsusi + Sosial media
                            </button>
                        </div>
                        {authorType === "existing" ? (
                            <select className={styles.input} value={authorId} onChange={e => setAuthorId(e.target.value)}>
                                <option value="">Seçin...</option>
                                {authors.map(a => <option key={a.id} value={a.id}>{getLocalizedName(a.name)}</option>)}
                            </select>
                        ) : (
                            <div className={ed.stack}>
                                <input className={styles.input} value={customAuthorName}
                                    onChange={e => setCustomAuthorName(e.target.value)} placeholder="Müəllif adı" />
                                <div className={ed.socialGrid}>
                                    {[
                                        { key: "facebook", icon: "f", color: "#1877F2", label: "Facebook" },
                                        { key: "instagram", icon: "📷", color: "#E4405F", label: "Instagram" },
                                        { key: "tiktok", icon: "♪", color: "#000000", label: "TikTok" },
                                        { key: "website", icon: "🌐", color: "#4A90D9", label: "Vebsayt" },
                                    ].map(platform => (
                                        <div key={platform.key} className={ed.socialItem}>
                                            <span title={platform.label} className={ed.socialIcon}
                                                style={{ "--social-color": platform.color } as React.CSSProperties}>
                                                {platform.icon}
                                            </span>
                                            <input className={styles.input}
                                                value={socialLinks[platform.key] || ""}
                                                onChange={e => setSocialLinks(prev => ({ ...prev, [platform.key]: e.target.value }))}
                                                placeholder={`${platform.label} URL`} />
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
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleCoverUpload} />
                    <div className={ed.coverUpload} onClick={() => fileRef.current?.click()}>
                        {coverImage
                            ? <img src={toAbsUrl(coverImage)} alt="" className={ed.coverPreview} />
                            : <span className={ed.coverHint}>Şəkil yüklə</span>}
                    </div>
                </div>

                <div className={ed.rowWide}>
                    <label className={ed.checkLabel}>
                        <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} /> Dərc olunub
                    </label>
                    <label className={ed.checkLabel}>
                        <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} /> Seçilmiş
                    </label>
                </div>
            </div>

            <div className={styles.settingsCard}>
                <h3 className={styles.settingsGroupTitle}>Açar sözlər</h3>
                <div className={ed.wrapRow}>
                    {keywords.map(k => (
                        <button key={k.id} type="button"
                            onClick={() => toggleKeyword(k.id)}
                            className={selectedKeywords.includes(k.id) ? ed.chipActive : ed.chip}>
                            {getLocalizedName(k.name)}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.settingsCard}>
                <h3 className={styles.settingsGroupTitle}>Seçilmiş məqalələr <span className={ed.countHint}>({selectedArticleIds.length}/4)</span></h3>
                {selectedArticleIds.length > 0 && (
                    <div className={ed.selectedList}>
                        {selectedArticleIds.map(aid => {
                            const art = allArticles.find(a => a.id === aid);
                            if (!art) return null;
                            const artTitle = getLocalizedName(art.title);
                            const artCat = getLocalizedName(art.category);
                            return (
                                <div key={aid} className={ed.selectedItem}>
                                    {art.coverImage && <img src={toAbsUrl(art.coverImage)} alt="" className={ed.selectedThumb} />}
                                    <div className={ed.selectedInfo}>
                                        <div className={ed.selectedTitle}>{artTitle}</div>
                                        {artCat && <div className={ed.selectedCat}>{artCat}</div>}
                                    </div>
                                    <button type="button" onClick={() => toggleSelectedArticle(aid)}
                                        className={ed.selectedRemove}>Sil</button>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className={ed.wrapRow}>
                    {availableArticles.map(art => {
                        const isSelected = selectedArticleIds.includes(art.id);
                        const artTitle = getLocalizedName(art.title);
                        return (
                            <button key={art.id} type="button" disabled={!isSelected && selectedArticleIds.length >= 4}
                                onClick={() => toggleSelectedArticle(art.id)}
                                className={isSelected ? ed.pickerChipActive : ed.pickerChip}>
                                {art.coverImage && <img src={toAbsUrl(art.coverImage)} alt="" className={ed.pickerThumb} />}
                                {artTitle.length > 40 ? artTitle.slice(0, 40) + "..." : artTitle}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.settingsCard}>
                <h3 className={styles.settingsGroupTitle}>Məzmun blokları</h3>
                <div className={ed.langRow}>
                    {EDITOR_LANGS.map((lang) => (
                        <button
                            key={lang.key}
                            type="button"
                            onClick={() => setBlockLocale(lang.key)}
                            className={blockLocale === lang.key ? ed.langChipActive : ed.langChip}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBlockDragEnd}>
                    <SortableContext items={blocks.map((b, i) => b.id ?? `idx-${i}`)} strategy={verticalListSortingStrategy}>
                        <div className={ed.blockList}>
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

                <div className={`${styles.addSectionRow} ${ed.blockAddRow}`}>
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
