"use client";

/**
 * Layihə detalı redaktoru — v2 (blok əsaslı).
 *
 * v1-də bu səhifə 40+ sabit sahəni bir-bir redaktə edirdi və hər sahə ayrıca
 * DB sütunu idi. v2-də bütün kontent tək `sections` massividir:
 *
 *   [{ type: "hero", isVisible: true, ...data }, { type: "overview", ... }]
 *
 * Quruluş master branch-dakı service/blog/portfolio səhifələri ilə eynidir:
 * SECTION_TYPES + SectionEditor switch + Görünür/Gizli + Aç/Bağla + Sil.
 * Hər tipdən yalnız bir dənə əlavə olunur (usedTypes filtri), sıra sabitdir.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    LangTabs,
    LocalizedRichEditor,
    toLocalized,
    type Lang,
    type LocalizedString,
} from "@/components/RichEditor";
import styles from "@/styles/layihelerimiz.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;

/* ────────────────────────────── köməkçilər ────────────────────────────── */

function getToken() {
    return document.cookie.split("access_token=")[1]?.split(";")[0] ?? "";
}

async function cmsFetch(path: string, options?: RequestInit) {
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

/** Böyük şəkilləri yükləməzdən əvvəl webp-ə sıxır (v1-dən olduğu kimi saxlanılıb). */
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
    const res = await fetch(`${API}/layihelerimiz/project-details/upload`, {
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

function toAbs(path: string) {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${API}${path}`;
}

const lv = toLocalized;
const asArray = (v: unknown): any[] => (Array.isArray(v) ? v : []);
const asStr = (v: unknown): string => (typeof v === "string" ? v : "");

/* ──────────────────────────── ortaq input-lar ──────────────────────────── */

/** Tək dilli düz mətn sahəsi (aktiv dilə görə). */
function LocalizedInput({ label, value, activeLang, onChange, placeholder }: {
    label: string;
    value: unknown;
    activeLang: Lang;
    onChange: (v: LocalizedString) => void;
    placeholder?: string;
}) {
    const obj = lv(value);
    return (
        <div className={styles.field}>
            <label>{label} ({activeLang.toUpperCase()})</label>
            <input
                className={styles.input}
                value={obj[activeLang] ?? ""}
                placeholder={placeholder}
                onChange={e => onChange({ ...obj, [activeLang]: e.target.value })}
            />
        </div>
    );
}

/** Dilsiz düz mətn sahəsi (link, URL və s.). */
function PlainInput({ label, value, onChange, placeholder }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <div className={styles.field}>
            <label>{label}</label>
            <input
                className={styles.input}
                value={value ?? ""}
                placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    );
}

/** Zəngin mətn sahəsi — treva-web tərəfində HTML kimi render olunur. */
function RichField({ label, value, activeLang, onChange }: {
    label: string;
    value: unknown;
    activeLang: Lang;
    onChange: (v: LocalizedString) => void;
}) {
    return (
        <div className={styles.field}>
            <label>{label} ({activeLang.toUpperCase()})</label>
            <LocalizedRichEditor styles={styles} value={value} lang={activeLang} onChange={onChange} />
        </div>
    );
}

function FileUpload({ value, onChange, label = "Şəkil", accept = "image/webp,image/jpeg,image/png" }: {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    accept?: string;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const absUrl = value ? toAbs(value) : "";
    const lower = (value || "").toLowerCase();
    const isDocument = lower.endsWith(".pdf") || lower.endsWith(".docx");

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const prepared = await prepareImageFile(file);
            onChange(await uploadFile(prepared));
        } catch (err: any) {
            alert("Yükləmə uğursuz: " + err.message);
        } finally {
            setUploading(false);
            if (ref.current) ref.current.value = "";
        }
    };

    return (
        <div className={styles.fileRow}>
            <input ref={ref} type="file" accept={accept} hidden onChange={handleChange} />
            <button type="button" className={styles.addBtn} disabled={uploading}
                onClick={() => ref.current?.click()}>
                {uploading ? "Yüklənir..." : value ? "Dəyişdir" : `${label} yüklə`}
            </button>
            {value && (
                <>
                    {isDocument
                        ? <a className={styles.fileLink} href={absUrl} target="_blank" rel="noreferrer">Faylı aç</a>
                        : <img className={styles.filePreview} src={absUrl} alt="" />}
                    <button type="button" className={styles.removeBtn} onClick={() => onChange("")}>✕</button>
                </>
            )}
        </div>
    );
}

/* ─────────────────────────── section redaktorları ─────────────────────── */

function HeroSectionEditor({ data, onChange, activeLang }: {
    data: any; onChange: (d: any) => void; activeLang: Lang;
}) {
    const images = asArray(data.images);

    const setImage = (i: number, patch: any) =>
        onChange({ ...data, images: images.map((img, idx) => (idx === i ? { ...img, ...patch } : img)) });

    return (
        <div className={styles.sectionFields}>
            <LocalizedInput label="Başlıq" value={data.title} activeLang={activeLang}
                onChange={v => onChange({ ...data, title: v })} />
            <RichField label="Desktop təsvir" value={data.desktopDesc} activeLang={activeLang}
                onChange={v => onChange({ ...data, desktopDesc: v })} />
            <RichField label="Mobil təsvir" value={data.mobileDesc} activeLang={activeLang}
                onChange={v => onChange({ ...data, mobileDesc: v })} />

            <div className={styles.sectionDivider} />
            <label className={styles.sectionGroupLabel}>Slayder şəkilləri</label>
            {images.map((img: any, i: number) => {
                const alt = lv(img?.alt);
                return (
                    <div key={i} className={styles.contentItemBlock}>
                        <div className={styles.contentItemHeader}>
                            <span className={styles.contentItemLabel}>Şəkil #{i + 1}</span>
                            <button type="button" className={styles.removeBtn}
                                onClick={() => onChange({ ...data, images: images.filter((_, idx) => idx !== i) })}>✕</button>
                        </div>
                        <FileUpload value={asStr(img?.url)} onChange={url => setImage(i, { url })} />
                        <div className={styles.field}>
                            <label>Alt mətn ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={alt[activeLang] ?? ""}
                                onChange={e => setImage(i, { alt: { ...alt, [activeLang]: e.target.value } })} />
                        </div>
                    </div>
                );
            })}
            <button type="button" className={styles.addRowBtn}
                onClick={() => onChange({ ...data, images: [...images, { url: "", alt: { az: "", en: "", ru: "" } }] })}>
                + Şəkil əlavə et
            </button>

            <div className={styles.sectionDivider} />
            <LocalizedInput label="CTA mətni" value={data.ctaText} activeLang={activeLang}
                placeholder="GET A CONSULTATION"
                onChange={v => onChange({ ...data, ctaText: v })} />
            <PlainInput label="CTA link" value={asStr(data.ctaLink)} placeholder="/consultation"
                onChange={v => onChange({ ...data, ctaLink: v })} />
        </div>
    );
}

function OverviewSectionEditor({ data, onChange, activeLang }: {
    data: any; onChange: (d: any) => void; activeLang: Lang;
}) {
    const dataRows = asArray(data.dataRows);
    const imgs = (data.images ?? {}) as any;

    const setImageSlot = (slot: "large" | "medium" | "small", patch: any) =>
        onChange({ ...data, images: { ...imgs, [slot]: { ...(imgs[slot] ?? {}), ...patch } } });

    const imageSlot = (slot: "large" | "medium" | "small", title: string) => {
        const cur = (imgs[slot] ?? {}) as any;
        const label = lv(cur.label);
        return (
            <div className={styles.contentItemBlock}>
                <div className={styles.contentItemHeader}>
                    <span className={styles.contentItemLabel}>{title}</span>
                </div>
                <FileUpload value={asStr(cur.url)} onChange={url => setImageSlot(slot, { url })} />
                <div className={styles.field}>
                    <label>Etiket ({activeLang.toUpperCase()})</label>
                    <input className={styles.input} value={label[activeLang] ?? ""}
                        onChange={e => setImageSlot(slot, { label: { ...label, [activeLang]: e.target.value } })} />
                </div>
            </div>
        );
    };

    return (
        <div className={styles.sectionFields}>
            <div className={styles.twoCol}>
                <LocalizedInput label="Başlıq (nazik)" value={data.titleLight} activeLang={activeLang}
                    onChange={v => onChange({ ...data, titleLight: v })} />
                <LocalizedInput label="Başlıq (qalın)" value={data.titleBold} activeLang={activeLang}
                    onChange={v => onChange({ ...data, titleBold: v })} />
            </div>
            <LocalizedInput label="Brend adı" value={data.brandName} activeLang={activeLang}
                onChange={v => onChange({ ...data, brandName: v })} />
            <div className={styles.threeCol}>
                <LocalizedInput label="Debut mətni" value={data.debutText} activeLang={activeLang}
                    onChange={v => onChange({ ...data, debutText: v })} />
                <LocalizedInput label="Məkan mətni" value={data.locationText} activeLang={activeLang}
                    onChange={v => onChange({ ...data, locationText: v })} />
                <LocalizedInput label="Debut mətni (son)" value={data.debutTextEnd} activeLang={activeLang}
                    onChange={v => onChange({ ...data, debutTextEnd: v })} />
            </div>
            <RichField label="Təsvir" value={data.description} activeLang={activeLang}
                onChange={v => onChange({ ...data, description: v })} />

            <div className={styles.sectionDivider} />
            <label className={styles.sectionGroupLabel}>Şəkillər</label>
            {imageSlot("large", "Böyük şəkil")}
            {imageSlot("medium", "Orta şəkil")}
            {imageSlot("small", "Kiçik şəkil")}

            <div className={styles.sectionDivider} />
            <label className={styles.sectionGroupLabel}>Məlumat sətirləri</label>
            {dataRows.map((row: any, i: number) => {
                const key = lv(row?.key);
                const value = lv(row?.value);
                return (
                    <div key={i} className={styles.contentItemBlock}>
                        <div className={styles.contentItemHeader}>
                            <span className={styles.contentItemLabel}>Sətir #{i + 1}</span>
                            <button type="button" className={styles.removeBtn}
                                onClick={() => onChange({ ...data, dataRows: dataRows.filter((_, idx) => idx !== i) })}>✕</button>
                        </div>
                        <div className={styles.twoCol}>
                            <div className={styles.field}>
                                <label>Ad ({activeLang.toUpperCase()})</label>
                                <input className={styles.input} value={key[activeLang] ?? ""}
                                    onChange={e => onChange({
                                        ...data,
                                        dataRows: dataRows.map((r, idx) => idx === i ? { ...r, key: { ...key, [activeLang]: e.target.value } } : r),
                                    })} />
                            </div>
                            <div className={styles.field}>
                                <label>Dəyər ({activeLang.toUpperCase()})</label>
                                <input className={styles.input} value={value[activeLang] ?? ""}
                                    onChange={e => onChange({
                                        ...data,
                                        dataRows: dataRows.map((r, idx) => idx === i ? { ...r, value: { ...value, [activeLang]: e.target.value } } : r),
                                    })} />
                            </div>
                        </div>
                    </div>
                );
            })}
            <button type="button" className={styles.addRowBtn}
                onClick={() => onChange({
                    ...data,
                    dataRows: [...dataRows, { key: { az: "", en: "", ru: "" }, value: { az: "", en: "", ru: "" } }],
                })}>
                + Sətir əlavə et
            </button>
        </div>
    );
}

function FeaturesSectionEditor({ data, onChange, activeLang }: {
    data: any; onChange: (d: any) => void; activeLang: Lang;
}) {
    const blocks = asArray(data.sections);

    const updateBlock = (i: number, patch: any) =>
        onChange({ ...data, sections: blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) });

    return (
        <div className={styles.sectionFields}>
            <RichField label="Başlıq mətni (əsas)" value={data.headerMain} activeLang={activeLang}
                onChange={v => onChange({ ...data, headerMain: v })} />
            <RichField label="Başlıq mətni (alt)" value={data.headerSub} activeLang={activeLang}
                onChange={v => onChange({ ...data, headerSub: v })} />
            <div className={styles.twoCol}>
                <LocalizedInput label="Başlıq (nazik)" value={data.titleLight} activeLang={activeLang}
                    onChange={v => onChange({ ...data, titleLight: v })} />
                <LocalizedInput label="Başlıq (qalın)" value={data.titleBold} activeLang={activeLang}
                    onChange={v => onChange({ ...data, titleBold: v })} />
            </div>

            <div className={styles.field}>
                <label>Broşür faylı</label>
                <FileUpload value={asStr(data.brochureFile)} label="Fayl"
                    accept=".pdf,.docx,.jpg,.jpeg,.png,.webp"
                    onChange={url => onChange({ ...data, brochureFile: url })} />
            </div>

            <div className={styles.sectionDivider} />
            <label className={styles.sectionGroupLabel}>Xüsusiyyət blokları</label>
            {blocks.map((block: any, i: number) => {
                const items = asArray(block?.items);
                return (
                    <div key={i} className={styles.contentItemBlock}>
                        <div className={styles.contentItemHeader}>
                            <span className={styles.contentItemLabel}>Blok #{block?.id || i + 1}</span>
                            <button type="button" className={styles.removeBtn}
                                onClick={() => onChange({ ...data, sections: blocks.filter((_, idx) => idx !== i) })}>Sil</button>
                        </div>
                        <div className={styles.twoCol}>
                            <LocalizedInput label="Başlıq (kursiv)" value={block?.titleItalic} activeLang={activeLang}
                                onChange={v => updateBlock(i, { titleItalic: v })} />
                            <LocalizedInput label="Başlıq (davamı)" value={block?.titleRest} activeLang={activeLang}
                                onChange={v => updateBlock(i, { titleRest: v })} />
                        </div>
                        <RichField label="Alt başlıq" value={block?.subtitle} activeLang={activeLang}
                            onChange={v => updateBlock(i, { subtitle: v })} />
                        <FileUpload value={asStr(block?.image)} onChange={url => updateBlock(i, { image: url })} />

                        <div className={styles.checkboxRow}>
                            <label className={styles.checkboxLabel}>
                                <input type="checkbox" checked={Boolean(block?.dark)}
                                    onChange={e => updateBlock(i, { dark: e.target.checked })} />
                                Tünd fon
                            </label>
                            <label className={styles.checkboxLabel}>
                                <input type="checkbox" checked={Boolean(block?.imageLeft)}
                                    onChange={e => updateBlock(i, { imageLeft: e.target.checked })} />
                                Şəkil solda
                            </label>
                        </div>

                        <label className={styles.sectionGroupLabel}>Sıra elementləri</label>
                        {items.map((item: any, j: number) => {
                            const itemVal = lv(item);
                            return (
                                <div key={j} className={styles.field}>
                                    <label>
                                        Element {j + 1} ({activeLang.toUpperCase()})
                                        <button type="button" className={styles.removeBtn}
                                            onClick={() => updateBlock(i, { items: items.filter((_, idx) => idx !== j) })}>✕</button>
                                    </label>
                                    <input className={styles.input} value={itemVal[activeLang] ?? ""}
                                        onChange={e => updateBlock(i, {
                                            items: items.map((it, idx) => idx === j ? { ...itemVal, [activeLang]: e.target.value } : it),
                                        })} />
                                </div>
                            );
                        })}
                        <button type="button" className={styles.addRowBtn}
                            onClick={() => updateBlock(i, { items: [...items, { az: "", en: "", ru: "" }] })}>
                            + Element əlavə et
                        </button>
                    </div>
                );
            })}
            <button type="button" className={styles.addRowBtn}
                onClick={() => onChange({
                    ...data,
                    sections: [...blocks, {
                        id: String(blocks.length + 1).padStart(2, "0"),
                        titleItalic: { az: "", en: "", ru: "" },
                        titleRest: { az: "", en: "", ru: "" },
                        subtitle: { az: "", en: "", ru: "" },
                        items: [{ az: "", en: "", ru: "" }],
                        dark: blocks.length % 2 === 0,
                        image: "",
                        imageLeft: blocks.length % 2 === 0,
                    }],
                })}>
                + Xüsusiyyət bloku əlavə et
            </button>
        </div>
    );
}

function LocationSectionEditor({ data, onChange, activeLang }: {
    data: any; onChange: (d: any) => void; activeLang: Lang;
}) {
    return (
        <div className={styles.sectionFields}>
            <div className={styles.twoCol}>
                <LocalizedInput label="Başlıq (nazik)" value={data.titleLight} activeLang={activeLang}
                    onChange={v => onChange({ ...data, titleLight: v })} />
                <LocalizedInput label="Başlıq (qalın)" value={data.titleBold} activeLang={activeLang}
                    onChange={v => onChange({ ...data, titleBold: v })} />
            </div>
            <LocalizedInput label="Brend adı" value={data.brandName} activeLang={activeLang}
                placeholder="Panorama by ELIE SAAB"
                onChange={v => onChange({ ...data, brandName: v })} />
            <LocalizedInput label="Əsas mətn" value={data.mainLead} activeLang={activeLang}
                onChange={v => onChange({ ...data, mainLead: v })} />
            <RichField label="Alt mətn" value={data.subText} activeLang={activeLang}
                onChange={v => onChange({ ...data, subText: v })} />

            <div className={styles.field}>
                <label>Xəritə şəkli</label>
                <FileUpload value={asStr(data.mapImage)} onChange={url => onChange({ ...data, mapImage: url })} />
            </div>
            <LocalizedInput label="Ünvan (alt hissə)" value={data.footerAddress} activeLang={activeLang}
                onChange={v => onChange({ ...data, footerAddress: v })} />
            <PlainInput label="Google Maps embed URL" value={asStr(data.googleMapsUrl)}
                placeholder="https://www.google.com/maps/embed?..."
                onChange={v => onChange({ ...data, googleMapsUrl: v })} />
        </div>
    );
}

/**
 * Foto qalereyası bloku — interyer və eksteryer şəkilləri.
 *
 * Features bloklarındakı şəkillərdən fərqi: burada mətn yoxdur, sayı sərbəstdir
 * və treva-web-də şəbəkə şəklində göstərilir. Şəkillərin hamısı səhifənin ümumi
 * tam ekran qalereyasına düşür.
 */
function GallerySectionEditor({ data, onChange, activeLang }: {
    data: any; onChange: (d: any) => void; activeLang: Lang;
}) {
    const items = asArray(data.items);

    const setItem = (i: number, patch: any) =>
        onChange({ ...data, items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });

    const move = (i: number, dir: -1 | 1) => {
        const j = i + dir;
        if (j < 0 || j >= items.length) return;
        const next = [...items];
        [next[i], next[j]] = [next[j], next[i]];
        onChange({ ...data, items: next });
    };

    return (
        <div className={styles.sectionFields}>
            <LocalizedInput label="Başlıq (nazik hissə)" value={data.titleLight} activeLang={activeLang}
                placeholder="Interior " onChange={v => onChange({ ...data, titleLight: v })} />
            <LocalizedInput label="Başlıq (qalın hissə)" value={data.titleBold} activeLang={activeLang}
                placeholder="Gallery" onChange={v => onChange({ ...data, titleBold: v })} />
            <RichField label="Təsvir" value={data.description} activeLang={activeLang}
                onChange={v => onChange({ ...data, description: v })} />

            <div className={styles.sectionDivider} />
            <label className={styles.sectionGroupLabel}>Qalereya şəkilləri</label>
            {items.map((item: any, i: number) => {
                const caption = lv(item?.caption);
                return (
                    <div key={i} className={styles.contentItemBlock}>
                        <div className={styles.contentItemHeader}>
                            <span className={styles.contentItemLabel}>Şəkil #{i + 1}</span>
                            <div className={styles.contentItemActions}>
                                <button type="button" className={styles.moveBtn} disabled={i === 0}
                                    onClick={() => move(i, -1)} aria-label="Yuxarı">↑</button>
                                <button type="button" className={styles.moveBtn} disabled={i === items.length - 1}
                                    onClick={() => move(i, 1)} aria-label="Aşağı">↓</button>
                                <button type="button" className={styles.removeBtn}
                                    onClick={() => onChange({ ...data, items: items.filter((_, idx) => idx !== i) })}>✕</button>
                            </div>
                        </div>
                        <FileUpload value={asStr(item?.url)} onChange={url => setItem(i, { url })} />
                        <div className={styles.field}>
                            <label>Başlıq / alt mətn ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={caption[activeLang] ?? ""}
                                placeholder="Yaşayış otağı"
                                onChange={e => setItem(i, { caption: { ...caption, [activeLang]: e.target.value } })} />
                        </div>
                    </div>
                );
            })}
            <button type="button" className={styles.addRowBtn}
                onClick={() => onChange({ ...data, items: [...items, { url: "", caption: { az: "", en: "", ru: "" } }] })}>
                + Şəkil əlavə et
            </button>
        </div>
    );
}

function LayoutsSectionEditor() {
    return (
        <div className={styles.sectionFields}>
            <p className={styles.sectionNote}>
                Bu blokun redaktə olunası sahəsi yoxdur. Mənzil planları treva-api-dən
                layihənin slug-ı üzrə avtomatik çəkilir. Blok yalnız səhifədə görünüb-görünməməsini
                idarə edir.
            </p>
        </div>
    );
}

/* ────────────────────────────── section qabığı ────────────────────────── */

const SECTION_TYPES = [
    { type: "hero", label: "Hero" },
    { type: "overview", label: "Overview" },
    { type: "features", label: "Features" },
    { type: "location", label: "Location" },
    { type: "layouts", label: "Layouts" },
    { type: "gallery", label: "Qalereya" },
];

/** Yeni əlavə olunan blokun boş şablonu. */
function emptySection(type: string): any {
    const L = () => ({ az: "", en: "", ru: "" });
    switch (type) {
        case "hero":
            return { type, isVisible: true, title: L(), desktopDesc: L(), mobileDesc: L(), images: [], ctaText: L(), ctaLink: "" };
        case "overview":
            return {
                type, isVisible: true,
                titleLight: L(), titleBold: L(), brandName: L(),
                debutText: L(), locationText: L(), debutTextEnd: L(), description: L(),
                images: {
                    large: { url: "", label: L() },
                    medium: { url: "", label: L() },
                    small: { url: "", label: L() },
                },
                dataRows: [],
            };
        case "features":
            return { type, isVisible: true, headerMain: L(), headerSub: L(), titleLight: L(), titleBold: L(), sections: [], brochureFile: "" };
        case "location":
            return {
                type, isVisible: true,
                titleLight: L(), titleBold: L(), brandName: L(), mainLead: L(), subText: L(),
                mapImage: "", footerAddress: L(), googleMapsUrl: "",
            };
        case "gallery":
            return { type, isVisible: true, titleLight: L(), titleBold: L(), description: L(), items: [] };
        default:
            return { type, isVisible: true };
    }
}

function SectionEditor({ section, index, activeLang, onChange, onRemove }: {
    section: any; index: number; activeLang: Lang;
    onChange: (d: any) => void; onRemove: () => void;
}) {
    const [open, setOpen] = useState(false);

    const renderEditor = () => {
        switch (section.type) {
            case "hero": return <HeroSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
            case "overview": return <OverviewSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
            case "features": return <FeaturesSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
            case "location": return <LocationSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
            case "layouts": return <LayoutsSectionEditor />;
            case "gallery": return <GallerySectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
            default: return null;
        }
    };

    return (
        <div className={styles.sectionBlock} style={{ opacity: section.isVisible === false ? 0.5 : 1 }}>
            <div className={styles.sectionBlockHeader}>
                <div className={styles.sectionBlockLeft}>
                    <span className={styles.sectionTypeTag}>{String(section.type).toUpperCase()}</span>
                    <span className={styles.sectionIndex}>#{index + 1}</span>
                </div>
                <div className={styles.sectionBlockRight}>
                    <button type="button"
                        className={section.isVisible === false ? styles.inactiveToggle : styles.activeToggle}
                        onClick={() => onChange({ ...section, isVisible: section.isVisible === false })}>
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

/* ────────────────────────────────── səhifə ────────────────────────────── */

export default function ProjectDetailEditor() {
    const params = useParams();
    const slug = params?.slug as string;

    const [id, setId] = useState<string | null>(null);
    const [sections, setSections] = useState<any[]>([]);
    const [seoTitle, setSeoTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [seoDescription, setSeoDescription] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [ogImage, setOgImage] = useState("");

    const [activeLang, setActiveLang] = useState<Lang>("az");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const loadDetail = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const data = await cmsFetch(`/layihelerimiz/project-details/${slug}`);
            if (data) {
                setId(data.id ?? null);
                // API dual-read edir: sections boşdursa köhnə sütunlardan qurulmuş
                // halda gəlir, ona görə burada əlavə fallback lazım deyil.
                setSections(asArray(data.sections));
                setSeoTitle(lv(data.seoTitle));
                setSeoDescription(lv(data.seoDescription));
                setOgImage(asStr(data.ogImage));
            }
        } catch (err: any) {
            // 404 = bu slug üçün hələ detal yaradılmayıb, boş formadan başlayırıq.
            if (String(err?.message).startsWith("[404]")) {
                setId(null);
                setSections([]);
            } else {
                console.error("Layihə detalını yükləmək alınmadı:", err);
                setLoadError("Məlumatları yükləmək mümkün olmadı. CMS API işləyir?");
            }
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => { loadDetail(); }, [loadDetail]);

    const usedTypes = sections.map(s => s.type);

    const addSection = (type: string) => setSections(prev => [...prev, emptySection(type)]);
    const updateSection = (i: number, data: any) => setSections(prev => prev.map((s, idx) => (idx === i ? data : s)));
    const removeSection = (i: number) => setSections(prev => prev.filter((_, idx) => idx !== i));

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = { categorySlug: slug, sections, seoTitle, seoDescription, ogImage };
            if (id) {
                await cmsFetch(`/layihelerimiz/project-details/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                });
            } else {
                const created = await cmsFetch("/layihelerimiz/project-details", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                if (created?.id) setId(created.id);
            }
            alert("Saxlanıldı!");
        } catch (err: any) {
            alert("Xəta: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className={styles.page}><p>Yüklənir...</p></div>;
    }

    if (loadError) {
        return (
            <div className={styles.page}>
                <p className={styles.errorText}>{loadError}</p>
                <button type="button" className={styles.addBtn} onClick={loadDetail}>Yenidən cəhd et</button>
            </div>
        );
    }

    const saveButton = (
        <button type="button" className={styles.saveBtn} disabled={saving} onClick={handleSave}>
            {saving ? "Saxlanılır..." : "Saxla"}
        </button>
    );

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <Link href="/layihelerimiz" className={styles.backLink}>← Geri</Link>
                    <h1 className={styles.title}>Layihə Detalları</h1>
                    <p className={styles.subtitle}>
                        Slug: <code className={styles.slugCode}>{slug}</code>
                    </p>
                </div>
                <div className={styles.headerRight}>
                    <LangTabs styles={styles} active={activeLang} onChange={setActiveLang} />
                    {saveButton}
                </div>
            </div>

            <div className={styles.fullDrawerSection}>
                <h3 className={styles.drawerSectionTitle}>Səhifə blokları</h3>
                {sections.length === 0 && (
                    <p className={styles.empty}>Hələ blok yoxdur. Aşağıdan əlavə et.</p>
                )}
                {sections.map((section, i) => (
                    <SectionEditor key={`${section.type}-${i}`}
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
                <LocalizedInput label="SEO başlıq" value={seoTitle} activeLang={activeLang} onChange={setSeoTitle} />
                <div className={styles.field}>
                    <label>SEO təsvir ({activeLang.toUpperCase()})</label>
                    <textarea className={styles.textarea} rows={3}
                        value={seoDescription[activeLang] ?? ""}
                        onChange={e => setSeoDescription({ ...seoDescription, [activeLang]: e.target.value })} />
                </div>
                <div className={styles.field}>
                    <label>OG şəkil</label>
                    <FileUpload value={ogImage} onChange={setOgImage} />
                </div>
            </div>

            <div className={styles.headerRight}>{saveButton}</div>
        </div>
    );
}
