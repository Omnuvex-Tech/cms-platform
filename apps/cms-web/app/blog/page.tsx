// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Underline from "@tiptap/extension-underline";
// import Heading from "@tiptap/extension-heading";
// import TiptapLink from "@tiptap/extension-link";
// import { HardBreak } from "@tiptap/extension-hard-break";
// import {
//     DndContext, closestCenter, PointerSensor,
//     useSensor, useSensors, DragEndEvent,
// } from "@dnd-kit/core";
// import {
//     SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import styles from "@/styles/blog.module.css";

// const API = process.env.NEXT_PUBLIC_API_URL;

// type Lang = "az" | "en" | "ru";
// type LocalizedString = Record<string, string>;

// function getToken() { return document.cookie.split("access_token=")[1]?.split(";")[0] ?? ""; }

// async function apiFetch(path: string, options?: RequestInit) {
//     const res = await fetch(`${API}${path}`, {
//         ...options,
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...options?.headers },
//     });
//     if (!res.ok) {
//         let message = "Xəta baş verdi";
//         try {
//             const err = await res.json();
//             message = err?.message || err?.error || JSON.stringify(err);
//         } catch {
//             message = await res.text().catch(() => `HTTP ${res.status}`);
//         }
//         throw new Error(`[${res.status}] ${path}: ${message}`);
//     }
//     const text = await res.text();
//     return text ? JSON.parse(text) : null;
// }

// async function uploadFile(file: File): Promise<string> {
//     const formData = new FormData();
//     formData.append("file", file);
//     const res = await fetch(`${API}/blog/upload`, {
//         method: "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: formData,
//     });
//     if (!res.ok) throw new Error("Fayl yükləmə uğursuz");
//     return (await res.json()).url;
// }

// function toAbsUrl(path: string) {
//     if (!path) return "";
//     if (path.startsWith("http") || path.startsWith("blob:")) return path;
//     return `${API}${path}`;
// }

// function generateSlug(title: string) {
//     return title.toLowerCase()
//         .replace(/<[^>]*>/g, "")
//         .replace(/ə/g, "e").replace(/ğ/g, "g").replace(/ı/g, "i")
//         .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c")
//         .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").trim();
// }

// function LangTabs({ active, onChange }: { active: Lang; onChange: (l: Lang) => void }) {
//     return (
//         <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
//             {(["az", "en", "ru"] as Lang[]).map((l) => (
//                 <button key={l} type="button" onClick={() => onChange(l)}
//                     style={{
//                         padding: "4px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600,
//                         border: "1.5px solid",
//                         borderColor: active === l ? "#3b82f6" : "#333",
//                         background: active === l ? "#1e3a5f" : "transparent",
//                         color: active === l ? "#fff" : "#888",
//                         cursor: "pointer",
//                     }}>
//                     {l.toUpperCase()}
//                 </button>
//             ))}
//         </div>
//     );
// }

// function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
//     const [showLinkPopup, setShowLinkPopup] = useState(false);
//     const [linkUrl, setLinkUrl] = useState("");
//     const [linkNewTab, setLinkNewTab] = useState(true);

//     const editor = useEditor({
//         extensions: [
//             StarterKit.configure({ hardBreak: false }),
//             Underline,
//             Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
//             TiptapLink.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
//             HardBreak.extend({
//                 addKeyboardShortcuts() {
//                     return { "Shift-Enter": () => this.editor.commands.setHardBreak() };
//                 },
//             }),
//         ],
//         content: value,
//         onUpdate: ({ editor }) => onChange(editor.getHTML()),
//     });

//     useEffect(() => {
//         if (editor && editor.getHTML() !== value) {
//             editor.commands.setContent(value || "");
//         }
//     }, [value]);

//     const openLinkPopup = () => {
//         if (!editor) return;
//         if (editor.state.selection.empty) { alert("Əvvəlcə mətn seçin"); return; }
//         setLinkUrl(editor.getAttributes("link").href ?? "");
//         setLinkNewTab(editor.getAttributes("link").target !== "_self");
//         setShowLinkPopup(true);
//     };

//     const applyLink = () => {
//         if (editor && linkUrl.trim()) {
//             editor.chain().focus().extendMarkRange("link")
//                 .setLink({ href: linkUrl.trim(), target: linkNewTab ? "_blank" : "_self" })
//                 .run();
//         }
//         setShowLinkPopup(false);
//     };

//     const removeLink = () => { editor?.chain().focus().unsetLink().run(); setShowLinkPopup(false); };

//     return (
//         <div className={styles.richEditor}>
//             <div className={styles.richToolbar}>
//                 {[
//                     { label: <b>B</b>, action: () => editor?.chain().focus().toggleBold().run(), key: "bold" },
//                     { label: <i>I</i>, action: () => editor?.chain().focus().toggleItalic().run(), key: "italic" },
//                     { label: <u>U</u>, action: () => editor?.chain().focus().toggleUnderline().run(), key: "underline" },
//                 ].map(({ label, action, key }) => (
//                     <button key={key} type="button"
//                         className={editor?.isActive(key) ? styles.toolbarBtnActive : styles.toolbarBtn}
//                         onClick={action}>{label}</button>
//                 ))}
//                 <div className={styles.toolbarDivider} />
//                 {([1, 2, 3, 4, 5, 6] as const).map(level => (
//                     <button key={level} type="button"
//                         className={editor?.isActive("heading", { level }) ? styles.toolbarBtnActive : styles.toolbarBtn}
//                         onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}>H{level}</button>
//                 ))}
//                 <button type="button"
//                     className={editor?.isActive("paragraph") ? styles.toolbarBtnActive : styles.toolbarBtn}
//                     onClick={() => editor?.chain().focus().setParagraph().run()}>P</button>
//                 <div className={styles.toolbarDivider} />
//                 <button type="button"
//                     className={editor?.isActive("bulletList") ? styles.toolbarBtnActive : styles.toolbarBtn}
//                     onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
//                 <button type="button"
//                     className={editor?.isActive("orderedList") ? styles.toolbarBtnActive : styles.toolbarBtn}
//                     onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
//                 <button type="button"
//                     className={editor?.isActive("blockquote") ? styles.toolbarBtnActive : styles.toolbarBtn}
//                     onClick={() => editor?.chain().focus().toggleBlockquote().run()}
//                     style={{ fontFamily: "Georgia, serif", fontSize: 16 }}>❝❞</button>
//                 <div className={styles.toolbarDivider} />
//                 <button type="button"
//                     className={editor?.isActive("link") ? styles.toolbarBtnActive : styles.toolbarBtn}
//                     onClick={openLinkPopup}>🔗</button>
//             </div>

//             {showLinkPopup && (
//                 <div className={styles.linkPopup}>
//                     <input className={styles.linkInput} type="url" placeholder="https://..."
//                         value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
//                         onKeyDown={e => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setShowLinkPopup(false); }}
//                         autoFocus />
//                     <label className={styles.linkCheckbox}>
//                         <input type="checkbox" checked={linkNewTab} onChange={e => setLinkNewTab(e.target.checked)} />
//                         Yeni tab
//                     </label>
//                     <button type="button" className={styles.linkApplyBtn} onClick={applyLink}>Əlavə et</button>
//                     <button type="button" className={styles.linkRemoveBtn} onClick={removeLink}>Sil</button>
//                     <button type="button" className={styles.linkCancelBtn} onClick={() => setShowLinkPopup(false)}>✕</button>
//                 </div>
//             )}
//             <EditorContent editor={editor} className={styles.richContent} />
//         </div>
//     );
// }

// function LocalizedRichEditor({ value, lang, onChange }: {
//     value: LocalizedString; lang: Lang; onChange: (v: LocalizedString) => void;
// }) {
//     return (
//         <RichEditor
//             value={value?.[lang] || ""}
//             onChange={v => onChange({ ...value, [lang]: v })}
//         />
//     );
// }

// function SingleImageUpload({ value, onChange, label, accept = "image/webp" }: {
//     value: string; onChange: (url: string) => void; label?: string; accept?: string;
// }) {
//     const inputRef = useRef<HTMLInputElement>(null);
//     const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (!file) return;
//         const url = await uploadFile(file);
//         onChange(url);
//         if (inputRef.current) inputRef.current.value = "";
//     };
//     return (
//         <div className={styles.field}>
//             {label && <label>{label}</label>}
//             <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={handleSelect} />
//             <div className={styles.singleUploadArea} onClick={() => inputRef.current?.click()}>
//                 {value ? (
//                     <div className={styles.singleUploadPreviewWrap}>
//                         <img src={toAbsUrl(value)} alt="" className={styles.singleUploadPreview} />
//                         <button type="button" className={styles.imageRemoveBtn}
//                             onClick={e => { e.stopPropagation(); onChange(""); }}>✕</button>
//                     </div>
//                 ) : (
//                     <div className={styles.imagePlaceholder}>
//                         <span>🖼️</span><span>{label ?? "Şəkil seçin"}</span><small>WebP</small>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// function LocalizedImageUpload({ value, lang, onChange, label }: {
//     value: LocalizedString; lang: Lang; onChange: (v: LocalizedString) => void; label?: string;
// }) {
//     return (
//         <SingleImageUpload
//             label={`${label ?? "Şəkil"} (${lang.toUpperCase()})`}
//             value={value?.[lang] || ""}
//             onChange={v => onChange({ ...value, [lang]: v })}
//         />
//     );
// }

// function HeroSectionEditor({ data, onChange, activeLang }: {
//     data: any; onChange: (d: any) => void; activeLang: Lang
// }) {
//     const lv = (field: any) => (typeof field === "object" && field !== null ? field : { az: field ?? "", en: "", ru: "" });
//     const setL = (key: string, val: string) => onChange({ ...data, [key]: { ...lv(data[key]), [activeLang]: val } });

//     return (
//         <div className={styles.sectionFields}>
//             <SingleImageUpload label="Hero şəkil" value={data.heroImage ?? ""} onChange={v => onChange({ ...data, heroImage: v })} />
//             <div className={styles.field}>
//                 <label>Hero şəkil alt mətn ({activeLang.toUpperCase()})</label>
//                 <input className={styles.input} value={lv(data.heroImageAlt)[activeLang] ?? ""} onChange={e => setL("heroImageAlt", e.target.value)} />
//             </div>
//             <div className={styles.field}>
//                 <label>Hashtag ({activeLang.toUpperCase()})</label>
//                 <input className={styles.input} value={lv(data.hashtag)[activeLang] ?? ""} placeholder="Design" onChange={e => setL("hashtag", e.target.value)} />
//             </div>
//             <div className={styles.field}>
//                 <label>Başlıq ({activeLang.toUpperCase()})</label>
//                 <RichEditor value={lv(data.title)[activeLang] ?? ""} onChange={v => setL("title", v)} />
//             </div>
//             {(data.paragraphs ?? [""]).map((p: any, i: number) => {
//                 const pVal = typeof p === "object" && p !== null ? p : { az: p ?? "", en: "", ru: "" };
//                 return (
//                     <div key={i} className={styles.field}>
//                         <label>Paraqraf {i + 1} ({activeLang.toUpperCase()})</label>
//                         <RichEditor value={pVal[activeLang] ?? ""} onChange={v => {
//                             const arr = [...(data.paragraphs ?? [])];
//                             arr[i] = { ...pVal, [activeLang]: v };
//                             onChange({ ...data, paragraphs: arr });
//                         }} />
//                     </div>
//                 );
//             })}
//             <button type="button" className={styles.addRowBtn}
//                 onClick={() => onChange({ ...data, paragraphs: [...(data.paragraphs ?? []), { az: "", en: "", ru: "" }] })}>
//                 + Paraqraf əlavə et
//             </button>
//         </div>
//     );
// }

// function ContentSectionEditor({ data, onChange, activeLang }: {
//     data: any; onChange: (d: any) => void; activeLang: Lang
// }) {
//     const lv = (field: any) => (typeof field === "object" && field !== null && !Array.isArray(field) ? field : { az: field ?? "", en: "", ru: "" });
//     const setL = (key: string, val: string) => onChange({ ...data, [key]: { ...lv(data[key]), [activeLang]: val } });
//     const sections = data.sections ?? [];
//     const addSection = () => onChange({ ...data, sections: [...sections, { title: { az: "", en: "", ru: "" }, paragraphs: [{ az: "", en: "", ru: "" }] }] });
//     const removeSection = (i: number) => onChange({ ...data, sections: sections.filter((_: any, idx: number) => idx !== i) });
//     const updateSection = (i: number, key: string, val: any) => {
//         const arr = [...sections]; arr[i] = { ...arr[i], [key]: val };
//         onChange({ ...data, sections: arr });
//     };

//     return (
//         <div className={styles.sectionFields}>
//             <SingleImageUpload label="Hero şəkil" value={data.heroImage ?? ""} onChange={v => onChange({ ...data, heroImage: v })} />
//             <div className={styles.field}>
//                 <label>Hero şəkil alt mətn ({activeLang.toUpperCase()})</label>
//                 <input className={styles.input} value={lv(data.heroImageAlt)[activeLang] ?? ""} onChange={e => setL("heroImageAlt", e.target.value)} />
//             </div>
//             <div className={styles.field}>
//                 <label>Overlap başlıq ({activeLang.toUpperCase()})</label>
//                 <RichEditor value={lv(data.overlapTitle)[activeLang] ?? ""} onChange={v => setL("overlapTitle", v)} />
//             </div>
//             {(data.introParagraphs ?? [{ az: "", en: "", ru: "" }]).map((p: any, i: number) => {
//                 const pVal = typeof p === "object" && p !== null && !Array.isArray(p) ? p : { az: p ?? "", en: "", ru: "" };
//                 return (
//                     <div key={i} className={styles.field}>
//                         <label>Paraqraf {i + 1} ({activeLang.toUpperCase()})</label>
//                         <RichEditor value={pVal[activeLang] ?? ""} onChange={v => {
//                             const arr = [...(data.introParagraphs ?? [])]; arr[i] = { ...pVal, [activeLang]: v };
//                             onChange({ ...data, introParagraphs: arr });
//                         }} />
//                     </div>
//                 );
//             })}
//             <button type="button" className={styles.addRowBtn}
//                 onClick={() => onChange({ ...data, introParagraphs: [...(data.introParagraphs ?? []), { az: "", en: "", ru: "" }] })}>
//                 + Paraqraf əlavə et
//             </button>
//             <div className={styles.sectionDivider} />
//             <label className={styles.sectionGroupLabel}>Alt bölmələr</label>
//             {sections.map((sec: any, i: number) => {
//                 const secTitle = typeof sec.title === "object" && sec.title !== null ? sec.title : { az: sec.title ?? "", en: "", ru: "" };
//                 return (
//                     <div key={i} className={styles.contentItemBlock}>
//                         <div className={styles.contentItemHeader}>
//                             <span className={styles.contentItemLabel}>Bölmə #{i + 1}</span>
//                             <button type="button" className={styles.removeBtn} onClick={() => removeSection(i)}>✕</button>
//                         </div>
//                         <div className={styles.field}>
//                             <label>Başlıq ({activeLang.toUpperCase()})</label>
//                             <RichEditor value={secTitle[activeLang] ?? ""} onChange={v => updateSection(i, "title", { ...secTitle, [activeLang]: v })} />
//                         </div>
//                         {(sec.paragraphs ?? [{ az: "", en: "", ru: "" }]).map((p: any, j: number) => {
//                             const pVal = typeof p === "object" && p !== null && !Array.isArray(p) ? p : { az: p ?? "", en: "", ru: "" };
//                             return (
//                                 <div key={j} className={styles.field}>
//                                     <label>Paraqraf {j + 1} ({activeLang.toUpperCase()})</label>
//                                     <RichEditor value={pVal[activeLang] ?? ""} onChange={v => {
//                                         const arr = [...(sec.paragraphs ?? [])]; arr[j] = { ...pVal, [activeLang]: v };
//                                         updateSection(i, "paragraphs", arr);
//                                     }} />
//                                 </div>
//                             );
//                         })}
//                         <button type="button" className={styles.addRowBtn}
//                             onClick={() => updateSection(i, "paragraphs", [...(sec.paragraphs ?? []), { az: "", en: "", ru: "" }])}>
//                             + Paraqraf əlavə et
//                         </button>
//                     </div>
//                 );
//             })}
//             <button type="button" className={styles.addRowBtn} onClick={addSection}>+ Bölmə əlavə et</button>
//             <div className={styles.sectionDivider} />
//             <label className={styles.sectionGroupLabel}>Alt şəkillər</label>
//             <div className={styles.twoCol}>
//                 <div>
//                     <SingleImageUpload label="Sol şəkil" value={data.bottomImages?.left ?? ""} onChange={v => onChange({ ...data, bottomImages: { ...data.bottomImages, left: v } })} />
//                     <div className={styles.field}>
//                         <label>Sol şəkil alt mətn ({activeLang.toUpperCase()})</label>
//                         <input className={styles.input} value={lv(data.bottomImages?.leftAlt)[activeLang] ?? ""}
//                             onChange={e => onChange({ ...data, bottomImages: { ...data.bottomImages, leftAlt: { ...lv(data.bottomImages?.leftAlt), [activeLang]: e.target.value } } })} />
//                     </div>
//                 </div>
//                 <div>
//                     <SingleImageUpload label="Sağ şəkil" value={data.bottomImages?.right ?? ""} onChange={v => onChange({ ...data, bottomImages: { ...data.bottomImages, right: v } })} />
//                     <div className={styles.field}>
//                         <label>Sağ şəkil alt mətn ({activeLang.toUpperCase()})</label>
//                         <input className={styles.input} value={lv(data.bottomImages?.rightAlt)[activeLang] ?? ""}
//                             onChange={e => onChange({ ...data, bottomImages: { ...data.bottomImages, rightAlt: { ...lv(data.bottomImages?.rightAlt), [activeLang]: e.target.value } } })} />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// function ArticleSectionEditor({ data, onChange, activeLang }: {
//     data: any; onChange: (d: any) => void; activeLang: Lang
// }) {
//     const lv = (field: any) => (typeof field === "object" && field !== null && !Array.isArray(field) ? field : { az: field ?? "", en: "", ru: "" });
//     const sections = data.sections ?? [];

