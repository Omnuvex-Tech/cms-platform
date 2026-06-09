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

function toAbsUrl(path: string) {
    if (!path) return "";
    if (
        path.startsWith("http") ||
        path.startsWith("blob:") ||
        path.startsWith("data:")
    )
        return path;
    return `${API}${path}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface FooterNavLink {
    id: number;
    label: string;
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
    logoAlt: string;
    description: string;
    copyrightText: string;
    privacyText: string;
    locationLabel: string;
    phoneLabel: string;
    emailLabel: string;
    locationValue: string;
    phoneValue: string;
    emailValue: string;
    navLinks: FooterNavLink[];
    socialLinks: FooterSocialLink[];
}

// ─── Logo Upload ──────────────────────────────────────────────────────────────

function LogoUpload({
    value,
    onChange,
}: {
    value: string | null;
    onChange: (v: string | null) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== "image/webp") {
            alert("Yalnız WebP formatı qəbul edilir");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${API}/about/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${getToken()}` },
            body: formData,
        });
        if (!res.ok) {
            alert("Yükləmə uğursuz");
            return;
        }
        const { url } = await res.json();
        onChange(url);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className={styles.field}>
            <label>Logo şəkil (WebP)</label>
            <input
                ref={inputRef}
                type="file"
                accept="image/webp"
                style={{ display: "none" }}
                onChange={handleSelect}
            />
            <div
                className={styles.singleUploadArea}
                onClick={() => inputRef.current?.click()}
            >
                {value ? (
                    <div className={styles.singleUploadPreviewWrap}>
                        <img
                            src={toAbsUrl(value)}
                            alt="logo"
                            className={styles.singleUploadPreview}
                        />
                    </div>
                ) : (
                    <div className={styles.imagePlaceholder}>
                        <span>🖼️</span>
                        <span>Logo seçin</span>
                        <small>WebP</small>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Social Icon Upload ───────────────────────────────────────────────────────

function SocialIconUpload({
    value,
    onChange,
}: {
    value: string | null;
    onChange: (v: string | null) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== "image/webp") {
            alert("Yalnız WebP formatı qəbul edilir");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${API}/about/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${getToken()}` },
            body: formData,
        });
        if (!res.ok) {
            alert("Yükləmə uğursuz");
            return;
        }
        const { url } = await res.json();
        onChange(url);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className={styles.field} style={{ flex: "0 0 72px" }}>
            <label>İkon</label>
            <input
                ref={inputRef}
                type="file"
                accept="image/webp"
                style={{ display: "none" }}
                onChange={handleSelect}
            />
            <div
                onClick={() => inputRef.current?.click()}
                style={{
                    width: 56,
                    height: 56,
                    border: "1.5px dashed #444",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    overflow: "hidden",
                    background: "#1a1a1a",
                }}
            >
                {value ? (
                    <img
                        src={toAbsUrl(value)}
                        alt="icon"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                ) : (
                    <span style={{ fontSize: 22, color: "#555" }}>+</span>
                )}
            </div>
        </div>
    );
}

// ─── Sortable Nav Link Row ────────────────────────────────────────────────────

function SortableNavLinkRow({
    link,
    onUpdate,
    onDelete,
}: {
    link: FooterNavLink;
    onUpdate: (id: number, data: Partial<FooterNavLink>) => void;
    onDelete: (id: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: link.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={styles.contentItemBlock}>
            <div className={styles.contentItemHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                        {...attributes}
                        {...listeners}
                        style={{
                            cursor: "grab",
                            fontSize: 18,
                            color: "#aaa",
                            padding: "0 4px",
                            touchAction: "none",
                        }}
                        title="Sürüşdür"
                    >
                        ⠿
                    </span>
                    <span className={styles.contentItemLabel}>
                        {link.label || "Adsız link"}
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 13,
                            cursor: "pointer",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={link.isVisible}
                            onChange={(e) =>
                                onUpdate(link.id, { isVisible: e.target.checked })
                            }
                        />
                        Görünən
                    </label>
                    <button
                        type="button"
                        onClick={() => onDelete(link.id)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: 16,
                            padding: "0 2px",
                        }}
                        title="Sil"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className={styles.twoCol}>
                <div className={styles.field}>
                    <label>Ad</label>
                    <input
                        className={styles.input}
                        value={link.label}
                        placeholder="Haqqımızda"
                        onChange={(e) => onUpdate(link.id, { label: e.target.value })}
                    />
                </div>
                <div className={styles.field}>
                    <label>Link</label>
                    <input
                        className={styles.input}
                        value={link.href}
                        placeholder="/about"
                        onChange={(e) => onUpdate(link.id, { href: e.target.value })}
                    />
                </div>
            </div>

            <label
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    cursor: "pointer",
                    marginTop: 4,
                }}
            >
                <input
                    type="checkbox"
                    checked={link.openInNewTab}
                    onChange={(e) =>
                        onUpdate(link.id, { openInNewTab: e.target.checked })
                    }
                />
                Yeni tabda aç
            </label>
        </div>
    );
}

// ─── Sortable Social Link Row ─────────────────────────────────────────────────

function SortableSocialLinkRow({
    link,
    onUpdate,
    onDelete,
}: {
    link: FooterSocialLink;
    onUpdate: (id: number, data: Partial<FooterSocialLink>) => void;
    onDelete: (id: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: link.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={styles.contentItemBlock}>
            <div className={styles.contentItemHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                        {...attributes}
                        {...listeners}
                        style={{
                            cursor: "grab",
                            fontSize: 18,
                            color: "#aaa",
                            padding: "0 4px",
                            touchAction: "none",
                        }}
                        title="Sürüşdür"
                    >
                        ⠿
                    </span>
                    <span className={styles.contentItemLabel}>Sosial link</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 13,
                            cursor: "pointer",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={link.isVisible}
                            onChange={(e) =>
                                onUpdate(link.id, { isVisible: e.target.checked })
                            }
                        />
                        Görünən
                    </label>
                    <button
                        type="button"
                        onClick={() => onDelete(link.id)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: 16,
                            padding: "0 2px",
                        }}
                        title="Sil"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                <SocialIconUpload
                    value={link.icon}
                    onChange={(v) => onUpdate(link.id, { icon: v ?? undefined })}
                />
                <div className={styles.field} style={{ flex: 1 }}>
                    <label>Link (href)</label>
                    <input
                        className={styles.input}
                        value={link.href}
                        placeholder="https://instagram.com/trenders"
                        onChange={(e) => onUpdate(link.id, { href: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FooterPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
        "idle"
    );
    const [settings, setSettings] = useState<FooterSettings | null>(null);
    const [navLinks, setNavLinks] = useState<FooterNavLink[]>([]);
    const [socialLinks, setSocialLinks] = useState<FooterSocialLink[]>([]);

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

    const updateSetting = (key: keyof FooterSettings, val: any) => {
        setSettings((prev) => (prev ? { ...prev, [key]: val } : prev));
    };

    // Nav link handlers
    const updateNavLink = (id: number, data: Partial<FooterNavLink>) => {
        setNavLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
    };

    const handleNavDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setNavLinks((prev) => {
            const oldIndex = prev.findIndex((l) => l.id === active.id);
            const newIndex = prev.findIndex((l) => l.id === over.id);
            return arrayMove(prev, oldIndex, newIndex).map((l, i) => ({
                ...l,
                order: i,
            }));
        });
    };

    const addNavLink = async () => {
        if (navLinks.length >= MAX_NAV_LINKS) return;
        try {
            const newLink = await apiFetch("/footer/nav-links", {
                method: "POST",
                body: JSON.stringify({
                    label: "Yeni link",
                    href: "/",
                    order: navLinks.length,
                    isVisible: true,
                    openInNewTab: false,
                }),
            });
            setNavLinks((prev) => [...prev, newLink]);
        } catch {
            alert("Link əlavə edilərkən xəta baş verdi");
        }
    };

    const deleteNavLink = async (id: number) => {
        try {
            await apiFetch(`/footer/nav-links/${id}`, { method: "DELETE" });
            setNavLinks((prev) => prev.filter((l) => l.id !== id));
        } catch {
            alert("Silinərkən xəta baş verdi");
        }
    };

    // Social link handlers
    const updateSocialLink = (id: number, data: Partial<FooterSocialLink>) => {
        setSocialLinks((prev) =>
            prev.map((l) => (l.id === id ? { ...l, ...data } : l))
        );
    };

    const handleSocialDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setSocialLinks((prev) => {
            const oldIndex = prev.findIndex((l) => l.id === active.id);
            const newIndex = prev.findIndex((l) => l.id === over.id);
            return arrayMove(prev, oldIndex, newIndex).map((l, i) => ({
                ...l,
                order: i,
            }));
        });
    };

    const addSocialLink = async () => {
        if (socialLinks.length >= MAX_SOCIAL_LINKS) return;
        try {
            const newLink = await apiFetch("/footer/social-links", {
                method: "POST",
                body: JSON.stringify({
                    href: "https://",
                    order: socialLinks.length,
                    isVisible: true,
                }),
            });
            setSocialLinks((prev) => [...prev, newLink]);
        } catch {
            alert("Sosial link əlavə edilərkən xəta baş verdi");
        }
    };

    const deleteSocialLink = async (id: number) => {
        try {
            await apiFetch(`/footer/social-links/${id}`, { method: "DELETE" });
            setSocialLinks((prev) => prev.filter((l) => l.id !== id));
        } catch {
            alert("Silinərkən xəta baş verdi");
        }
    };

    // Save
    const save = async () => {
        if (!settings) return;
        setSaving(true);
        setSaveStatus("idle");
        try {
            // 1. Settings
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

            // 2. Nav links
            await Promise.all(
                navLinks.map((l) =>
                    apiFetch(`/footer/nav-links/${l.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({
                            label: l.label,
                            href: l.href,
                            order: l.order,
                            isVisible: l.isVisible,
                            openInNewTab: l.openInNewTab,
                        }),
                    })
                )
            );

            await apiFetch("/footer/nav-links/reorder", {
                method: "PATCH",
                body: JSON.stringify({
                    links: navLinks.map((l, i) => ({ id: l.id, order: i })),
                }),
            });

            // 3. Social links
            await Promise.all(
                socialLinks.map((l) =>
                    apiFetch(`/footer/social-links/${l.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({
                            icon: l.icon,
                            href: l.href,
                            order: l.order,
                            isVisible: l.isVisible,
                        }),
                    })
                )
            );

            await apiFetch("/footer/social-links/reorder", {
                method: "PATCH",
                body: JSON.stringify({
                    links: socialLinks.map((l, i) => ({ id: l.id, order: i })),
                }),
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
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Footer</h1>
                    <p className={styles.subtitle}>Footer məzmununu idarə edin</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {saveStatus === "success" && (
                        <span style={{ color: "#16a34a", fontSize: 14, fontWeight: 600 }}>
                            ✓ Saxlanıldı
                        </span>
                    )}
                    {saveStatus === "error" && (
                        <span style={{ color: "#dc2626", fontSize: 14, fontWeight: 600 }}>
                            ✕ Xəta baş verdi
                        </span>
                    )}
                    <button
                        className={styles.saveBtn}
                        onClick={save}
                        disabled={saving}
                    >
                        {saving ? "Saxlanır..." : "Saxla"}
                    </button>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Logo */}
                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Logo</h3>
                    <LogoUpload
                        value={settings.logoImage}
                        onChange={(v) => updateSetting("logoImage", v)}
                    />
                    <div className={styles.field}>
                        <label>Logo alt text</label>
                        <input
                            className={styles.input}
                            value={settings.logoAlt}
                            placeholder="trenders"
                            onChange={(e) => updateSetting("logoAlt", e.target.value)}
                        />
                    </div>
                </div>

                {/* Təsvir */}
                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Təsvir</h3>
                    <div className={styles.field}>
                        <label>Açıqlama mətni</label>
                        <textarea
                            className={styles.input}
                            value={settings.description}
                            placeholder="Şirkət haqqında qısa məlumat..."
                            rows={3}
                            style={{ resize: "vertical" }}
                            onChange={(e) => updateSetting("description", e.target.value)}
                        />
                    </div>
                </div>

                {/* Əlaqə */}
                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Əlaqə məlumatları</h3>

                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Ünvan başlığı</label>
                            <input
                                className={styles.input}
                                value={settings.locationLabel}
                                placeholder="Location"
                                onChange={(e) => updateSetting("locationLabel", e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Ünvan dəyəri</label>
                            <input
                                className={styles.input}
                                value={settings.locationValue}
                                placeholder="Baku, Sabail..."
                                onChange={(e) => updateSetting("locationValue", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Telefon başlığı</label>
                            <input
                                className={styles.input}
                                value={settings.phoneLabel}
                                placeholder="Phone"
                                onChange={(e) => updateSetting("phoneLabel", e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Telefon nömrəsi</label>
                            <input
                                className={styles.input}
                                value={settings.phoneValue}
                                placeholder="+(994) 50..."
                                onChange={(e) => updateSetting("phoneValue", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Email başlığı</label>
                            <input
                                className={styles.input}
                                value={settings.emailLabel}
                                placeholder="Email Adress"
                                onChange={(e) => updateSetting("emailLabel", e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Email dəyəri</label>
                            <input
                                className={styles.input}
                                value={settings.emailValue}
                                placeholder="info@trenders.az"
                                onChange={(e) => updateSetting("emailValue", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Nav Linklər */}
                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>
                        Nav Linklər
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 400,
                                color: "#888",
                                marginLeft: 8,
                            }}
                        >
                            ({navLinks.length}/{MAX_NAV_LINKS})
                        </span>
                    </h3>

                    {navLinks.length === 0 && (
                        <p style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>
                            Heç bir link yoxdur
                        </p>
                    )}

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleNavDragEnd}
                    >
                        <SortableContext
                            items={navLinks.map((l) => l.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {navLinks.map((link) => (
                                <SortableNavLinkRow
                                    key={link.id}
                                    link={link}
                                    onUpdate={updateNavLink}
                                    onDelete={deleteNavLink}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {navLinks.length < MAX_NAV_LINKS ? (
                        <button
                            type="button"
                            className={styles.addRowBtn}
                            onClick={addNavLink}
                        >
                            + Link əlavə et
                        </button>
                    ) : (
                        <p style={{ fontSize: 13, color: "#f59e0b", marginTop: 8 }}>
                            ⚠ Maksimum {MAX_NAV_LINKS} link əlavə etmək olar
                        </p>
                    )}
                </div>

                {/* Sosial Linklər */}
                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>
                        Sosial Linklər
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 400,
                                color: "#888",
                                marginLeft: 8,
                            }}
                        >
                            ({socialLinks.length}/{MAX_SOCIAL_LINKS})
                        </span>
                    </h3>

                    {socialLinks.length === 0 && (
                        <p style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>
                            Heç bir sosial link yoxdur
                        </p>
                    )}

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleSocialDragEnd}
                    >
                        <SortableContext
                            items={socialLinks.map((l) => l.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {socialLinks.map((link) => (
                                <SortableSocialLinkRow
                                    key={link.id}
                                    link={link}
                                    onUpdate={updateSocialLink}
                                    onDelete={deleteSocialLink}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {socialLinks.length < MAX_SOCIAL_LINKS ? (
                        <button
                            type="button"
                            className={styles.addRowBtn}
                            onClick={addSocialLink}
                        >
                            + Sosial link əlavə et
                        </button>
                    ) : (
                        <p style={{ fontSize: 13, color: "#f59e0b", marginTop: 8 }}>
                            ⚠ Maksimum {MAX_SOCIAL_LINKS} sosial link əlavə etmək olar
                        </p>
                    )}
                </div>

                {/* Copyright */}
                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Copyright</h3>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Sol mətn (© 2023 Trenders)</label>
                            <input
                                className={styles.input}
                                value={settings.copyrightText}
                                placeholder="© 2023 Trenders"
                                onChange={(e) => updateSetting("copyrightText", e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Sağ mətn (Məxfilik siyasəti...)</label>
                            <input
                                className={styles.input}
                                value={settings.privacyText}
                                placeholder="Məxfilik siyasəti | Bütün hüquqlar qorunur"
                                onChange={(e) => updateSetting("privacyText", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}