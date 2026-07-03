"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, uploadFile, toAbsUrl, generateSlug } from "@/lib/pulse-api";
import styles from "@/styles/blog.module.css";

type Author = { id: string; name: string; slug: string };
type Keyword = { id: string; name: string; slug: string };
type Category = { id: string; name: string | { az?: string; en?: string; ru?: string }; slug: string };
type ArticleSummary = { id: string; slug: string; title: string | { az?: string; en?: string; ru?: string }; coverImage?: string; category?: string | { az?: string; en?: string; ru?: string } };

type Block =
    | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
    | { type: "paragraph"; text: string }
    | { type: "image"; url: string; alt: string; caption?: string }
    | { type: "list"; ordered: boolean; items: string[] }
    | { type: "faq"; question: string; answer: string }
    | { type: "quote"; text: string; author?: string }
    | { type: "video"; url: string }
    | { type: "gallery"; images: { url: string; alt: string }[] };

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

function getLocalizedName(name: string | { az?: string; en?: string; ru?: string } | undefined): string {
    if (!name) return "";
    if (typeof name === "string") return name;
    return name.az || Object.values(name)[0] || "";
}

function ParagraphEditor({ block, onChange }: { block: Block & { type: "paragraph" }; onChange: (b: Block) => void }) {
    const ref = useRef<HTMLDivElement>(null);
    const [showLinkPopup, setShowLinkPopup] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkNewTab, setLinkNewTab] = useState(true);

    useEffect(() => {
        if (ref.current && ref.current.innerHTML !== block.text)
            ref.current.innerHTML = block.text;
    }, []);

    const wrapSelection = (tag: string) => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;
        const range = sel.getRangeAt(0);
        const el = document.createElement(tag);
        try { range.surroundContents(el); sel.removeAllRanges(); } catch {}
        const active = document.activeElement as HTMLElement;
        if (active) onChange({ ...block, text: active.innerHTML });
    };

    const openLinkPopup = () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) { alert("Əvvəlcə mətn seçin"); return; }
        setLinkUrl("");
        setLinkNewTab(true);
        setShowLinkPopup(true);
    };

    const applyLink = () => {
        setShowLinkPopup(false);
        if (!linkUrl.trim()) return;
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;
        const range = sel.getRangeAt(0);
        const a = document.createElement("a");
        a.href = linkUrl.trim();
        if (linkNewTab) a.target = "_blank";
        try { range.surroundContents(a); sel.removeAllRanges(); } catch {}
        const active = document.activeElement as HTMLElement;
        if (active) onChange({ ...block, text: active.innerHTML });
    };

    const removeLink = () => {
        setShowLinkPopup(false);
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;
        const node = sel.anchorNode?.parentElement?.closest?.("a");
        if (node) {
            node.replaceWith(...node.childNodes);
            sel.removeAllRanges();
            const active = document.activeElement as HTMLElement;
            if (active) onChange({ ...block, text: active.innerHTML });
        }
    };

    return (
        <div className={styles.field}>
            <label>
                Paraqraf mətni
                <button type="button" onClick={() => wrapSelection("b")} style={{
                    marginLeft: 12, padding: "2px 10px", borderRadius: 4,
                    border: "1px solid #cbd5e1", background: "#f1f5f9",
                    cursor: "pointer", fontSize: 13, fontWeight: 700,
                }} title="Seçilmiş mətni qalın et (B)">B</button>
                <button type="button" onClick={() => wrapSelection("i")} style={{
                    marginLeft: 4, padding: "2px 10px", borderRadius: 4,
                    border: "1px solid #cbd5e1", background: "#f1f5f9",
                    cursor: "pointer", fontSize: 13, fontStyle: "italic",
                }} title="Seçilmiş mətni kursiv et (I)">I</button>
                <button type="button" onClick={openLinkPopup} style={{
                    marginLeft: 4, padding: "2px 10px", borderRadius: 4,
                    border: "1px solid #cbd5e1", background: "#f1f5f9",
                    cursor: "pointer", fontSize: 13,
                }} title="Link əlavə et (🔗)">🔗</button>
            </label>
            {showLinkPopup && (
                <div className={styles.linkPopup} style={{ marginTop: 6 }}>
                    <input className={styles.linkInput} value={linkUrl}
                        onChange={e => setLinkUrl(e.target.value)}
                        placeholder="https://..." autoFocus
                        onKeyDown={e => e.key === "Enter" && applyLink()}
                    />
                    <label className={styles.linkCheckbox}>
                        <input type="checkbox" checked={linkNewTab}
                            onChange={e => setLinkNewTab(e.target.checked)}
                        /> Yeni səhifə
                    </label>
                    <button className={styles.linkApplyBtn} onClick={applyLink}>Tətbiq et</button>
                    <button className={styles.linkRemoveBtn} onClick={removeLink}>Sil</button>
                    <button className={styles.linkCancelBtn} onClick={() => setShowLinkPopup(false)}>Ləğv et</button>
                </div>
            )}
            <div ref={ref} contentEditable suppressHydrationWarning
                className={styles.input}
                style={{ minHeight: 80, whiteSpace: "pre-wrap" }}
                onBlur={e => onChange({ ...block, text: e.currentTarget.innerHTML })}
            />
        </div>
    );
}