//     const normalizeSection = (sec: any) => {
//         if (sec.blocks) return sec;
//         const blocks: any[] = [];
//         if (sec.heading) blocks.push({ type: "heading", content: { az: sec.heading, en: "", ru: "" } });
//         for (const p of sec.paragraphs ?? [""])
//             blocks.push({ type: "paragraph", content: typeof p === "object" ? p : { az: p ?? "", en: "", ru: "" } });
//         return { ...sec, blocks: blocks.length > 0 ? blocks : [{ type: "paragraph", content: { az: "", en: "", ru: "" } }], heading: undefined, paragraphs: undefined };
//     };

//     const addSection = () => onChange({
//         ...data,
//         sections: [...sections, { blocks: [{ type: "paragraph", content: { az: "", en: "", ru: "" } }], hashSections: [], hashHeading: { az: "", en: "", ru: "" }, sideImage: "", sideImageAlt: { az: "", en: "", ru: "" } }],
//     });

//     const removeSection = (i: number) => onChange({ ...data, sections: sections.filter((_: any, idx: number) => idx !== i) });

//     const updateSection = (i: number, key: string, val: any) => {
//         const arr = sections.map((s: any, idx: number) => idx === i ? { ...normalizeSection(s), [key]: val } : s);
//         onChange({ ...data, sections: arr });
//     };

//     return (
//         <div className={styles.sectionFields}>
//             {sections.map((secRaw: any, i: number) => {
//                 const sec = normalizeSection(secRaw);
//                 const blocks: any[] = sec.blocks ?? [{ type: "paragraph", content: { az: "", en: "", ru: "" } }];
//                 const hashHeading = lv(sec.hashHeading);
//                 const sideImageAlt = lv(sec.sideImageAlt);

//                 const updateBlock = (j: number, key: string, val: any) => updateSection(i, "blocks", blocks.map((b: any, idx: number) => idx === j ? { ...b, [key]: val } : b));
//                 const removeBlock = (j: number) => updateSection(i, "blocks", blocks.filter((_: any, idx: number) => idx !== j));

//                 return (
//                     <div key={i} className={styles.contentItemBlock}>
//                         <div className={styles.contentItemHeader}>
//                             <span className={styles.contentItemLabel}>Bölmə #{i + 1}</span>
//                             <button type="button" className={styles.removeBtn} onClick={() => removeSection(i)}>✕</button>
//                         </div>
//                         {blocks.map((block: any, j: number) => {
//                             const contentVal = lv(block.content);
//                             return (
//                                 <div key={j} className={styles.field} style={{ position: "relative" }}>
//                                     <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                                         <label>{block.type === "heading" ? "Başlıq" : "Paraqraf"} ({activeLang.toUpperCase()})</label>
//                                         {blocks.length > 1 && (
//                                             <button type="button" className={styles.removeBtn} style={{ fontSize: 11 }} onClick={() => removeBlock(j)}>✕</button>
//                                         )}
//                                     </div>
//                                     <RichEditor value={contentVal[activeLang] ?? ""} onChange={v => updateBlock(j, "content", { ...contentVal, [activeLang]: v })} />
//                                 </div>
//                             );
//                         })}
//                         <button type="button" className={styles.addRowBtn}
//                             onClick={() => updateSection(i, "blocks", [...blocks, { type: "paragraph", content: { az: "", en: "", ru: "" } }])}>
//                             + Paraqraf əlavə et
//                         </button>
//                         <button type="button" className={styles.addRowBtn} style={{ marginLeft: 8 }}
//                             onClick={() => updateSection(i, "blocks", [...blocks, { type: "heading", content: { az: "", en: "", ru: "" } }, { type: "paragraph", content: { az: "", en: "", ru: "" } }])}>
//                             + Başlıq və Paraqraf əlavə et
//                         </button>
//                         <div className={styles.sectionDivider} />
//                         <label className={styles.sectionGroupLabel}>Hash bölmələri</label>
//                         <div className={styles.field}>
//                             <label>Hash bölmə başlığı ({activeLang.toUpperCase()})</label>
//                             <RichEditor value={hashHeading[activeLang] ?? ""} onChange={v => updateSection(i, "hashHeading", { ...hashHeading, [activeLang]: v })} />
//                         </div>
//                         {(sec.hashSections ?? []).map((hs: any, k: number) => {
//                             const tagVal = lv(hs.tag);
//                             return (
//                                 <div key={k} className={styles.hashBlock}>
//                                     <div className={styles.field}>
//                                         <label>Tag ({activeLang.toUpperCase()})</label>
//                                         <input className={styles.input} value={tagVal[activeLang] ?? ""} placeholder="Dizayn kateqoriyası"
//                                             onChange={e => {
//                                                 const arr = [...(sec.hashSections ?? [])];
//                                                 arr[k] = { ...arr[k], tag: { ...tagVal, [activeLang]: e.target.value } };
//                                                 updateSection(i, "hashSections", arr);
//                                             }} />
//                                     </div>
//                                     {(hs.paragraphs ?? [{ az: "", en: "", ru: "" }]).map((p: any, m: number) => {
//                                         const pVal = lv(p);
//                                         return (
//                                             <div key={m} className={styles.field}>
//                                                 <label>Paraqraf {m + 1} ({activeLang.toUpperCase()})</label>
//                                                 <RichEditor value={pVal[activeLang] ?? ""} onChange={v => {
//                                                     const hsArr = [...(sec.hashSections ?? [])];
//                                                     const pArr = [...(hs.paragraphs ?? [])]; pArr[m] = { ...pVal, [activeLang]: v };
//                                                     hsArr[k] = { ...hsArr[k], paragraphs: pArr };
//                                                     updateSection(i, "hashSections", hsArr);
//                                                 }} />
//                                             </div>
//                                         );
//                                     })}
//                                     <button type="button" className={styles.addRowBtn} onClick={() => {
//                                         const hsArr = [...(sec.hashSections ?? [])];
//                                         hsArr[k] = { ...hsArr[k], paragraphs: [...(hs.paragraphs ?? []), { az: "", en: "", ru: "" }] };
//                                         updateSection(i, "hashSections", hsArr);
//                                     }}>+ Paraqraf əlavə et</button>
//                                     <button type="button" className={styles.removeBtn} style={{ marginTop: 8 }}
//                                         onClick={() => updateSection(i, "hashSections", sec.hashSections.filter((_: any, idx: number) => idx !== k))}>
//                                         Hash bölməni sil
//                                     </button>
//                                 </div>
//                             );
//                         })}
//                         <button type="button" className={styles.addRowBtn}
//                             onClick={() => updateSection(i, "hashSections", [...(sec.hashSections ?? []), { tag: { az: "", en: "", ru: "" }, paragraphs: [{ az: "", en: "", ru: "" }] }])}>
//                             + Hash bölmə əlavə et
//                         </button>
//                         <div className={styles.sectionDivider} />
//                         <SingleImageUpload label="Yan şəkil (optional)" value={sec.sideImage ?? ""} onChange={v => updateSection(i, "sideImage", v)} />
//                         <div className={styles.field}>
//                             <label>Yan şəkil alt mətn ({activeLang.toUpperCase()})</label>
//                             <input className={styles.input} value={sideImageAlt[activeLang] ?? ""}
//                                 onChange={e => updateSection(i, "sideImageAlt", { ...sideImageAlt, [activeLang]: e.target.value })} />
//                         </div>
//                     </div>
//                 );
//             })}
//             <button type="button" className={styles.addRowBtn} onClick={addSection}>+ Bölmə əlavə et</button>
//             <div className={styles.sectionDivider} />
//             <label className={styles.sectionGroupLabel}>Hashtaglar</label>
//             <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
//                 {(Array.isArray(data.hashtags) ? data.hashtags : []).map((tag: any, i: number) => {
//                     const tagObj = typeof tag === "string" ? { az: tag, en: tag, ru: tag } : tag;
//                     return (
//                         <div key={i} className={styles.contentItemBlock} style={{ padding: "10px 14px" }}>
//                             <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//                                 {(["az", "en", "ru"] as const).map(lang => (
//                                     <div key={lang} style={{ flex: 1 }}>
//                                         <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>
//                                             {lang.toUpperCase()}
//                                         </label>
//                                         <input
//                                             className={styles.input}
//                                             value={tagObj[lang] || ""}
//                                             placeholder={`#tag (${lang})`}
//                                             onChange={e => {
//                                                 const arr = [...(data.hashtags ?? [])];
//                                                 arr[i] = { ...tagObj, [lang]: e.target.value };
//                                                 onChange({ ...data, hashtags: arr });
//                                             }}
//                                         />
//                                     </div>
//                                 ))}
//                                 <button type="button"
//                                     onClick={() => onChange({ ...data, hashtags: (data.hashtags ?? []).filter((_: any, idx: number) => idx !== i) })}
//                                     style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18, flexShrink: 0, marginTop: 16 }}>✕</button>
//                             </div>
//                         </div>
//                     );
//                 })}
//                 <button type="button" className={styles.addRowBtn}
//                     onClick={() => onChange({ ...data, hashtags: [...(Array.isArray(data.hashtags) ? data.hashtags : []), { az: "", en: "", ru: "" }] })}>
//                     + Hashtag əlavə et
//                 </button>
//             </div>
//         </div>
//     );
// }

// const SECTION_TYPES = [
//     { type: "hero", label: "Hero" },
//     { type: "content", label: "Content" },
//     { type: "article", label: "Article" },
// ];

// function SectionEditor({ section, index, onChange, onRemove, activeLang }: {
//     section: any; index: number; onChange: (d: any) => void; onRemove: () => void; activeLang: Lang;
// }) {
//     const [open, setOpen] = useState(true);
//     const renderEditor = () => {
//         switch (section.type) {
//             case "hero": return <HeroSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
//             case "content": return <ContentSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
//             case "article": return <ArticleSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
//             default: return null;
//         }
//     };
//     return (
//         <div className={styles.sectionBlock} style={{ opacity: section.isVisible === false ? 0.5 : 1 }}>
//             <div className={styles.sectionBlockHeader}>
//                 <div className={styles.sectionBlockLeft}>
//                     <span className={styles.sectionTypeTag}>{section.type.toUpperCase()}</span>
//                     <span className={styles.sectionIndex}>#{index + 1}</span>
//                 </div>
//                 <div className={styles.sectionBlockRight}>
//                     <button type="button"
//                         className={section.isVisible === false ? styles.inactiveToggle : styles.activeToggle}
//                         onClick={() => onChange({ ...section, isVisible: section.isVisible === false ? true : false })}>
//                         {section.isVisible === false ? "Gizli" : "Görünür"}
//                     </button>
//                     <button type="button" className={styles.toggleBtn} onClick={() => setOpen(o => !o)}>{open ? "Bağla" : "Aç"}</button>
//                     <button type="button" className={styles.removeBtn} onClick={onRemove}>Sil</button>
//                 </div>
//             </div>
//             {open && renderEditor()}
//         </div>
//     );
// }

// function SortableBlogRow({ b, onEdit, onToggle, onDelete }: {
//     b: any; onEdit: (b: any) => void; onToggle: (b: any) => void; onDelete: (id: number) => void;
// }) {
//     const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: b.id });
//     const titleAz = typeof b.title === "object" ? (b.title?.az || "") : (b.title || "");
//     const badgeAz = typeof b.badge === "object" ? (b.badge?.az || "") : (b.badge || "");

//     return (
//         <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
//             <td className={styles.num}><span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span></td>
//             <td>
//                 <div className={styles.blogInfo}>
//                     {b.coverImage && (() => {
//                         const src = typeof b.coverImage === "object" ? (b.coverImage?.az || "") : b.coverImage;
//                         return src ? <img src={toAbsUrl(src)} alt="" className={styles.coverThumb} /> : null;
//                     })()}
//                     <div>
//                         <div className={styles.blogTitle} dangerouslySetInnerHTML={{ __html: titleAz.replace(/<[^>]*>/g, "").trim() }} />
//                         <div className={styles.blogSlug}>/{b.slug}</div>
//                     </div>
//                 </div>
//             </td>
//             <td><span className={styles.badgeTag}>{badgeAz}</span></td>
//             <td>
//                 <div className={styles.placementFlags}>
//                     {b.isFeaturedMain && <span className={styles.flag}>Main</span>}
//                     {b.isFeaturedSide && <span className={styles.flag}>Side</span>}
//                     {b.isPickOfWeek && <span className={styles.flag}>Pick</span>}
//                     {b.isPreview && <span className={styles.flag}>Preview</span>}
//                     {b.isGrid && <span className={styles.flag}>Grid</span>}
//                     {b.isAuthorPreview && <span className={styles.flag}>A.Preview</span>}
//                     {b.isAuthorList && <span className={styles.flag}>A.List</span>}
//                     {b.isHomeVisible && <span className={styles.flag}>Home</span>}
//                 </div>
//             </td>
//             <td>
//                 <span className={`${styles.statusBadge} ${b.isVisible ? styles.badgeVisible : styles.badgeHidden}`}>
//                     {b.isVisible ? "Görünür" : "Gizli"}
//                 </span>
//             </td>
//             <td>
//                 <div className={styles.actions}>
//                     <button className={styles.editBtn} onClick={() => onEdit(b)}>Düzəlt</button>
//                     <button className={`${styles.visBtn} ${b.isVisible ? styles.visBtnHide : styles.visBtnShow}`} onClick={() => onToggle(b)}>
//                         {b.isVisible ? "Gizlət" : "Göstər"}
//                     </button>
//                     <button className={styles.deleteBtn} onClick={() => onDelete(b.id)}>Sil</button>
//                 </div>
//             </td>
//         </tr>
//     );
// }

