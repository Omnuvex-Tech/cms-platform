"use client";

import { useEffect, useState, useRef } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/blog.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;

type Lang = "az" | "en" | "ru";
type LocalizedString = Record<string, string>;

function getToken() { return document.cookie.split("access_token=")[1]?.split(";")[0] ?? ""; }

async function apiFetch(path: string, options?: RequestInit) {
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...options?.headers },
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

interface NavLink {
    id: number;
    label: LocalizedString;
    href: string;
    order: number;
    isVisible: boolean;
    openInNewTab: boolean;
}

interface NavbarSettings {
    id: number;
    logoImage: string | null;
    logoImageAlt: LocalizedString;
    showSearch: boolean;
    showLang: boolean;
    links: NavLink[];
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
            <label>Logo (WebP)</label>
            <input ref={inputRef} type="file" accept="image/webp" style={{ display: "none" }} onChange={handleSelect} />
            <div className={styles.singleUploadArea} onClick={() => inputRef.current?.click()}>
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

function SortableLinkRow({
    link,
    activeLang,
    onUpdate,
}: {
    link: NavLink;
    activeLang: Lang;
    onUpdate: (id: number, data: Partial<NavLink>) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const displayLabel = link.label?.[activeLang] || link.label?.az || "Adsız link";

    return (
        <div ref={setNodeRef} style={style} className={styles.contentItemBlock}>
            <div className={styles.contentItemHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                        {...attributes}
                        {...listeners}
                        style={{ cursor: "grab", fontSize: 18, color: "#aaa", padding: "0 4px", touchAction: "none" }}
                        title="Sürüşdür"
                    >⠿</span>
                    <span className={styles.contentItemLabel}>{displayLabel}</span>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                    <input type="checkbox" checked={link.isVisible}
                        onChange={e => onUpdate(link.id, { isVisible: e.target.checked })} />
                    Görünən
                </label>
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

export default function NavbarPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [settings, setSettings] = useState<NavbarSettings | null>(null);
    const [links, setLinks] = useState<NavLink[]>([]);
    const [activeLang, setActiveLang] = useState<Lang>("az");

    const sensors = useSensors(useSensor(PointerSensor));
    const MAX_LINKS = 6;

    useEffect(() => {
        apiFetch("/navbar-settings/admin")
            .then((d: NavbarSettings) => {
                setSettings(d);
                setLinks([...d.links].sort((a, b) => a.order - b.order));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const updS = (key: keyof NavbarSettings, val: any) =>
        setSettings(prev => prev ? { ...prev, [key]: val } : prev);

    const updL = (lang: Lang, val: string) =>
        setSettings(prev => {
            if (!prev) return prev;
            return { ...prev, logoImageAlt: { ...prev.logoImageAlt, [lang]: val } };
        });

    const updateLink = (id: number, data: Partial<NavLink>) =>
        setLinks(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setLinks(prev => {
            const oldIndex = prev.findIndex(l => l.id === active.id);
            const newIndex = prev.findIndex(l => l.id === over.id);
            return arrayMove(prev, oldIndex, newIndex).map((l, i) => ({ ...l, order: i }));
        });
    };

    const addLink = async () => {
        if (links.length >= MAX_LINKS) return;
        try {
            const newLink = await apiFetch("/navbar-settings/links", {
                method: "POST",
                body: JSON.stringify({
                    label: { az: "Yeni link", en: "New link", ru: "Новая ссылка" },
                    href: "/",
                    order: links.length,
                    isVisible: true,
                    openInNewTab: false,
                }),
            });
            setLinks(prev => [...prev, newLink]);
        } catch { alert("Link əlavə edilərkən xəta baş verdi"); }
    };

    const save = async () => {
        if (!settings) return;
        setSaving(true);
        setSaveStatus("idle");
        try {
            await apiFetch("/navbar-settings", {
                method: "PATCH",
                body: JSON.stringify({
                    logoImage: settings.logoImage,
                    logoImageAlt: settings.logoImageAlt,
                    showSearch: settings.showSearch,
                    showLang: settings.showLang,
                }),
            });

            await Promise.all(links.map(l =>
                apiFetch(`/navbar-settings/links/${l.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        label: l.label,
                        href: l.href,
                        order: l.order,
                        isVisible: l.isVisible,
                        openInNewTab: l.openInNewTab,
                    }),
                })
            ));

            await apiFetch("/navbar-settings/links/reorder", {
                method: "PATCH",
                body: JSON.stringify({ links: links.map((l, i) => ({ id: l.id, order: i })) }),
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
                    <h1 className={styles.title}>Navbar</h1>
                    <p className={styles.subtitle}>Navbar məzmununu idarə edin</p>
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
                    <LogoUpload
                        value={settings.logoImage}
                        onChange={v => updS("logoImage", v)}
                    />
                    <div className={styles.field}>
                        <label>Logo alt text ({activeLang.toUpperCase()})</label>
                        <input
                            className={styles.input}
                            value={settings.logoImageAlt?.[activeLang] || ""}
                            placeholder="Trenders loqosu"
                            onChange={e => updL(activeLang, e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Parametrlər</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer" }}>
                            <input type="checkbox" checked={settings.showSearch}
                                onChange={e => updS("showSearch", e.target.checked)} />
                            Axtarış ikonunu göstər
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer" }}>
                            <input type="checkbox" checked={settings.showLang}
                                onChange={e => updS("showLang", e.target.checked)} />
                            Dil seçicisini göstər
                        </label>
                    </div>
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>
                        Nav Linklər
                        <span style={{ fontSize: 13, fontWeight: 400, color: "#888", marginLeft: 8 }}>
                            ({links.length}/{MAX_LINKS})
                        </span>
                    </h3>

                    {links.length === 0 && (
                        <p style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>Heç bir link yoxdur</p>
                    )}

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
                            {links.map(link => (
                                <SortableLinkRow
                                    key={link.id}
                                    link={link}
                                    activeLang={activeLang}
                                    onUpdate={updateLink}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {links.length < MAX_LINKS ? (
                        <button type="button" className={styles.addRowBtn} onClick={addLink}>
                            + Link əlavə et
                        </button>
                    ) : (
                        <p style={{ fontSize: 13, color: "#f59e0b", marginTop: 8 }}>
                            ⚠ Maksimum 6 link əlavə etmək olar
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}