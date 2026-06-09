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

interface ContactSocialLink {
    id: number;
    icon: string | null;
    href: string;
    order: number;
    isVisible: boolean;
}

interface ContactOption {
    id: number;
    label: string;
    order: number;
}

interface ContactSettings {
    id: number;
    title: string;
    description: string;
    emailLabel: string;
    emailValue: string;
    phoneLabel: string;
    phoneValue: string;
    locationLabel: string;
    locationValue: string;
    hoursLabel: string;
    hoursValue: string;
    followUsLabel: string;
    tags: string[];
    formNameLabel: string;
    formNamePlaceholder: string;
    formEmailLabel: string;
    formEmailPlaceholder: string;
    formPhoneLabel: string;
    formPhonePlaceholder: string;
    formServiceLabel: string;
    formBudgetLabel: string;
    formBudgetPlaceholder: string;
    formTimelineLabel: string;
    formTimelinePlaceholder: string;
    formMessageLabel: string;
    formMessagePlaceholder: string;
    formSubmitLabel: string;
    socialLinks: ContactSocialLink[];
    budgetOptions: ContactOption[];
    timelineOptions: ContactOption[];
}

function SocialIconUpload({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
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
        <div className={styles.field} style={{ flex: "0 0 72px" }}>
            <label>İkon</label>
            <input ref={inputRef} type="file" accept="image/webp" style={{ display: "none" }} onChange={handleSelect} />
            <div
                onClick={() => inputRef.current?.click()}
                style={{
                    width: 56, height: 56,
                    border: "1.5px dashed #444",
                    borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", overflow: "hidden", background: "#1a1a1a",
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
    option, onUpdate, onDelete,
}: {
    option: ContactOption;
    onUpdate: (id: number, label: string) => void;
    onDelete: (id: number) => void;
}) {
    return (
        <div className={styles.contentItemBlock} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className={styles.field} style={{ flex: 1, marginBottom: 0 }}>
                <input className={styles.input} value={option.label}
                    placeholder="Seçim adı"
                    onChange={e => onUpdate(option.id, e.target.value)} />
            </div>
            <button type="button" onClick={() => onDelete(option.id)}
                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>✕</button>
        </div>
    );
}

function TagsEditor({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
    const [input, setInput] = useState("");

    const add = () => {
        const val = input.trim();
        if (!val) return;
        const tag = val.startsWith("#") ? val : `#${val}`;
        if (!tags.includes(tag)) onChange([...tags, tag]);
        setInput("");
    };

    const remove = (t: string) => onChange(tags.filter(x => x !== t));

    return (
        <div className={styles.field}>
            <label>Tagler</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input className={styles.input} value={input}
                    placeholder="#aiblog"
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())} />
                <button type="button" className={styles.addRowBtn} style={{ marginTop: 0, width: "auto", padding: "0 16px" }} onClick={add}>
                    + Əlavə et
                </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {tags.map(t => (
                    <span key={t} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "#1e2a3a", color: "#7cb3f5",
                        borderRadius: 20, padding: "4px 12px", fontSize: 13,
                    }}>
                        {t}
                        <button type="button" onClick={() => remove(t)}
                            style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>
                    </span>
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
    const updateBudgetOption = (id: number, label: string) =>
        setBudgetOptions(prev => prev.map(o => o.id === id ? { ...o, label } : o));

    const addBudgetOption = async () => {
        try {
            const newOpt = await apiFetch("/contact/budget-options", {
                method: "POST",
                body: JSON.stringify({ label: "Yeni seçim", order: budgetOptions.length }),
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

    const updateTimelineOption = (id: number, label: string) =>
        setTimelineOptions(prev => prev.map(o => o.id === id ? { ...o, label } : o));

    const addTimelineOption = async () => {
        try {
            const newOpt = await apiFetch("/contact/timeline-options", {
                method: "POST",
                body: JSON.stringify({ label: "Yeni seçim", order: timelineOptions.length }),
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

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Ümumi</h3>
                    <div className={styles.field}>
                        <label>Başlıq</label>
                        <input className={styles.input} value={settings.title} placeholder="Contact us"
                            onChange={e => upd("title", e.target.value)} />
                    </div>
                    <div className={styles.field}>
                        <label>Təsvir</label>
                        <textarea className={styles.input} value={settings.description} rows={3}
                            style={{ resize: "vertical" }} placeholder="Ready to start a project..."
                            onChange={e => upd("description", e.target.value)} />
                    </div>
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Əlaqə məlumatları</h3>

                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Email başlığı</label>
                            <input className={styles.input} value={settings.emailLabel} placeholder="Email Adress"
                                onChange={e => upd("emailLabel", e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Email dəyəri</label>
                            <input className={styles.input} value={settings.emailValue} placeholder="info@trenders.az"
                                onChange={e => upd("emailValue", e.target.value)} />
                        </div>
                    </div>

                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Telefon başlığı</label>
                            <input className={styles.input} value={settings.phoneLabel} placeholder="Phone"
                                onChange={e => upd("phoneLabel", e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Telefon nömrəsi</label>
                            <input className={styles.input} value={settings.phoneValue} placeholder="+(994) 50..."
                                onChange={e => upd("phoneValue", e.target.value)} />
                        </div>
                    </div>

                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Ünvan başlığı</label>
                            <input className={styles.input} value={settings.locationLabel} placeholder="Location"
                                onChange={e => upd("locationLabel", e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Ünvan dəyəri</label>
                            <input className={styles.input} value={settings.locationValue} placeholder="Baku, Sabail..."
                                onChange={e => upd("locationValue", e.target.value)} />
                        </div>
                    </div>

                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Saat başlığı</label>
                            <input className={styles.input} value={settings.hoursLabel} placeholder="Hours"
                                onChange={e => upd("hoursLabel", e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Saat dəyəri</label>
                            <input className={styles.input} value={settings.hoursValue} placeholder="Monday – Friday 9:00 AM – 6:00 PM"
                                onChange={e => upd("hoursValue", e.target.value)} />
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
                        <label>"Follow Us" yazısı</label>
                        <input className={styles.input} value={settings.followUsLabel} placeholder="Follow Us"
                            onChange={e => upd("followUsLabel", e.target.value)} />
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
                    <TagsEditor tags={settings.tags} onChange={t => upd("tags", t)} />
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Form Sahələri</h3>

                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Ad — label</label>
                            <input className={styles.input} value={settings.formNameLabel} placeholder="Name"
                                onChange={e => upd("formNameLabel", e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Ad — placeholder</label>
                            <input className={styles.input} value={settings.formNamePlaceholder} placeholder="Your name*"
                                onChange={e => upd("formNamePlaceholder", e.target.value)} />
                        </div>
                    </div>

                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Email — label</label>
                            <input className={styles.input} value={settings.formEmailLabel} placeholder="Email"
                                onChange={e => upd("formEmailLabel", e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Email — placeholder</label>
                            <input className={styles.input} value={settings.formEmailPlaceholder} placeholder="Your email*"
                                onChange={e => upd("formEmailPlaceholder", e.target.value)} />
                        </div>
                    </div>

                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Telefon — label</label>
                            <input className={styles.input} value={settings.formPhoneLabel} placeholder="Phone"
                                onChange={e => upd("formPhoneLabel", e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Telefon — placeholder</label>
                            <input className={styles.input} value={settings.formPhonePlaceholder} placeholder="Your phone*"
                                onChange={e => upd("formPhonePlaceholder", e.target.value)} />
                        </div>
                    </div>

                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Servis — label</label>
                            <input className={styles.input} value={settings.formServiceLabel} placeholder="Service"
                                onChange={e => upd("formServiceLabel", e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Mesaj — label</label>
                            <input className={styles.input} value={settings.formMessageLabel} placeholder="Message"
                                onChange={e => upd("formMessageLabel", e.target.value)} />
                        </div>
                    </div>

                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Mesaj — placeholder</label>
                            <input className={styles.input} value={settings.formMessagePlaceholder} placeholder="Your message"
                                onChange={e => upd("formMessagePlaceholder", e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Submit düyməsi yazısı</label>
                            <input className={styles.input} value={settings.formSubmitLabel} placeholder="Submit Inquiry"
                                onChange={e => upd("formSubmitLabel", e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Budget Dropdown</h3>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Label</label>
                            <input className={styles.input} value={settings.formBudgetLabel} placeholder="Budget"
                                onChange={e => upd("formBudgetLabel", e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Placeholder</label>
                            <input className={styles.input} value={settings.formBudgetPlaceholder} placeholder="Estimated Budget"
                                onChange={e => upd("formBudgetPlaceholder", e.target.value)} />
                        </div>
                    </div>

                    {budgetOptions.length === 0 && (
                        <p style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>Heç bir seçim yoxdur</p>
                    )}
                    {budgetOptions.map(o => (
                        <OptionRow key={o.id} option={o} onUpdate={updateBudgetOption} onDelete={deleteBudgetOption} />
                    ))}
                    <button type="button" className={styles.addRowBtn} onClick={addBudgetOption}>
                        + Seçim əlavə et
                    </button>
                </div>

                <div className={styles.fullDrawerSection}>
                    <h3 className={styles.drawerSectionTitle}>Project Timeline Dropdown</h3>
                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label>Label</label>
                            <input className={styles.input} value={settings.formTimelineLabel} placeholder="Project Timeline"
                                onChange={e => upd("formTimelineLabel", e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label>Placeholder</label>
                            <input className={styles.input} value={settings.formTimelinePlaceholder} placeholder="ASAP"
                                onChange={e => upd("formTimelinePlaceholder", e.target.value)} />
                        </div>
                    </div>

                    {timelineOptions.length === 0 && (
                        <p style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>Heç bir seçim yoxdur</p>
                    )}
                    {timelineOptions.map(o => (
                        <OptionRow key={o.id} option={o} onUpdate={updateTimelineOption} onDelete={deleteTimelineOption} />
                    ))}
                    <button type="button" className={styles.addRowBtn} onClick={addTimelineOption}>
                        + Seçim əlavə et
                    </button>
                </div>

            </div>
        </div>
    );
}