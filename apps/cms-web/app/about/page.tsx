"use client";

import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import TiptapLink from "@tiptap/extension-link";
import { HardBreak } from "@tiptap/extension-hard-break";
import styles from "@/styles/blog.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;
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

async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API}/about/upload`, {
        method: "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: formData,
    });
    if (!res.ok) throw new Error("Fayl yükləmə uğursuz");
    return (await res.json()).url;
}

function toAbsUrl(path: string) {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${API}${path}`;
}

// ─── Rich Editor ─────────────────────────────────────────────────────────────
function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [showLinkPopup, setShowLinkPopup] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkNewTab, setLinkNewTab] = useState(true);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ hardBreak: false }),
            Underline,
            Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
            TiptapLink.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
            HardBreak.extend({
                addKeyboardShortcuts() {
                    return { "Shift-Enter": () => this.editor.commands.setHardBreak() };
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    const openLinkPopup = () => {
        if (!editor) return;
        if (editor.state.selection.empty) { alert("Əvvəlcə mətn seçin"); return; }
        setLinkUrl(editor.getAttributes("link").href ?? "");
        setLinkNewTab(editor.getAttributes("link").target !== "_self");
        setShowLinkPopup(true);
    };

    const applyLink = () => {
        if (editor && linkUrl.trim()) {
            editor.chain().focus().extendMarkRange("link")
                .setLink({ href: linkUrl.trim(), target: linkNewTab ? "_blank" : "_self" }).run();
        }
        setShowLinkPopup(false);
    };

    const removeLink = () => { editor?.chain().focus().unsetLink().run(); setShowLinkPopup(false); };

    return (
        <div className={styles.richEditor}>
            <div className={styles.richToolbar}>
                {[
                    { label: <b>B</b>, action: () => editor?.chain().focus().toggleBold().run(), key: "bold" },
                    { label: <i>I</i>, action: () => editor?.chain().focus().toggleItalic().run(), key: "italic" },
                    { label: <u>U</u>, action: () => editor?.chain().focus().toggleUnderline().run(), key: "underline" },
                ].map(({ label, action, key }) => (
                    <button key={key} type="button"
                        className={editor?.isActive(key) ? styles.toolbarBtnActive : styles.toolbarBtn}
                        onClick={action}>{label}</button>
                ))}
                <div className={styles.toolbarDivider} />
                {([1, 2, 3, 4, 5, 6] as const).map(level => (
                    <button key={level} type="button"
                        className={editor?.isActive("heading", { level }) ? styles.toolbarBtnActive : styles.toolbarBtn}
                        onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}>H{level}</button>
                ))}
                <button type="button"
                    className={editor?.isActive("paragraph") ? styles.toolbarBtnActive : styles.toolbarBtn}
                    onClick={() => editor?.chain().focus().setParagraph().run()}>P</button>
                <div className={styles.toolbarDivider} />
                <button type="button"
                    className={editor?.isActive("bulletList") ? styles.toolbarBtnActive : styles.toolbarBtn}
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
                <button type="button"
                    className={editor?.isActive("orderedList") ? styles.toolbarBtnActive : styles.toolbarBtn}
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
                <div className={styles.toolbarDivider} />
                <button type="button"
                    className={editor?.isActive("link") ? styles.toolbarBtnActive : styles.toolbarBtn}
                    onClick={openLinkPopup}>🔗</button>
            </div>

            {showLinkPopup && (
                <div className={styles.linkPopup}>
                    <input className={styles.linkInput} type="url" placeholder="https://..."
                        value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setShowLinkPopup(false); }}
                        autoFocus />
                    <label className={styles.linkCheckbox}>
                        <input type="checkbox" checked={linkNewTab} onChange={e => setLinkNewTab(e.target.checked)} />
                        Yeni tab
                    </label>
                    <button type="button" className={styles.linkApplyBtn} onClick={applyLink}>Əlavə et</button>
                    <button type="button" className={styles.linkRemoveBtn} onClick={removeLink}>Sil</button>
                    <button type="button" className={styles.linkCancelBtn} onClick={() => setShowLinkPopup(false)}>✕</button>
                </div>
            )}
            <EditorContent editor={editor} className={styles.richContent} />
        </div>
    );
}