// function CategoriesTab() {
//     const [categories, setCategories] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [modalOpen, setModalOpen] = useState(false);
//     const [editItem, setEditItem] = useState<any | null>(null);
//     const [activeLang, setActiveLang] = useState<Lang>("az");
//     const [label, setLabel] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [slug, setSlug] = useState("");
//     const [saving, setSaving] = useState(false);
//     const [deleteId, setDeleteId] = useState<number | null>(null);

//     const load = async () => {
//         setLoading(true);
//         try { setCategories(await apiFetch("/blog/categories")); } finally { setLoading(false); }
//     };

//     useEffect(() => { load(); }, []);

//     const openCreate = () => { setEditItem(null); setActiveLang("az"); setLabel({ az: "", en: "", ru: "" }); setSlug(""); setModalOpen(true); };

//     const openEdit = (c: any) => {
//         setEditItem(c); setActiveLang("az");
//         setLabel(typeof c.label === "object" ? c.label : { az: c.label ?? "", en: "", ru: "" });
//         setSlug(c.slug); setModalOpen(true);
//     };

//     const save = async () => {
//         if (!label.az?.trim() || !slug.trim()) return;
//         setSaving(true);
//         try {
//             const body = { label, slug };
//             if (editItem) await apiFetch(`/blog/categories/${editItem.id}`, { method: "PUT", body: JSON.stringify(body) });
//             else await apiFetch("/blog/categories", { method: "POST", body: JSON.stringify(body) });
//             setModalOpen(false); load();
//         } finally { setSaving(false); }
//     };

//     const handleDelete = async () => {
//         if (!deleteId) return;
//         await apiFetch(`/blog/categories/${deleteId}`, { method: "DELETE" });
//         setDeleteId(null); load();
//     };

//     const labelAz = (c: any) => typeof c.label === "object" ? (c.label?.az || "") : (c.label || "");

//     return (
//         <div>
//             <div className={styles.tabHeader}>
//                 <h2 className={styles.tabTitle}>Kateqoriyalar</h2>
//                 <button className={styles.addBtn} onClick={openCreate}>+ Yeni Kateqoriya</button>
//             </div>
//             {loading ? <div className={styles.empty}>Yüklənir...</div>
//                 : categories.length === 0 ? <div className={styles.empty}>Hələ kateqoriya yoxdur</div>
//                     : (
//                         <div className={styles.tableWrap}>
//                             <table className={styles.table}>
//                                 <thead><tr><th>Ad (AZ)</th><th>Slug</th><th>Əməliyyatlar</th></tr></thead>
//                                 <tbody>
//                                     {categories.map(c => (
//                                         <tr key={c.id}>
//                                             <td>{labelAz(c)}</td>
//                                             <td><span className={styles.blogSlug}>/{c.slug}</span></td>
//                                             <td>
//                                                 <div className={styles.actions}>
//                                                     <button className={styles.editBtn} onClick={() => openEdit(c)}>Düzəlt</button>
//                                                     <button className={styles.deleteBtn} onClick={() => setDeleteId(c.id)}>Sil</button>
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
//                     <div className={styles.modal} onClick={e => e.stopPropagation()}>
//                         <div className={styles.modalHeader}>
//                             <h2>{editItem ? "Kateqoriya Düzəlt" : "Yeni Kateqoriya"}</h2>
//                             <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
//                         </div>
//                         <div className={styles.modalBody}>
//                             <LangTabs active={activeLang} onChange={setActiveLang} />
//                             <div className={styles.field}>
//                                 <label>Ad * ({activeLang.toUpperCase()})</label>
//                                 <input className={styles.input} value={label[activeLang] || ""}
//                                     onChange={e => {
//                                         const val = e.target.value;
//                                         setLabel(prev => ({ ...prev, [activeLang]: val }));
//                                         if (activeLang === "az" && !editItem) setSlug(generateSlug(val));
//                                     }} placeholder="Design" />
//                             </div>
//                             <div className={styles.field}>
//                                 <label>Slug *</label>
//                                 <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} placeholder="design" />
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
//                         <div className={styles.modalBody}><p>Bu kateqoriyanı silmək istədiyinizə əminsiniz?</p></div>
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

// function SettingsTab() {
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
//     const [activeLang, setActiveLang] = useState<Lang>("az");
//     const [pageTitle, setPageTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [buttonText, setButtonText] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [buttonLink, setButtonLink] = useState("");
//     const [buttonNewTab, setButtonNewTab] = useState(false);
//     const [quoteText, setQuoteText] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [quoteImage, setQuoteImage] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [quoteImageAlt, setQuoteImageAlt] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [searchPlaceholder, setSearchPlaceholder] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [categoriesLabel, setCategoriesLabel] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [pickOfWeekLabel, setPickOfWeekLabel] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [moreBlogsButtonText, setMoreBlogsButtonText] = useState<LocalizedString>({ az: "", en: "", ru: "" });

//     const load = async () => {
//         setLoading(true);
//         try {
//             const data = await apiFetch("/blog/settings");
//             setPageTitle(typeof data.pageTitle === "object" ? data.pageTitle : { az: data.pageTitle ?? "", en: "", ru: "" });
//             setButtonText(typeof data.buttonText === "object" ? data.buttonText : { az: data.buttonText ?? "", en: "", ru: "" });
//             setButtonLink(data.buttonLink ?? "");
//             setButtonNewTab(data.buttonNewTab ?? false);
//             setQuoteText(typeof data.quoteText === "object" ? data.quoteText : { az: data.quoteText ?? "", en: "", ru: "" });
//             setQuoteImage(typeof data.quoteImage === "object" ? data.quoteImage : { az: data.quoteImage ?? "", en: "", ru: "" });
//             setQuoteImageAlt(typeof data.quoteImageAlt === "object" ? data.quoteImageAlt : { az: data.quoteImageAlt ?? "", en: "", ru: "" });
//             setSearchPlaceholder(
//                 typeof data.searchPlaceholder === "object"
//                     ? data.searchPlaceholder
//                     : { az: data.searchPlaceholder ?? "", en: "", ru: "" }
//             );

//             setCategoriesLabel(
//                 typeof data.categoriesLabel === "object"
//                     ? data.categoriesLabel
//                     : { az: data.categoriesLabel ?? "", en: "", ru: "" }
//             );

//             setPickOfWeekLabel(
//                 typeof data.pickOfWeekLabel === "object"
//                     ? data.pickOfWeekLabel
//                     : { az: data.pickOfWeekLabel ?? "", en: "", ru: "" }
//             );

//             setMoreBlogsButtonText(
//                 typeof data.moreBlogsButtonText === "object"
//                     ? data.moreBlogsButtonText
//                     : { az: data.moreBlogsButtonText ?? "", en: "", ru: "" }
//             );
//         } finally { setLoading(false); }
//     };

//     useEffect(() => { load(); }, []);

//     const save = async () => {
//         setSaving(true); setSaveStatus("idle");
//         try {
//             await apiFetch("/blog/settings", {
//                 method: "PUT",
//                 body: JSON.stringify({
//                     pageTitle,
//                     buttonText,
//                     buttonLink,
//                     buttonNewTab,
//                     quoteText,
//                     quoteImage,
//                     quoteImageAlt,
//                     searchPlaceholder,
//                     categoriesLabel,
//                     pickOfWeekLabel,
//                     moreBlogsButtonText,
//                 })
//             });
//             setSaveStatus("success");
//         } catch { setSaveStatus("error"); }
//         finally { setSaving(false); setTimeout(() => setSaveStatus("idle"), 3000); }
//     };

//     if (loading) return <div className={styles.empty}>Yüklənir...</div>;

//     return (
//         <div>
//             <div className={styles.tabHeader}>
//                 <h2 className={styles.tabTitle}>Parametrlər</h2>
//                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                     {saveStatus === "success" && <span style={{ color: "#16a34a", fontSize: 14, fontWeight: 600 }}>✓ Saxlanıldı</span>}
//                     {saveStatus === "error" && <span style={{ color: "#dc2626", fontSize: 14, fontWeight: 600 }}>✕ Xəta baş verdi</span>}
//                     <button className={styles.saveBtn} onClick={save} disabled={saving}>{saving ? "Saxlanır..." : "Saxla"}</button>
//                 </div>
//             </div>
//             <LangTabs active={activeLang} onChange={setActiveLang} />
//             <div className={styles.settingsCard}>
//                 <h3 className={styles.settingsGroupTitle}>Səhifə başlığı və button</h3>
//                 <div className={styles.twoCol}>
//                     <div className={styles.field}>
//                         <label>Səhifə başlığı ({activeLang.toUpperCase()})</label>
//                         <input className={styles.input} value={pageTitle[activeLang] || ""}
//                             onChange={e => setPageTitle(prev => ({ ...prev, [activeLang]: e.target.value }))} placeholder="Bloglar" />
//                     </div>
//                     <div className={styles.field}>
//                         <label>Button mətni ({activeLang.toUpperCase()})</label>
//                         <input className={styles.input} value={buttonText[activeLang] || ""}
//                             onChange={e => setButtonText(prev => ({ ...prev, [activeLang]: e.target.value }))} placeholder="Portfolio" />
//                     </div>
//                 </div>
//                 <div className={styles.twoCol}>
//                     <div className={styles.field}>
//                         <label>Button linki</label>
//                         <input className={styles.input} value={buttonLink} onChange={e => setButtonLink(e.target.value)} placeholder="/portfolio" />
//                     </div>
//                     <div className={styles.field}>
//                         <label>Button açılış rejimi</label>
//                         <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
//                             <button type="button" className={!buttonNewTab ? styles.activeToggle : styles.inactiveToggle} onClick={() => setButtonNewTab(false)}>Mövcud tab</button>
//                             <button type="button" className={buttonNewTab ? styles.activeToggle : styles.inactiveToggle} onClick={() => setButtonNewTab(true)}>Yeni tab</button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className={styles.settingsCard}>
//                 <h3 className={styles.settingsGroupTitle}>Quote bölməsi</h3>
//                 <div className={styles.field}>
//                     <label>Quote mətni ({activeLang.toUpperCase()})</label>
//                     <LocalizedRichEditor value={quoteText} lang={activeLang} onChange={setQuoteText} />
//                 </div>
//                 <LocalizedImageUpload value={quoteImage} lang={activeLang} onChange={setQuoteImage} label="Quote şəkli" />
//                 <div className={styles.field}>
//                     <label>Quote şəkil alt mətn ({activeLang.toUpperCase()})</label>
//                     <input className={styles.input} value={quoteImageAlt[activeLang] || ""}
//                         onChange={e => setQuoteImageAlt(prev => ({ ...prev, [activeLang]: e.target.value }))} />
//                 </div>
//             </div>

//             <div className={styles.settingsCard}>
//                 <h3 className={styles.settingsGroupTitle}>Search mətnləri</h3>

//                 <div className={styles.field}>
//                     <label>Search placeholder ({activeLang.toUpperCase()})</label>
//                     <input
//                         className={styles.input}
//                         value={searchPlaceholder[activeLang] || ""}
//                         onChange={(e) =>
//                             setSearchPlaceholder((prev) => ({
//                                 ...prev,
//                                 [activeLang]: e.target.value,
//                             }))
//                         }
//                     />
//                 </div>

//                 <div className={styles.field}>
//                     <label>Categories label ({activeLang.toUpperCase()})</label>
//                     <input
//                         className={styles.input}
//                         value={categoriesLabel[activeLang] || ""}
//                         onChange={(e) =>
//                             setCategoriesLabel((prev) => ({
//                                 ...prev,
//                                 [activeLang]: e.target.value,
//                             }))
//                         }
//                     />
//                 </div>

//                 <div className={styles.field}>
//                     <label>Pick of week label ({activeLang.toUpperCase()})</label>
//                     <input
//                         className={styles.input}
//                         value={pickOfWeekLabel[activeLang] || ""}
//                         onChange={(e) =>
//                             setPickOfWeekLabel((prev) => ({
//                                 ...prev,
//                                 [activeLang]: e.target.value,
//                             }))
//                         }
//                     />
//                 </div>

//                 <div className={styles.field}>
//                     <label>More blogs button ({activeLang.toUpperCase()})</label>
//                     <input
//                         className={styles.input}
//                         value={moreBlogsButtonText[activeLang] || ""}
//                         onChange={(e) =>
//                             setMoreBlogsButtonText((prev) => ({
//                                 ...prev,
//                                 [activeLang]: e.target.value,
//                             }))
//                         }
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// }

// const PLACEMENT_CONFIG = [
//     { key: "isFeaturedMain" as const, label: "Featured Main", desc: "Hero bölməsində sol böyük kart (yalnız 1 ola bilər)", exclusive: true, max: 1 },
//     { key: "isPickOfWeek" as const, label: "Pick of Week", desc: "Həftənin seçilmiş blogu (yalnız 1 ola bilər)", exclusive: true, max: 1 },
//     { key: "isPreview" as const, label: "Preview", desc: "Blog preview bölməsi", exclusive: false, max: null },
//     { key: "isGrid" as const, label: "Grid", desc: "Blog grid bölməsi", exclusive: false, max: null },
//     { key: "isAuthorPreview" as const, label: "Author Detail — Featured", desc: "Detail səhifəsindəki 'Digər bloqlar' featured kart (yalnız 1 ola bilər)", exclusive: true, max: 1 },
//     { key: "isAuthorList" as const, label: "Author Detail — List", desc: "Detail səhifəsindəki 'Digər bloqlar' siyahısı", exclusive: false, max: null },
//     { key: "isHomeVisible" as const, label: "Home Page", desc: "Ana səhifədəki blog bölməsində göstərilir (maksimum 3 ola bilər)", exclusive: false, max: 3 },
// ];

// type PlacementKey = "isFeaturedMain" | "isPickOfWeek" | "isPreview" | "isGrid" | "isAuthorPreview" | "isAuthorList" | "isHomeVisible";

// export default function BlogPage() {
//     const [activeTab, setActiveTab] = useState<"blogs" | "categories" | "settings">("blogs");
//     const [blogs, setBlogs] = useState<any[]>([]);
//     const [authors, setAuthors] = useState<any[]>([]);
//     const [categories, setCategories] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [drawerOpen, setDrawerOpen] = useState(false);
//     const [editItem, setEditItem] = useState<any | null>(null);
//     const [deleteId, setDeleteId] = useState<number | null>(null);
//     const [saving, setSaving] = useState(false);
//     const [reordering, setReordering] = useState(false);
//     const [activeLang, setActiveLang] = useState<Lang>("az");

