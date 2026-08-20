"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, uploadFile, toAbsUrl, generateSlug } from "@/lib/pulse-api";
import { LangInput } from "@/components/LangInput";
import { RichTextEditor } from "@repo/ui";
import { ImagePlus } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { Select } from "@/components/Select";
import styles from "@/styles/blog.module.css";
import ed from "@/styles/pulseEditor.module.css";

type Author = { id: string; name: string | { az?: string; en?: string; ru?: string }; slug: string };
type Keyword = { id: string; name: string | { az?: string; en?: string; ru?: string }; slug: string };
type Category = { id: string; name: string | { az?: string; en?: string; ru?: string }; slug: string };
type ArticleSummary = { id: string; slug: string; title: string | { az?: string; en?: string; ru?: string }; coverImage?: string; category?: string | { az?: string; en?: string; ru?: string } };

type LocalizedText = string | { az?: string; en?: string; ru?: string } | null | undefined;
type EditorLocale = "az" | "en" | "ru";

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
/**
 * Ən köhnə məqalələrdə mətn `text` yox, düz sətir olan `content` sahəsində
 * qalıb — redaktor yalnız `text`-ə baxsaydı belə bloklar boş açılardı.
 */
function legacyText(block: any): LocalizedText {
    return block.text ?? (typeof block.content === "string" ? block.content : undefined);
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/** Düz sətir gələndə onu paraqrafa bükür, HTML gələndə olduğu kimi buraxır. */
function asHtml(value: string): string {
    const text = (value || "").trim();
    if (!text) return "";
    return /^</.test(text) ? text : `<p>${escapeHtml(text)}</p>`;
}

const DIRECT_VIDEO = /\.(mp4|webm|ogg|mov)(\?|#|$)/i;

/**
 * Fayllar API host-unda dayanır, bazada isə nisbi yolla saxlanılır. Blok
 * sahələrini göstərəndə bunu `toAbsUrl` həll edirdi; sərbəst HTML-in içində isə
 * onu çağıran yoxdur — nisbi yol qalsa, brauzer faylı saytın öz domenində axtarır
 * və tapmır (slayd sayı düz, şəkil boş).
 */
function absolutizeMedia(html: string): string {
    return html.replace(
        /(src|href)="(\/uploads\/[^"]*)"/g,
        (_match, attribute: string, path: string) => `${attribute}="${toAbsUrl(path)}"`,
    );
}

/**
 * Köhnə blok siyahısını bir HTML sənədinə yığır.
 *
 * Məqalə mətni artıq tək sahədir, amma bazadakı köhnə məqalələr hələ də bloklarla
 * saxlanılır. Açılışda hər blok öz HTML qarşılığına çevrilir ki, heç bir mətn
 * gözdən itməsin; blok siyahısı bazada yalnız məqalə yenidən saxlananda əvəzlənir.
 */
function blocksToHtml(input: any[], locale: EditorLocale): string {
    return (input || [])
        .map((block) => {
            const localized = (value: LocalizedText) => normalizeLocalizedText(value)[locale] || "";

            switch (block?.type) {
                case "heading": {
                    const level = Math.min(Math.max(Number(block.level) || 2, 1), 6);
                    const text = localized(legacyText(block));
                    return text ? `<h${level}>${escapeHtml(text)}</h${level}>` : "";
                }

                case "paragraph":
                    return absolutizeMedia(asHtml(localized(legacyText(block))));

                case "image": {
                    if (!block.url) return "";
                    const alt = escapeHtml(localized(block.alt));
                    const caption = localized(block.caption);
                    return (
                        `<img src="${escapeHtml(toAbsUrl(block.url))}" alt="${alt}">` +
                        (caption ? `<p><em>${escapeHtml(caption)}</em></p>` : "")
                    );
                }

                case "list": {
                    const tag = block.ordered ? "ol" : "ul";
                    const items = (block.items || [])
                        .map((item: LocalizedText) => localized(item))
                        .filter(Boolean)
                        .map((item: string) => `<li><p>${escapeHtml(item)}</p></li>`)
                        .join("");
                    return items ? `<${tag}>${items}</${tag}>` : "";
                }

                // Sayt FAQ blokunu da başlıq + paraqraf kimi göstərirdi.
                case "faq": {
                    const question = localized(block.question);
                    const answer = localized(block.answer);
                    if (!question && !answer) return "";
                    return (
                        (question ? `<h2>${escapeHtml(question)}</h2>` : "") +
                        (answer ? `<p>${escapeHtml(answer)}</p>` : "")
                    );
                }

                case "quote": {
                    const text = localized(block.text);
                    const author = localized(block.author);
                    if (!text && !author) return "";
                    return (
                        "<blockquote>" +
                        (text ? `<p>${escapeHtml(text)}</p>` : "") +
                        (author ? `<p>— ${escapeHtml(author)}</p>` : "") +
                        "</blockquote>"
                    );
                }

                // Yüklənmiş fayl oynadıla bilər; YouTube kimi embed ünvanı isə
                // keçid kimi qalır ki, itməsin və admin onu yenidən əlavə etsin.
                case "video": {
                    if (!block.url) return "";
                    const url = escapeHtml(toAbsUrl(block.url));
                    return DIRECT_VIDEO.test(block.url)
                        ? `<video src="${url}" controls preload="metadata"></video>`
                        : `<p><a href="${url}">${url}</a></p>`;
                }

                case "gallery": {
                    const images = (block.images || [])
                        .filter((image: any) => image?.url)
                        .map(
                            (image: any) =>
                                `<img src="${escapeHtml(toAbsUrl(image.url))}" alt="${escapeHtml(localized(image.alt))}">`,
                        )
                        .join("");
                    return images ? `<div class="treva-slider" data-slider="true">${images}</div>` : "";
                }

                default:
                    return "";
            }
        })
        .filter(Boolean)
        .join("");
}