function BlockItem({ block, index, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: {
    block: Block; index: number; onChange: (b: Block) => void; onRemove: () => void;
    onMoveUp: () => void; onMoveDown: () => void; isFirst: boolean; isLast: boolean;
}) {
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadFile(file);
            if (block.type === "image") onChange({ ...block, url });
            else if (block.type === "gallery") {
                const newImages = [...block.images, { url, alt: "" }];
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
                            <input className={styles.input} value={block.text}
                                onChange={e => onChange({ ...block, text: e.target.value })} placeholder="Başlıq" />
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
                return <ParagraphEditor block={block} onChange={onChange} />;
            case "image":
                return (
                    <div className={styles.field}>
                        <label>Şəkil</label>
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                                <input className={styles.input} value={block.url}
                                    onChange={e => onChange({ ...block, url: e.target.value })} placeholder="Şəkil URL və ya yükləyin" />
                                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                                    <input className={styles.input} value={block.alt}
                                        onChange={e => onChange({ ...block, alt: e.target.value })} placeholder="Alt text" style={{ flex: 1 }} />
                                    <input className={styles.input} value={block.caption || ""}
                                        onChange={e => onChange({ ...block, caption: e.target.value })} placeholder="Caption (ixtiyari)" style={{ flex: 1 }} />
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
                            <img src={toAbsUrl(block.url)} alt={block.alt} style={{ maxWidth: 200, maxHeight: 120, borderRadius: 6, marginTop: 8 }} />
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
                                <input className={styles.input} value={item}
                                    onChange={e => {
                                        const newItems = [...block.items];
                                        newItems[i] = e.target.value;
                                        onChange({ ...block, items: newItems });
                                    }} placeholder={`Element ${i + 1}`} />
                                <button type="button" onClick={() => {
                                    const newItems = block.items.filter((_, idx) => idx !== i);
                                    onChange({ ...block, items: newItems });
                                }} style={{ padding: "4px 8px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 4, cursor: "pointer" }}>Sil</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => onChange({ ...block, items: [...block.items, ""] })}
                            style={{ padding: "6px 12px", border: "1px dashed #cbd5e1", borderRadius: 6, background: "#f8fafc", cursor: "pointer", fontSize: 13 }}>+ Element əlavə et</button>
                    </div>
                );
            case "faq":
                return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div className={styles.field}>
                            <label>Sual</label>
                            <input className={styles.input} value={block.question}
                                onChange={e => onChange({ ...block, question: e.target.value })} placeholder="Sualı yazın" />
                        </div>
                        <div className={styles.field}>
                            <label>Cavab</label>
                            <textarea className={styles.input} rows={3} value={block.answer}
                                onChange={e => onChange({ ...block, answer: e.target.value })} placeholder="Cavabı yazın" />
                        </div>
                    </div>
                );
            case "quote":
                return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div className={styles.field}>
                            <label>Sitat mətni</label>
                            <textarea className={styles.input} rows={2} value={block.text}
                                onChange={e => onChange({ ...block, text: e.target.value })} placeholder="Sitatı yazın" />
                        </div>
                        <div className={styles.field}>
                            <label>Müəllif (ixtiyari)</label>
                            <input className={styles.input} value={block.author || ""}
                                onChange={e => onChange({ ...block, author: e.target.value })} placeholder="Müəllif adı" />
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
                                    <img src={toAbsUrl(img.url)} alt={img.alt} style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 6 }} />
                                    <input className={styles.input} value={img.alt} placeholder="Alt"
                                        onChange={e => {
                                            const newImages = [...block.images];
                                            const current = newImages[i]!;
                                            newImages[i] = { url: current.url || "", alt: e.target.value };
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
        <div className={styles.sectionBlock}>
            <div className={styles.sectionBlockHeader}>
                <div className={styles.sectionBlockLeft}>
                    <span className={styles.sectionTypeTag}>{blockLabel?.icon} {blockLabel?.label}</span>
                    <span className={styles.sectionIndex}>#{index + 1}</span>
                </div>
                <div className={styles.sectionBlockRight}>
                    <button type="button" className={styles.toggleBtn} onClick={onMoveUp} disabled={isFirst} style={{ opacity: isFirst ? 0.3 : 1 }}>↑</button>
                    <button type="button" className={styles.toggleBtn} onClick={onMoveDown} disabled={isLast} style={{ opacity: isLast ? 0.3 : 1 }}>↓</button>
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

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [category, setCategory] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [authorId, setAuthorId] = useState("");
    const [published, setPublished] = useState(false);
    const [featured, setFeatured] = useState(false);
    const [headerPositions, setHeaderPositions] = useState<string[]>([]);
    const [headerOrder, setHeaderOrder] = useState<number>(0);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
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
                setTitle(a.title && typeof a.title === "object" ? (a.title?.az || Object.values(a.title)[0] || "") : (a.title || ""));
                setSlug(a.slug);
                setCategory(a.category && typeof a.category === "object" ? (a.category?.az || Object.values(a.category)[0] || "") : (a.category || ""));
                setExcerpt(a.excerpt && typeof a.excerpt === "object" ? (a.excerpt?.az || Object.values(a.excerpt)[0] || "") : (a.excerpt || ""));
                setCoverImage(a.coverImage || "");
                setAuthorId(a.authorId || ""); setPublished(a.published);
                setFeatured(a.featured); setHeaderPositions(Array.isArray(a.headerPositions) ? a.headerPositions : []);
                setHeaderOrder(a.headerOrder || 0);
                setSelectedKeywords(a.keywords?.map((k: any) => k.id) || []);
                setBlocks(Array.isArray(a.blocks) ? (a.blocks as Block[]) : []);
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
            case "heading": newBlock = { type: "heading", level: 2, text: "" }; break;
            case "paragraph": newBlock = { type: "paragraph", text: "" }; break;
            case "image": newBlock = { type: "image", url: "", alt: "" }; break;
            case "list": newBlock = { type: "list", ordered: false, items: [""] }; break;
            case "faq": newBlock = { type: "faq", question: "", answer: "" }; break;
            case "quote": newBlock = { type: "quote", text: "", author: "" }; break;
            case "video": newBlock = { type: "video", url: "" }; break;
            case "gallery": newBlock = { type: "gallery", images: [] }; break;
        }
        setBlocks(prev => [...prev, newBlock!]);
    };

    const updateBlock = useCallback((index: number, block: Block) => {
        setBlocks(prev => { const next = [...prev]; next[index] = block; return next; });
    }, []);

    const removeBlock = useCallback((index: number) => {
        setBlocks(prev => prev.filter((_, i) => i !== index));
    }, []);

    const moveBlock = useCallback((from: number, to: number) => {
        setBlocks(prev => {
            const next = [...prev];
            const moved = next.splice(from, 1)[0];
            if (moved) next.splice(to, 0, moved);
            return next;
        });
    }, []);

    const save = async () => {
        if (!title.trim() || !slug.trim() || !category) return;
        setSaving(true);
        try {
            const body = {
                title: { az: title }, slug, category: { az: category },
                excerpt: excerpt ? { az: excerpt } : null,
                coverImage: coverImage || null,
                authorId: authorType === "existing" ? (authorId || null) : null,
                published, featured,
                headerPositions,
                headerOrder: headerOrder || null,
                blocks,
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
                        <label>Başlıq *</label>
                        <input className={styles.input} value={title} onChange={e => { setTitle(e.target.value); if (!isNew) setSlug(generateSlug(e.target.value)); }} placeholder="Məqalə başlığı" />
                    </div>
                    <div className={styles.field}>
                        <label>Slug *</label>
                        <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} placeholder="meqale-basligi" />
                    </div>
                </div>
                <div className={styles.twoCol}>
                    <div className={styles.field}>
                        <label>Kateqoriya *</label>
                        <select className={styles.input} value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="">Seçin...</option>
                            {categories.map(c => {
                                const catName = typeof c.name === "string" ? c.name : (c.name?.az || Object.values(c.name)[0] || "");
                                return <option key={c.id} value={catName}>{catName}</option>;
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
                                {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
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
                    <label>Qısa məzmun</label>
                    <textarea className={styles.input} rows={3} value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Məqalənin qısa təsviri" />
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
                            {k.name}
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
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {blocks.map((block, i) => (
                        <BlockItem
                            key={i} block={block} index={i}
                            onChange={b => updateBlock(i, b)}
                            onRemove={() => removeBlock(i)}
                            onMoveUp={() => i > 0 && moveBlock(i, i - 1)}
                            onMoveDown={() => i < blocks.length - 1 && moveBlock(i, i + 1)}
                            isFirst={i === 0} isLast={i === blocks.length - 1}
                        />
                    ))}
                </div>

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
