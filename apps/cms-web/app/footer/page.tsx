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

type Lang = "az" | "en" | "ru";
type LocalizedString = Record<string, string>;

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

function toAbsUrl(path: string) {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) return path;
    return `${API}${path}`;
}

interface FooterNavLink {
    id: number;
    label: LocalizedString;
    href: string;
    order: number;
    isVisible: boolean;
    openInNewTab: boolean;
}

interface FooterSocialLink {
    id: number;
    icon: string | null;
    href: string;
    order: number;
    isVisible: boolean;
}

interface FooterSettings {
    id: number;
    logoImage: string | null;
    logoAlt: LocalizedString;
    description: LocalizedString;
    copyrightText: LocalizedString;
    privacyText: LocalizedString;
    locationLabel: LocalizedString;
    phoneLabel: LocalizedString;
    emailLabel: LocalizedString;
    locationValue: LocalizedString;
    phoneValue: LocalizedString;
    emailValue: LocalizedString;
    navLinks: FooterNavLink[];
    socialLinks: FooterSocialLink[];
}

function LangTabs({ active, onChange }: { active: Lang; onChange: (l: Lang) => void }) {
    return (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["az", "en", "ru"] as Lang[]).map((l) => (
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

function LogoUpload({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== "image/webp") { alert("Yalnız WebP formatı qəbul edilir"); return; }
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
        <div className={styles.field}>
            <label>Logo şəkil (WebP)</label>
            <input ref={inputRef} type="file" accept="image/webp,image/svg+xml" style={{ display: "none" }} onChange={handleSelect} />            <div className={styles.singleUploadArea} onClick={() => inputRef.current?.click()}>
                {value ? (
                    <div className={styles.singleUploadPreviewWrap}>
                        <img src={toAbsUrl(value)} alt="logo" className={styles.singleUploadPreview} />
                    </div>
                ) : (
                    <div className={styles.imagePlaceholder}>
                        <span>🖼️</span><span>Logo seçin</span><small>WebP</small>
                    </div>
                )}
            </div>
        </div>
    );
}

function SocialIconUpload({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== "image/webp" && file.type !== "image/svg+xml") {
            alert("Yalnız WebP və ya SVG formatı qəbul edilir");
            return;
        } const formData = new FormData();
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
                    border: "1.5px dashed #444", borderRadius: 10,
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

function SortableNavLinkRow({
    link, activeLang, onUpdate, onDelete,
}: {
    link: FooterNavLink;
    activeLang: Lang;
    onUpdate: (id: number, data: Partial<FooterNavLink>) => void;
    onDelete: (id: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    const displayLabel = link.label?.[activeLang] || link.label?.az || "Adsız link";

    return (
        <div ref={setNodeRef} style={style} className={styles.contentItemBlock}>
            <div className={styles.contentItemHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span {...attributes} {...listeners}
                        style={{ cursor: "grab", fontSize: 18, color: "#aaa", padding: "0 4px", touchAction: "none" }}
                        title="Sürüşdür">⠿</span>
                    <span className={styles.contentItemLabel}>{displayLabel}</span>
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

            <div className={styles.twoCol}>
                <div className={styles.field}>
                    <label>Ad ({activeLang.toUpperCase()})</label>
                    <input
                        className={styles.input}
                        value={link.label?.[activeLang] || ""}
                        placeholder="Haqqımızda"
                        onChange={e => onUpdate(link.id, { label: { ...link.label, [activeLang]: e.target.value } })}
                    />
                </div>
                <div className={styles.field}>
                    <label>Link (href)</label>
                    <input
                        className={styles.input}
                        value={link.href}
                        placeholder="/about"
                        onChange={e => onUpdate(link.id, { href: e.target.value })}
                    />
                </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginTop: 4 }}>
                <input type="checkbox" checked={link.openInNewTab}
                    onChange={e => onUpdate(link.id, { openInNewTab: e.target.checked })} />
                Yeni tabda aç
            </label>
        </div>
    );
}

function SortableSocialLinkRow({
    link, onUpdate, onDelete,
}: {
    link: FooterSocialLink;
    onUpdate: (id: number, data: Partial<FooterSocialLink>) => void;
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
                        placeholder="https://instagram.com/trenders"
                        onChange={e => onUpdate(link.id, { href: e.target.value })} />
                </div>
            </div>
        </div>
    );
}

export default function FooterPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [settings, setSettings] = useState<FooterSettings | null>(null);
    const [navLinks, setNavLinks] = useState<FooterNavLink[]>([]);
    const [socialLinks, setSocialLinks] = useState<FooterSocialLink[]>([]);
    const [activeLang, setActiveLang] = useState<Lang>("az");

    const sensors = useSensors(useSensor(PointerSensor));
    const MAX_NAV_LINKS = 8;
    const MAX_SOCIAL_LINKS = 6;

    useEffect(() => {
        apiFetch("/footer/admin")
            .then((d: FooterSettings) => {
                setSettings(d);
                setNavLinks([...d.navLinks].sort((a, b) => a.order - b.order));
                setSocialLinks([...d.socialLinks].sort((a, b) => a.order - b.order));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const updS = (key: keyof FooterSettings, val: any) =>
        setSettings(prev => prev ? { ...prev, [key]: val } : prev);

    const updL = (key: keyof FooterSettings, lang: Lang, val: string) =>
        setSettings(prev => {
            if (!prev) return prev;
            const current = (prev[key] as LocalizedString) || {};
            return { ...prev, [key]: { ...current, [lang]: val } };
        });

    const updateNavLink = (id: number, data: Partial<FooterNavLink>) =>
        setNavLinks(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));

    const handleNavDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setNavLinks(prev => {
            const oldIndex = prev.findIndex(l => l.id === active.id);
            const newIndex = prev.findIndex(l => l.id === over.id);
            return arrayMove(prev, oldIndex, newIndex).map((l, i) => ({ ...l, order: i }));
        });
    };

    const addNavLink = async () => {
        if (navLinks.length >= MAX_NAV_LINKS) return;
        try {
            const newLink = await apiFetch("/footer/nav-links", {
                method: "POST",
                body: JSON.stringify({
                    label: { az: "Yeni link", en: "New link", ru: "Новая ссылка" },
                    href: "/",
                    order: navLinks.length,
                    isVisible: true,
                    openInNewTab: false,
                }),
            });
            setNavLinks(prev => [...prev, newLink]);
        } catch { alert("Link əlavə edilərkən xəta baş verdi"); }
    };

    const deleteNavLink = async (id: number) => {
        try {
            await apiFetch(`/footer/nav-links/${id}`, { method: "DELETE" });
            setNavLinks(prev => prev.filter(l => l.id !== id));
        } catch { alert("Silinərkən xəta baş verdi"); }
    };

    const updateSocialLink = (id: number, data: Partial<FooterSocialLink>) =>
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
        if (socialLinks.length >= MAX_SOCIAL_LINKS) return;
        try {
            const newLink = await apiFetch("/footer/social-links", {
                method: "POST",
                body: JSON.stringify({ href: "https://", order: socialLinks.length, isVisible: true }),
            });
            setSocialLinks(prev => [...prev, newLink]);
        } catch { alert("Sosial link əlavə edilərkən xəta baş verdi"); }
    };

    const deleteSocialLink = async (id: number) => {
        try {
            await apiFetch(`/footer/social-links/${id}`, { method: "DELETE" });
            setSocialLinks(prev => prev.filter(l => l.id !== id));
        } catch { alert("Silinərkən xəta baş verdi"); }
    };

    const save = async () => {
        if (!settings) return;
        setSaving(true);
        setSaveStatus("idle");
        try {
            await apiFetch("/footer", {
                method: "PATCH",
                body: JSON.stringify({
                    logoImage: settings.logoImage,
                    logoAlt: settings.logoAlt,
                    description: settings.description,
                    copyrightText: settings.copyrightText,
                    privacyText: settings.privacyText,
                    locationLabel: settings.locationLabel,
                    phoneLabel: settings.phoneLabel,
                    emailLabel: settings.emailLabel,
                    locationValue: settings.locationValue,
                    phoneValue: settings.phoneValue,
                    emailValue: settings.emailValue,
                }),
            });

            await Promise.all(navLinks.map(l =>
                apiFetch(`/footer/nav-links/${l.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ label: l.label, href: l.href, order: l.order, isVisible: l.isVisible, openInNewTab: l.openInNewTab }),
                })
            ));

            await apiFetch("/footer/nav-links/reorder", {
                method: "PATCH",
                body: JSON.stringify({ links: navLinks.map((l, i) => ({ id: l.id, order: i })) }),
            });

            await Promise.all(socialLinks.map(l =>
                apiFetch(`/footer/social-links/${l.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ icon: l.icon, href: l.href, order: l.order, isVisible: l.isVisible }),
                })
            ));

            await apiFetch("/footer/social-links/reorder", {
                method: "PATCH",
                body: JSON.stringify({ links: socialLinks.map((l, i) => ({ id: l.id, order: i })) }),
            });

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
                    <h1 className={styles.title}>Footer</h1>
                    <p className={styles.subtitle}>Footer məzmununu idarə edin</p>
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
                    <h3 className={styles.drawerSectionTitle}>Logo</h3>
                    <LogoUpload value={settings.logoImage} onChange={v => updS("logoImage", v)} />
                    <div className={styles.field}>
                        <label>Logo alt text ({activeLang.toUpperCase()})</label>
                        <input className={styles.input} value={settings.logoAlt?.[activeLang] || ""}
                            placeholder="trenders"
                            onChange={e => updL("logoAlt", activeLang, e.target.value)} />
                    </div>
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Təsvir</h3>
                    <div className={styles.field}>
                        <label>Açıqlama mətni ({activeLang.toUpperCase()})</label>
                        <textarea className={styles.input} value={settings.description?.[activeLang] || ""}
                            placeholder="Şirkət haqqında qısa məlumat..." rows={3}
                            style={{ resize: "vertical" }}
                            onChange={e => updL("description", activeLang, e.target.value)} />
                    </div>
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Əlaqə məlumatları</h3>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Ünvan başlığı ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.locationLabel?.[activeLang] || ""}
                                placeholder="Location"
                                onChange={e => updL("locationLabel", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Ünvan dəyəri ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.locationValue?.[activeLang] || ""}
                                placeholder="Baku, Sabail..."
                                onChange={e => updL("locationValue", activeLang, e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Telefon başlığı ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.phoneLabel?.[activeLang] || ""}
                                placeholder="Phone"
                                onChange={e => updL("phoneLabel", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Telefon nömrəsi ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.phoneValue?.[activeLang] || ""}
                                placeholder="+(994) 50..."
                                onChange={e => updL("phoneValue", activeLang, e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Email başlığı ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.emailLabel?.[activeLang] || ""}
                                placeholder="Email Adress"
                                onChange={e => updL("emailLabel", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Email dəyəri ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.emailValue?.[activeLang] || ""}
                                placeholder="info@trenders.az"
                                onChange={e => updL("emailValue", activeLang, e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>
                        Nav Linklər
                        <span style={{ fontSize: 13, fontWeight: 400, color: "#888", marginLeft: 8 }}>
                            ({navLinks.length}/{MAX_NAV_LINKS})
                        </span>
                    </h3>
                    {navLinks.length === 0 && (
                        <p style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>Heç bir link yoxdur</p>
                    )}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleNavDragEnd}>
                        <SortableContext items={navLinks.map(l => l.id)} strategy={verticalListSortingStrategy}>
                            {navLinks.map(link => (
                                <SortableNavLinkRow key={link.id} link={link}
                                    activeLang={activeLang} onUpdate={updateNavLink} onDelete={deleteNavLink} />
                            ))}
                        </SortableContext>
                    </DndContext>
                    {navLinks.length < MAX_NAV_LINKS ? (
                        <button type="button" className={styles.addRowBtn} onClick={addNavLink}>+ Link əlavə et</button>
                    ) : (
                        <p style={{ fontSize: 13, color: "#f59e0b", marginTop: 8 }}>⚠ Maksimum {MAX_NAV_LINKS} link əlavə etmək olar</p>
                    )}
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>
                        Sosial Linklər
                        <span style={{ fontSize: 13, fontWeight: 400, color: "#888", marginLeft: 8 }}>
                            ({socialLinks.length}/{MAX_SOCIAL_LINKS})
                        </span>
                    </h3>
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
                    {socialLinks.length < MAX_SOCIAL_LINKS ? (
                        <button type="button" className={styles.addRowBtn} onClick={addSocialLink}>+ Sosial link əlavə et</button>
                    ) : (
                        <p style={{ fontSize: 13, color: "#f59e0b", marginTop: 8 }}>⚠ Maksimum {MAX_SOCIAL_LINKS} sosial link əlavə etmək olar</p>
                    )}
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Copyright</h3>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Sol mətn ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.copyrightText?.[activeLang] || ""}
                                placeholder="© 2023 Trenders"
                                onChange={e => updL("copyrightText", activeLang, e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Sağ mətn ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={settings.privacyText?.[activeLang] || ""}
                                placeholder="Məxfilik siyasəti | Bütün hüquqlar qorunur"
                                onChange={e => updL("privacyText", activeLang, e.target.value)} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}