// ─── Single Image Upload ──────────────────────────────────────────────────────
function SingleImageUpload({ value, onChange, label }: {
    value: string; onChange: (url: string) => void; label?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await uploadFile(file);
        onChange(url);
        if (inputRef.current) inputRef.current.value = "";
    };
    return (
        <div className={styles.field}>
            {label && <label>{label}</label>}
            <input ref={inputRef} type="file" accept="image/webp" style={{ display: "none" }} onChange={handleSelect} />
            <div className={styles.singleUploadArea} onClick={() => inputRef.current?.click()}>
                {value ? (
                    <div className={styles.singleUploadPreviewWrap}>
                        <img src={toAbsUrl(value)} alt="" className={styles.singleUploadPreview} />
                        <button type="button" className={styles.imageRemoveBtn}
                            onClick={e => { e.stopPropagation(); onChange(""); }}>✕</button>
                    </div>
                ) : (
                    <div className={styles.imagePlaceholder}>
                        <span>🖼️</span><span>{label ?? "Şəkil seçin"}</span><small>WebP</small>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    const paragraphs: string[] = data.heroParagraphs ?? [""];

    return (
        <div className={styles.fullDrawerSection}>
            <h3 className={styles.drawerSectionTitle}>Hero Bölməsi</h3>

            <SingleImageUpload
                label="Hero şəkil"
                value={data.heroImage ?? ""}
                onChange={v => onChange({ ...data, heroImage: v })}
            />
            <div className={styles.field}>
                <label>Hero şəkil alt mətn</label>
                <input className={styles.input} value={data.heroImageAlt ?? ""}
                    onChange={e => onChange({ ...data, heroImageAlt: e.target.value })} />
            </div>
            <div className={styles.twoCol}>
                <div className={styles.field}>
                    <label>Badge</label>
                    <input className={styles.input} value={data.heroBadge ?? ""}
                        placeholder="Haqqımızda"
                        onChange={e => onChange({ ...data, heroBadge: e.target.value })} />
                </div>
                <div className={styles.field}>
                    <label>Başlıq</label>
                    <input className={styles.input} value={data.heroTitle ?? ""}
                        placeholder="SİZİN RƏQƏMSAL KOMANDANIZ"
                        onChange={e => onChange({ ...data, heroTitle: e.target.value })} />
                </div>
            </div>

            <div className={styles.sectionDivider} />
            <label className={styles.sectionGroupLabel}>Paraqraflar</label>

            {paragraphs.map((p, i) => (
                <div key={i} className={styles.contentItemBlock}>
                    <div className={styles.contentItemHeader}>
                        <span className={styles.contentItemLabel}>Paraqraf {i + 1}</span>
                        {paragraphs.length > 1 && (
                            <button type="button" className={styles.removeBtn}
                                onClick={() => onChange({
                                    ...data,
                                    heroParagraphs: paragraphs.filter((_, idx) => idx !== i),
                                })}>✕</button>
                        )}
                    </div>
                    <RichEditor value={p} onChange={v => {
                        const arr = [...paragraphs]; arr[i] = v;
                        onChange({ ...data, heroParagraphs: arr });
                    }} />
                </div>
            ))}
            <button type="button" className={styles.addRowBtn}
                onClick={() => onChange({ ...data, heroParagraphs: [...paragraphs, ""] })}>
                + Paraqraf əlavə et
            </button>
        </div>
    );
}

// ─── Story Section ────────────────────────────────────────────────────────────
function StorySection({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    const blocks: any[] = data.storyBlocks ?? [];

    const addBlock = () => onChange({
        ...data,
        storyBlocks: [...blocks, { title: "", paragraphs: [""], image: "", imageAlt: "" }],
    });

    const removeBlock = (i: number) => onChange({
        ...data,
        storyBlocks: blocks.filter((_, idx) => idx !== i),
    });

    const updateBlock = (i: number, key: string, val: any) => {
        const arr = [...blocks]; arr[i] = { ...arr[i], [key]: val };
        onChange({ ...data, storyBlocks: arr });
    };

    return (
        <div className={styles.fullDrawerSection}>
            <h3 className={styles.drawerSectionTitle}>Story Bölməsi</h3>

            {blocks.map((block, i) => (
                <div key={i} className={styles.contentItemBlock}>
                    <div className={styles.contentItemHeader}>
                        <span className={styles.contentItemLabel}>Blok #{i + 1}</span>
                        <button type="button" className={styles.removeBtn} onClick={() => removeBlock(i)}>✕</button>
                    </div>

                    <div className={styles.field}>
                        <label>Başlıq</label>
                        <input className={styles.input} value={block.title ?? ""}
                            onChange={e => updateBlock(i, "title", e.target.value)} />
                    </div>

                    <label className={styles.sectionGroupLabel}>Paraqraflar</label>
                    {(block.paragraphs ?? [""]).map((p: string, j: number) => (
                        <div key={j} className={styles.field}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <label>Paraqraf {j + 1}</label>
                                {(block.paragraphs ?? []).length > 1 && (
                                    <button type="button" className={styles.removeBtn} style={{ fontSize: 11 }}
                                        onClick={() => {
                                            const arr = [...(block.paragraphs ?? [])];
                                            arr.splice(j, 1);
                                            updateBlock(i, "paragraphs", arr);
                                        }}>✕</button>
                                )}
                            </div>
                            <RichEditor value={p} onChange={v => {
                                const arr = [...(block.paragraphs ?? [])]; arr[j] = v;
                                updateBlock(i, "paragraphs", arr);
                            }} />
                        </div>
                    ))}
                    <button type="button" className={styles.addRowBtn}
                        onClick={() => updateBlock(i, "paragraphs", [...(block.paragraphs ?? []), ""])}>
                        + Paraqraf əlavə et
                    </button>

                    <div className={styles.sectionDivider} />

                    <SingleImageUpload
                        label="Şəkil (optional)"
                        value={block.image ?? ""}
                        onChange={v => updateBlock(i, "image", v)}
                    />
                    <div className={styles.field}>
                        <label>Şəkil alt mətn</label>
                        <input className={styles.input} value={block.imageAlt ?? ""}
                            onChange={e => updateBlock(i, "imageAlt", e.target.value)} />
                    </div>
                </div>
            ))}

            <button type="button" className={styles.addRowBtn} onClick={addBlock}>
                + Blok əlavə et
            </button>
        </div>
    );
}

// ─── Team Section ─────────────────────────────────────────────────────────────
function TeamSection({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    return (
        <div className={styles.fullDrawerSection}>
            <h3 className={styles.drawerSectionTitle}>Team Bölməsi (Sol Yazı)</h3>

            <div className={styles.field}>
                <label>Başlıq</label>
                <input className={styles.input} value={data.teamTitle ?? ""}
                    placeholder="İLHAM VERƏN KOMANDA"
                    onChange={e => onChange({ ...data, teamTitle: e.target.value })} />
            </div>
            <div className={styles.field}>
                <label>Təsvir</label>
                <textarea className={styles.input} value={data.teamDescription ?? ""}
                    placeholder="Biz tipik bir marketinq şirkəti deyilik..."
                    rows={4}
                    style={{ resize: "vertical", minHeight: 100 }}
                    onChange={e => onChange({ ...data, teamDescription: e.target.value })} />
            </div>
            <div className={styles.twoCol}>
                <div className={styles.field}>
                    <label>Button mətni</label>
                    <input className={styles.input} value={data.teamCtaLabel ?? ""}
                        placeholder="Keçid edin →"
                        onChange={e => onChange({ ...data, teamCtaLabel: e.target.value })} />
                </div>
                <div className={styles.field}>
                    <label>Button linki</label>
                    <input className={styles.input} value={data.teamCtaHref ?? ""}
                        placeholder="/OurTeam"
                        onChange={e => onChange({ ...data, teamCtaHref: e.target.value })} />
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AboutPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [data, setData] = useState<any>({
        heroImage: "",
        heroImageAlt: "",
        heroBadge: "",
        heroTitle: "",
        heroParagraphs: [""],
        storyBlocks: [],
        teamTitle: "",
        teamDescription: "",
        teamCtaLabel: "",
        teamCtaHref: "",
    });

    useEffect(() => {
        apiFetch("/about/settings")
            .then(d => {
                if (d) setData({
                    heroImage: d.heroImage ?? "",
                    heroImageAlt: d.heroImageAlt ?? "",
                    heroBadge: d.heroBadge ?? "",
                    heroTitle: d.heroTitle ?? "",
                    heroParagraphs: Array.isArray(d.heroParagraphs) && d.heroParagraphs.length > 0 ? d.heroParagraphs : [""],
                    storyBlocks: Array.isArray(d.storyBlocks) ? d.storyBlocks : [],
                    teamTitle: d.teamTitle ?? "",
                    teamDescription: d.teamDescription ?? "",
                    teamCtaLabel: d.teamCtaLabel ?? "",
                    teamCtaHref: d.teamCtaHref ?? "",
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        setSaveStatus("idle");
        try {
            await apiFetch("/about/settings", {
                method: "PUT",
                body: JSON.stringify(data),
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

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Haqqımızda</h1>
                    <p className={styles.subtitle}>About Us səhifəsinin məzmununu idarə edin</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {saveStatus === "success" && (
                        <span style={{ color: "#16a34a", fontSize: 14, fontWeight: 600 }}>✓ Saxlanıldı</span>
                    )}
                    {saveStatus === "error" && (
                        <span style={{ color: "#dc2626", fontSize: 14, fontWeight: 600 }}>✕ Xəta baş verdi</span>
                    )}
                    <button className={styles.saveBtn} onClick={save} disabled={saving}>
                        {saving ? "Saxlanır..." : "Saxla"}
                    </button>
                </div>
            </div>

            {/* Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <HeroSection data={data} onChange={setData} />
                <StorySection data={data} onChange={setData} />
                <TeamSection data={data} onChange={setData} />
            </div>
        </div>
    );
}