/**
 * Yüklənən fayl API host-unda qalır, saxlanılan HTML isə sayta olduğu kimi
 * verilir — ona görə nisbi yol yox, tam ünvan yazılır.
 */
const uploadArticleMedia = async (file: File) => toAbsUrl(await uploadFile(file));

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
    const [content, setContent] = useState<LocalizedValue>({ az: "", en: "", ru: "" });
    const [contentLocale, setContentLocale] = useState<EditorLocale>("az");
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
                setContent(
                    Array.isArray(a.blocks)
                        ? {
                            az: blocksToHtml(a.blocks, "az"),
                            en: blocksToHtml(a.blocks, "en"),
                            ru: blocksToHtml(a.blocks, "ru"),
                        }
                        : { az: "", en: "", ru: "" },
                );
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
                // Baza sxemi dəyişmir: mətn yenə `blocks` sütununda, yenə paraqraf
                // bloku kimi gedir — sayt onu olduğu kimi render edir.
                blocks: [{ id: "content", type: "paragraph", isVisible: true, text: content }],
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
        <div className={styles.fullWidth}>
            <div className={styles.editorBar}>
                <h1 className={styles.editorBarTitle}>{isNew ? "Yeni Məqalə" : "Məqaləni Düzəlt"}</h1>
                <div className={styles.editorBarActions}>
                    <button className={styles.cancelBtn} onClick={() => router.push("/pulse")}>Ləğv et</button>
                    <button className={styles.saveBtn} onClick={save} disabled={saving}>{saving ? "Saxlanır..." : "Saxla"}</button>
                </div>
            </div>

            <div className={styles.settingsCard}>
                <h3 className={styles.settingsGroupTitle}>Əsas məlumatlar</h3>
                {/* Başlıq üç dili tutduğu üçün sıranın çox hissəsini alır;
                    slug tək sahədir və eyni xətdə oturur. */}
                <div className={styles.titleRow}>
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
                    <div className={styles.field}>
                        <label>Slug *</label>
                        <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} placeholder="meqale-basligi" />
                    </div>
                </div>
                <div className={styles.twoCol}>
                    <div className={styles.field}>
                        <label>Kateqoriya *</label>
                        <Select
                            ariaLabel="Kateqoriya"
                            value={(() => {
                                const currentName = getLocalizedName(category);
                                const found = categories.find((c) => getLocalizedName(c.name) === currentName);
                                return found?.id || "";
                            })()}
                            onChange={val => {
                                const selected = categories.find(c => c.id === val);
                                if (selected) setCategory(toLocalizedValue(selected.name));
                                else setCategory({ az: "", en: "", ru: "" });
                            }}
                            options={categories.map(c => ({
                                value: c.id,
                                label: typeof c.name === "string" ? c.name : (c.name?.az || Object.values(c.name)[0] || ""),
                            }))}
                        />
                    </div>
                    <div className={styles.field}>
                        {/* Rejim seçici etiketlə eyni sətirdədir — ayrı sətirdə
                            dayansaydı, altındakı select qonşu sütundakı
                            Kateqoriya seçicisindən aşağı düşərdi. */}
                        <div className={styles.fieldHead}>
                            <label>Müəllif</label>
                            <div className={`${ed.langRow} ${styles.fieldHeadSeg}`}>
                                <button type="button" onClick={() => setAuthorType("existing")}
                                    className={authorType === "existing" ? ed.segItemActive : ed.segItem}>
                                    Mövcud müəllif
                                </button>
                                <button type="button" onClick={() => setAuthorType("custom")}
                                    className={authorType === "custom" ? ed.segItemActive : ed.segItem}>
                                    Xüsusi + Sosial media
                                </button>
                            </div>
                        </div>
                        {authorType === "existing" ? (
                            <Select
                                ariaLabel="Müəllif"
                                value={authorId}
                                onChange={setAuthorId}
                                options={authors.map(a => ({ value: a.id, label: getLocalizedName(a.name) }))}
                            />
                        ) : (
                            <div className={ed.stack}>
                                <input className={styles.input} value={customAuthorName}
                                    onChange={e => setCustomAuthorName(e.target.value)} placeholder="Müəllif adı" />
                                {/* İkona sahənin içindəki neytral relsdədir. Əvvəl hər
                                    platformanın öz doymuş rəngli dairəsi və emoji işarəsi
                                    vardı — dörd fərqli rəng sahəni parçalayırdı. */}
                                <div className={styles.socialGrid}>
                                    {[
                                        { key: "facebook", code: "FB", label: "Facebook" },
                                        { key: "instagram", code: "IG", label: "Instagram" },
                                        { key: "tiktok", code: "TT", label: "TikTok" },
                                        { key: "website", code: "WEB", label: "Vebsayt" },
                                    ].map(({ key, code, label }) => (
                                        <div key={key} className={styles.socialCell}>
                                            <span className={styles.socialIcon} title={label} aria-hidden="true">
                                                {code}
                                            </span>
                                            <input
                                                className={`${styles.input} ${styles.socialInput}`}
                                                value={socialLinks[key] || ""}
                                                onChange={e => setSocialLinks(prev => ({ ...prev, [key]: e.target.value }))}
                                                placeholder={`${label} URL`}
                                                aria-label={`${label} URL`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <LangInput
                    label="Qısa məzmun"
                    value={excerpt}
                    onChange={setExcerpt}
                    type="textarea"
                    placeholder="Məqalənin qısa təsviri"
                />

                <div className={styles.twoCol}>
                    <div className={styles.field}>
                        <label>Dərc olunma tarixi</label>
                        <DatePicker
                            ariaLabel="Dərc olunma tarixi"
                            value={publishDate}
                            onChange={setPublishDate}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Örtük şəkli</label>
                        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleCoverUpload} />
                        <div className={styles.coverRow}>
                            <div className={styles.coverBox} onClick={() => fileRef.current?.click()}>
                                {coverImage ? (
                                    <>
                                        <img src={toAbsUrl(coverImage)} alt="" />
                                        <span>Dəyişdir</span>
                                    </>
                                ) : (
                                    <>
                                        <ImagePlus size={15} />
                                        <span>Şəkil yüklə</span>
                                    </>
                                )}
                            </div>
                            <p className={styles.coverNote}>
                                JPG və ya PNG. Siyahıda və məqalə başlığında görünür.
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.checkRow}>
                    <label className={styles.checkLabel}>
                        <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} /> Dərc olunub
                    </label>
                    <label className={styles.checkLabel}>
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
                <h3 className={styles.settingsGroupTitle}>Məqalə mətni</h3>
                <div className={ed.langRow}>
                    {EDITOR_LANGS.map((lang) => (
                        <button
                            key={lang.key}
                            type="button"
                            onClick={() => setContentLocale(lang.key)}
                            className={contentLocale === lang.key ? ed.langChipActive : ed.langChip}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>

                <RichTextEditor
                    value={content[contentLocale] || ""}
                    onChange={(html) => setContent(prev => ({ ...prev, [contentLocale]: html }))}
                    placeholder="Məqalə mətnini buraya yazın…"
                    minHeight={240}
                    onUploadImage={uploadArticleMedia}
                    onUploadVideo={uploadArticleMedia}
                    className="rte-scope"
                />
            </div>
        </div>
    );
}