//     const [title, setTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [slug, setSlug] = useState("");
//     const [badge, setBadge] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [excerpt, setExcerpt] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [coverImage, setCoverImage] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [coverImageAlt, setCoverImageAlt] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [seoTitle, setSeoTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [seoDescription, setSeoDescription] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [seoKeywords, setSeoKeywords] = useState<LocalizedString>({ az: "", en: "", ru: "" });
//     const [schemaText, setSchemaText] = useState("");
//     const [schemaError, setSchemaError] = useState<string | null>(null);
//     const [schemaGenerating, setSchemaGenerating] = useState(false);
//     const [schemaSaving, setSchemaSaving] = useState(false);
//     const [schemaSaveStatus, setSchemaSaveStatus] = useState<"idle" | "success" | "error">("idle");
//     const [publishedAt, setPublishedAt] = useState("");
//     const [authorId, setAuthorId] = useState<number | "">("");
//     const [categoryId, setCategoryId] = useState<number | "">("");
//     const [placements, setPlacements] = useState<Record<PlacementKey, boolean>>({
//         isFeaturedMain: false, isPickOfWeek: false, isPreview: false,
//         isGrid: true, isAuthorPreview: false, isAuthorList: false, isHomeVisible: false,
//     });
//     const [sections, setSections] = useState<any[]>([]);
//     const [gif, setGif] = useState("");


//     const sensors = useSensors(useSensor(PointerSensor));
//     const load = async () => {
//         setLoading(true);
//         try {
//             const [blogsData, authorsData, catsData] = await Promise.all([
//                 apiFetch("/blog"), apiFetch("/blog/authors"), apiFetch("/blog/categories"),
//             ]);
//             console.log("AUTHORS:", authorsData);
//             console.log("CATS:", catsData);
//             setBlogs(Array.isArray(blogsData) ? blogsData : []);
//             setAuthors(Array.isArray(authorsData) ? authorsData : []);
//             setCategories(Array.isArray(catsData) ? catsData : []);
//         } finally { setLoading(false); }
//     };

//     useEffect(() => { load(); }, []);

//     useEffect(() => {
//         if (editItem) {
//             setSchemaText(editItem.schema?.[activeLang] ? JSON.stringify(editItem.schema[activeLang], null, 2) : "");
//             setSchemaError(null);
//         }
//     }, [activeLang]);

//     const resetForm = () => {
//         setTitle({ az: "", en: "", ru: "" }); setSlug("");
//         setBadge({ az: "", en: "", ru: "" }); setExcerpt({ az: "", en: "", ru: "" });
//         setCoverImage({ az: "", en: "", ru: "" }); setCoverImageAlt({ az: "", en: "", ru: "" });
//         setSeoTitle({ az: "", en: "", ru: "" });
//         setSeoDescription({ az: "", en: "", ru: "" });
//         setSeoKeywords({ az: "", en: "", ru: "" });
//         setPublishedAt(""); setAuthorId(""); setCategoryId("");
//         setPlacements({ isFeaturedMain: false, isPickOfWeek: false, isPreview: false, isGrid: true, isAuthorPreview: false, isAuthorList: false, isHomeVisible: false });
//         setGif("");
//         setSections([]);
//         setSchemaText("");
//     };

//     const openCreate = () => { setEditItem(null); resetForm(); setActiveLang("az"); setDrawerOpen(true); };

//     const openEdit = (b: any) => {
//         setEditItem(b); setActiveLang("az");
//         setTitle(typeof b.title === "object" ? b.title : { az: b.title ?? "", en: "", ru: "" });
//         setSlug(b.slug ?? "");
//         setBadge(typeof b.badge === "object" ? b.badge : { az: b.badge ?? "", en: "", ru: "" });
//         setExcerpt(typeof b.excerpt === "object" ? b.excerpt : { az: b.excerpt ?? "", en: "", ru: "" });
//         setCoverImage(typeof b.coverImage === "object" ? b.coverImage : { az: b.coverImage ?? "", en: "", ru: "" });
//         setCoverImageAlt(typeof b.coverImageAlt === "object" ? b.coverImageAlt : { az: b.coverImageAlt ?? "", en: "", ru: "" });
//         setSeoTitle(b.seoTitle ?? { az: "", en: "", ru: "" });
//         setSeoDescription(b.seoDescription ?? { az: "", en: "", ru: "" });
//         setSeoKeywords(b.seoKeywords ?? { az: "", en: "", ru: "" });
//         setPublishedAt(b.publishedAt ? b.publishedAt.slice(0, 10) : "");
//         setAuthorId(b.authorId ?? ""); setCategoryId(b.categoryId ?? "");
//         setPlacements({
//             isFeaturedMain: b.isFeaturedMain ?? false, isPickOfWeek: b.isPickOfWeek ?? false,
//             isPreview: b.isPreview ?? false, isGrid: b.isGrid ?? true,
//             isAuthorPreview: b.isAuthorPreview ?? false, isAuthorList: b.isAuthorList ?? false,
//             isHomeVisible: b.isHomeVisible ?? false,
//         });
//         setGif(b.gif ?? "");
//         setSections(b.sections ?? []);
//         setSchemaText(b.schema?.[activeLang] ? JSON.stringify(b.schema[activeLang], null, 2) : "");
//         setDrawerOpen(true);
//     };

//     const closeDrawer = () => { setDrawerOpen(false); setEditItem(null); };

//     const handleTitleChange = (val: LocalizedString) => {
//         setTitle(val);
//         if (activeLang === "az") setSlug(generateSlug(val.az || ""));
//     };

//     const handlePlacementToggle = async (key: PlacementKey) => {
//         const newVal = !placements[key];
//         const config = PLACEMENT_CONFIG.find(c => c.key === key);
//         if (newVal && config?.max && config.max > 1) {
//             const activeCount = blogs.filter(b => b[key] && b.id !== editItem?.id).length;
//             if (activeCount >= config.max) { alert(`Maksimum ${config.max} blog aktiv ola bilər.`); return; }
//         }
//         setPlacements(prev => ({ ...prev, [key]: newVal }));
//         if (key === "isAuthorList" && editItem) {
//             try {
//                 await apiFetch(`/blog/${editItem.id}`, { method: "PUT", body: JSON.stringify({ isAuthorList: newVal, authorListPinnedAt: newVal ? new Date().toISOString() : null }) });
//             } catch (e) { console.error(e); }
//             return;
//         }
//         if (newVal && config?.max === 1) {
//             const oldActive = blogs.find(b => b[key] && b.id !== editItem?.id);
//             if (oldActive) {
//                 try {
//                     await apiFetch(`/blog/${oldActive.id}`, { method: "PUT", body: JSON.stringify({ [key]: false }) });
//                     setBlogs(prev => prev.map(b => b.id === oldActive.id ? { ...b, [key]: false } : b));
//                 } catch (e) { console.error(e); }
//             }
//         }
//     };

//     const addSection = (type: string) => setSections(prev => [...prev, { type, isVisible: true }]);
//     const updateSection = (i: number, data: any) => setSections(prev => { const arr = [...prev]; arr[i] = data; return arr; });
//     const removeSection = (i: number) => setSections(prev => prev.filter((_, idx) => idx !== i));

//     const generateSchema = async () => {
//         if (!editItem) return;
//         setSchemaGenerating(true);
//         setSchemaError(null);
//         try {
//             const generated = await apiFetch(`/blog/${editItem.id}/schema/preview`);
//             setSchemaText(JSON.stringify(generated[activeLang], null, 2));
//         } catch {
//             setSchemaError("Schema yaradılarkən xəta baş verdi");
//         } finally {
//             setSchemaGenerating(false);
//         }
//     };

//     const handleSchemaChange = (val: string) => {
//         setSchemaText(val);
//         setSchemaError(null);
//         try {
//             if (val.trim()) JSON.parse(val);
//         } catch {
//             setSchemaError("JSON formatı səhvdir");
//         }
//     };

//     const saveSchema = async () => {
//         if (!editItem || schemaError) return;
//         setSchemaSaving(true);
//         setSchemaSaveStatus("idle");
//         try {
//             let parsed = null;
//             if (schemaText.trim()) parsed = JSON.parse(schemaText);
//             const current = editItem.schema ?? {};
//             const updatedSchema = { ...current, [activeLang]: parsed };
//             await apiFetch(`/blog/${editItem.id}/schema`, {
//                 method: "PATCH",
//                 body: JSON.stringify({ schema: updatedSchema }),
//             });
//             setEditItem((prev: any) => ({ ...prev, schema: updatedSchema }));
//             setSchemaSaveStatus("success");
//         } catch {
//             setSchemaSaveStatus("error");
//         } finally {
//             setSchemaSaving(false);
//             setTimeout(() => setSchemaSaveStatus("idle"), 3000);
//         }
//     };


//     const save = async () => {
//         if (!title.az || !slug) return;
//         setSaving(true);
//         try {
//             const payload = {
//                 title, slug, badge, excerpt, coverImage, coverImageAlt,
//                 publishedAt: publishedAt || null,
//                 authorId: authorId ? Number(authorId) : null,
//                 categoryId: categoryId ? Number(categoryId) : null,
//                 ...placements, sections,
//                 gif: gif || null,
//                 seoTitle, seoDescription, seoKeywords,
//             };
//             if (editItem) await apiFetch(`/blog/${editItem.id}`, { method: "PUT", body: JSON.stringify(payload) });
//             else await apiFetch("/blog", { method: "POST", body: JSON.stringify(payload) });
//             closeDrawer(); load();
//         } finally { setSaving(false); }
//     };

//     const toggleVisibility = async (b: any) => {
//         await apiFetch(`/blog/${b.id}/visibility`, { method: "PATCH", body: JSON.stringify({ isVisible: !b.isVisible }) });
//         load();
//     };

//     const handleDelete = async () => {
//         if (!deleteId) return;
//         await apiFetch(`/blog/${deleteId}`, { method: "DELETE" });
//         setDeleteId(null); load();
//     };

//     const handleDragEnd = async (event: DragEndEvent) => {
//         const { active, over } = event;
//         if (!over || active.id === over.id) return;
//         const oi = blogs.findIndex(b => b.id === active.id);
//         const ni = blogs.findIndex(b => b.id === over.id);
//         const newList = arrayMove(blogs, oi, ni);
//         setBlogs(newList); setReordering(true);
//         try {
//             await apiFetch("/blog/reorder", { method: "PATCH", body: JSON.stringify({ ids: newList.map(b => b.id) }) });
//         } finally { setReordering(false); }
//     };

//     const usedTypes = sections.map(s => s.type);

//     return (
//         <div className={styles.page}>
//             <div className={styles.header}>
//                 <div>
//                     <h1 className={styles.title}>Blog</h1>
//                     <p className={styles.subtitle}>Blog məzmununu idarə edin</p>
//                 </div>
//             </div>

//             <div className={styles.tabs}>
//                 {(["blogs", "categories", "settings"] as const).map(tab => (
//                     <button key={tab} className={activeTab === tab ? styles.tabActive : styles.tabInactive}
//                         onClick={() => setActiveTab(tab)}>
//                         {tab === "blogs" ? "Bloglar" : tab === "categories" ? "Kateqoriyalar" : "Parametrlər"}
//                     </button>
//                 ))}
//             </div>

//             {activeTab === "categories" && <CategoriesTab />}
//             {activeTab === "settings" && <SettingsTab />}

//             {activeTab === "blogs" && (
//                 <>
//                     <div className={styles.tabHeader}>
//                         <div className={styles.headerRight}>
//                             {reordering && <span className={styles.reorderingText}>Saxlanır...</span>}
//                             <button className={styles.addBtn} onClick={openCreate}>+ Yeni Blog</button>
//                         </div>
//                     </div>
//                     <div className={styles.tableWrap}>
//                         {loading ? <div className={styles.empty}>Yüklənir...</div>
//                             : blogs.length === 0 ? <div className={styles.empty}>Hələ blog yoxdur</div>
//                                 : (
//                                     <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//                                         <SortableContext items={blogs.map(b => b.id)} strategy={verticalListSortingStrategy}>
//                                             <table className={styles.table}>
//                                                 <thead><tr><th></th><th>Blog</th><th>Badge</th><th>Placement</th><th>Status</th><th>Əməliyyatlar</th></tr></thead>
//                                                 <tbody>
//                                                     {blogs.map(b => (
//                                                         <SortableBlogRow key={b.id} b={b} onEdit={openEdit} onToggle={toggleVisibility} onDelete={setDeleteId} />
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </SortableContext>
//                                     </DndContext>
//                                 )}
//                     </div>
//                 </>
//             )}

//             {drawerOpen && (
//                 <div className={styles.fullDrawer}>
//                     <div className={styles.fullDrawerHeader}>
//                         <h2>{editItem ? "Blog Düzəlt" : "Yeni Blog"}</h2>
//                         <div className={styles.fullDrawerHeaderRight}>
//                             <button className={styles.cancelBtn} onClick={closeDrawer}>Ləğv et</button>
//                             <button className={styles.saveBtn} onClick={save} disabled={saving}>{saving ? "Saxlanır..." : "Saxla"}</button>
//                         </div>
//                     </div>
//                     <div className={styles.fullDrawerBody}>
//                         <LangTabs active={activeLang} onChange={setActiveLang} />
//                         <div className={styles.fullDrawerSection}>
//                             <h3 className={styles.drawerSectionTitle}>Əsas Məlumatlar</h3>
//                             <div className={styles.field}>
//                                 <label>Başlıq * ({activeLang.toUpperCase()})</label>
//                                 <LocalizedRichEditor value={title} lang={activeLang} onChange={handleTitleChange} />
//                             </div>
//                             <div className={styles.twoCol}>
//                                 <div className={styles.field}><label>Slug</label>
//                                     <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} />
//                                 </div>
//                                 <div className={styles.field}>
//                                     <label>Badge ({activeLang.toUpperCase()})</label>
//                                     <input className={styles.input} value={badge[activeLang] || ""}
//                                         onChange={e => setBadge(prev => ({ ...prev, [activeLang]: e.target.value }))} placeholder="Design" />
//                                 </div>
//                             </div>
//                             <div className={styles.field}>
//                                 <label>Qısa təsvir ({activeLang.toUpperCase()})</label>
//                                 <LocalizedRichEditor value={excerpt} lang={activeLang} onChange={setExcerpt} />
//                             </div>
//                             <LocalizedImageUpload value={coverImage} lang={activeLang} onChange={setCoverImage} label="Cover şəkil" />
//                             <div className={styles.field}>
//                                 <label>Cover şəkil alt mətn ({activeLang.toUpperCase()})</label>
//                                 <input className={styles.input} value={coverImageAlt[activeLang] || ""}
//                                     onChange={e => setCoverImageAlt(prev => ({ ...prev, [activeLang]: e.target.value }))} />
//                             </div>
//                             <SingleImageUpload
//                                 label="GIF (optional)"
//                                 value={gif}
//                                 onChange={setGif}
//                                  accept="image/gif,image/webp,video/mp4"
//                             />
//                             <div className={styles.twoCol}>
//                                 <div className={styles.field}><label>Author</label>
//                                     <select className={styles.input} value={authorId} onChange={e => setAuthorId(Number(e.target.value))}>
//                                         <option value="">Seçin...</option>
//                                         {authors.map(a => {
//                                             const nameAz = typeof a.name === "object" ? (a.name?.az || "") : (a.name || "");
//                                             return <option key={a.id} value={a.id}>{nameAz}</option>;
//                                         })}
//                                     </select>
//                                 </div>
//                                 <div className={styles.field}><label>Kateqoriya</label>
//                                     <select className={styles.input} value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
//                                         <option value="">Seçin...</option>
//                                         {categories.map(c => {
//                                             const labelAz = typeof c.label === "object" ? (c.label?.az || "") : (c.label || "");
//                                             return <option key={c.id} value={c.id}>{labelAz}</option>;
//                                         })}
//                                     </select>
//                                 </div>
//                             </div>
//                             <div className={styles.twoCol}>
//                                 <div className={styles.field}><label>Yayımlanma tarixi</label>
//                                     <input type="date" className={styles.input} value={publishedAt} onChange={e => setPublishedAt(e.target.value)} />
//                                 </div>

