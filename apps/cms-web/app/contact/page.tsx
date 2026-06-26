"use client";

import { useEffect, useState, useRef } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/blog.module.css";

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
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

function toAbsUrl(path: string | null | undefined): string {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) return path;
    return `${API}${path}`;
}

type Lang = "az" | "en" | "ru";
type LocalizedString = Record<string, string>;

interface ContactSocialLink {
    id: number;
    icon: string | null;
    href: string;
    order: number;
    isVisible: boolean;
}

interface ContactOption {
    id: number;
    label: LocalizedString;
    order: number;
}

interface ContactSettings {
    id: number;
    title: LocalizedString;
    description: LocalizedString;
    emailLabel: LocalizedString;
    emailValue: LocalizedString;
    phoneLabel: LocalizedString;
    phoneValue: LocalizedString;
    locationLabel: LocalizedString;
    locationValue: LocalizedString;
    hoursLabel: LocalizedString;
    hoursValue: LocalizedString;
    followUsLabel: LocalizedString;
    tags: Record<string, string>[];
    formNameLabel: LocalizedString;
    formNamePlaceholder: LocalizedString;
    formEmailLabel: LocalizedString;
    formEmailPlaceholder: LocalizedString;
    formPhoneLabel: LocalizedString;
    formPhonePlaceholder: LocalizedString;
    formServiceLabel: LocalizedString;
    formBudgetLabel: LocalizedString;
    formBudgetPlaceholder: LocalizedString;
    formTimelineLabel: LocalizedString;
    formTimelinePlaceholder: LocalizedString;
    formMessageLabel: LocalizedString;
    formMessagePlaceholder: LocalizedString;
    formSubmitLabel: LocalizedString;
    socialLinks: ContactSocialLink[];
    budgetOptions: ContactOption[];
    timelineOptions: ContactOption[];
    image: string | null;
    imageAlt: LocalizedString;
}

function LangTabs({ active, onChange }: { active: Lang; onChange: (l: Lang) => void }) {
    return (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["az", "en", "ru"] as Lang[]).map(l => (
                <button
                    key={l}
                    type="button"
                    onClick={() => onChange(l)}
                    style={{
                        padding: "4px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                        border: "1.5px solid",
                        borderColor: active === l ? "#3b82f6" : "#333",
                        background: active === l ? "#1e3a5f" : "transparent",
                        color: active === l ? "#fff" : "#888",
                        cursor: "pointer",
                    }}
                >
                    {l.toUpperCase()}
                </button>
            ))}
        </div>
    );
}

