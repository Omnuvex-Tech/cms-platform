"use client";

import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import TiptapLink from "@tiptap/extension-link";
import { HardBreak } from "@tiptap/extension-hard-break";
import {
    DndContext, closestCenter, PointerSensor,
    useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
    const res = await fetch(`${API}/blog/upload`, {
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

function generateSlug(title: string) {
    return title.toLowerCase()
        .replace(/<[^>]*>/g, "")
        .replace(/ə/g, "e").replace(/ğ/g, "g").replace(/ı/g, "i")
        .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c")
        .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").trim();
}

function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [showLinkPopup, setShowLinkPopup] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkNewTab, setLinkNewTab] = useState(true);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                hardBreak: false,
            }),
            Underline,
            Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
            TiptapLink.configure({
                openOnClick: false,
                HTMLAttributes: { rel: "noopener noreferrer" },
            }),
            HardBreak.extend({
                addKeyboardShortcuts() {
                    return {
                        "Shift-Enter": () => this.editor.commands.setHardBreak(),
                    };
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
                .setLink({ href: linkUrl.trim(), target: linkNewTab ? "_blank" : "_self" })
                .run();
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
                <button type="button"
                    className={editor?.isActive("blockquote") ? styles.toolbarBtnActive : styles.toolbarBtn}
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                    style={{ fontFamily: "Georgia, serif", fontSize: 16, letterSpacing: 1 }}>
                    ❝❞
                </button>
                <div className={styles.toolbarDivider} />
                <button type="button"
                    className={editor?.isActive("link") ? styles.toolbarBtnActive : styles.toolbarBtn}
                    onClick={openLinkPopup}>🔗</button>
            </div>

            {showLinkPopup && (
                <div className={styles.linkPopup}>
                    <input
                        className={styles.linkInput}
                        type="url"
                        placeholder="https://..."
                        value={linkUrl}
                        onChange={e => setLinkUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setShowLinkPopup(false); }}
                        autoFocus
                    />
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

function SingleImageUpload({ value, onChange, label, accept = "image/webp" }: {
    value: string; onChange: (url: string) => void; label?: string; accept?: string;
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
            <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={handleSelect} />
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

function AvatarUpload({ value, onChange, label }: { value: string; onChange: (url: string) => void; label?: string }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await uploadFile(file);
        onChange(url);
    };
    return (
        <div className={styles.field}>
            {label && <label>{label}</label>}
            <input ref={inputRef} type="file" accept="image/webp" style={{ display: "none" }} onChange={handleSelect} />
            <div className={styles.avatarUpload} onClick={() => inputRef.current?.click()}>
                {value ? <img src={toAbsUrl(value)} alt="" className={styles.avatarPreview} /> : <span>+</span>}
            </div>
        </div>
    );
}

function HeroSectionEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    return (
        <div className={styles.sectionFields}>
            <SingleImageUpload label="Hero şəkil" value={data.heroImage ?? ""} onChange={v => onChange({ ...data, heroImage: v })} />
            <div className={styles.field}><label>Hero şəkil alt mətn</label>
                <input className={styles.input} value={data.heroImageAlt ?? ""} onChange={e => onChange({ ...data, heroImageAlt: e.target.value })} />
            </div>
            <div className={styles.field}><label>Hashtag</label>
                <input className={styles.input} value={data.hashtag ?? ""} placeholder="Design" onChange={e => onChange({ ...data, hashtag: e.target.value })} />
            </div>
            <div className={styles.field}><label>Başlıq</label>
                <RichEditor value={data.title ?? ""} onChange={v => onChange({ ...data, title: v })} />
            </div>
            {(data.paragraphs ?? [""]).map((p: string, i: number) => (
                <div key={i} className={styles.field}>
                    <label>Paraqraf {i + 1}</label>
                    <RichEditor value={p} onChange={v => {
                        const arr = [...(data.paragraphs ?? [])];
                        arr[i] = v;
                        onChange({ ...data, paragraphs: arr });
                    }} />
                </div>
            ))}
            <button type="button" className={styles.addRowBtn}
                onClick={() => onChange({ ...data, paragraphs: [...(data.paragraphs ?? []), ""] })}>
                + Paraqraf əlavə et
            </button>
        </div>
    );
}

function ContentSectionEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    const sections = data.sections ?? [];

    const addSection = () => onChange({ ...data, sections: [...sections, { title: "", paragraphs: [""] }] });
    const removeSection = (i: number) => onChange({ ...data, sections: sections.filter((_: any, idx: number) => idx !== i) });
    const updateSection = (i: number, key: string, val: any) => {
        const arr = [...sections]; arr[i] = { ...arr[i], [key]: val };
        onChange({ ...data, sections: arr });
    };

    return (
        <div className={styles.sectionFields}>
            <SingleImageUpload label="Hero şəkil" value={data.heroImage ?? ""} onChange={v => onChange({ ...data, heroImage: v })} />
            <div className={styles.field}><label>Hero şəkil alt mətn</label>
                <input className={styles.input} value={data.heroImageAlt ?? ""} onChange={e => onChange({ ...data, heroImageAlt: e.target.value })} />
            </div>
            <div className={styles.field}><label>Overlap başlıq</label>
                <RichEditor value={data.overlapTitle ?? ""} onChange={v => onChange({ ...data, overlapTitle: v })} />
            </div>
            {(data.introParagraphs ?? [""]).map((p: string, i: number) => (
                <div key={i} className={styles.field}>
                    <label>Paraqraf {i + 1}</label>
                    <RichEditor value={p} onChange={v => {
                        const arr = [...(data.introParagraphs ?? [])];
                        arr[i] = v;
                        onChange({ ...data, introParagraphs: arr });
                    }} />
                </div>
            ))}
            <button type="button" className={styles.addRowBtn}
                onClick={() => onChange({ ...data, introParagraphs: [...(data.introParagraphs ?? []), ""] })}>
                + Paraqraf əlavə et
            </button>

            <div className={styles.sectionDivider} />
            <label className={styles.sectionGroupLabel}>Alt bölmələr</label>
            {sections.map((sec: any, i: number) => (
                <div key={i} className={styles.contentItemBlock}>
                    <div className={styles.contentItemHeader}>
                        <span className={styles.contentItemLabel}>Bölmə #{i + 1}</span>
                        <button type="button" className={styles.removeBtn} onClick={() => removeSection(i)}>✕</button>
                    </div>
                    <div className={styles.field}><label>Başlıq</label>
                        <RichEditor value={sec.title ?? ""} onChange={v => updateSection(i, "title", v)} />
                    </div>
                    {(sec.paragraphs ?? [""]).map((p: string, j: number) => (
                        <div key={j} className={styles.field}>
                            <label>Paraqraf {j + 1}</label>
                            <RichEditor value={p} onChange={v => {
                                const arr = [...(sec.paragraphs ?? [])];
                                arr[j] = v;
                                updateSection(i, "paragraphs", arr);
                            }} />
                        </div>
                    ))}
                    <button type="button" className={styles.addRowBtn}
                        onClick={() => updateSection(i, "paragraphs", [...(sec.paragraphs ?? []), ""])}>
                        + Paraqraf əlavə et
                    </button>
                </div>
            ))}
            <button type="button" className={styles.addRowBtn} onClick={addSection}>+ Bölmə əlavə et</button>

            <div className={styles.sectionDivider} />
            <label className={styles.sectionGroupLabel}>Alt şəkillər</label>
            <div className={styles.twoCol}>
                <div>
                    <SingleImageUpload label="Sol şəkil" value={data.bottomImages?.left ?? ""} onChange={v => onChange({ ...data, bottomImages: { ...data.bottomImages, left: v } })} />
                    <div className={styles.field}><label>Sol şəkil alt mətn</label>
                        <input className={styles.input} value={data.bottomImages?.leftAlt ?? ""} onChange={e => onChange({ ...data, bottomImages: { ...data.bottomImages, leftAlt: e.target.value } })} />
                    </div>
                </div>
                <div>
                    <SingleImageUpload label="Sağ şəkil" value={data.bottomImages?.right ?? ""} onChange={v => onChange({ ...data, bottomImages: { ...data.bottomImages, right: v } })} />
                    <div className={styles.field}><label>Sağ şəkil alt mətn</label>
                        <input className={styles.input} value={data.bottomImages?.rightAlt ?? ""} onChange={e => onChange({ ...data, bottomImages: { ...data.bottomImages, rightAlt: e.target.value } })} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArticleSectionEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
    const sections = data.sections ?? [];

    const normalizeSection = (sec: any) => {
        if (sec.blocks) return sec;
        const blocks: any[] = [];
        if (sec.heading) blocks.push({ type: "heading", content: sec.heading });
        for (const p of sec.paragraphs ?? [""]) {
            blocks.push({ type: "paragraph", content: p });
        }
        return {
            ...sec,
            blocks: blocks.length > 0 ? blocks : [{ type: "paragraph", content: "" }],
            heading: undefined,
            paragraphs: undefined,
        };
    };

    const addSection = () =>
        onChange({
            ...data,
            sections: [
                ...sections,
                {
                    blocks: [{ type: "paragraph", content: "" }],
                    hashSections: [],
                    hashHeading: "",
                    sideImage: "",
                    sideImageAlt: "",
                },
            ],
        });

    const removeSection = (i: number) =>
        onChange({ ...data, sections: sections.filter((_: any, idx: number) => idx !== i) });

    const updateSection = (i: number, key: string, val: any) => {
        const arr = sections.map((s: any, idx: number) =>
            idx === i ? { ...normalizeSection(s), [key]: val } : s
        );
        onChange({ ...data, sections: arr });
    };

    return (
        <div className={styles.sectionFields}>
            {sections.map((secRaw: any, i: number) => {
                const sec = normalizeSection(secRaw);
                const blocks: any[] = sec.blocks ?? [{ type: "paragraph", content: "" }];

                const updateBlock = (j: number, key: string, val: any) => {
                    const newBlocks = blocks.map((b: any, idx: number) =>
                        idx === j ? { ...b, [key]: val } : b
                    );
                    updateSection(i, "blocks", newBlocks);
                };

                const removeBlock = (j: number) => {
                    updateSection(i, "blocks", blocks.filter((_: any, idx: number) => idx !== j));
                };

                const addParagraph = () =>
                    updateSection(i, "blocks", [...blocks, { type: "paragraph", content: "" }]);

                const addHeadingAndParagraph = () =>
                    updateSection(i, "blocks", [
                        ...blocks,
                        { type: "heading", content: "" },
                        { type: "paragraph", content: "" },
                    ]);

                return (
                    <div key={i} className={styles.contentItemBlock}>
                        <div className={styles.contentItemHeader}>
                            <span className={styles.contentItemLabel}>Bölmə #{i + 1}</span>
                            <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={() => removeSection(i)}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Blocks: heading / paragraph */}
                        {blocks.map((block: any, j: number) => (
                            <div key={j} className={styles.field} style={{ position: "relative" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <label>
                                        {block.type === "heading" ? `Başlıq` : `Paraqraf`}
                                    </label>
                                    {blocks.length > 1 && (
                                        <button
                                            type="button"
                                            className={styles.removeBtn}
                                            style={{ fontSize: 11 }}
                                            onClick={() => removeBlock(j)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                <RichEditor
                                    value={block.content ?? ""}
                                    onChange={(v) => updateBlock(j, "content", v)}
                                />
                            </div>
                        ))}

                        <button type="button" className={styles.addRowBtn} onClick={addParagraph}>
                            + Paraqraf əlavə et
                        </button>
                        <button
                            type="button"
                            className={styles.addRowBtn}
                            onClick={addHeadingAndParagraph}
                            style={{ marginLeft: 8 }}
                        >
                            + Başlıq və Paraqraf əlavə et
                        </button>

                        <div className={styles.sectionDivider} />

                        <label className={styles.sectionGroupLabel}>Hash bölmələri</label>

                        <div className={styles.field}>
                            <label>Hash bölmə başlığı</label>
                            <RichEditor
                                value={sec.hashHeading ?? ""}
                                onChange={(v) => updateSection(i, "hashHeading", v)}
                            />
                        </div>

                        {(sec.hashSections ?? []).map((hs: any, k: number) => (
                            <div key={k} className={styles.hashBlock}>
                                <div className={styles.field}>
                                    <label>Tag</label>
                                    <input
                                        className={styles.input}
                                        value={hs.tag ?? ""}
                                        placeholder="Dizayn kateqoriyası"
                                        onChange={(e) => {
                                            const arr = [...(sec.hashSections ?? [])];
                                            arr[k] = { ...arr[k], tag: e.target.value };
                                            updateSection(i, "hashSections", arr);
                                        }}
                                    />
                                </div>
                                {(hs.paragraphs ?? [""]).map((p: string, m: number) => (
                                    <div key={m} className={styles.field}>
                                        <label>Paraqraf {m + 1}</label>
                                        <RichEditor
                                            value={p}
                                            onChange={(v) => {
                                                const hsArr = [...(sec.hashSections ?? [])];
                                                const pArr = [...(hs.paragraphs ?? [])];
                                                pArr[m] = v;
                                                hsArr[k] = { ...hsArr[k], paragraphs: pArr };
                                                updateSection(i, "hashSections", hsArr);
                                            }}
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className={styles.addRowBtn}
                                    onClick={() => {
                                        const hsArr = [...(sec.hashSections ?? [])];
                                        hsArr[k] = { ...hsArr[k], paragraphs: [...(hs.paragraphs ?? []), ""] };
                                        updateSection(i, "hashSections", hsArr);
                                    }}
                                >
                                    + Paraqraf əlavə et
                                </button>
                                <button
                                    type="button"
                                    className={styles.removeBtn}
                                    style={{ marginTop: 8 }}
                                    onClick={() =>
                                        updateSection(
                                            i,
                                            "hashSections",
                                            sec.hashSections.filter((_: any, idx: number) => idx !== k)
                                        )
                                    }
                                >
                                    Hash bölməni sil
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            className={styles.addRowBtn}
                            onClick={() =>
                                updateSection(i, "hashSections", [
                                    ...(sec.hashSections ?? []),
                                    { tag: "", paragraphs: [""] },
                                ])
                            }
                        >
                            + Hash bölmə əlavə et
                        </button>

                        <div className={styles.sectionDivider} />

                        <SingleImageUpload
                            label="Yan şəkil (optional)"
                            value={sec.sideImage ?? ""}
                            onChange={(v) => updateSection(i, "sideImage", v)}
                        />
                        <div className={styles.field}>
                            <label>Yan şəkil alt mətn</label>
                            <input
                                className={styles.input}
                                value={sec.sideImageAlt ?? ""}
                                onChange={(e) => updateSection(i, "sideImageAlt", e.target.value)}
                            />
                        </div>
                    </div>
                );
            })}

            <button type="button" className={styles.addRowBtn} onClick={addSection}>
                + Bölmə əlavə et
            </button>

            <div className={styles.sectionDivider} />
            <label className={styles.sectionGroupLabel}>Hashtaglar</label>
            <div className={styles.field}>
                <input
                    className={styles.input}
                    value={
                        Array.isArray(data.hashtags)
                            ? data.hashtags.join(", ")
                            : (data.hashtags ?? "")
                    }
                    placeholder="#aiblog, #design"
                    onChange={(e) => onChange({ ...data, hashtags: e.target.value })}
                />
                <small style={{ color: "#94a3b8" }}>Vergüllə ayırın</small>
            </div>
        </div>
    );
}


const SECTION_TYPES = [
    { type: "hero", label: "Hero" },
    { type: "content", label: "Content" },
    { type: "article", label: "Article" },
];
function SectionEditor({ section, index, onChange, onRemove }: {
    section: any; index: number; onChange: (d: any) => void; onRemove: () => void;
}) {
    const [open, setOpen] = useState(true);

    const renderEditor = () => {
        switch (section.type) {
            case "hero": return <HeroSectionEditor data={section} onChange={onChange} />;
            case "content": return <ContentSectionEditor data={section} onChange={onChange} />;
            case "article": return <ArticleSectionEditor data={section} onChange={onChange} />;
            default: return null;
        }
    };

    return (
        <div className={styles.sectionBlock}>
            <div className={styles.sectionBlockHeader}>
                <div className={styles.sectionBlockLeft}>
                    <span className={styles.sectionTypeTag}>{section.type.toUpperCase()}</span>
                    <span className={styles.sectionIndex}>#{index + 1}</span>
                </div>
                <div className={styles.sectionBlockRight}>
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

function SortableBlogRow({ b, onEdit, onToggle, onDelete }: {
    b: any; onEdit: (b: any) => void; onToggle: (b: any) => void; onDelete: (id: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: b.id });
    return (
        <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
            <td className={styles.num}><span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span></td>
            <td>
                <div className={styles.blogInfo}>
                    {b.coverImage && <img src={toAbsUrl(b.coverImage)} alt="" className={styles.coverThumb} />}
                    <div>
                        <div
                            className={styles.blogTitle}
                            dangerouslySetInnerHTML={{ __html: b.title.replace(/<[^>]*>/g, "").trim() }}
                        />                        <div className={styles.blogSlug}>/{b.slug}</div>
                    </div>
                </div>
            </td>
            <td><span className={styles.badgeTag}>{b.badge}</span></td>
            <td>
                <div className={styles.placementFlags}>
                    {b.isFeaturedMain && <span className={styles.flag}>Main</span>}
                    {b.isFeaturedSide && <span className={styles.flag}>Side</span>}
                    {b.isPickOfWeek && <span className={styles.flag}>Pick</span>}
                    {b.isPreview && <span className={styles.flag}>Preview</span>}
                    {b.isGrid && <span className={styles.flag}>Grid</span>}
                    {b.isAuthorPreview && <span className={styles.flag}>A.Preview</span>}
                    {b.isAuthorList && <span className={styles.flag}>A.List</span>}
                    {b.isHomeVisible && <span className={styles.flag}>Home</span>}
                </div>
            </td>
            <td>
                <span className={`${styles.statusBadge} ${b.isVisible ? styles.badgeVisible : styles.badgeHidden}`}>
                    {b.isVisible ? "Görünür" : "Gizli"}
                </span>
            </td>
            <td>
                <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => onEdit(b)}>Düzəlt</button>
                    <button className={`${styles.visBtn} ${b.isVisible ? styles.visBtnHide : styles.visBtnShow}`} onClick={() => onToggle(b)}>
                        {b.isVisible ? "Gizlət" : "Göstər"}
                    </button>
                    <button className={styles.deleteBtn} onClick={() => onDelete(b.id)}>Sil</button>
                </div>
            </td>
        </tr>
    );
}

// function AuthorsTab() {
//     const [authors, setAuthors] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [modalOpen, setModalOpen] = useState(false);
//     const [editItem, setEditItem] = useState<any | null>(null);
//     const [name, setName] = useState("");
//     const [role, setRole] = useState("");
//     const [avatar, setAvatar] = useState("");
//     const [linkedinHref, setLinkedinHref] = useState("");
//     const [bio, setBio] = useState("");
//     const [skillsTitle, setSkillsTitle] = useState("SKILLS");
//     const [skills, setSkills] = useState("");
//     const [saving, setSaving] = useState(false);
//     const [deleteId, setDeleteId] = useState<number | null>(null);
//     const [slug, setSlug] = useState("");
//     const [avatarAlt, setAvatarAlt] = useState("");
//     const [linkedinIcon, setLinkedinIcon] = useState("");

//     const load = async () => {
//         setLoading(true);
//         try { setAuthors(await apiFetch("/blog/authors")); } finally { setLoading(false); }
//     };

//     useEffect(() => { load(); }, []);

//     const openCreate = () => {
//         setEditItem(null); setName(""); setRole(""); setAvatar("");
//         setLinkedinHref(""); setBio(""); setSkillsTitle("SKILLS"); setSkills("");
//         setSlug("");
//         setModalOpen(true);
//         setAvatarAlt(""); setLinkedinIcon("");
//     };

//     const openEdit = (a: any) => {
//         setEditItem(a); setName(a.name); setRole(a.role ?? ""); setAvatar(a.avatar ?? "");
//         setLinkedinHref(a.linkedinHref ?? ""); setBio(a.bio ?? "");
//         setSkillsTitle(a.skillsTitle ?? "SKILLS");
//         setSkills((a.skills ?? []).join(", "));
//         setModalOpen(true);
//         setSlug(a.slug ?? "");
//         setAvatarAlt(a.avatarAlt ?? "");
//         setLinkedinIcon(a.linkedinIcon ?? "");
//     };

//     const save = async () => {
//         if (!name.trim()) return;
//         setSaving(true);
//         try {
//             const body = {
//                 name,
//                 slug: slug || null,
//                 role: role || null,
//                 avatar: avatar || null,
//                 linkedinHref: linkedinHref || null,
//                 bio: bio || null,
//                 skillsTitle: skillsTitle || null,
//                 skills: skills.split(",").map((s: string) => s.trim()).filter(Boolean),
//                 avatarAlt: avatarAlt || null,
//                 linkedinIcon: linkedinIcon || null,
//             };
//             if (editItem) await apiFetch(`/blog/authors/${editItem.id}`, { method: "PUT", body: JSON.stringify(body) });
//             else await apiFetch("/blog/authors", { method: "POST", body: JSON.stringify(body) });
//             setModalOpen(false); load();
//         } finally { setSaving(false); }
//     };

//     const handleDelete = async () => {
//         if (!deleteId) return;
//         await apiFetch(`/blog/authors/${deleteId}`, { method: "DELETE" });
//         setDeleteId(null); load();
//     };

//     return (
//         <div>
//             <div className={styles.tabHeader}>
//                 <h2 className={styles.tabTitle}>Authorlar</h2>
//                 <button className={styles.addBtn} onClick={openCreate}>+ Yeni Author</button>
//             </div>
//             {loading ? <div className={styles.empty}>Yüklənir...</div>
//                 : authors.length === 0 ? <div className={styles.empty}>Hələ author yoxdur</div>
//                     : (
//                         <div className={styles.tableWrap}>
//                             <table className={styles.table}>
//                                 <thead><tr><th>Avatar</th><th>Ad</th><th>Vəzifə</th><th>Əməliyyatlar</th></tr></thead>
//                                 <tbody>
//                                     {authors.map(a => (
//                                         <tr key={a.id}>
//                                             <td>{a.avatar && <img src={toAbsUrl(a.avatar)} alt="" className={styles.authorAvatar} />}</td>
//                                             <td>{a.name}</td>
//                                             <td>{a.role ?? "—"}</td>
//                                             <td>
//                                                 <div className={styles.actions}>
//                                                     <button className={styles.editBtn} onClick={() => openEdit(a)}>Düzəlt</button>
//                                                     <button className={styles.deleteBtn} onClick={() => setDeleteId(a.id)}>Sil</button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}

//             {modalOpen && (
//                 <div className={styles.overlay} onClick={() => setModalOpen(false)}>
//                     <div className={styles.modal} style={{ maxWidth: 720, width: "95%" }} onClick={e => e.stopPropagation()}>
//                         <div className={styles.modalHeader}>
//                             <h2>{editItem ? "Author Düzəlt" : "Yeni Author"}</h2>
//                             <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
//                         </div>
//                         <div className={styles.modalBody}>

//                             {/* Avatar + Avatar Alt Text */}
//                             <div className={styles.twoCol}>
//                                 <AvatarUpload label="Avatar" value={avatar} onChange={setAvatar} />
//                                 <div className={styles.field}>
//                                     <label>Avatar Alt Text</label>
//                                     <input className={styles.input} value={avatarAlt} onChange={e => setAvatarAlt(e.target.value)} placeholder="Almaz Abdullayeva şəkli" />
//                                 </div>
//                             </div>

//                             <div className={styles.twoCol}>
//                                 <div className={styles.field}>
//                                     <label>Ad Soyad *</label>
//                                     <input className={styles.input} value={name} onChange={e => {
//                                         setName(e.target.value);
//                                         setSlug(generateSlug(e.target.value));
//                                     }} placeholder="Almaz Abdullayeva" />
//                                 </div>
//                                 <div className={styles.field}>
//                                     <label>Slug</label>
//                                     <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} placeholder="cavid-axundov" />
//                                 </div>
//                             </div>

//                             <div className={styles.field}>
//                                 <label>Vəzifə</label>
//                                 <input className={styles.input} value={role} onChange={e => setRole(e.target.value)} placeholder="Baş İcarçı Direktor" />
//                             </div>

//                             <div className={styles.field}>
//                                 <label>Bio</label>
//                                 <textarea className={styles.input} value={bio} onChange={e => setBio(e.target.value)} rows={6} placeholder="Author haqqında qısa məlumat..." style={{ width: "100%", resize: "vertical", minHeight: 120 }} />
//                             </div>

//                             {/* LinkedIn URL + LinkedIn İkon */}
//                             <div className={styles.twoCol}>
//                                 <div className={styles.field}>
//                                     <label>LinkedIn URL</label>
//                                     <input className={styles.input} value={linkedinHref} onChange={e => setLinkedinHref(e.target.value)} placeholder="https://linkedin.com/in/..." />
//                                 </div>
//                                 <div className={styles.field}>
//                                     <label>LinkedIn İkon <small>(WebP və ya SVG)</small></label>
//                                     <SingleImageUpload
//                                         value={linkedinIcon}
//                                         onChange={setLinkedinIcon}
//                                         accept="image/webp,image/svg+xml"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Skills başlığı + Skills */}
//                             <div className={styles.twoCol}>
//                                 <div className={styles.field}>
//                                     <label>Skills başlığı</label>
//                                     <input className={styles.input} value={skillsTitle} onChange={e => setSkillsTitle(e.target.value)} placeholder="SKILLS" />
//                                 </div>
//                                 <div className={styles.field}>
//                                     <label>Skills <small>(vergüllə ayırın)</small></label>
//                                     <input className={styles.input} value={skills} onChange={e => setSkills(e.target.value)} placeholder="Management, Strategy Development" />
//                                 </div>
//                             </div>

//                         </div>
//                         <div className={styles.modalFooter}>
//                             <button className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Ləğv et</button>
//                             <button className={styles.saveBtn} onClick={save} disabled={saving}>{saving ? "Saxlanır..." : "Saxla"}</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//             {deleteId && (
//                 <div className={styles.overlay} onClick={() => setDeleteId(null)}>
//                     <div className={styles.modal} onClick={e => e.stopPropagation()}>
//                         <div className={styles.modalHeader}><h2>Silməyi təsdiq edin</h2>
//                             <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button></div>
//                         <div className={styles.modalBody}><p>Bu authoru silmək istədiyinizə əminsiniz?</p></div>
//                         <div className={styles.modalFooter}>
//                             <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Ləğv et</button>
//                             <button className={styles.deleteConfirmBtn} onClick={handleDelete}>Sil</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }


function SortableAuthorRow({ a, onEdit, onDelete, onToggleVisibility, onToggleOurTeam }: {
    a: any;
    onEdit: (a: any) => void;
    onDelete: (id: number) => void;
    onToggleVisibility: (a: any) => void;
    onToggleOurTeam: (a: any) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: a.id });
    return (
        <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
            <td className={styles.num}><span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span></td>
            <td>{a.avatar && <img src={toAbsUrl(a.avatar)} alt="" className={styles.authorAvatar} />}</td>
            <td>{a.name}</td>
            <td>{a.role ?? "—"}</td>
            <td>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                        type="button"
                        className={a.isVisible ? styles.activeToggle : styles.inactiveToggle}
                        onClick={() => onToggleVisibility(a)}
                    >
                        {a.isVisible ? "Görünür" : "Gizli"}
                    </button>
                    <button
                        type="button"
                        className={a.isOurTeam ? styles.activeToggle : styles.inactiveToggle}
                        onClick={() => onToggleOurTeam(a)}
                    >
                        {a.isOurTeam ? "Team ✓" : "Team"}
                    </button>
                </div>
            </td>
            <td>
                <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => onEdit(a)}>Düzəlt</button>
                    <button className={styles.deleteBtn} onClick={() => onDelete(a.id)}>Sil</button>
                </div>
            </td>
        </tr>
    );
}

function AuthorsTab() {
    const [authors, setAuthors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [avatar, setAvatar] = useState("");
    const [linkedinHref, setLinkedinHref] = useState("");
    const [bio, setBio] = useState("");
    const [skillsTitle, setSkillsTitle] = useState("SKILLS");
    const [skills, setSkills] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [slug, setSlug] = useState("");
    const [avatarAlt, setAvatarAlt] = useState("");
    const [linkedinIcon, setLinkedinIcon] = useState("");
    const [isVisible, setIsVisible] = useState(true);
    const [isOurTeam, setIsOurTeam] = useState(false);
    const [reordering, setReordering] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

    const load = async () => {
        setLoading(true);
        try { setAuthors(await apiFetch("/blog/authors")); } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditItem(null); setName(""); setRole(""); setAvatar("");
        setLinkedinHref(""); setBio(""); setSkillsTitle("SKILLS"); setSkills("");
        setSlug(""); setAvatarAlt(""); setLinkedinIcon("");
        setIsVisible(true); setIsOurTeam(false);
        setModalOpen(true);
    };

    const openEdit = (a: any) => {
        setEditItem(a); setName(a.name); setRole(a.role ?? ""); setAvatar(a.avatar ?? "");
        setLinkedinHref(a.linkedinHref ?? ""); setBio(a.bio ?? "");
        setSkillsTitle(a.skillsTitle ?? "SKILLS");
        setSkills((a.skills ?? []).join(", "));
        setSlug(a.slug ?? "");
        setAvatarAlt(a.avatarAlt ?? "");
        setLinkedinIcon(a.linkedinIcon ?? "");
        setIsVisible(a.isVisible ?? true);
        setIsOurTeam(a.isOurTeam ?? false);
        setModalOpen(true);
    };

    const save = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            const body = {
                name,
                slug: slug || null,
                role: role || null,
                avatar: avatar || null,
                linkedinHref: linkedinHref || null,
                bio: bio || null,
                skillsTitle: skillsTitle || null,
                skills: skills.split(",").map((s: string) => s.trim()).filter(Boolean),
                avatarAlt: avatarAlt || null,
                linkedinIcon: linkedinIcon || null,
                isVisible,
                isOurTeam,
            };
            if (editItem) await apiFetch(`/blog/authors/${editItem.id}`, { method: "PUT", body: JSON.stringify(body) });
            else await apiFetch("/blog/authors", { method: "POST", body: JSON.stringify(body) });
            setModalOpen(false); load();
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await apiFetch(`/blog/authors/${deleteId}`, { method: "DELETE" });
        setDeleteId(null); load();
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oi = authors.findIndex(a => a.id === active.id);
        const ni = authors.findIndex(a => a.id === over.id);
        const newList = arrayMove(authors, oi, ni);
        setAuthors(newList);
        setReordering(true);
        try {
            await apiFetch("/blog/authors/reorder", {
                method: "PATCH",
                body: JSON.stringify({ ids: newList.map(a => a.id) }),
            });
        } finally { setReordering(false); }
    };

    const handleToggleVisibility = async (a: any) => {
        try {
            await apiFetch(`/blog/authors/${a.id}`, {
                method: "PUT",
                body: JSON.stringify({ isVisible: !a.isVisible }),
            });
            setAuthors(prev => prev.map(x => x.id === a.id ? { ...x, isVisible: !a.isVisible } : x));
        } catch (e) { console.error(e); }
    };

    const handleToggleOurTeam = async (a: any) => {
        try {
            await apiFetch(`/blog/authors/${a.id}`, {
                method: "PUT",
                body: JSON.stringify({ isOurTeam: !a.isOurTeam }),
            });
            setAuthors(prev => prev.map(x => x.id === a.id ? { ...x, isOurTeam: !a.isOurTeam } : x));
        } catch (e) { console.error(e); }
    };


    return (
        <div>
            <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>Authorlar</h2>
                <div className={styles.headerRight}>
                    {reordering && <span className={styles.reorderingText}>Saxlanır...</span>}
                    <button className={styles.addBtn} onClick={openCreate}>+ Yeni Author</button>
                </div>
            </div>

            {loading ? <div className={styles.empty}>Yüklənir...</div>
                : authors.length === 0 ? <div className={styles.empty}>Hələ author yoxdur</div>
                    : (
                        <div className={styles.tableWrap}>
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={authors.map(a => a.id)} strategy={verticalListSortingStrategy}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr><th></th><th>Avatar</th><th>Ad</th><th>Vəzifə</th><th>Placement</th><th>Əməliyyatlar</th></tr>
                                        </thead>
                                        <tbody>
                                            {authors.map(a => (
                                                <SortableAuthorRow
                                                    key={a.id}
                                                    a={a}
                                                    onEdit={openEdit}
                                                    onDelete={setDeleteId}
                                                    onToggleVisibility={handleToggleVisibility}
                                                    onToggleOurTeam={handleToggleOurTeam}
                                                />))}
                                        </tbody>
                                    </table>
                                </SortableContext>
                            </DndContext>
                        </div>
                    )}

            {modalOpen && (
                <div className={styles.overlay} onClick={() => setModalOpen(false)}>
                    <div className={styles.modal} style={{ maxWidth: 720, width: "95%" }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editItem ? "Author Düzəlt" : "Yeni Author"}</h2>
                            <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>

                            {/* Görünürlük + Our Team */}
                            <div className={styles.twoCol}>
                                <div className={styles.field}>
                                    <label>Görünürlük</label>
                                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                        <button
                                            type="button"
                                            className={`${isVisible ? styles.activeToggle : styles.inactiveToggle} ${styles.toggleFixed}`}
                                            onClick={() => setIsVisible(v => !v)}
                                        >
                                            {isVisible ? "Görünür" : "Gizli"}
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.field}>
                                    <label>Our Team səhifəsi</label>
                                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                        <button type="button"
                                            className={isOurTeam ? styles.activeToggle : styles.inactiveToggle}
                                            onClick={() => setIsOurTeam(v => !v)}>
                                            {isOurTeam ? "Aktiv" : "Deaktiv"}
                                        </button>
                                    </div>
                                    <small style={{ color: "#94a3b8" }}>İlk 6-sı About Us-da da görünür</small>
                                </div>
                            </div>

                            {/* Avatar + Avatar Alt Text */}
                            <div className={styles.twoCol}>
                                <AvatarUpload label="Avatar" value={avatar} onChange={setAvatar} />
                                <div className={styles.field}>
                                    <label>Avatar Alt Text</label>
                                    <input className={styles.input} value={avatarAlt} onChange={e => setAvatarAlt(e.target.value)} placeholder="Almaz Abdullayeva şəkli" />
                                </div>
                            </div>

                            <div className={styles.twoCol}>
                                <div className={styles.field}>
                                    <label>Ad Soyad *</label>
                                    <input className={styles.input} value={name} onChange={e => {
                                        setName(e.target.value);
                                        setSlug(generateSlug(e.target.value));
                                    }} placeholder="Almaz Abdullayeva" />
                                </div>
                                <div className={styles.field}>
                                    <label>Slug</label>
                                    <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} placeholder="cavid-axundov" />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Vəzifə</label>
                                <input className={styles.input} value={role} onChange={e => setRole(e.target.value)} placeholder="Baş İcarçı Direktor" />
                            </div>

                            <div className={styles.field}>
                                <label>Bio</label>
                                <textarea className={styles.input} value={bio} onChange={e => setBio(e.target.value)} rows={6} placeholder="Author haqqında qısa məlumat..." style={{ width: "100%", resize: "vertical", minHeight: 120 }} />
                            </div>

                            <div className={styles.twoCol}>
                                <div className={styles.field}>
                                    <label>LinkedIn URL</label>
                                    <input className={styles.input} value={linkedinHref} onChange={e => setLinkedinHref(e.target.value)} placeholder="https://linkedin.com/in/..." />
                                </div>
                                <div className={styles.field}>
                                    <label>LinkedIn İkon <small>(WebP və ya SVG)</small></label>
                                    <SingleImageUpload
                                        value={linkedinIcon}
                                        onChange={setLinkedinIcon}
                                        accept="image/webp,image/svg+xml"
                                    />
                                </div>
                            </div>

                            <div className={styles.twoCol}>
                                <div className={styles.field}>
                                    <label>Skills başlığı</label>
                                    <input className={styles.input} value={skillsTitle} onChange={e => setSkillsTitle(e.target.value)} placeholder="SKILLS" />
                                </div>
                                <div className={styles.field}>
                                    <label>Skills <small>(vergüllə ayırın)</small></label>
                                    <input className={styles.input} value={skills} onChange={e => setSkills(e.target.value)} placeholder="Management, Strategy Development" />
                                </div>
                            </div>

                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Ləğv et</button>
                            <button className={styles.saveBtn} onClick={save} disabled={saving}>{saving ? "Saxlanır..." : "Saxla"}</button>
                        </div>
                    </div>
                </div>
            )}

            {deleteId && (
                <div className={styles.overlay} onClick={() => setDeleteId(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}><h2>Silməyi təsdiq edin</h2>
                            <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button></div>
                        <div className={styles.modalBody}><p>Bu authoru silmək istədiyinizə əminsiniz?</p></div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Ləğv et</button>
                            <button className={styles.deleteConfirmBtn} onClick={handleDelete}>Sil</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



function CategoriesTab() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);
    const [label, setLabel] = useState("");
    const [slug, setSlug] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const load = async () => {
        setLoading(true);
        try { setCategories(await apiFetch("/blog/categories")); } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setEditItem(null); setLabel(""); setSlug(""); setModalOpen(true); };
    const openEdit = (c: any) => { setEditItem(c); setLabel(c.label); setSlug(c.slug); setModalOpen(true); };

    const save = async () => {
        if (!label.trim() || !slug.trim()) return;
        setSaving(true);
        try {
            const body = { label, slug };
            if (editItem) await apiFetch(`/blog/categories/${editItem.id}`, { method: "PUT", body: JSON.stringify(body) });
            else await apiFetch("/blog/categories", { method: "POST", body: JSON.stringify(body) });
            setModalOpen(false); load();
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await apiFetch(`/blog/categories/${deleteId}`, { method: "DELETE" });
        setDeleteId(null); load();
    };

    return (
        <div>
            <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>Kateqoriyalar</h2>
                <button className={styles.addBtn} onClick={openCreate}>+ Yeni Kateqoriya</button>
            </div>
            {loading ? <div className={styles.empty}>Yüklənir...</div>
                : categories.length === 0 ? <div className={styles.empty}>Hələ kateqoriya yoxdur</div>
                    : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead><tr><th>Ad</th><th>Slug</th><th>Əməliyyatlar</th></tr></thead>
                                <tbody>
                                    {categories.map(c => (
                                        <tr key={c.id}>
                                            <td>{c.label}</td>
                                            <td><span className={styles.blogSlug}>/{c.slug}</span></td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button className={styles.editBtn} onClick={() => openEdit(c)}>Düzəlt</button>
                                                    <button className={styles.deleteBtn} onClick={() => setDeleteId(c.id)}>Sil</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

            {modalOpen && (
                <div className={styles.overlay} onClick={() => setModalOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editItem ? "Kateqoriya Düzəlt" : "Yeni Kateqoriya"}</h2>
                            <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.field}><label>Ad *</label>
                                <input className={styles.input} value={label} onChange={e => { setLabel(e.target.value); if (!editItem) setSlug(generateSlug(e.target.value)); }} placeholder="Design" />
                            </div>
                            <div className={styles.field}><label>Slug *</label>
                                <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} placeholder="design" />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Ləğv et</button>
                            <button className={styles.saveBtn} onClick={save} disabled={saving}>{saving ? "Saxlanır..." : "Saxla"}</button>
                        </div>
                    </div>
                </div>
            )}

            {deleteId && (
                <div className={styles.overlay} onClick={() => setDeleteId(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}><h2>Silməyi təsdiq edin</h2>
                            <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button></div>
                        <div className={styles.modalBody}><p>Bu kateqoriyanı silmək istədiyinizə əminsiniz?</p></div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Ləğv et</button>
                            <button className={styles.deleteConfirmBtn} onClick={handleDelete}>Sil</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SettingsTab() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [pageTitle, setPageTitle] = useState("");
    const [buttonText, setButtonText] = useState("");
    const [buttonLink, setButtonLink] = useState("");
    const [buttonNewTab, setButtonNewTab] = useState(false);
    const [quoteText, setQuoteText] = useState("");
    const [quoteImage, setQuoteImage] = useState("");
    const [quoteImageAlt, setQuoteImageAlt] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const load = async () => {
        setLoading(true);
        try {
            const data = await apiFetch("/blog/settings");
            setPageTitle(data.pageTitle ?? "");
            setButtonText(data.buttonText ?? "");
            setButtonLink(data.buttonLink ?? "");
            setButtonNewTab(data.buttonNewTab ?? false);
            setQuoteText(data.quoteText ?? "");
            setQuoteImage(data.quoteImage ?? "");
            setQuoteImageAlt(data.quoteImageAlt ?? "");
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await uploadFile(file);
        setQuoteImage(url);
        if (inputRef.current) inputRef.current.value = "";
    };

    const save = async () => {
        setSaving(true);
        setSaveStatus("idle");
        try {
            await apiFetch("/blog/settings", {
                method: "PUT",
                body: JSON.stringify({
                    pageTitle, buttonText, buttonLink, buttonNewTab,
                    quoteText, quoteImage, quoteImageAlt,
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

    return (
        <div>
            <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>Parametrlər</h2>
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

            <div className={styles.settingsCard}>
                <h3 className={styles.settingsGroupTitle}>Səhifə başlığı və button</h3>
                <div className={styles.twoCol}>
                    <div className={styles.field}>
                        <label>Səhifə başlığı</label>
                        <input className={styles.input} value={pageTitle}
                            onChange={e => setPageTitle(e.target.value)} placeholder="Bloglar" />
                    </div>
                    <div className={styles.field}>
                        <label>Button mətni</label>
                        <input className={styles.input} value={buttonText}
                            onChange={e => setButtonText(e.target.value)} placeholder="Portfolio" />
                    </div>
                </div>
                <div className={styles.twoCol}>
                    <div className={styles.field}>
                        <label>Button linki</label>
                        <input className={styles.input} value={buttonLink}
                            onChange={e => setButtonLink(e.target.value)} placeholder="/portfolio" />
                    </div>
                    <div className={styles.field}>
                        <label>Button açılış rejimi</label>
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            <button
                                type="button"
                                className={!buttonNewTab ? styles.activeToggle : styles.inactiveToggle}
                                onClick={() => setButtonNewTab(false)}
                            >
                                Mövcud tab
                            </button>
                            <button
                                type="button"
                                className={buttonNewTab ? styles.activeToggle : styles.inactiveToggle}
                                onClick={() => setButtonNewTab(true)}
                            >
                                Yeni tab
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.settingsCard}>
                <h3 className={styles.settingsGroupTitle}>Quote bölməsi</h3>
                <div className={styles.field}>
                    <label>Quote mətni</label>
                    <RichEditor value={quoteText} onChange={setQuoteText} />
                </div>
                <div className={styles.field}>
                    <label>Quote şəkli</label>
                    <input ref={inputRef} type="file" accept="image/webp"
                        style={{ display: "none" }} onChange={handleImageSelect} />
                    <div className={styles.singleUploadArea} onClick={() => inputRef.current?.click()}>
                        {quoteImage ? (
                            <div className={styles.singleUploadPreviewWrap}>
                                <img src={toAbsUrl(quoteImage)} alt="" className={styles.singleUploadPreview} />
                                <button type="button" className={styles.imageRemoveBtn}
                                    onClick={e => { e.stopPropagation(); setQuoteImage(""); }}>✕</button>
                            </div>
                        ) : (
                            <div className={styles.imagePlaceholder}>
                                <span></span><span>Quote şəkli seçin</span><small>WebP</small>
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.field}>
                    <label>Quote şəkil alt mətn</label>
                    <input className={styles.input} value={quoteImageAlt}
                        onChange={e => setQuoteImageAlt(e.target.value)} />
                </div>
            </div>
        </div>
    );
}

const PLACEMENT_CONFIG = [
    {
        key: "isFeaturedMain" as const,
        label: "Featured Main",
        desc: "Hero bölməsində sol böyük kart (yalnız 1 ola bilər)",
        exclusive: true,
        max: 1,
    },
    {
        key: "isPickOfWeek" as const,
        label: "Pick of Week",
        desc: "Həftənin seçilmiş blogu (yalnız 1 ola bilər)",
        exclusive: true,
        max: 1,
    },
    {
        key: "isPreview" as const,
        label: "Preview",
        desc: "Blog preview bölməsi",
        exclusive: false,
        max: null,
    },
    {
        key: "isGrid" as const,
        label: "Grid",
        desc: "Blog grid bölməsi",
        exclusive: false,
        max: null,
    },
    {
        key: "isAuthorPreview" as const,
        label: "Author Detail — Featured",
        desc: "Detail səhifəsindəki 'Digər bloqlar' featured kart (yalnız 1 ola bilər)",
        exclusive: true,
        max: 1,
    },
    {
        key: "isAuthorList" as const,
        label: "Author Detail — List",
        desc: "Detail səhifəsindəki 'Digər bloqlar' siyahısı",
        exclusive: false,
        max: null,
    },
    {
        key: "isHomeVisible" as const,
        label: "Home Page",
        desc: "Ana səhifədəki blog bölməsində göstərilir (maksimum 3 ola bilər)",
        exclusive: false,
        max: 3,
    },
];

type PlacementKey = "isFeaturedMain" | "isPickOfWeek" | "isPreview" | "isGrid" | "isAuthorPreview" | "isAuthorList" | "isHomeVisible";

export default function BlogPage() {
    const [activeTab, setActiveTab] = useState<"blogs" | "authors" | "categories" | "settings">("blogs");
    const [blogs, setBlogs] = useState<any[]>([]);
    const [authors, setAuthors] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [reordering, setReordering] = useState(false);

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [badge, setBadge] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [coverImageAlt, setCoverImageAlt] = useState("");
    const [publishedAt, setPublishedAt] = useState("");
    const [authorId, setAuthorId] = useState<number | "">("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [hashtags, setHashtags] = useState("");
    const [placements, setPlacements] = useState<Record<PlacementKey, boolean>>({
        isFeaturedMain: false,
        isPickOfWeek: false,
        isPreview: false,
        isGrid: true,
        isAuthorPreview: false,
        isAuthorList: false,
        isHomeVisible: false,
    });
    const [sections, setSections] = useState<any[]>([]);

    const sensors = useSensors(useSensor(PointerSensor));

    const load = async () => {
        setLoading(true);
        try {
            const [blogsData, authorsData, catsData] = await Promise.all([
                apiFetch("/blog"),
                apiFetch("/blog/authors"),
                apiFetch("/blog/categories"),
            ]);
            setBlogs(blogsData ?? []);
            setAuthors(authorsData ?? []);
            setCategories(catsData ?? []);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const resetForm = () => {
        setTitle(""); setSlug(""); setBadge(""); setExcerpt("");
        setCoverImage(""); setCoverImageAlt(""); setPublishedAt("");
        setAuthorId(""); setCategoryId(""); setHashtags("");
        setPlacements({
            isFeaturedMain: false, isPickOfWeek: false, isPreview: false, isGrid: true, isAuthorPreview: false,
            isAuthorList: false, isHomeVisible: false,
        }); setSections([]);
    };

    const openCreate = () => { setEditItem(null); resetForm(); setDrawerOpen(true); };

    const openEdit = (b: any) => {
        setEditItem(b);
        setTitle(b.title ?? ""); setSlug(b.slug ?? ""); setBadge(b.badge ?? "");
        setExcerpt(b.excerpt ?? ""); setCoverImage(b.coverImage ?? "");
        setCoverImageAlt(b.coverImageAlt ?? "");
        setPublishedAt(b.publishedAt ? b.publishedAt.slice(0, 10) : "");
        setAuthorId(b.authorId ?? ""); setCategoryId(b.categoryId ?? ""); setHashtags((b.hashtags ?? []).join(", "));
        setPlacements({
            isFeaturedMain: b.isFeaturedMain ?? false,
            isPickOfWeek: b.isPickOfWeek ?? false,
            isPreview: b.isPreview ?? false,
            isGrid: b.isGrid ?? true,
            isAuthorPreview: b.isAuthorPreview ?? false,
            isAuthorList: b.isAuthorList ?? false,
            isHomeVisible: b.isHomeVisible ?? false,

        });
        setSections(b.sections ?? []);
        setDrawerOpen(true);
    };

    const closeDrawer = () => { setDrawerOpen(false); setEditItem(null); };

    const handleTitleChange = (val: string) => {
        setTitle(val);
        setSlug(generateSlug(val));
    };


    const handlePlacementToggle = async (key: PlacementKey) => {
        const newVal = !placements[key];
        const config = PLACEMENT_CONFIG.find(c => c.key === key);

        if (newVal && config?.max && config.max > 1) {
            const activeCount = blogs.filter(b => b[key] && b.id !== editItem?.id).length;
            if (activeCount >= config.max) {
                alert(`Maksimum ${config.max} blog aktiv ola bilər. Əvvəlcə birini deaktiv edin.`);
                return;
            }
        }

        setPlacements(prev => ({ ...prev, [key]: newVal }));
        if (key === "isAuthorList" && editItem) {
            try {
                await apiFetch(`/blog/${editItem.id}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        isAuthorList: newVal,
                        authorListPinnedAt: newVal ? new Date().toISOString() : null,
                    }),
                });
            } catch (e) { console.error(e); }
            return;
        }

        if (newVal && config?.max === 1) {
            const oldActive = blogs.find(b => b[key] && b.id !== editItem?.id);
            if (oldActive) {
                try {
                    await apiFetch(`/blog/${oldActive.id}`, {
                        method: "PUT",
                        body: JSON.stringify({ [key]: false }),
                    });
                    setBlogs(prev => prev.map(b => b.id === oldActive.id ? { ...b, [key]: false } : b));
                } catch (e) { console.error(e); }
            }
        }
    };

    const addSection = (type: string) => setSections(prev => [...prev, { type }]);
    const updateSection = (i: number, data: any) => setSections(prev => { const arr = [...prev]; arr[i] = data; return arr; });
    const removeSection = (i: number) => setSections(prev => prev.filter((_, idx) => idx !== i));
    const save = async () => {
        if (!title || !slug) return;
        setSaving(true);
        try {
            const payload = {
                title, slug, badge, excerpt, coverImage,
                coverImageAlt: coverImageAlt || null,
                publishedAt: publishedAt || null,
                authorId: authorId ? Number(authorId) : null,
                categoryId: categoryId ? Number(categoryId) : null,
                hashtags: hashtags.split(/[,\s]+/).map(t => t.trim()).filter(Boolean), ...placements,
                sections,
            };
            if (editItem) await apiFetch(`/blog/${editItem.id}`, { method: "PUT", body: JSON.stringify(payload) });
            else await apiFetch("/blog", { method: "POST", body: JSON.stringify(payload) });
            closeDrawer(); load();
        } finally { setSaving(false); }
    };

    const toggleVisibility = async (b: any) => {
        try {
            await apiFetch(`/blog/${b.id}/visibility`, { method: "PATCH", body: JSON.stringify({ isVisible: !b.isVisible }) });
            load();
        } catch (e) { console.error(e); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await apiFetch(`/blog/${deleteId}`, { method: "DELETE" });
        setDeleteId(null); load();
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oi = blogs.findIndex(b => b.id === active.id);
        const ni = blogs.findIndex(b => b.id === over.id);
        const newList = arrayMove(blogs, oi, ni);
        setBlogs(newList);
        setReordering(true);
        try {
            await apiFetch("/blog/reorder", { method: "PATCH", body: JSON.stringify({ ids: newList.map(b => b.id) }) });
        } finally { setReordering(false); }
    };

    const usedTypes = sections.map(s => s.type);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Blog</h1>
                    <p className={styles.subtitle}>Blog məzmununu idarə edin</p>
                </div>
            </div>

            <div className={styles.tabs}>
                {(["blogs", "authors", "categories", "settings"] as const).map(tab => (
                    <button key={tab}
                        className={activeTab === tab ? styles.tabActive : styles.tabInactive}
                        onClick={() => setActiveTab(tab)}>
                        {tab === "blogs" ? "Bloglar"
                            : tab === "authors" ? "Authorlar"
                                : tab === "categories" ? "Kateqoriyalar"
                                    : "Parametrlər"}
                    </button>
                ))}
            </div>

            {activeTab === "authors" && <AuthorsTab />}
            {activeTab === "categories" && <CategoriesTab />}
            {activeTab === "settings" && <SettingsTab />}
            {activeTab === "blogs" && (
                <>
                    <div className={styles.tabHeader}>
                        <div className={styles.headerRight}>
                            {reordering && <span className={styles.reorderingText}>Saxlanır...</span>}
                            <button className={styles.addBtn} onClick={openCreate}>+ Yeni Blog</button>
                        </div>
                    </div>

                    <div className={styles.tableWrap}>
                        {loading ? <div className={styles.empty}>Yüklənir...</div>
                            : blogs.length === 0 ? <div className={styles.empty}>Hələ blog yoxdur</div>
                                : (
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={blogs.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                            <table className={styles.table}>
                                                <thead><tr><th></th><th>Blog</th><th>Badge</th><th>Placement</th><th>Status</th><th>Əməliyyatlar</th></tr></thead>
                                                <tbody>
                                                    {blogs.map(b => (
                                                        <SortableBlogRow key={b.id} b={b} onEdit={openEdit} onToggle={toggleVisibility} onDelete={setDeleteId} />
                                                    ))}
                                                </tbody>
                                            </table>
                                        </SortableContext>
                                    </DndContext>
                                )}
                    </div>
                </>
            )}

            {/* Full screen drawer */}
            {drawerOpen && (
                <div className={styles.fullDrawer}>
                    <div className={styles.fullDrawerHeader}>
                        <h2>{editItem ? "Blog Düzəlt" : "Yeni Blog"}</h2>
                        <div className={styles.fullDrawerHeaderRight}>
                            <button className={styles.cancelBtn} onClick={closeDrawer}>Ləğv et</button>
                            <button className={styles.saveBtn} onClick={save} disabled={saving}>
                                {saving ? "Saxlanır..." : "Saxla"}
                            </button>
                        </div>
                    </div>

                    <div className={styles.fullDrawerBody}>
                        {/* Əsas məlumatlar */}
                        <div className={styles.fullDrawerSection}>
                            <h3 className={styles.drawerSectionTitle}>Əsas Məlumatlar</h3>
                            <div className={styles.field}><label>Başlıq *</label>
                                <RichEditor value={title} onChange={v => handleTitleChange(v)} />
                            </div>
                            <div className={styles.twoCol}>
                                <div className={styles.field}><label>Slug</label>
                                    <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} />
                                </div>
                                <div className={styles.field}><label>Badge</label>
                                    <input className={styles.input} value={badge} onChange={e => setBadge(e.target.value)} placeholder="Design" />
                                </div>
                            </div>
                            <div className={styles.field}><label>Qısa təsvir (excerpt)</label>
                                <RichEditor value={excerpt} onChange={v => setExcerpt(v)} />
                            </div>
                            <SingleImageUpload label="Cover şəkil" value={coverImage} onChange={setCoverImage} />
                            <div className={styles.field}><label>Cover şəkil alt mətn</label>
                                <input className={styles.input} value={coverImageAlt} onChange={e => setCoverImageAlt(e.target.value)} />
                            </div>
                            <div className={styles.twoCol}>
                                <div className={styles.field}><label>Author</label>
                                    <select className={styles.input} value={authorId} onChange={e => setAuthorId(Number(e.target.value))}>
                                        <option value="">Seçin...</option>
                                        {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div className={styles.field}><label>Kateqoriya</label>
                                    <select className={styles.input} value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
                                        <option value="">Seçin...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.twoCol}>
                                <div className={styles.field}><label>Yayımlanma tarixi</label>
                                    <input type="date" className={styles.input} value={publishedAt} onChange={e => setPublishedAt(e.target.value)} />
                                </div>
                                <div className={styles.field}><label>Hashtaglar <small>(vergüllə)</small></label>
                                    <input className={styles.input} value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="#design, #ai" />
                                </div>
                            </div>
                        </div>

                        {/* Placement */}
                        <div className={styles.fullDrawerSection}>
                            <h3 className={styles.drawerSectionTitle}>Placement</h3>
                            <p className={styles.placementInfo}>Blogun saytda harada görünəcəyini seçin</p>
                            <div className={styles.placementGrid}>
                                {PLACEMENT_CONFIG.map((config) => {
                                    const val = placements[config.key];
                                    const activeCount = config.max !== null
                                        ? blogs.filter(b => b[config.key] && b.id !== editItem?.id).length
                                        : null;
                                    return (
                                        <div key={config.key} className={styles.placementCard}>
                                            <div className={styles.placementCardTop}>
                                                <button
                                                    type="button"
                                                    className={val ? styles.activeToggle : styles.inactiveToggle}
                                                    onClick={() => handlePlacementToggle(config.key)}
                                                >
                                                    {val ? "Aktiv" : "Deaktiv"}
                                                </button>
                                            </div>
                                            <p className={styles.placementDesc}>{config.desc}</p>
                                            {activeCount !== null && (
                                                <p className={styles.placementCount}>
                                                    Hal-hazırda aktiv: <strong>{activeCount}</strong> / {config.max}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.fullDrawerSection}>
                            <h3 className={styles.drawerSectionTitle}>Detail Səhifəsi Sectionları</h3>
                            {sections.map((section, i) => (
                                <SectionEditor key={`section-${i}-${section.type}`} section={section} index={i}
                                    onChange={data => updateSection(i, data)} onRemove={() => removeSection(i)} />
                            ))}
                            <div className={styles.addSectionRow}>
                                {SECTION_TYPES.filter(({ type }) => !usedTypes.includes(type)).map(({ type, label }) => (
                                    <button key={type} type="button" className={styles.addSectionBtn} onClick={() => addSection(type)}>
                                        + {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteId && (
                <div className={styles.overlay} onClick={() => setDeleteId(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}><h2>Silməyi təsdiq edin</h2>
                            <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button></div>
                        <div className={styles.modalBody}><p>Bu blogu silmək istədiyinizə əminsiniz?</p></div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Ləğv et</button>
                            <button className={styles.deleteConfirmBtn} onClick={handleDelete}>Sil</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}