//                             </div>
//                         </div>
//                         <div className={styles.fullDrawerSection}>
//                             <h3 className={styles.drawerSectionTitle}>Placement</h3>
//                             <p className={styles.placementInfo}>Blogun saytda harada görünəcəyini seçin</p>
//                             <div className={styles.placementGrid}>
//                                 {PLACEMENT_CONFIG.map((config) => {
//                                     const val = placements[config.key];
//                                     const activeCount = config.max !== null ? blogs.filter(b => b[config.key] && b.id !== editItem?.id).length : null;
//                                     return (
//                                         <div key={config.key} className={styles.placementCard}>
//                                             <div className={styles.placementCardTop}>
//                                                 <button type="button"
//                                                     className={val ? styles.activeToggle : styles.inactiveToggle}
//                                                     onClick={() => handlePlacementToggle(config.key)}>
//                                                     {val ? "Aktiv" : "Deaktiv"}
//                                                 </button>
//                                             </div>
//                                             <p className={styles.placementDesc}>{config.desc}</p>
//                                             {activeCount !== null && (
//                                                 <p className={styles.placementCount}>Hal-hazırda aktiv: <strong>{activeCount}</strong> / {config.max}</p>
//                                             )}
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </div>
//                         <div className={styles.fullDrawerSection}>
//                             <h3 className={styles.drawerSectionTitle}>Detail Səhifəsi Sectionları</h3>
//                             {sections.map((section, i) => (
//                                 <SectionEditor key={`section-${i}-${section.type}`} section={section} index={i}
//                                     onChange={data => updateSection(i, data)}
//                                     onRemove={() => removeSection(i)}
//                                     activeLang={activeLang}
//                                 />
//                             ))}
//                             <div className={styles.addSectionRow}>
//                                 {SECTION_TYPES.filter(({ type }) => !usedTypes.includes(type)).map(({ type, label }) => (
//                                     <button key={type} type="button" className={styles.addSectionBtn} onClick={() => addSection(type)}>
//                                         + {label}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>
//                         <div className={styles.fullDrawerSection}>
//                             <h3 className={styles.drawerSectionTitle}>SEO</h3>
//                             <div className={styles.field}>
//                                 <label>SEO Title ({activeLang.toUpperCase()})</label>
//                                 <input
//                                     className={styles.input}
//                                     value={seoTitle[activeLang] || ""}
//                                     onChange={e => setSeoTitle(prev => ({ ...prev, [activeLang]: e.target.value }))}
//                                     placeholder={`SEO başlığı (${activeLang})`}
//                                 />
//                             </div>
//                             <div className={styles.field}>
//                                 <label>SEO Description ({activeLang.toUpperCase()})</label>
//                                 <textarea
//                                     className={styles.input}
//                                     rows={3}
//                                     value={seoDescription[activeLang] || ""}
//                                     onChange={e => setSeoDescription(prev => ({ ...prev, [activeLang]: e.target.value }))}
//                                     placeholder={`Qısa açıqlama (${activeLang})`}
//                                 />
//                             </div>
//                             <div className={styles.field}>
//                                 <label>SEO Keywords ({activeLang.toUpperCase()})</label>
//                                 <input
//                                     className={styles.input}
//                                     value={seoKeywords[activeLang] || ""}
//                                     onChange={e => setSeoKeywords(prev => ({ ...prev, [activeLang]: e.target.value }))}
//                                     placeholder={`açar söz 1, açar söz 2 (${activeLang})`}
//                                 />
//                             </div>
//                             <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
//                                 ℹ Article section-larındakı hashtaglar avtomatik keyword-lərə əlavə olunacaq
//                             </p>
                         
//                         {editItem && (
//                                 <div className={styles.fullDrawerSection}>
//                                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
//                                         <h3 className={styles.drawerSectionTitle} style={{ marginBottom: 0 }}>
//                                             JSON-LD Schema ({activeLang.toUpperCase()})
//                                         </h3>
//                                         <div style={{ display: "flex", gap: 8 }}>
//                                             <button type="button" onClick={generateSchema} disabled={schemaGenerating}
//                                                 style={{ padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "1.5px solid #3b82f6", background: "#1e3a5f", color: "#fff", cursor: "pointer" }}>
//                                                 {schemaGenerating ? "Yaradılır..." : "⚡ Generate Et"}
//                                             </button>
//                                             <button type="button" onClick={saveSchema} disabled={schemaSaving || !!schemaError}
//                                                 style={{ padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "1.5px solid #16a34a", background: "#14532d", color: "#fff", cursor: "pointer" }}>
//                                                 {schemaSaving ? "Saxlanır..." : "Saxla"}
//                                             </button>
//                                         </div>
//                                     </div>
//                                     {schemaSaveStatus === "success" && <p style={{ color: "#16a34a", fontSize: 13, marginBottom: 8 }}>✓ Schema saxlanıldı</p>}
//                                     {schemaSaveStatus === "error" && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 8 }}>✕ Xəta baş verdi</p>}
//                                     <div className={styles.field}>
//                                         <textarea
//                                             className={styles.input}
//                                             rows={14}
//                                             value={schemaText}
//                                             placeholder='{"@context": "https://schema.org", ...}'
//                                             onChange={(e) => handleSchemaChange(e.target.value)}
//                                             style={{ fontFamily: "monospace", fontSize: 12 }}
//                                         />
//                                     </div>
//                                     {schemaError && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 4 }}>⚠ {schemaError}</p>}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {deleteId && (
//                 <div className={styles.overlay} onClick={() => setDeleteId(null)}>
//                     <div className={styles.modal} onClick={e => e.stopPropagation()}>
//                         <div className={styles.modalHeader}><h2>Silməyi təsdiq edin</h2>
//                             <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button></div>
//                         <div className={styles.modalBody}><p>Bu blogu silmək istədiyinizə əminsiniz?</p></div>
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
    SortableContext, verticalListSortingStrategy, useSortable, arrayMove, horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/blog.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;

type Lang = "az" | "en" | "ru";
type LocalizedString = Record<string, string>;
type LocalizedImages = Partial<Record<Lang, string[]>>;

function getToken() { return document.cookie.split("access_token=")[1]?.split(";")[0] ?? ""; }

async function apiFetch(path: string, options?: RequestInit) {
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...options?.headers },
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
        .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").trim();
}

// --- Localized images helpers -------------------------------------------
// Köhnə (flat) formatları LocalizedImages formatına çevirir ki, köhnə
// sectionlar sınmasın. Admin formada YALNIZ aktiv dilin şəkli göstərilir/
// redaktə olunur — dillər arası fallback yalnız canlı saytın render
// tərəfində tətbiq olunmalıdır.

function normalizeImages(images: any): LocalizedImages {
    if (Array.isArray(images)) return images.length ? { az: images } : {};
    return images ?? {};
}

// Tək şəkil sahələri (heroImage, sideImage və s.) köhnədən sadə string idi;
// bunu LocalizedImages-ə (maks. 1 element) çeviririk.
function normalizeMainImage(img: any): LocalizedImages {
    if (typeof img === "string") return img ? { az: [img] } : {};
    return normalizeImages(img);
}

function LangTabs({ active, onChange }: { active: Lang; onChange: (l: Lang) => void }) {
    return (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["az", "en", "ru"] as Lang[]).map((l) => (
                <button key={l} type="button" onClick={() => onChange(l)}
                    style={{
                        padding: "4px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                        border: "1.5px solid",
                        borderColor: active === l ? "#3b82f6" : "#333",
                        background: active === l ? "#1e3a5f" : "transparent",
                        color: active === l ? "#fff" : "#888",
                        cursor: "pointer",
                    }}>
                    {l.toUpperCase()}
                </button>
            ))}
        </div>
    );
}

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

    useEffect(() => {
        if (editor && editor.getHTML() !== value) {
            editor.commands.setContent(value || "");
        }
    }, [value]);

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
                    style={{ fontFamily: "Georgia, serif", fontSize: 16 }}>❝❞</button>
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