function SocialIconUpload({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!['image/webp', 'image/svg+xml'].includes(file.type)) {
            alert("Yalnız WebP və ya SVG formatı qəbul edilir");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${API}/about/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${getToken()}` },
            body: formData,
        });
        if (!res.ok) { alert("Yükləmə uğursuz"); return; }
        const { url } = await res.json();
        onChange(url);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className={styles.field} style={{ flex: "0 0 72px" }}>
            <label>İkon</label>
            <input ref={inputRef} type="file" accept="image/webp,image/svg+xml" style={{ display: "none" }} onChange={handleSelect} />
            <div
                onClick={() => inputRef.current?.click()}
                style={{
                    width: 56, height: 56,
                    border: "1.5px dashed #444",
                    borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", overflow: "hidden",
                }}
            >
                {value ? (
                    <img src={toAbsUrl(value)} alt="icon" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                    <span style={{ fontSize: 22, color: "#555" }}>+</span>
                )}
            </div>
        </div>
    );
}

function SortableSocialLinkRow({
    link, onUpdate, onDelete,
}: {
    link: ContactSocialLink;
    onUpdate: (id: number, data: Partial<ContactSocialLink>) => void;
    onDelete: (id: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

    return (
        <div ref={setNodeRef} style={style} className={styles.contentItemBlock}>
            <div className={styles.contentItemHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span {...attributes} {...listeners}
                        style={{ cursor: "grab", fontSize: 18, color: "#aaa", padding: "0 4px", touchAction: "none" }}
                        title="Sürüşdür">⠿</span>
                    <span className={styles.contentItemLabel}>Sosial link</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                        <input type="checkbox" checked={link.isVisible}
                            onChange={e => onUpdate(link.id, { isVisible: e.target.checked })} />
                        Görünən
                    </label>
                    <button type="button" onClick={() => onDelete(link.id)}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                <SocialIconUpload value={link.icon} onChange={v => onUpdate(link.id, { icon: v ?? undefined })} />
                <div className={styles.field} style={{ flex: 1 }}>
                    <label>Link (href)</label>
                    <input className={styles.input} value={link.href}
                        placeholder="https://instagram.com/..."
                        onChange={e => onUpdate(link.id, { href: e.target.value })} />
                </div>
            </div>
        </div>
    );
}

function OptionRow({
    option, activeLang, onUpdate, onDelete,
}: {
    option: ContactOption;
    activeLang: Lang;
    onUpdate: (id: number, lang: Lang, label: string) => void;
    onDelete: (id: number) => void;
}) {
    return (
        <div className={styles.contentItemBlock} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className={styles.field} style={{ flex: 1, marginBottom: 0 }}>
                <input className={styles.input}
                    value={option.label?.[activeLang] || ""}
                    placeholder="Seçim adı"
                    onChange={e => onUpdate(option.id, activeLang, e.target.value)} />
            </div>
            <button type="button" onClick={() => onDelete(option.id)}
                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>✕</button>
        </div>
    );
}

function TagsEditor({ tags, onChange }: {
    tags: Record<string, string>[];
    onChange: (t: Record<string, string>[]) => void;
}) {
    const [input, setInput] = useState("");

    const add = () => {
        const val = input.trim();
        if (!val) return;
        const tag = val.startsWith("#") ? val : `#${val}`;
        onChange([...tags, { az: tag, en: "", ru: "" }]);
        setInput("");
    };

    const update = (i: number, lang: "az" | "en" | "ru", val: string) => {
        const arr = [...tags];
        arr[i] = { ...arr[i], [lang]: val };
        onChange(arr);
    };

    const remove = (i: number) => onChange(tags.filter((_, idx) => idx !== i));

    return (
        <div className={styles.field}>
            <label>Tagler</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input className={styles.input} value={input}
                    placeholder="#aiblog (AZ)"
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())} />
                <button type="button" className={styles.addRowBtn}
                    style={{ marginTop: 0, width: "auto", padding: "0 16px" }} onClick={add}>
                    + Əlavə et
                </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tags.map((tag, i) => (
                    <div key={i} className={styles.contentItemBlock} style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {(["az", "en", "ru"] as const).map(lang => (
                                <div key={lang} style={{ flex: 1 }}>
                                    <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>
                                        {lang.toUpperCase()}
                                    </label>
                                    <input
                                        className={styles.input}
                                        value={tag[lang] || ""}
                                        placeholder={`#tag (${lang})`}
                                        onChange={e => update(i, lang, e.target.value)}
                                    />
                                </div>
                            ))}
                            <button type="button" onClick={() => remove(i)}
                                style={{
                                    background: "none", border: "none", color: "#ef4444",
                                    cursor: "pointer", fontSize: 18, flexShrink: 0, marginTop: 16
                                }}>✕</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ContactPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [settings, setSettings] = useState<ContactSettings | null>(null);
    const [socialLinks, setSocialLinks] = useState<ContactSocialLink[]>([]);
    const [budgetOptions, setBudgetOptions] = useState<ContactOption[]>([]);
    const [timelineOptions, setTimelineOptions] = useState<ContactOption[]>([]);
    const [activeLang, setActiveLang] = useState<Lang>("az");

    const sensors = useSensors(useSensor(PointerSensor));
    const MAX_SOCIAL = 6;

    useEffect(() => {
        apiFetch("/contact/admin")
            .then((d: ContactSettings) => {
                setSettings(d);
                setSocialLinks([...d.socialLinks].sort((a, b) => a.order - b.order));
                setBudgetOptions([...d.budgetOptions].sort((a, b) => a.order - b.order));
                setTimelineOptions([...d.timelineOptions].sort((a, b) => a.order - b.order));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const upd = (key: keyof ContactSettings, val: any) =>
        setSettings(prev => prev ? { ...prev, [key]: val } : prev);

    const updL = (key: keyof ContactSettings, lang: Lang, val: string) =>
        setSettings(prev => {
            if (!prev) return prev;
            const current = (prev[key] as LocalizedString) || {};
            return { ...prev, [key]: { ...current, [lang]: val } };
        });

    const updateSocialLink = (id: number, data: Partial<ContactSocialLink>) =>
        setSocialLinks(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));

    const handleSocialDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setSocialLinks(prev => {
            const oldIndex = prev.findIndex(l => l.id === active.id);
            const newIndex = prev.findIndex(l => l.id === over.id);
            return arrayMove(prev, oldIndex, newIndex).map((l, i) => ({ ...l, order: i }));
        });
    };

    const addSocialLink = async () => {
        if (socialLinks.length >= MAX_SOCIAL) return;
        try {
            const newLink = await apiFetch("/contact/social-links", {
                method: "POST",
                body: JSON.stringify({ href: "https://", order: socialLinks.length, isVisible: true }),
            });
            setSocialLinks(prev => [...prev, newLink]);
        } catch { alert("Xəta baş verdi"); }
    };

    const deleteSocialLink = async (id: number) => {
        try {
            await apiFetch(`/contact/social-links/${id}`, { method: "DELETE" });
            setSocialLinks(prev => prev.filter(l => l.id !== id));
        } catch { alert("Silinərkən xəta baş verdi"); }
    };

    const updateBudgetOption = (id: number, lang: Lang, label: string) =>
        setBudgetOptions(prev => prev.map(o =>
            o.id === id ? { ...o, label: { ...o.label, [lang]: label } } : o
        ));

    const addBudgetOption = async () => {
        try {
            const newOpt = await apiFetch("/contact/budget-options", {
                method: "POST",
                body: JSON.stringify({ label: { az: "Yeni seçim", en: "New option", ru: "Новый вариант" }, order: budgetOptions.length }),
            });
            setBudgetOptions(prev => [...prev, newOpt]);
        } catch { alert("Xəta baş verdi"); }
    };

    const deleteBudgetOption = async (id: number) => {
        try {
            await apiFetch(`/contact/budget-options/${id}`, { method: "DELETE" });
            setBudgetOptions(prev => prev.filter(o => o.id !== id));
        } catch { alert("Silinərkən xəta baş verdi"); }
    };

    const updateTimelineOption = (id: number, lang: Lang, label: string) =>
        setTimelineOptions(prev => prev.map(o =>
            o.id === id ? { ...o, label: { ...o.label, [lang]: label } } : o
        ));

    const addTimelineOption = async () => {
        try {
            const newOpt = await apiFetch("/contact/timeline-options", {
                method: "POST",
                body: JSON.stringify({ label: { az: "Yeni seçim", en: "New option", ru: "Новый вариант" }, order: timelineOptions.length }),
            });
            setTimelineOptions(prev => [...prev, newOpt]);
        } catch { alert("Xəta baş verdi"); }
    };

    const deleteTimelineOption = async (id: number) => {
        try {
            await apiFetch(`/contact/timeline-options/${id}`, { method: "DELETE" });
            setTimelineOptions(prev => prev.filter(o => o.id !== id));
        } catch { alert("Silinərkən xəta baş verdi"); }
    };

    const save = async () => {
        if (!settings) return;
        setSaving(true);
        setSaveStatus("idle");
        try {
            await apiFetch("/contact", {
                method: "PATCH",
                body: JSON.stringify({
                    title: settings.title,
                    description: settings.description,
                    emailLabel: settings.emailLabel,
                    emailValue: settings.emailValue,
                    phoneLabel: settings.phoneLabel,
                    phoneValue: settings.phoneValue,
                    locationLabel: settings.locationLabel,
                    locationValue: settings.locationValue,
                    hoursLabel: settings.hoursLabel,
                    hoursValue: settings.hoursValue,
                    followUsLabel: settings.followUsLabel,
                    tags: settings.tags,
                    formNameLabel: settings.formNameLabel,
                    formNamePlaceholder: settings.formNamePlaceholder,
                    formEmailLabel: settings.formEmailLabel,
                    formEmailPlaceholder: settings.formEmailPlaceholder,
                    formPhoneLabel: settings.formPhoneLabel,
                    formPhonePlaceholder: settings.formPhonePlaceholder,
                    formServiceLabel: settings.formServiceLabel,
                    formBudgetLabel: settings.formBudgetLabel,
                    formBudgetPlaceholder: settings.formBudgetPlaceholder,
                    formTimelineLabel: settings.formTimelineLabel,
                    formTimelinePlaceholder: settings.formTimelinePlaceholder,
                    formMessageLabel: settings.formMessageLabel,
                    formMessagePlaceholder: settings.formMessagePlaceholder,
                    formSubmitLabel: settings.formSubmitLabel,
                    image: settings.image,
                    imageAlt: settings.imageAlt,
                }),
            });

            await Promise.all(
                socialLinks.map(l =>
                    apiFetch(`/contact/social-links/${l.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ icon: l.icon, href: l.href, order: l.order, isVisible: l.isVisible }),
                    })
                )
            );
            await apiFetch("/contact/social-links/reorder", {
                method: "PATCH",
                body: JSON.stringify({ links: socialLinks.map((l, i) => ({ id: l.id, order: i })) }),
            });

            await Promise.all(
                budgetOptions.map(o =>
                    apiFetch(`/contact/budget-options/${o.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ label: o.label }),
                    })
                )
            );

            await Promise.all(
                timelineOptions.map(o =>
                    apiFetch(`/contact/timeline-options/${o.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ label: o.label }),
                    })
                )
            );

            setSaveStatus("success");
        } catch {
            setSaveStatus("error");
        } finally {
            setSaving(false);
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    };

    if (loading) return <div className={styles.empty}>Yüklənir...</div>;
    if (!settings) return <div className={styles.empty}>Məlumat tapılmadı</div>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Əlaqə</h1>
                    <p className={styles.subtitle}>Əlaqə səhifəsinin məzmununu idarə edin</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {saveStatus === "success" && <span style={{ color: "#16a34a", fontSize: 14, fontWeight: 600 }}>✓ Saxlanıldı</span>}
                    {saveStatus === "error" && <span style={{ color: "#dc2626", fontSize: 14, fontWeight: 600 }}>✕ Xəta baş verdi</span>}
                    <button className={styles.saveBtn} onClick={save} disabled={saving}>
                        {saving ? "Saxlanır..." : "Saxla"}
                    </button>
                </div>
            </div>

            <LangTabs active={activeLang} onChange={setActiveLang} />

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Ümumi</h3>
                    <div className={styles.field}>
                        <label>Başlıq ({activeLang.toUpperCase()})</label>
                        <input className={styles.input} value={settings.title?.[activeLang] || ""} placeholder="Contact us"
                            onChange={e => updL("title", activeLang, e.target.value)} />
                    </div>
                    <div className={styles.field}>
                        <label>Təsvir ({activeLang.toUpperCase()})</label>
                        <textarea className={styles.input} value={settings.description?.[activeLang] || ""} rows={3}
                            style={{ resize: "vertical" }} placeholder="Ready to start a project..."
                            onChange={e => updL("description", activeLang, e.target.value)} />
                    </div>
                    <div className={styles.field}>
                        <label>Şəkil</label>
                        <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                            <div
                                onClick={() => (document.getElementById("contact-img-upload") as HTMLInputElement)?.click()}
                                style={{
                                    width: 160, height: 100, border: "1.5px dashed #444",
                                    borderRadius: 10, display: "flex", alignItems: "center",
                                    justifyContent: "center", cursor: "pointer", overflow: "hidden", flexShrink: 0,
                                }}
                            >
                                {settings.image ? (
                                    <img src={toAbsUrl(settings.image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <span style={{ fontSize: 22, color: "#555" }}>+</span>
                                )}
                            </div>
                            <input id="contact-img-upload" type="file" accept="image/*" style={{ display: "none" }}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const fd = new FormData();
                                    fd.append("file", file);
                                    const res = await fetch(`${API}/about/upload`, {
                                        method: "POST",
                                        headers: { Authorization: `Bearer ${getToken()}` },
                                        body: fd,
                                    });
                                    if (!res.ok) { alert("Yükləmə uğursuz"); return; }
                                    const { url } = await res.json();
                                    upd("image", url);
                                    e.target.value = "";
                                }}
                            />
                            <div style={{ flex: 1 }}>
                                <div className={styles.field} style={{ marginBottom: 0 }}>
                                    <label>Alt text ({activeLang.toUpperCase()})</label>
                                    <input className={styles.input}
                                        value={settings.imageAlt?.[activeLang] || ""}
                                        placeholder="Ofis şəkili"
                                        onChange={e => updL("imageAlt", activeLang, e.target.value)} />
                                </div>
                                {settings.image && (
                                    <button type="button" onClick={() => upd("image", null)}
                                        style={{ marginTop: 8, background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 13 }}>
                                        ✕ Şəkili sil
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Əlaqə məlumatları</h3>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Email başlığı ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.emailLabel?.[activeLang] || ""} placeholder="Email Adress"
                                onChange={e => updL("emailLabel", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Email dəyəri ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.emailValue?.[activeLang] || ""} placeholder="info@trenders.az"
                                onChange={e => updL("emailValue", activeLang, e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Telefon başlığı ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.phoneLabel?.[activeLang] || ""} placeholder="Phone"
                                onChange={e => updL("phoneLabel", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Telefon nömrəsi ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.phoneValue?.[activeLang] || ""} placeholder="+(994) 50..."
                                onChange={e => updL("phoneValue", activeLang, e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Ünvan başlığı ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.locationLabel?.[activeLang] || ""} placeholder="Location"
                                onChange={e => updL("locationLabel", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Ünvan dəyəri ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.locationValue?.[activeLang] || ""} placeholder="Baku, Sabail..."
                                onChange={e => updL("locationValue", activeLang, e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Saat başlığı ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.hoursLabel?.[activeLang] || ""} placeholder="Hours"
                                onChange={e => updL("hoursLabel", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Saat dəyəri ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.hoursValue?.[activeLang] || ""} placeholder="Monday – Friday 9:00 AM – 6:00 PM"
                                onChange={e => updL("hoursValue", activeLang, e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>
                        Sosial Linklər
                        <span style={{ fontSize: 13, fontWeight: 400, color: "#888", marginLeft: 8 }}>
                            ({socialLinks.length}/{MAX_SOCIAL})
                        </span>
                    </h3>
                    <div className={styles.field}>
                        <label>"Follow Us" yazısı ({activeLang.toUpperCase()})</label>
                        <input className={styles.input} value={settings.followUsLabel?.[activeLang] || ""} placeholder="Follow Us"
                            onChange={e => updL("followUsLabel", activeLang, e.target.value)} />
                    </div>
                    {socialLinks.length === 0 && (
                        <p style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>Heç bir sosial link yoxdur</p>
                    )}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSocialDragEnd}>
                        <SortableContext items={socialLinks.map(l => l.id)} strategy={verticalListSortingStrategy}>
                            {socialLinks.map(link => (
                                <SortableSocialLinkRow key={link.id} link={link}
                                    onUpdate={updateSocialLink} onDelete={deleteSocialLink} />
                            ))}
                        </SortableContext>
                    </DndContext>
                    {socialLinks.length < MAX_SOCIAL ? (
                        <button type="button" className={styles.addRowBtn} onClick={addSocialLink}>
                            + Sosial link əlavə et
                        </button>
                    ) : (
                        <p style={{ fontSize: 13, color: "#f59e0b", marginTop: 8 }}>⚠ Maksimum {MAX_SOCIAL} link əlavə etmək olar</p>
                    )}
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Tagler</h3>
                    <TagsEditor tags={settings.tags} onChange={t => upd("tags", t)} />              </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Form Sahələri</h3>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Ad — label ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.formNameLabel?.[activeLang] || ""} placeholder="Name"
                                onChange={e => updL("formNameLabel", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Ad — placeholder ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.formNamePlaceholder?.[activeLang] || ""} placeholder="Your name*"
                                onChange={e => updL("formNamePlaceholder", activeLang, e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Email — label ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.formEmailLabel?.[activeLang] || ""} placeholder="Email"
                                onChange={e => updL("formEmailLabel", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Email — placeholder ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.formEmailPlaceholder?.[activeLang] || ""} placeholder="Your email*"
                                onChange={e => updL("formEmailPlaceholder", activeLang, e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Telefon — label ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.formPhoneLabel?.[activeLang] || ""} placeholder="Phone"
                                onChange={e => updL("formPhoneLabel", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Telefon — placeholder ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.formPhonePlaceholder?.[activeLang] || ""} placeholder="Your phone*"
                                onChange={e => updL("formPhonePlaceholder", activeLang, e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Servis — label ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.formServiceLabel?.[activeLang] || ""} placeholder="Service"
                                onChange={e => updL("formServiceLabel", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Mesaj — label ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.formMessageLabel?.[activeLang] || ""} placeholder="Message"
                                onChange={e => updL("formMessageLabel", activeLang, e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Mesaj — placeholder ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.formMessagePlaceholder?.[activeLang] || ""} placeholder="Your message"
                                onChange={e => updL("formMessagePlaceholder", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Submit düyməsi yazısı ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.formSubmitLabel?.[activeLang] || ""} placeholder="Submit Inquiry"
                                onChange={e => updL("formSubmitLabel", activeLang, e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Budget Dropdown</h3>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Label ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.formBudgetLabel?.[activeLang] || ""} placeholder="Budget"
                                onChange={e => updL("formBudgetLabel", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Placeholder ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.formBudgetPlaceholder?.[activeLang] || ""} placeholder="Estimated Budget"
                                onChange={e => updL("formBudgetPlaceholder", activeLang, e.target.value)} />
                        </div>
                    </div>
                    {budgetOptions.length === 0 && (
                        <p style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>Heç bir seçim yoxdur</p>
                    )}
                    {budgetOptions.map(o => (
                        <OptionRow key={o.id} option={o} activeLang={activeLang} onUpdate={updateBudgetOption} onDelete={deleteBudgetOption} />
                    ))}
                    <button type="button" className={styles.addRowBtn} onClick={addBudgetOption}>
                        + Seçim əlavə et
                    </button>
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Project Timeline Dropdown</h3>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Label ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.formTimelineLabel?.[activeLang] || ""} placeholder="Project Timeline"
                                onChange={e => updL("formTimelineLabel", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Placeholder ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.formTimelinePlaceholder?.[activeLang] || ""} placeholder="ASAP"
                                onChange={e => updL("formTimelinePlaceholder", activeLang, e.target.value)} />
                        </div>
                    </div>
                    {timelineOptions.length === 0 && (
                        <p style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>Heç bir seçim yoxdur</p>
                    )}
                    {timelineOptions.map(o => (
                        <OptionRow key={o.id} option={o} activeLang={activeLang} onUpdate={updateTimelineOption} onDelete={deleteTimelineOption} />
                    ))}
                    <button type="button" className={styles.addRowBtn} onClick={addTimelineOption}>
                        + Seçim əlavə et
                    </button>
                </div>

            </div>
        </div>
    );
}