function LocalizedRichEditor({ value, lang, onChange }: {
    value: LocalizedString; lang: Lang; onChange: (v: LocalizedString) => void;
}) {
    return (
        <RichEditor
            value={value?.[lang] || ""}
            onChange={v => onChange({ ...value, [lang]: v })}
        />
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

function LocalizedImageUpload({ value, lang, onChange, label }: {
    value: LocalizedString; lang: Lang; onChange: (v: LocalizedString) => void; label?: string;
}) {
    return (
        <SingleImageUpload
            label={`${label ?? "Şəkil"} (${lang.toUpperCase()})`}
            value={value?.[lang] || ""}
            onChange={v => onChange({ ...value, [lang]: v })}
        />
    );
}

function SortableImage({ id, src, onRemove }: { id: string; src: string; onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    return (
        <div ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            className={styles.imageItem}>
            <div className={styles.imageDragHandle} {...attributes} {...listeners}>⠿</div>
            <img src={toAbsUrl(src)} alt="" className={styles.imageThumb} />
            <button type="button" className={styles.imageRemoveBtn} onClick={onRemove}>✕</button>
        </div>
    );
}

// Dilə görə fərqlənən şəkil sahələri üçün (Hero şəkil, Yan şəkil, Alt
// şəkillər və s.). Admin panelində hər dil YALNIZ öz şəklini göstərir/
// redaktə edir. maxImages=1 verilən yerlərdə tək şəkil sahəsi kimi işləyir
// (SingleImageUpload əvəzinə), amma hər dil üçün ayrıca şəkil saxlamağa
// imkan verir.
function ImageUploadArea({ images, onChange, maxImages, activeLang, label, accept = "image/webp" }: {
    images: LocalizedImages;
    onChange: (imgs: LocalizedImages) => void;
    maxImages?: number;
    activeLang: Lang;
    label?: string;
    accept?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const sensors = useSensors(useSensor(PointerSensor));

    const currentList = images?.[activeLang] ?? [];

    const setLangImages = (list: string[]) => {
        onChange({ ...images, [activeLang]: list });
    };

    const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const base = currentList;
        const urls: string[] = [];
        for (const file of files) {
            if (maxImages && base.length + urls.length >= maxImages) break;
            const url = await uploadFile(file);
            urls.push(url);
        }
        setLangImages(maxImages === 1 ? urls.slice(-1) : [...base, ...urls]);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = currentList.findIndex((_, i) => `img-${i}` === active.id);
        const newIndex = currentList.findIndex((_, i) => `img-${i}` === over.id);
        setLangImages(arrayMove(currentList, oldIndex, newIndex));
    };

    const removeAt = (i: number) => {
        setLangImages(currentList.filter((_, idx) => idx !== i));
    };

    return (
        <div className={styles.field}>
            {label && <label>{label} ({activeLang.toUpperCase()})</label>}
            <div className={styles.imageUploadWrap}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={currentList.map((_, i) => `img-${i}`)} strategy={horizontalListSortingStrategy}>
                        <div className={styles.imageGrid}>
                            {currentList.map((img, i) => (
                                <SortableImage key={`img-${i}`} id={`img-${i}`} src={img} onRemove={() => removeAt(i)} />
                            ))}
                            {(!maxImages || currentList.length < maxImages) && (
                                <div className={styles.imageAddBtn} onClick={() => inputRef.current?.click()}>
                                    <span>+</span><small>WebP əlavə et</small>
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
            <input ref={inputRef} type="file" accept={accept} multiple={maxImages !== 1} style={{ display: "none" }} onChange={handleSelect} />
        </div>
    );
}

function HeroSectionEditor({ data, onChange, activeLang }: {
    data: any; onChange: (d: any) => void; activeLang: Lang
}) {
    const lv = (field: any) => (typeof field === "object" && field !== null ? field : { az: field ?? "", en: "", ru: "" });
    const setL = (key: string, val: string) => onChange({ ...data, [key]: { ...lv(data[key]), [activeLang]: val } });

    return (
        <div className={styles.sectionFields}>
            <ImageUploadArea
                label="Hero şəkil"
                images={normalizeMainImage(data.heroImage)}
                onChange={imgs => onChange({ ...data, heroImage: imgs })}
                maxImages={1}
                activeLang={activeLang} />
            <div className={styles.field}>
                <label>Hero şəkil alt mətn ({activeLang.toUpperCase()})</label>
                <input className={styles.input} value={lv(data.heroImageAlt)[activeLang] ?? ""} onChange={e => setL("heroImageAlt", e.target.value)} />
            </div>
            <div className={styles.field}>
                <label>Hashtag ({activeLang.toUpperCase()})</label>
                <input className={styles.input} value={lv(data.hashtag)[activeLang] ?? ""} placeholder="Design" onChange={e => setL("hashtag", e.target.value)} />
            </div>
            <div className={styles.field}>
                <label>Başlıq ({activeLang.toUpperCase()})</label>
                <RichEditor value={lv(data.title)[activeLang] ?? ""} onChange={v => setL("title", v)} />
            </div>
            {(data.paragraphs ?? [""]).map((p: any, i: number) => {
                const pVal = typeof p === "object" && p !== null ? p : { az: p ?? "", en: "", ru: "" };
                return (
                    <div key={i} className={styles.field}>
                        <label>Paraqraf {i + 1} ({activeLang.toUpperCase()})</label>
                        <RichEditor value={pVal[activeLang] ?? ""} onChange={v => {
                            const arr = [...(data.paragraphs ?? [])];
                            arr[i] = { ...pVal, [activeLang]: v };
                            onChange({ ...data, paragraphs: arr });
                        }} />
                    </div>
                );
            })}
            <button type="button" className={styles.addRowBtn}
                onClick={() => onChange({ ...data, paragraphs: [...(data.paragraphs ?? []), { az: "", en: "", ru: "" }] })}>
                + Paraqraf əlavə et
            </button>
        </div>
    );
}

function ContentSectionEditor({ data, onChange, activeLang }: {
    data: any; onChange: (d: any) => void; activeLang: Lang
}) {
    const lv = (field: any) => (typeof field === "object" && field !== null && !Array.isArray(field) ? field : { az: field ?? "", en: "", ru: "" });
    const setL = (key: string, val: string) => onChange({ ...data, [key]: { ...lv(data[key]), [activeLang]: val } });
    const sections = data.sections ?? [];
    const addSection = () => onChange({ ...data, sections: [...sections, { title: { az: "", en: "", ru: "" }, paragraphs: [{ az: "", en: "", ru: "" }] }] });
    const removeSection = (i: number) => onChange({ ...data, sections: sections.filter((_: any, idx: number) => idx !== i) });
    const updateSection = (i: number, key: string, val: any) => {
        const arr = [...sections]; arr[i] = { ...arr[i], [key]: val };
        onChange({ ...data, sections: arr });
    };

    return (
        <div className={styles.sectionFields}>
            <ImageUploadArea
                label="Hero şəkil"
                images={normalizeMainImage(data.heroImage)}
                onChange={imgs => onChange({ ...data, heroImage: imgs })}
                maxImages={1}
                activeLang={activeLang} />
            <div className={styles.field}>
                <label>Hero şəkil alt mətn ({activeLang.toUpperCase()})</label>
                <input className={styles.input} value={lv(data.heroImageAlt)[activeLang] ?? ""} onChange={e => setL("heroImageAlt", e.target.value)} />
            </div>
            <div className={styles.field}>
                <label>Overlap başlıq ({activeLang.toUpperCase()})</label>
                <RichEditor value={lv(data.overlapTitle)[activeLang] ?? ""} onChange={v => setL("overlapTitle", v)} />
            </div>
            {(data.introParagraphs ?? [{ az: "", en: "", ru: "" }]).map((p: any, i: number) => {
                const pVal = typeof p === "object" && p !== null && !Array.isArray(p) ? p : { az: p ?? "", en: "", ru: "" };
                return (
                    <div key={i} className={styles.field}>
                        <label>Paraqraf {i + 1} ({activeLang.toUpperCase()})</label>
                        <RichEditor value={pVal[activeLang] ?? ""} onChange={v => {
                            const arr = [...(data.introParagraphs ?? [])]; arr[i] = { ...pVal, [activeLang]: v };
                            onChange({ ...data, introParagraphs: arr });
                        }} />
                    </div>
                );
            })}
            <button type="button" className={styles.addRowBtn}
                onClick={() => onChange({ ...data, introParagraphs: [...(data.introParagraphs ?? []), { az: "", en: "", ru: "" }] })}>
                + Paraqraf əlavə et
            </button>
            <div className={styles.sectionDivider} />
            <label className={styles.sectionGroupLabel}>Alt bölmələr</label>
            {sections.map((sec: any, i: number) => {
                const secTitle = typeof sec.title === "object" && sec.title !== null ? sec.title : { az: sec.title ?? "", en: "", ru: "" };
                return (
                    <div key={i} className={styles.contentItemBlock}>
                        <div className={styles.contentItemHeader}>
                            <span className={styles.contentItemLabel}>Bölmə #{i + 1}</span>
                            <button type="button" className={styles.removeBtn} onClick={() => removeSection(i)}>✕</button>
                        </div>
                        <div className={styles.field}>
                            <label>Başlıq ({activeLang.toUpperCase()})</label>
                            <RichEditor value={secTitle[activeLang] ?? ""} onChange={v => updateSection(i, "title", { ...secTitle, [activeLang]: v })} />
                        </div>
                        {(sec.paragraphs ?? [{ az: "", en: "", ru: "" }]).map((p: any, j: number) => {
                            const pVal = typeof p === "object" && p !== null && !Array.isArray(p) ? p : { az: p ?? "", en: "", ru: "" };
                            return (
                                <div key={j} className={styles.field}>
                                    <label>Paraqraf {j + 1} ({activeLang.toUpperCase()})</label>
                                    <RichEditor value={pVal[activeLang] ?? ""} onChange={v => {
                                        const arr = [...(sec.paragraphs ?? [])]; arr[j] = { ...pVal, [activeLang]: v };
                                        updateSection(i, "paragraphs", arr);
                                    }} />
                                </div>
                            );
                        })}
                        <button type="button" className={styles.addRowBtn}
                            onClick={() => updateSection(i, "paragraphs", [...(sec.paragraphs ?? []), { az: "", en: "", ru: "" }])}>
                            + Paraqraf əlavə et
                        </button>
                    </div>
                );
            })}
            <button type="button" className={styles.addRowBtn} onClick={addSection}>+ Bölmə əlavə et</button>
            <div className={styles.sectionDivider} />
            <label className={styles.sectionGroupLabel}>Alt şəkillər</label>
            <div className={styles.twoCol}>
                <div>
                    <ImageUploadArea
                        label="Sol şəkil"
                        images={normalizeMainImage(data.bottomImages?.left)}
                        onChange={imgs => onChange({ ...data, bottomImages: { ...data.bottomImages, left: imgs } })}
                        maxImages={1}
                        activeLang={activeLang} />
                    <div className={styles.field}>
                        <label>Sol şəkil alt mətn ({activeLang.toUpperCase()})</label>
                        <input className={styles.input} value={lv(data.bottomImages?.leftAlt)[activeLang] ?? ""}
                            onChange={e => onChange({ ...data, bottomImages: { ...data.bottomImages, leftAlt: { ...lv(data.bottomImages?.leftAlt), [activeLang]: e.target.value } } })} />
                    </div>
                </div>
                <div>
                    <ImageUploadArea
                        label="Sağ şəkil"
                        images={normalizeMainImage(data.bottomImages?.right)}
                        onChange={imgs => onChange({ ...data, bottomImages: { ...data.bottomImages, right: imgs } })}
                        maxImages={1}
                        activeLang={activeLang} />
                    <div className={styles.field}>
                        <label>Sağ şəkil alt mətn ({activeLang.toUpperCase()})</label>
                        <input className={styles.input} value={lv(data.bottomImages?.rightAlt)[activeLang] ?? ""}
                            onChange={e => onChange({ ...data, bottomImages: { ...data.bottomImages, rightAlt: { ...lv(data.bottomImages?.rightAlt), [activeLang]: e.target.value } } })} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArticleSectionEditor({ data, onChange, activeLang }: {
    data: any; onChange: (d: any) => void; activeLang: Lang
}) {
    const lv = (field: any) => (typeof field === "object" && field !== null && !Array.isArray(field) ? field : { az: field ?? "", en: "", ru: "" });
    const sections = data.sections ?? [];

    const normalizeSection = (sec: any) => {
        if (sec.blocks) return sec;
        const blocks: any[] = [];
        if (sec.heading) blocks.push({ type: "heading", content: { az: sec.heading, en: "", ru: "" } });
        for (const p of sec.paragraphs ?? [""])
            blocks.push({ type: "paragraph", content: typeof p === "object" ? p : { az: p ?? "", en: "", ru: "" } });
        return { ...sec, blocks: blocks.length > 0 ? blocks : [{ type: "paragraph", content: { az: "", en: "", ru: "" } }], heading: undefined, paragraphs: undefined };
    };

    const addSection = () => onChange({
        ...data,
        sections: [...sections, { blocks: [{ type: "paragraph", content: { az: "", en: "", ru: "" } }], hashSections: [], hashHeading: { az: "", en: "", ru: "" }, sideImage: {}, sideImageAlt: { az: "", en: "", ru: "" } }],
    });

    const removeSection = (i: number) => onChange({ ...data, sections: sections.filter((_: any, idx: number) => idx !== i) });

    const updateSection = (i: number, key: string, val: any) => {
        const arr = sections.map((s: any, idx: number) => idx === i ? { ...normalizeSection(s), [key]: val } : s);
        onChange({ ...data, sections: arr });
    };

    return (
        <div className={styles.sectionFields}>
            {sections.map((secRaw: any, i: number) => {
                const sec = normalizeSection(secRaw);
                const blocks: any[] = sec.blocks ?? [{ type: "paragraph", content: { az: "", en: "", ru: "" } }];
                const hashHeading = lv(sec.hashHeading);
                const sideImageAlt = lv(sec.sideImageAlt);

                const updateBlock = (j: number, key: string, val: any) => updateSection(i, "blocks", blocks.map((b: any, idx: number) => idx === j ? { ...b, [key]: val } : b));
                const removeBlock = (j: number) => updateSection(i, "blocks", blocks.filter((_: any, idx: number) => idx !== j));

                return (
                    <div key={i} className={styles.contentItemBlock}>
                        <div className={styles.contentItemHeader}>
                            <span className={styles.contentItemLabel}>Bölmə #{i + 1}</span>
                            <button type="button" className={styles.removeBtn} onClick={() => removeSection(i)}>✕</button>
                        </div>
                        {blocks.map((block: any, j: number) => {
                            const contentVal = lv(block.content);
                            return (
                                <div key={j} className={styles.field} style={{ position: "relative" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <label>{block.type === "heading" ? "Başlıq" : "Paraqraf"} ({activeLang.toUpperCase()})</label>
                                        {blocks.length > 1 && (
                                            <button type="button" className={styles.removeBtn} style={{ fontSize: 11 }} onClick={() => removeBlock(j)}>✕</button>
                                        )}
                                    </div>
                                    <RichEditor value={contentVal[activeLang] ?? ""} onChange={v => updateBlock(j, "content", { ...contentVal, [activeLang]: v })} />
                                </div>
                            );
                        })}
                        <button type="button" className={styles.addRowBtn}
                            onClick={() => updateSection(i, "blocks", [...blocks, { type: "paragraph", content: { az: "", en: "", ru: "" } }])}>
                            + Paraqraf əlavə et
                        </button>
                        <button type="button" className={styles.addRowBtn} style={{ marginLeft: 8 }}
                            onClick={() => updateSection(i, "blocks", [...blocks, { type: "heading", content: { az: "", en: "", ru: "" } }, { type: "paragraph", content: { az: "", en: "", ru: "" } }])}>
                            + Başlıq və Paraqraf əlavə et
                        </button>
                        <div className={styles.sectionDivider} />
                        <label className={styles.sectionGroupLabel}>Hash bölmələri</label>
                        <div className={styles.field}>
                            <label>Hash bölmə başlığı ({activeLang.toUpperCase()})</label>
                            <RichEditor value={hashHeading[activeLang] ?? ""} onChange={v => updateSection(i, "hashHeading", { ...hashHeading, [activeLang]: v })} />
                        </div>
                        {(sec.hashSections ?? []).map((hs: any, k: number) => {
                            const tagVal = lv(hs.tag);
                            return (
                                <div key={k} className={styles.hashBlock}>
                                    <div className={styles.field}>
                                        <label>Tag ({activeLang.toUpperCase()})</label>
                                        <input className={styles.input} value={tagVal[activeLang] ?? ""} placeholder="Dizayn kateqoriyası"
                                            onChange={e => {
                                                const arr = [...(sec.hashSections ?? [])];
                                                arr[k] = { ...arr[k], tag: { ...tagVal, [activeLang]: e.target.value } };
                                                updateSection(i, "hashSections", arr);
                                            }} />
                                    </div>
                                    {(hs.paragraphs ?? [{ az: "", en: "", ru: "" }]).map((p: any, m: number) => {
                                        const pVal = lv(p);
                                        return (
                                            <div key={m} className={styles.field}>
                                                <label>Paraqraf {m + 1} ({activeLang.toUpperCase()})</label>
                                                <RichEditor value={pVal[activeLang] ?? ""} onChange={v => {
                                                    const hsArr = [...(sec.hashSections ?? [])];
                                                    const pArr = [...(hs.paragraphs ?? [])]; pArr[m] = { ...pVal, [activeLang]: v };
                                                    hsArr[k] = { ...hsArr[k], paragraphs: pArr };
                                                    updateSection(i, "hashSections", hsArr);
                                                }} />
                                            </div>
                                        );
                                    })}
                                    <button type="button" className={styles.addRowBtn} onClick={() => {
                                        const hsArr = [...(sec.hashSections ?? [])];
                                        hsArr[k] = { ...hsArr[k], paragraphs: [...(hs.paragraphs ?? []), { az: "", en: "", ru: "" }] };
                                        updateSection(i, "hashSections", hsArr);
                                    }}>+ Paraqraf əlavə et</button>
                                    <button type="button" className={styles.removeBtn} style={{ marginTop: 8 }}
                                        onClick={() => updateSection(i, "hashSections", sec.hashSections.filter((_: any, idx: number) => idx !== k))}>
                                        Hash bölməni sil
                                    </button>
                                </div>
                            );
                        })}
                        <button type="button" className={styles.addRowBtn}
                            onClick={() => updateSection(i, "hashSections", [...(sec.hashSections ?? []), { tag: { az: "", en: "", ru: "" }, paragraphs: [{ az: "", en: "", ru: "" }] }])}>
                            + Hash bölmə əlavə et
                        </button>
                        <div className={styles.sectionDivider} />
                        <ImageUploadArea
                            label="Yan şəkil (optional)"
                            images={normalizeMainImage(sec.sideImage)}
                            onChange={imgs => updateSection(i, "sideImage", imgs)}
                            maxImages={1}
                            activeLang={activeLang} />
                        <div className={styles.field}>
                            <label>Yan şəkil alt mətn ({activeLang.toUpperCase()})</label>
                            <input className={styles.input} value={sideImageAlt[activeLang] ?? ""}
                                onChange={e => updateSection(i, "sideImageAlt", { ...sideImageAlt, [activeLang]: e.target.value })} />
                        </div>
                    </div>
                );
            })}
            <button type="button" className={styles.addRowBtn} onClick={addSection}>+ Bölmə əlavə et</button>
            <div className={styles.sectionDivider} />
            <label className={styles.sectionGroupLabel}>Hashtaglar</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                {(Array.isArray(data.hashtags) ? data.hashtags : []).map((tag: any, i: number) => {
                    const tagObj = typeof tag === "string" ? { az: tag, en: tag, ru: tag } : tag;
                    return (
                        <div key={i} className={styles.contentItemBlock} style={{ padding: "10px 14px" }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                {(["az", "en", "ru"] as const).map(lang => (
                                    <div key={lang} style={{ flex: 1 }}>
                                        <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>
                                            {lang.toUpperCase()}
                                        </label>
                                        <input
                                            className={styles.input}
                                            value={tagObj[lang] || ""}
                                            placeholder={`#tag (${lang})`}
                                            onChange={e => {
                                                const arr = [...(data.hashtags ?? [])];
                                                arr[i] = { ...tagObj, [lang]: e.target.value };
                                                onChange({ ...data, hashtags: arr });
                                            }}
                                        />
                                    </div>
                                ))}
                                <button type="button"
                                    onClick={() => onChange({ ...data, hashtags: (data.hashtags ?? []).filter((_: any, idx: number) => idx !== i) })}
                                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18, flexShrink: 0, marginTop: 16 }}>✕</button>
                            </div>
                        </div>
                    );
                })}
                <button type="button" className={styles.addRowBtn}
                    onClick={() => onChange({ ...data, hashtags: [...(Array.isArray(data.hashtags) ? data.hashtags : []), { az: "", en: "", ru: "" }] })}>
                    + Hashtag əlavə et
                </button>
            </div>
        </div>
    );
}

const SECTION_TYPES = [
    { type: "hero", label: "Hero" },
    { type: "content", label: "Content" },
    { type: "article", label: "Article" },
];

function SectionEditor({ section, index, onChange, onRemove, activeLang }: {
    section: any; index: number; onChange: (d: any) => void; onRemove: () => void; activeLang: Lang;
}) {
    const [open, setOpen] = useState(true);
    const renderEditor = () => {
        switch (section.type) {
            case "hero": return <HeroSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
            case "content": return <ContentSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
            case "article": return <ArticleSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
            default: return null;
        }
    };
    return (
        <div className={styles.sectionBlock} style={{ opacity: section.isVisible === false ? 0.5 : 1 }}>
            <div className={styles.sectionBlockHeader}>
                <div className={styles.sectionBlockLeft}>
                    <span className={styles.sectionTypeTag}>{section.type.toUpperCase()}</span>
                    <span className={styles.sectionIndex}>#{index + 1}</span>
                </div>
                <div className={styles.sectionBlockRight}>
                    <button type="button"
                        className={section.isVisible === false ? styles.inactiveToggle : styles.activeToggle}
                        onClick={() => onChange({ ...section, isVisible: section.isVisible === false ? true : false })}>
                        {section.isVisible === false ? "Gizli" : "Görünür"}
                    </button>
                    <button type="button" className={styles.toggleBtn} onClick={() => setOpen(o => !o)}>{open ? "Bağla" : "Aç"}</button>
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
    const titleAz = typeof b.title === "object" ? (b.title?.az || "") : (b.title || "");
    const badgeAz = typeof b.badge === "object" ? (b.badge?.az || "") : (b.badge || "");

    return (
        <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
            <td className={styles.num}><span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span></td>
            <td>
                <div className={styles.blogInfo}>
                    {b.coverImage && (() => {
                        const src = typeof b.coverImage === "object" ? (b.coverImage?.az || "") : b.coverImage;
                        return src ? <img src={toAbsUrl(src)} alt="" className={styles.coverThumb} /> : null;
                    })()}
                    <div>
                        <div className={styles.blogTitle} dangerouslySetInnerHTML={{ __html: titleAz.replace(/<[^>]*>/g, "").trim() }} />
                        <div className={styles.blogSlug}>/{b.slug}</div>
                    </div>
                </div>
            </td>
            <td><span className={styles.badgeTag}>{badgeAz}</span></td>
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

function CategoriesTab() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);
    const [activeLang, setActiveLang] = useState<Lang>("az");
    const [label, setLabel] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [slug, setSlug] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const load = async () => {
        setLoading(true);
        try { setCategories(await apiFetch("/blog/categories")); } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setEditItem(null); setActiveLang("az"); setLabel({ az: "", en: "", ru: "" }); setSlug(""); setModalOpen(true); };

    const openEdit = (c: any) => {
        setEditItem(c); setActiveLang("az");
        setLabel(typeof c.label === "object" ? c.label : { az: c.label ?? "", en: "", ru: "" });
        setSlug(c.slug); setModalOpen(true);
    };

    const save = async () => {
        if (!label.az?.trim() || !slug.trim()) return;
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

    const labelAz = (c: any) => typeof c.label === "object" ? (c.label?.az || "") : (c.label || "");

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
                                <thead><tr><th>Ad (AZ)</th><th>Slug</th><th>Əməliyyatlar</th></tr></thead>
                                <tbody>
                                    {categories.map(c => (
                                        <tr key={c.id}>
                                            <td>{labelAz(c)}</td>
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
                            <LangTabs active={activeLang} onChange={setActiveLang} />
                            <div className={styles.field}>
                                <label>Ad * ({activeLang.toUpperCase()})</label>
                                <input className={styles.input} value={label[activeLang] || ""}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setLabel(prev => ({ ...prev, [activeLang]: val }));
                                        if (activeLang === "az" && !editItem) setSlug(generateSlug(val));
                                    }} placeholder="Design" />
                            </div>
                            <div className={styles.field}>
                                <label>Slug *</label>
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
    const [activeLang, setActiveLang] = useState<Lang>("az");
    const [pageTitle, setPageTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [buttonText, setButtonText] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [buttonLink, setButtonLink] = useState("");
    const [buttonNewTab, setButtonNewTab] = useState(false);
    const [quoteText, setQuoteText] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [quoteImage, setQuoteImage] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [quoteImageAlt, setQuoteImageAlt] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [searchPlaceholder, setSearchPlaceholder] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [categoriesLabel, setCategoriesLabel] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [pickOfWeekLabel, setPickOfWeekLabel] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [moreBlogsButtonText, setMoreBlogsButtonText] = useState<LocalizedString>({ az: "", en: "", ru: "" });

    const load = async () => {
        setLoading(true);
        try {
            const data = await apiFetch("/blog/settings");
            setPageTitle(typeof data.pageTitle === "object" ? data.pageTitle : { az: data.pageTitle ?? "", en: "", ru: "" });
            setButtonText(typeof data.buttonText === "object" ? data.buttonText : { az: data.buttonText ?? "", en: "", ru: "" });
            setButtonLink(data.buttonLink ?? "");
            setButtonNewTab(data.buttonNewTab ?? false);
            setQuoteText(typeof data.quoteText === "object" ? data.quoteText : { az: data.quoteText ?? "", en: "", ru: "" });
            setQuoteImage(typeof data.quoteImage === "object" ? data.quoteImage : { az: data.quoteImage ?? "", en: "", ru: "" });
            setQuoteImageAlt(typeof data.quoteImageAlt === "object" ? data.quoteImageAlt : { az: data.quoteImageAlt ?? "", en: "", ru: "" });
            setSearchPlaceholder(
                typeof data.searchPlaceholder === "object"
                    ? data.searchPlaceholder
                    : { az: data.searchPlaceholder ?? "", en: "", ru: "" }
            );

            setCategoriesLabel(
                typeof data.categoriesLabel === "object"
                    ? data.categoriesLabel
                    : { az: data.categoriesLabel ?? "", en: "", ru: "" }
            );

            setPickOfWeekLabel(
                typeof data.pickOfWeekLabel === "object"
                    ? data.pickOfWeekLabel
                    : { az: data.pickOfWeekLabel ?? "", en: "", ru: "" }
            );

            setMoreBlogsButtonText(
                typeof data.moreBlogsButtonText === "object"
                    ? data.moreBlogsButtonText
                    : { az: data.moreBlogsButtonText ?? "", en: "", ru: "" }
            );
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const save = async () => {
        setSaving(true); setSaveStatus("idle");
        try {
            await apiFetch("/blog/settings", {
                method: "PUT",
                body: JSON.stringify({
                    pageTitle,
                    buttonText,
                    buttonLink,
                    buttonNewTab,
                    quoteText,
                    quoteImage,
                    quoteImageAlt,
                    searchPlaceholder,
                    categoriesLabel,
                    pickOfWeekLabel,
                    moreBlogsButtonText,
                })
            });
            setSaveStatus("success");
        } catch { setSaveStatus("error"); }
        finally { setSaving(false); setTimeout(() => setSaveStatus("idle"), 3000); }
    };

    if (loading) return <div className={styles.empty}>Yüklənir...</div>;

    return (
        <div>
            <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>Parametrlər</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {saveStatus === "success" && <span style={{ color: "#16a34a", fontSize: 14, fontWeight: 600 }}>✓ Saxlanıldı</span>}
                    {saveStatus === "error" && <span style={{ color: "#dc2626", fontSize: 14, fontWeight: 600 }}>✕ Xəta baş verdi</span>}
                    <button className={styles.saveBtn} onClick={save} disabled={saving}>{saving ? "Saxlanır..." : "Saxla"}</button>
                </div>
            </div>
            <LangTabs active={activeLang} onChange={setActiveLang} />
            <div className={styles.settingsCard}>
                <h3 className={styles.settingsGroupTitle}>Səhifə başlığı və button</h3>
                <div className={styles.twoCol}>
                    <div className={styles.field}>
                        <label>Səhifə başlığı ({activeLang.toUpperCase()})</label>
                        <input className={styles.input} value={pageTitle[activeLang] || ""}
                            onChange={e => setPageTitle(prev => ({ ...prev, [activeLang]: e.target.value }))} placeholder="Bloglar" />
                    </div>
                    <div className={styles.field}>
                        <label>Button mətni ({activeLang.toUpperCase()})</label>
                        <input className={styles.input} value={buttonText[activeLang] || ""}
                            onChange={e => setButtonText(prev => ({ ...prev, [activeLang]: e.target.value }))} placeholder="Portfolio" />
                    </div>
                </div>
                <div className={styles.twoCol}>
                    <div className={styles.field}>
                        <label>Button linki</label>
                        <input className={styles.input} value={buttonLink} onChange={e => setButtonLink(e.target.value)} placeholder="/portfolio" />
                    </div>
                    <div className={styles.field}>
                        <label>Button açılış rejimi</label>
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            <button type="button" className={!buttonNewTab ? styles.activeToggle : styles.inactiveToggle} onClick={() => setButtonNewTab(false)}>Mövcud tab</button>
                            <button type="button" className={buttonNewTab ? styles.activeToggle : styles.inactiveToggle} onClick={() => setButtonNewTab(true)}>Yeni tab</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.settingsCard}>
                <h3 className={styles.settingsGroupTitle}>Quote bölməsi</h3>
                <div className={styles.field}>
                    <label>Quote mətni ({activeLang.toUpperCase()})</label>
                    <LocalizedRichEditor value={quoteText} lang={activeLang} onChange={setQuoteText} />
                </div>
                <LocalizedImageUpload value={quoteImage} lang={activeLang} onChange={setQuoteImage} label="Quote şəkli" />
                <div className={styles.field}>
                    <label>Quote şəkil alt mətn ({activeLang.toUpperCase()})</label>
                    <input className={styles.input} value={quoteImageAlt[activeLang] || ""}
                        onChange={e => setQuoteImageAlt(prev => ({ ...prev, [activeLang]: e.target.value }))} />
                </div>
            </div>

            <div className={styles.settingsCard}>
                <h3 className={styles.settingsGroupTitle}>Search mətnləri</h3>

                <div className={styles.field}>
                    <label>Search placeholder ({activeLang.toUpperCase()})</label>
                    <input
                        className={styles.input}
                        value={searchPlaceholder[activeLang] || ""}
                        onChange={(e) =>
                            setSearchPlaceholder((prev) => ({
                                ...prev,
                                [activeLang]: e.target.value,
                            }))
                        }
                    />
                </div>

                <div className={styles.field}>
                    <label>Categories label ({activeLang.toUpperCase()})</label>
                    <input
                        className={styles.input}
                        value={categoriesLabel[activeLang] || ""}
                        onChange={(e) =>
                            setCategoriesLabel((prev) => ({
                                ...prev,
                                [activeLang]: e.target.value,
                            }))
                        }
                    />
                </div>

                <div className={styles.field}>
                    <label>Pick of week label ({activeLang.toUpperCase()})</label>
                    <input
                        className={styles.input}
                        value={pickOfWeekLabel[activeLang] || ""}
                        onChange={(e) =>
                            setPickOfWeekLabel((prev) => ({
                                ...prev,
                                [activeLang]: e.target.value,
                            }))
                        }
                    />
                </div>

                <div className={styles.field}>
                    <label>More blogs button ({activeLang.toUpperCase()})</label>
                    <input
                        className={styles.input}
                        value={moreBlogsButtonText[activeLang] || ""}
                        onChange={(e) =>
                            setMoreBlogsButtonText((prev) => ({
                                ...prev,
                                [activeLang]: e.target.value,
                            }))
                        }
                    />
                </div>
            </div>
        </div>
    );
}

const PLACEMENT_CONFIG = [
    { key: "isFeaturedMain" as const, label: "Featured Main", desc: "Hero bölməsində sol böyük kart (yalnız 1 ola bilər)", exclusive: true, max: 1 },
    { key: "isPickOfWeek" as const, label: "Pick of Week", desc: "Həftənin seçilmiş blogu (yalnız 1 ola bilər)", exclusive: true, max: 1 },
    { key: "isPreview" as const, label: "Preview", desc: "Blog preview bölməsi", exclusive: false, max: null },
    { key: "isGrid" as const, label: "Grid", desc: "Blog grid bölməsi", exclusive: false, max: null },
    { key: "isAuthorPreview" as const, label: "Author Detail — Featured", desc: "Detail səhifəsindəki 'Digər bloqlar' featured kart (yalnız 1 ola bilər)", exclusive: true, max: 1 },
    { key: "isAuthorList" as const, label: "Author Detail — List", desc: "Detail səhifəsindəki 'Digər bloqlar' siyahısı", exclusive: false, max: null },
    { key: "isHomeVisible" as const, label: "Home Page", desc: "Ana səhifədəki blog bölməsində göstərilir (maksimum 3 ola bilər)", exclusive: false, max: 3 },
];

type PlacementKey = "isFeaturedMain" | "isPickOfWeek" | "isPreview" | "isGrid" | "isAuthorPreview" | "isAuthorList" | "isHomeVisible";

export default function BlogPage() {
    const [activeTab, setActiveTab] = useState<"blogs" | "categories" | "settings">("blogs");
    const [blogs, setBlogs] = useState<any[]>([]);
    const [authors, setAuthors] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [reordering, setReordering] = useState(false);
    const [activeLang, setActiveLang] = useState<Lang>("az");

    const [title, setTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [slug, setSlug] = useState("");
    const [badge, setBadge] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [excerpt, setExcerpt] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [coverImage, setCoverImage] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [coverImageAlt, setCoverImageAlt] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [seoTitle, setSeoTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [seoDescription, setSeoDescription] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [seoKeywords, setSeoKeywords] = useState<LocalizedString>({ az: "", en: "", ru: "" });
    const [schemaText, setSchemaText] = useState("");
    const [schemaError, setSchemaError] = useState<string | null>(null);
    const [schemaGenerating, setSchemaGenerating] = useState(false);
    const [schemaSaving, setSchemaSaving] = useState(false);
    const [schemaSaveStatus, setSchemaSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [publishedAt, setPublishedAt] = useState("");
    const [authorId, setAuthorId] = useState<number | "">("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [placements, setPlacements] = useState<Record<PlacementKey, boolean>>({
        isFeaturedMain: false, isPickOfWeek: false, isPreview: false,
        isGrid: true, isAuthorPreview: false, isAuthorList: false, isHomeVisible: false,
    });
   const [sections, setSections] = useState<any[]>([]);
    const [gif, setGif] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const sensors = useSensors(useSensor(PointerSensor));
    const load = async () => {
        setLoading(true);
        try {
            const [blogsData, authorsData, catsData] = await Promise.all([
                apiFetch("/blog"), apiFetch("/blog/authors"), apiFetch("/blog/categories"),
            ]);
            console.log("AUTHORS:", authorsData);
            console.log("CATS:", catsData);
            setBlogs(Array.isArray(blogsData) ? blogsData : []);
            setAuthors(Array.isArray(authorsData) ? authorsData : []);
            setCategories(Array.isArray(catsData) ? catsData : []);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (editItem) {
            setSchemaText(editItem.schema?.[activeLang] ? JSON.stringify(editItem.schema[activeLang], null, 2) : "");
            setSchemaError(null);
        }
    }, [activeLang]);

    const resetForm = () => {
        setTitle({ az: "", en: "", ru: "" }); setSlug("");
        setBadge({ az: "", en: "", ru: "" }); setExcerpt({ az: "", en: "", ru: "" });
        setCoverImage({ az: "", en: "", ru: "" }); setCoverImageAlt({ az: "", en: "", ru: "" });
        setSeoTitle({ az: "", en: "", ru: "" });
        setSeoDescription({ az: "", en: "", ru: "" });
        setSeoKeywords({ az: "", en: "", ru: "" });
        setPublishedAt(""); setAuthorId(""); setCategoryId("");
        setPlacements({ isFeaturedMain: false, isPickOfWeek: false, isPreview: false, isGrid: true, isAuthorPreview: false, isAuthorList: false, isHomeVisible: false });
        setGif("");
        setSections([]);
        setSchemaText("");
    };

    const openCreate = () => { setEditItem(null); resetForm(); setActiveLang("az"); setDrawerOpen(true); };

    const openEdit = (b: any) => {
        setEditItem(b); setActiveLang("az");
        setTitle(typeof b.title === "object" ? b.title : { az: b.title ?? "", en: "", ru: "" });
        setSlug(b.slug ?? "");
        setBadge(typeof b.badge === "object" ? b.badge : { az: b.badge ?? "", en: "", ru: "" });
        setExcerpt(typeof b.excerpt === "object" ? b.excerpt : { az: b.excerpt ?? "", en: "", ru: "" });
        setCoverImage(typeof b.coverImage === "object" ? b.coverImage : { az: b.coverImage ?? "", en: "", ru: "" });
        setCoverImageAlt(typeof b.coverImageAlt === "object" ? b.coverImageAlt : { az: b.coverImageAlt ?? "", en: "", ru: "" });
        setSeoTitle(b.seoTitle ?? { az: "", en: "", ru: "" });
        setSeoDescription(b.seoDescription ?? { az: "", en: "", ru: "" });
        setSeoKeywords(b.seoKeywords ?? { az: "", en: "", ru: "" });
        setPublishedAt(b.publishedAt ? b.publishedAt.slice(0, 10) : "");
        setAuthorId(b.authorId ?? ""); setCategoryId(b.categoryId ?? "");
        setPlacements({
            isFeaturedMain: b.isFeaturedMain ?? false, isPickOfWeek: b.isPickOfWeek ?? false,
            isPreview: b.isPreview ?? false, isGrid: b.isGrid ?? true,
            isAuthorPreview: b.isAuthorPreview ?? false, isAuthorList: b.isAuthorList ?? false,
            isHomeVisible: b.isHomeVisible ?? false,
        });
        setGif(b.gif ?? "");
        setSections(b.sections ?? []);
        setSchemaText(b.schema?.[activeLang] ? JSON.stringify(b.schema[activeLang], null, 2) : "");
        setDrawerOpen(true);
    };

    const closeDrawer = () => { setDrawerOpen(false); setEditItem(null); };

    const handleTitleChange = (val: LocalizedString) => {
        setTitle(val);
        if (activeLang === "az") setSlug(generateSlug(val.az || ""));
    };

    const handlePlacementToggle = async (key: PlacementKey) => {
        const newVal = !placements[key];
        const config = PLACEMENT_CONFIG.find(c => c.key === key);
        if (newVal && config?.max && config.max > 1) {
            const activeCount = blogs.filter(b => b[key] && b.id !== editItem?.id).length;
            if (activeCount >= config.max) { alert(`Maksimum ${config.max} blog aktiv ola bilər.`); return; }
        }
        setPlacements(prev => ({ ...prev, [key]: newVal }));
        if (key === "isAuthorList" && editItem) {
            try {
                await apiFetch(`/blog/${editItem.id}`, { method: "PUT", body: JSON.stringify({ isAuthorList: newVal, authorListPinnedAt: newVal ? new Date().toISOString() : null }) });
            } catch (e) { console.error(e); }
            return;
        }
        if (newVal && config?.max === 1) {
            const oldActive = blogs.find(b => b[key] && b.id !== editItem?.id);
            if (oldActive) {
                try {
                    await apiFetch(`/blog/${oldActive.id}`, { method: "PUT", body: JSON.stringify({ [key]: false }) });
                    setBlogs(prev => prev.map(b => b.id === oldActive.id ? { ...b, [key]: false } : b));
                } catch (e) { console.error(e); }
            }
        }
    };

    const addSection = (type: string) => setSections(prev => [...prev, { type, isVisible: true }]);
    const updateSection = (i: number, data: any) => setSections(prev => { const arr = [...prev]; arr[i] = data; return arr; });
    const removeSection = (i: number) => setSections(prev => prev.filter((_, idx) => idx !== i));

    const generateSchema = async () => {
        if (!editItem) return;
        setSchemaGenerating(true);
        setSchemaError(null);
        try {
            const generated = await apiFetch(`/blog/${editItem.id}/schema/preview`);
            setSchemaText(JSON.stringify(generated[activeLang], null, 2));
        } catch {
            setSchemaError("Schema yaradılarkən xəta baş verdi");
        } finally {
            setSchemaGenerating(false);
        }
    };

    const handleSchemaChange = (val: string) => {
        setSchemaText(val);
        setSchemaError(null);
        try {
            if (val.trim()) JSON.parse(val);
        } catch {
            setSchemaError("JSON formatı səhvdir");
        }
    };

    const saveSchema = async () => {
        if (!editItem || schemaError) return;
        setSchemaSaving(true);
        setSchemaSaveStatus("idle");
        try {
            let parsed = null;
            if (schemaText.trim()) parsed = JSON.parse(schemaText);
            const current = editItem.schema ?? {};
            const updatedSchema = { ...current, [activeLang]: parsed };
            await apiFetch(`/blog/${editItem.id}/schema`, {
                method: "PATCH",
                body: JSON.stringify({ schema: updatedSchema }),
            });
            setEditItem((prev: any) => ({ ...prev, schema: updatedSchema }));
            setSchemaSaveStatus("success");
        } catch {
            setSchemaSaveStatus("error");
        } finally {
            setSchemaSaving(false);
            setTimeout(() => setSchemaSaveStatus("idle"), 3000);
        }
    };


    const save = async () => {
        if (!title.az || !slug) return;
        setSaving(true);
        try {
            const payload = {
                title, slug, badge, excerpt, coverImage, coverImageAlt,
                publishedAt: publishedAt || null,
                authorId: authorId ? Number(authorId) : null,
                categoryId: categoryId ? Number(categoryId) : null,
                ...placements, sections,
                gif: gif || null,
                seoTitle, seoDescription, seoKeywords,
            };
            if (editItem) await apiFetch(`/blog/${editItem.id}`, { method: "PUT", body: JSON.stringify(payload) });
            else await apiFetch("/blog", { method: "POST", body: JSON.stringify(payload) });
            closeDrawer(); load();
        } finally { setSaving(false); }
    };

    const toggleVisibility = async (b: any) => {
        await apiFetch(`/blog/${b.id}/visibility`, { method: "PATCH", body: JSON.stringify({ isVisible: !b.isVisible }) });
        load();
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
        setBlogs(newList); setReordering(true);
        try {
            await apiFetch("/blog/reorder", { method: "PATCH", body: JSON.stringify({ ids: newList.map(b => b.id) }) });
        } finally { setReordering(false); }
    };

   const usedTypes = sections.map(s => s.type);

    const normalize = (s: string) =>
        s.toLowerCase()
            .replace(/ə/g, "e").replace(/ğ/g, "g").replace(/ı/g, "i")
            .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c");

    const filteredBlogs = blogs.filter(b => {
        if (!searchQuery.trim()) return true;
        const q = normalize(searchQuery);
        const titleAz = normalize((typeof b.title === "object" ? (b.title?.az || "") : (b.title || "")).replace(/<[^>]*>/g, ""));
        const badgeAz = normalize(typeof b.badge === "object" ? (b.badge?.az || "") : (b.badge || ""));
        const slugVal = normalize(b.slug || "");
        return titleAz.includes(q) || badgeAz.includes(q) || slugVal.includes(q);
    });

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Blog</h1>
                    <p className={styles.subtitle}>Blog məzmununu idarə edin</p>
                </div>
            </div>

            <div className={styles.tabs}>
                {(["blogs", "categories", "settings"] as const).map(tab => (
                    <button key={tab} className={activeTab === tab ? styles.tabActive : styles.tabInactive}
                        onClick={() => setActiveTab(tab)}>
                        {tab === "blogs" ? "Bloglar" : tab === "categories" ? "Kateqoriyalar" : "Parametrlər"}
                    </button>
                ))}
            </div>

            {activeTab === "categories" && <CategoriesTab />}
            {activeTab === "settings" && <SettingsTab />}

          {activeTab === "blogs" && (
                <>
                    <div className={styles.tabHeader}>
                        <input
                            className={styles.input}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Başlıq, badge və ya slug-a görə axtar..."
                            style={{ maxWidth: 320 }}
                        />
                        <div className={styles.headerRight}>
                            {reordering && <span className={styles.reorderingText}>Saxlanır...</span>}
                            <button className={styles.addBtn} onClick={openCreate}>+ Yeni Blog</button>
                        </div>
                    </div>
                    <div className={styles.tableWrap}>
                        {loading ? (
                            <div className={styles.empty}>Yüklənir...</div>
                        ) : blogs.length === 0 ? (
                            <div className={styles.empty}>Hələ blog yoxdur</div>
                        ) : filteredBlogs.length === 0 ? (
                            <div className={styles.empty}>Axtarışa uyğun nəticə tapılmadı</div>
                        ) : searchQuery.trim() ? (
                            <table className={styles.table}>
                                <thead><tr><th></th><th>Blog</th><th>Badge</th><th>Placement</th><th>Status</th><th>Əməliyyatlar</th></tr></thead>
                                <tbody>
                                    {filteredBlogs.map(b => (
                                        <SortableBlogRow key={b.id} b={b} onEdit={openEdit} onToggle={toggleVisibility} onDelete={setDeleteId} />
                                    ))}
                                </tbody>
                            </table>
                        ) : (
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

            {drawerOpen && (
                <div className={styles.fullDrawer}>
                    <div className={styles.fullDrawerHeader}>
                        <h2>{editItem ? "Blog Düzəlt" : "Yeni Blog"}</h2>
                        <div className={styles.fullDrawerHeaderRight}>
                            <button className={styles.cancelBtn} onClick={closeDrawer}>Ləğv et</button>
                            <button className={styles.saveBtn} onClick={save} disabled={saving}>{saving ? "Saxlanır..." : "Saxla"}</button>
                        </div>
                    </div>
                    <div className={styles.fullDrawerBody}>
                        <LangTabs active={activeLang} onChange={setActiveLang} />
                        <div className={styles.fullDrawerSection}>
                            <h3 className={styles.drawerSectionTitle}>Əsas Məlumatlar</h3>
                            <div className={styles.field}>
                                <label>Başlıq * ({activeLang.toUpperCase()})</label>
                                <LocalizedRichEditor value={title} lang={activeLang} onChange={handleTitleChange} />
                            </div>
                            <div className={styles.twoCol}>
                                <div className={styles.field}><label>Slug</label>
                                    <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label>Badge ({activeLang.toUpperCase()})</label>
                                    <input className={styles.input} value={badge[activeLang] || ""}
                                        onChange={e => setBadge(prev => ({ ...prev, [activeLang]: e.target.value }))} placeholder="Design" />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label>Qısa təsvir ({activeLang.toUpperCase()})</label>
                                <LocalizedRichEditor value={excerpt} lang={activeLang} onChange={setExcerpt} />
                            </div>
                            <LocalizedImageUpload value={coverImage} lang={activeLang} onChange={setCoverImage} label="Cover şəkil" />
                            <div className={styles.field}>
                                <label>Cover şəkil alt mətn ({activeLang.toUpperCase()})</label>
                                <input className={styles.input} value={coverImageAlt[activeLang] || ""}
                                    onChange={e => setCoverImageAlt(prev => ({ ...prev, [activeLang]: e.target.value }))} />
                            </div>
                            <SingleImageUpload
                                label="GIF (optional)"
                                value={gif}
                                onChange={setGif}
                                 accept="image/gif,image/webp,video/mp4"
                            />
                            <div className={styles.twoCol}>
                                <div className={styles.field}><label>Author</label>
                                    <select className={styles.input} value={authorId} onChange={e => setAuthorId(Number(e.target.value))}>
                                        <option value="">Seçin...</option>
                                        {authors.map(a => {
                                            const nameAz = typeof a.name === "object" ? (a.name?.az || "") : (a.name || "");
                                            return <option key={a.id} value={a.id}>{nameAz}</option>;
                                        })}
                                    </select>
                                </div>
                                <div className={styles.field}><label>Kateqoriya</label>
                                    <select className={styles.input} value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
                                        <option value="">Seçin...</option>
                                        {categories.map(c => {
                                            const labelAz = typeof c.label === "object" ? (c.label?.az || "") : (c.label || "");
                                            return <option key={c.id} value={c.id}>{labelAz}</option>;
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.twoCol}>
                                <div className={styles.field}><label>Yayımlanma tarixi</label>
                                    <input type="date" className={styles.input} value={publishedAt} onChange={e => setPublishedAt(e.target.value)} />
                                </div>

                            </div>
                        </div>
                        <div className={styles.fullDrawerSection}>
                            <h3 className={styles.drawerSectionTitle}>Placement</h3>
                            <p className={styles.placementInfo}>Blogun saytda harada görünəcəyini seçin</p>
                            <div className={styles.placementGrid}>
                                {PLACEMENT_CONFIG.map((config) => {
                                    const val = placements[config.key];
                                    const activeCount = config.max !== null ? blogs.filter(b => b[config.key] && b.id !== editItem?.id).length : null;
                                    return (
                                        <div key={config.key} className={styles.placementCard}>
                                            <div className={styles.placementCardTop}>
                                                <button type="button"
                                                    className={val ? styles.activeToggle : styles.inactiveToggle}
                                                    onClick={() => handlePlacementToggle(config.key)}>
                                                    {val ? "Aktiv" : "Deaktiv"}
                                                </button>
                                            </div>
                                            <p className={styles.placementDesc}>{config.desc}</p>
                                            {activeCount !== null && (
                                                <p className={styles.placementCount}>Hal-hazırda aktiv: <strong>{activeCount}</strong> / {config.max}</p>
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
                                    onChange={data => updateSection(i, data)}
                                    onRemove={() => removeSection(i)}
                                    activeLang={activeLang}
                                />
                            ))}
                            <div className={styles.addSectionRow}>
                                {SECTION_TYPES.filter(({ type }) => !usedTypes.includes(type)).map(({ type, label }) => (
                                    <button key={type} type="button" className={styles.addSectionBtn} onClick={() => addSection(type)}>
                                        + {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={styles.fullDrawerSection}>
                            <h3 className={styles.drawerSectionTitle}>SEO</h3>
                            <div className={styles.field}>
                                <label>SEO Title ({activeLang.toUpperCase()})</label>
                                <input
                                    className={styles.input}
                                    value={seoTitle[activeLang] || ""}
                                    onChange={e => setSeoTitle(prev => ({ ...prev, [activeLang]: e.target.value }))}
                                    placeholder={`SEO başlığı (${activeLang})`}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>SEO Description ({activeLang.toUpperCase()})</label>
                                <textarea
                                    className={styles.input}
                                    rows={3}
                                    value={seoDescription[activeLang] || ""}
                                    onChange={e => setSeoDescription(prev => ({ ...prev, [activeLang]: e.target.value }))}
                                    placeholder={`Qısa açıqlama (${activeLang})`}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>SEO Keywords ({activeLang.toUpperCase()})</label>
                                <input
                                    className={styles.input}
                                    value={seoKeywords[activeLang] || ""}
                                    onChange={e => setSeoKeywords(prev => ({ ...prev, [activeLang]: e.target.value }))}
                                    placeholder={`açar söz 1, açar söz 2 (${activeLang})`}
                                />
                            </div>
                            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                                ℹ Article section-larındakı hashtaglar avtomatik keyword-lərə əlavə olunacaq
                            </p>
                         
                        {editItem && (
                                <div className={styles.fullDrawerSection}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                        <h3 className={styles.drawerSectionTitle} style={{ marginBottom: 0 }}>
                                            JSON-LD Schema ({activeLang.toUpperCase()})
                                        </h3>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button type="button" onClick={generateSchema} disabled={schemaGenerating}
                                                style={{ padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "1.5px solid #3b82f6", background: "#1e3a5f", color: "#fff", cursor: "pointer" }}>
                                                {schemaGenerating ? "Yaradılır..." : "⚡ Generate Et"}
                                            </button>
                                            <button type="button" onClick={saveSchema} disabled={schemaSaving || !!schemaError}
                                                style={{ padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "1.5px solid #16a34a", background: "#14532d", color: "#fff", cursor: "pointer" }}>
                                                {schemaSaving ? "Saxlanır..." : "Saxla"}
                                            </button>
                                        </div>
                                    </div>
                                    {schemaSaveStatus === "success" && <p style={{ color: "#16a34a", fontSize: 13, marginBottom: 8 }}>✓ Schema saxlanıldı</p>}
                                    {schemaSaveStatus === "error" && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 8 }}>✕ Xəta baş verdi</p>}
                                    <div className={styles.field}>
                                        <textarea
                                            className={styles.input}
                                            rows={14}
                                            value={schemaText}
                                            placeholder='{"@context": "https://schema.org", ...}'
                                            onChange={(e) => handleSchemaChange(e.target.value)}
                                            style={{ fontFamily: "monospace", fontSize: 12 }}
                                        />
                                    </div>
                                    {schemaError && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 4 }}>⚠ {schemaError}</p>}
                                </div>
                            )}
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