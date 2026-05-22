// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Underline from "@tiptap/extension-underline";
// import TiptapLink from "@tiptap/extension-link";
// import TiptapHeading from "@tiptap/extension-heading";
// import {
//   DndContext, closestCenter, PointerSensor,
//   useSensor, useSensors, DragEndEvent,
// } from "@dnd-kit/core";
// import {
//   SortableContext, verticalListSortingStrategy,
//   useSortable, arrayMove,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import styles from "@/styles/partners.module.css";

// interface Partner {
//   id: number;
//   image: string;
//   altText: string;
//   name: string;
//   isHomepage: boolean;
//   isVisible: boolean;
//   order: number;
// }

// interface Section {
//   id: number;
//   title: string;
//   description: string;
//   partners: Partner[];
// }

// const API = process.env.NEXT_PUBLIC_API_URL;

// function toAbsoluteUrl(path: string): string {
//   if (!path) return "";
//   if (path.startsWith("blob:") || path.startsWith("http")) return path;
//   return `${API}${path}`;
// }

// function getToken() {
//   return document.cookie.split("access_token=")[1]?.split(";")[0] ?? "";
// }

// async function apiFetch(path: string, options?: RequestInit) {
//   const res = await fetch(`${API}${path}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${getToken()}`,
//       ...options?.headers,
//     },
//   });
//   if (!res.ok) throw new Error("Xəta baş verdi");
//   return res.json();
// }

// // ─── Rich Editor (Tiptap) ─────────────────────────────────────────────────────
// function RichEditor({
//   value,
//   onChange,
//   placeholder,
// }: {
//   value: string;
//   onChange: (html: string) => void;
//   placeholder?: string;
// }) {
//   const [showLinkPopup, setShowLinkPopup] = useState(false);
//   const [linkUrl, setLinkUrl] = useState("");

//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Underline,
//       TiptapHeading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
//       TiptapLink.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } }),
//     ],
//     content: value,
//     onUpdate: ({ editor }) => onChange(editor.getHTML()),
//     editorProps: {
//       attributes: {
//         class: styles.richEditorContent ?? "",
//         "data-placeholder": placeholder ?? "Mətn daxil edin...",
//       },
//     },
//   });

//   const openLinkPopup = () => {
//     if (!editor) return;
//     if (editor.state.selection.empty) { alert("Əvvəlcə bir mətn seçin"); return; }
//     setLinkUrl(editor.getAttributes("link").href ?? "");
//     setShowLinkPopup(true);
//   };

//   const applyLink = () => {
//     if (editor && linkUrl.trim()) {
//       editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.trim() }).run();
//     }
//     setShowLinkPopup(false);
//   };

//   const removeLink = () => {
//     editor?.chain().focus().unsetLink().run();
//     setShowLinkPopup(false);
//   };

//   return (
//     <div className={styles.richEditorWrap}>
//       <div className={styles.richToolbar}>
//         <button type="button" title="Qalın"
//           className={editor?.isActive("bold") ? styles.toolbarBtnActive : styles.toolbarBtn}
//           onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBold().run(); }}>
//           <strong>B</strong>
//         </button>
//         <button type="button" title="İtalik"
//           className={editor?.isActive("italic") ? styles.toolbarBtnActive : styles.toolbarBtn}
//           onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run(); }}>
//           <em>I</em>
//         </button>
//         <div className={styles.toolbarDivider} />
//         {([1, 2, 3, 4, 5, 6] as const).map((level) => (
//           <button key={level} type="button" title={`H${level}`}
//             className={editor?.isActive("heading", { level }) ? styles.toolbarBtnActive : styles.toolbarBtn}
//             onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleHeading({ level }).run(); }}>
//             H{level}
//           </button>
//         ))}
//         <div className={styles.toolbarDivider} />
//         <button type="button" title="Link əlavə et"
//           className={editor?.isActive("link") ? styles.toolbarBtnActive : styles.toolbarBtn}
//           onMouseDown={(e) => { e.preventDefault(); openLinkPopup(); }}>
//           🔗
//         </button>
//       </div>

//       {showLinkPopup && (
//         <div className={styles.linkPopup}>
//           <input
//             className={styles.linkInput}
//             type="url"
//             placeholder="https://..."
//             value={linkUrl}
//             onChange={(e) => setLinkUrl(e.target.value)}
//             onKeyDown={(e) => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setShowLinkPopup(false); }}
//             autoFocus
//           />
//           <button type="button" className={styles.linkApplyBtn} onClick={applyLink}>Əlavə et</button>
//           <button type="button" className={styles.linkRemoveBtn} onClick={removeLink}>Sil</button>
//           <button type="button" className={styles.linkCancelBtn} onClick={() => setShowLinkPopup(false)}>✕</button>
//         </div>
//       )}

//       <EditorContent editor={editor} className={styles.richEditor} />
//     </div>
//   );
// }

// // ─── Sortable Row ─────────────────────────────────────────────────────────────
// function SortableRow({
//   p, index, onEdit, onToggleHomepage, onToggleVisibility, onDelete,
// }: {
//   p: Partner;
//   index: number;
//   onEdit: (p: Partner) => void;
//   onToggleHomepage: (p: Partner) => void;
//   onToggleVisibility: (p: Partner) => void;
//   onDelete: (id: number) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: p.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.5 : 1,
//     background: isDragging ? "#f0f7ff" : undefined,
//   };

//   return (
//     <tr ref={setNodeRef} style={style}>
//       <td className={styles.num}>
//         <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
//         {String(index + 1).padStart(2, "0")}
//       </td>
//       <td>
//         <div className={styles.authorCell}>
//           <img src={toAbsoluteUrl(p.image)} alt={p.altText || p.name} className={styles.avatar} />
//           <div>
//             <p className={styles.authorName} dangerouslySetInnerHTML={{ __html: p.name }} />
//             {p.altText && <p className={styles.authorRole}>{p.altText}</p>}
//           </div>
//         </div>
//       </td>
//       <td>
//         <div className={styles.badgeGroup}>
//           <span className={`${styles.badge} ${p.isHomepage ? styles.badgeVisible : styles.badgeHidden}`}>
//             {p.isHomepage ? "Ana səhifədə" : "Ana səhifədə yox"}
//           </span>
//           <span className={`${styles.badge} ${p.isVisible ? styles.badgeVisible : styles.badgeHidden}`}>
//             {p.isVisible ? "Görünür" : "Gizli"}
//           </span>
//         </div>
//       </td>
//       <td>
//         <div className={styles.actions}>
//           <button type="button" className={styles.editBtn} onClick={() => onEdit(p)}>Düzəlt</button>
//           <button type="button"
//             className={`${styles.visBtn} ${p.isHomepage ? styles.visBtnHide : styles.visBtnShow}`}
//             onClick={() => onToggleHomepage(p)}
//           >
//             {p.isHomepage ? "Ana səhifədən çıxar" : "Ana səhifəyə əlavə et"}
//           </button>
//           <button
//            type="button" className={`${styles.visBtn} ${p.isVisible ? styles.visBtnHide : styles.visBtnShow}`}
//             onClick={() => onToggleVisibility(p)}
//           >
//             {p.isVisible ? "Gizlət" : "Göstər"}
//           </button>
//           <button type="button" className={styles.deleteBtn} onClick={() => onDelete(p.id)}>Sil</button>
//         </div>
//       </td>
//     </tr>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function PartnersPage() {
//   const [section, setSection] = useState<Section | null>(null);
//   const [partners, setPartners] = useState<Partner[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [sectionTitle, setSectionTitle] = useState("");
//   const [sectionDesc, setSectionDesc] = useState("");
//   const [sectionSaving, setSectionSaving] = useState(false);

//   const [modalOpen, setModalOpen] = useState(false);
//   const [editItem, setEditItem] = useState<Partner | null>(null);
//   const [name, setName] = useState("");
//   const [altText, setAltText] = useState("");
//   const [image, setImage] = useState("");
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState("");
//   const [imageUploading, setImageUploading] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const [saving, setSaving] = useState(false);
//   const [deleteId, setDeleteId] = useState<number | null>(null);
//   const [reordering, setReordering] = useState(false);

//   const sensors = useSensors(useSensor(PointerSensor));

//   const load = async () => {
//     setLoading(true);
//     try {
//       const data: Section = await apiFetch("/partners");
//       if (data) {
//         setSection(data);
//         setSectionTitle(data.title);
//         setSectionDesc(data.description);
//         setPartners(data.partners);
//       }
//     } catch {
//       setSection(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, []);

//   const saveSection = async () => {
//     if (!sectionTitle.trim()) return;
//     setSectionSaving(true);
//     try {
//       const payload = { title: sectionTitle, description: sectionDesc };
//       if (section) {
//         await apiFetch(`/partners/section/${section.id}`, { method: "PUT", body: JSON.stringify(payload) });
//       } else {
//         await apiFetch("/partners/section", { method: "POST", body: JSON.stringify(payload) });
//       }
//       load();
//     } finally {
//       setSectionSaving(false);
//     }
//   };

//   const handleDragEnd = async (event: DragEndEvent) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;
//     const oldIndex = partners.findIndex((p) => p.id === active.id);
//     const newIndex = partners.findIndex((p) => p.id === over.id);
//     const newList = arrayMove(partners, oldIndex, newIndex);
//     setPartners(newList);
//     setReordering(true);
//     try {
//       await apiFetch("/partners/reorder", { method: "PATCH", body: JSON.stringify({ ids: newList.map((p) => p.id) }) });
//     } finally {
//       setReordering(false);
//     }
//   };

//   const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.type !== "image/webp") {
//       alert("Yalnız WebP formatında şəkil qəbul edilir (.webp)");
//       if (fileInputRef.current) fileInputRef.current.value = "";
//       return;
//     }
//     setImageFile(file);
//     setImagePreview(URL.createObjectURL(file));
//   };

//   const uploadImageIfNeeded = async (): Promise<string> => {
//     if (!imageFile) return image;
//     setImageUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", imageFile);
//       const res = await fetch(`${API}/partners/upload`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${getToken()}` },
//         body: formData,
//       });
//       if (!res.ok) throw new Error("Şəkil yükləmə uğursuz oldu");
//       const data = await res.json();
//       return data.url as string;
//     } finally {
//       setImageUploading(false);
//     }
//   };

//   const resetImageState = () => {
//     setImageFile(null);
//     setImagePreview("");
//     setImage("");
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const openCreate = () => {
//     setEditItem(null);
//     setName("");
//     setAltText("");
//     resetImageState();
//     setModalOpen(true);
//   };

//   const openEdit = (p: Partner) => {
//     setEditItem(p);
//     setName(p.name);
//     setAltText(p.altText ?? "");
//     setImage(p.image);
//     setImageFile(null);
//     setImagePreview(p.image);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//     setModalOpen(true);
//   };

//   const closeModal = () => { setModalOpen(false); setEditItem(null); };

//   const savePartner = async () => {
//     setSaving(true);
//     try {
//       const imageUrl = await uploadImageIfNeeded();
//       if (editItem) {
//         await apiFetch(`/partners/${editItem.id}`, {
//           method: "PUT",
//           body: JSON.stringify({ name, altText, image: imageUrl }),
//         });
//       } else {
//         await apiFetch("/partners", {
//           method: "POST",
//           body: JSON.stringify({ name, altText, image: imageUrl, sectionId: section!.id }),
//         });
//       }
//       closeModal();
//       load();
//     } finally {
//       setSaving(false);
//     }
//   };

//   const toggleHomepage = async (p: Partner) => {
//     try {
//       await apiFetch(`/partners/${p.id}/homepage`, { method: "PATCH", body: JSON.stringify({ isHomepage: !p.isHomepage }) });
//       load();
//     } catch (e) { console.error(e); }
//   };

//   const toggleVisibility = async (p: Partner) => {
//     try {
//       await apiFetch(`/partners/${p.id}/visibility`, { method: "PATCH", body: JSON.stringify({ isVisible: !p.isVisible }) });
//       load();
//     } catch (e) { console.error(e); }
//   };

//   const handleDelete = async () => {
//     if (!deleteId) return;
//     await apiFetch(`/partners/${deleteId}`, { method: "DELETE" });
//     setDeleteId(null);
//     load();
//   };

//   if (loading) return <div className={styles.page}><div className={styles.empty}>Yüklənir...</div></div>;

//   return (
//     <div className={styles.page}>
//       <div className={styles.header}>
//         <div>
//           <h1 className={styles.title}>Partnyorlar</h1>
//           <p className={styles.subtitle}>Partnyorları idarə edin</p>
//         </div>
//         {section && (
//           <div className={styles.headerRight}>
//             {reordering && <span className={styles.reorderingText}>Saxlanır...</span>}
//             <button type="button" className={styles.addBtn} onClick={openCreate}>+ Yeni Partnyор</button>
//           </div>
//         )}
//       </div>

//       {/* ── Section məlumatları ── */}
//       <div className={styles.sectionCard}>
//         <h2 className={styles.sectionCardTitle}>Home Tərəfdaşlarımız</h2>
//         <div className={styles.sectionFields}>
//           <div className={styles.field}>
//             <label>Başlıq</label>
//             <input
//               className={styles.input}
//               value={sectionTitle}
//               onChange={(e) => setSectionTitle(e.target.value)}
//               placeholder="Tərəfdaşlarımız"
//             />
//           </div>
//           <div className={styles.field}>
//             <label>Təsvir <small>(mətni seçib 🔗 ilə link, H1–H6 ilə başlıq əlavə edə bilərsiniz)</small></label>
//             {!loading && (
//               <RichEditor
//                 value={sectionDesc}
//                 onChange={setSectionDesc}
//                 placeholder="Bölmə təsviri..."
//               />
//             )}
//           </div>
//         </div>
//         <div className={styles.sectionFooter}>
//           <button type="button" className={styles.saveBtn} onClick={saveSection} disabled={sectionSaving}>
//             {sectionSaving ? "Saxlanır..." : section ? "Yenilə" : "Yarat"}
//           </button>
//         </div>
//       </div>

//       {/* ── Partners cədvəli ── */}
//       {section && (
//         <div className={styles.tableWrap}>
//           {partners.length === 0 ? (
//             <div className={styles.empty}>Hələ partnyор əlavə edilməyib</div>
//           ) : (
//             <table className={styles.table}>
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Partnyор</th>
//                   <th>Status</th>
//                   <th>Əməliyyatlar</th>
//                 </tr>
//               </thead>
//               <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//                 <SortableContext items={partners.map((p) => p.id)} strategy={verticalListSortingStrategy}>
//                   <tbody>
//                     {partners.map((p, i) => (
//                       <SortableRow
//                         key={p.id}
//                         p={p}
//                         index={i}
//                         onEdit={openEdit}
//                         onToggleHomepage={toggleHomepage}
//                         onToggleVisibility={toggleVisibility}
//                         onDelete={setDeleteId}
//                       />
//                     ))}
//                   </tbody>
//                 </SortableContext>
//               </DndContext>
//             </table>
//           )}
//         </div>
//       )}

//       {/* ── Partner Modal ── */}
//       {modalOpen && (
//         <div className={styles.overlay} onClick={closeModal}>
//           <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
//             <div className={styles.modalHeader}>
//               <h2>{editItem ? "Partnyoru Düzəlt" : "Yeni Partnyор"}</h2>
//               <button type="button" className={styles.closeBtn} onClick={closeModal}>✕</button>
//             </div>
//             <div className={styles.modalBody}>
//               <div className={styles.field}>
//                 <label>Təsvir <small>(H1–H6, B, I, 🔗 dəstəklənir)</small></label>
//                 <RichEditor
//                   value={name}
//                   onChange={setName}
//                   placeholder="Partnyorun adı və ya təsviri..."
//                 />
//               </div>
//               <div className={styles.field}>
//                 <label>Şəkil</label>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/webp"
//                   style={{ display: "none" }}
//                   onChange={handleImageSelect}
//                 />
//                 <div className={styles.imageUploadArea} onClick={() => fileInputRef.current?.click()}>
//                   {imagePreview ? (
//                     <>
//                       <img src={toAbsoluteUrl(imagePreview)} alt="preview" className={styles.imagePreview} />
//                       <span className={styles.imageChangeHint}>Dəyişmək üçün klik et</span>
//                     </>
//                   ) : (
//                     <div className={styles.imagePlaceholder}>
//                       <span>🖼️</span>
//                       <span>Şəkil seçin</span>
//                       <small>WebP • maks 2MB</small>
//                     </div>
//                   )}
//                 </div>
//                 {imageUploading && <p className={styles.uploadingText}>Şəkil yüklənir...</p>}
//               </div>
//               <div className={styles.field}>
//                 <label>Şəkil Alt Text <small>(SEO)</small></label>
//                 <input
//                   className={styles.input}
//                   value={altText}
//                   onChange={(e) => setAltText(e.target.value)}
//                   placeholder="Məsələn: Kapital Bank logosu"
//                 />
//               </div>
//             </div>
//             <div className={styles.modalFooter}>
//               <button  type="button" className={styles.cancelBtn} onClick={closeModal}>Ləğv et</button>
//               <button type="button" className={styles.saveBtn} onClick={savePartner} disabled={saving || imageUploading}>
//                 {saving ? "Saxlanır..." : imageUploading ? "Şəkil yüklənir..." : "Saxla"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Silmə təsdiq modalı ── */}
//       {deleteId && (
//         <div className={styles.overlay} onClick={() => setDeleteId(null)}>
//           <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
//             <div className={styles.modalHeader}>
//               <h2>Silməyi təsdiq edin</h2>
//               <button  type="button" className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button>
//             </div>
//             <div className={styles.modalBody}>
//               <p>Bu partnyoru silmək istədiyinizə əminsiniz?</p>
//             </div>
//             <div className={styles.modalFooter}>
//               <button  type="button" className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Ləğv et</button>
//               <button  type="button" className={styles.deleteConfirmBtn} onClick={handleDelete}>Sil</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// } 
















































































"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TiptapLink from "@tiptap/extension-link";
import TiptapHeading from "@tiptap/extension-heading";
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/partners.module.css";

interface Partner {
  id: number;
  image: string;
  altText: string;
  name: string;
  isHomepage: boolean;
  isVisible: boolean;
  order: number;
}

interface Section {
  id: number;
  title: string;
  description: string;
  partners: Partner[];
}

const API = process.env.NEXT_PUBLIC_API_URL;

function toAbsoluteUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("blob:") || path.startsWith("http")) return path;
  return `${API}${path}`;
}

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
  return res.json();
}

// ─── Rich Editor (Tiptap) ─────────────────────────────────────────────────────
function RichEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: "editor-p",
          },
        },
      }),
      Underline,
      TiptapHeading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      TiptapLink.configure({ 
        openOnClick: false, 
        HTMLAttributes: { 
          rel: "noopener noreferrer" 
        } 
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      let html = editor.getHTML();
      html = html.replace(/<p>\s*(<h[1-6]>.*?<\/h[1-6]>)\s*<\/p>/gi, "$1");
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: styles.richEditorContent ?? "",
        "data-placeholder": placeholder ?? "Mətn daxil edin...",
      },
    },
  });

  const openLinkPopup = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editor) return;
    if (editor.state.selection.empty) { alert("Əvvəlcə bir mətn seçin"); return; }
    
    const attrs = editor.getAttributes("link");
    setLinkUrl(attrs.href ?? "");
    setOpenInNewTab(attrs.target === "_blank" || !attrs.href);
    setShowLinkPopup(true);
  };

  const applyLink = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (editor && linkUrl.trim()) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ 
          href: linkUrl.trim(), 
          target: openInNewTab ? "_blank" : "_self" 
        })
        .run();
    }
    setShowLinkPopup(false);
  };

  const removeLink = (e: React.MouseEvent) => {
    e.preventDefault();
    editor?.chain().focus().unsetLink().run();
    setShowLinkPopup(false);
  };

  return (
    <div className={styles.richEditorWrap}>
      <div className={styles.richToolbar}>
        <button type="button" title="Qalın"
          className={editor?.isActive("bold") ? styles.toolbarBtnActive : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBold().run(); }}>
          <strong>B</strong>
        </button>
        <button type="button" title="İtalik"
          className={editor?.isActive("italic") ? styles.toolbarBtnActive : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run(); }}>
          <em>I</em>
        </button>
        <div className={styles.toolbarDivider} />
        {([1, 2, 3, 4, 5, 6] as const).map((level) => (
          <button key={level} type="button" title={`H${level}`}
            className={editor?.isActive("heading", { level }) ? styles.toolbarBtnActive : styles.toolbarBtn}
            onMouseDown={(e) => { 
              e.preventDefault(); 
              if (editor?.isActive("heading", { level })) {
                editor?.chain().focus().setParagraph().run();
              } else {
                editor?.chain().focus().toggleHeading({ level }).run();
              }
            }}>
            H{level}
          </button>
        ))}
        <div className={styles.toolbarDivider} />
        <button type="button" title="Link əlavə et"
          className={editor?.isActive("link") ? styles.toolbarBtnActive : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); openLinkPopup(e); }}>
          🔗
        </button>
      </div>

      {showLinkPopup && (
        <div className={styles.linkPopup} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
          <input
            className={styles.linkInput}
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setShowLinkPopup(false); }}
            autoFocus
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
            <input 
              type="checkbox" 
              checked={openInNewTab} 
              onChange={(e) => setOpenInNewTab(e.target.checked)}
            />
            Yeni tabda açılsın (_blank)
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button type="button" className={styles.linkApplyBtn} onClick={(e) => applyLink(e)}>Əlavə et</button>
            <button type="button" className={styles.linkRemoveBtn} onClick={removeLink}>Sil</button>
            <button type="button" className={styles.linkCancelBtn} onClick={(e) => { e.preventDefault(); setShowLinkPopup(false); }}>✕</button>
          </div>
        </div>
      )}

      <EditorContent editor={editor} className={styles.richEditor} />
    </div>
  );
}

// ─── Sortable Row ─────────────────────────────────────────────────────────────
function SortableRow({
  p, index, onEdit, onToggleHomepage, onToggleVisibility, onDelete,
}: {
  p: Partner;
  index: number;
  onEdit: (p: Partner) => void;
  onToggleHomepage: (p: Partner) => void;
  onToggleVisibility: (p: Partner) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: p.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "#f0f7ff" : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className={styles.num}>
        <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
        {String(index + 1).padStart(2, "0")}
      </td>
      <td>
        <div className={styles.authorCell}>
          <img src={toAbsoluteUrl(p.image)} alt={p.altText || p.name} className={styles.avatar} />
          <div>
            {/* YENİLİK: data-admin-preview vasitəsilə daxili CSS qaydası tətbiq etdik.
              Bununla brauzerin H1-H6 teqlərinə verdiyi nəhəng ölçülər cədvəl daxilində sıfırlanır,
              mətn düz xətt üzrə səliqəli şəkildə CSS-dəki öz sabit ölçüsünü götürür.
            */}
            <div className={styles.authorName} data-admin-preview="true">
              <style dangerouslySetInnerHTML={{__html: `
                [data-admin-preview="true"] h1, [data-admin-preview="true"] h2, 
                [data-admin-preview="true"] h3, [data-admin-preview="true"] h4, 
                [data-admin-preview="true"] h5, [data-admin-preview="true"] h6,
                [data-admin-preview="true"] p {
                  font-size: inherit !important;
                  font-weight: inherit !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  display: inline !important;
                }
              `}}/>
              <span dangerouslySetInnerHTML={{ __html: p.name }} />
            </div>
            {p.altText && <p className={styles.authorRole}>{p.altText}</p>}
          </div>
        </div>
      </td>
      <td>
        <div className={styles.badgeGroup}>
          <span className={`${styles.badge} ${p.isHomepage ? styles.badgeVisible : styles.badgeHidden}`}>
            {p.isHomepage ? "Ana səhifədə" : "Ana səhifədə yox"}
          </span>
          <span className={`${styles.badge} ${p.isVisible ? styles.badgeVisible : styles.badgeHidden}`}>
            {p.isVisible ? "Görünür" : "Gizli"}
          </span>
        </div>
      </td>
      <td>
        <div className={styles.actions}>
          <button type="button" className={styles.editBtn} onClick={(e) => { e.preventDefault(); onEdit(p); }}>Düzəlt</button>
          <button type="button"
            className={`${styles.visBtn} ${p.isHomepage ? styles.visBtnHide : styles.visBtnShow}`}
            onClick={(e) => { e.preventDefault(); onToggleHomepage(p); }}
          >
            {p.isHomepage ? "Ana səhifən çıxar" : "Ana səhifəyə əlavə et"}
          </button>
          <button
           type="button" className={`${styles.visBtn} ${p.isVisible ? styles.visBtnHide : styles.visBtnShow}`}
            onClick={(e) => { e.preventDefault(); onToggleVisibility(p); }}
          >
            {p.isVisible ? "Gizlət" : "Göstər"}
          </button>
          <button type="button" className={styles.deleteBtn} onClick={(e) => { e.preventDefault(); onDelete(p.id); }}>Sil</button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PartnersPage() {
  const [section, setSection] = useState<Section | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDesc, setSectionDesc] = useState("");
  const [sectionSaving, setSectionSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partner | null>(null);
  const [name, setName] = useState("");
  const [altText, setAltText] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

  // YENİLİK: Sürüşdürmə zamanı klikləmə hərəkətlərinin və scroll-un yuxarı qaçmasının
  // qarşısını almaq üçün activationConstraint (8px hərəkət limiti) əlavə olundu.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // YENİLİK: isSilent parametri əlavə edildi. 
  // Səhifə daxilindəki gizlət/göstər əməliyyatlarında bütün komponentin sıfırlanıb scroll-un 
  // ən yuxarıya qaçmasının qarşısını alır (arxa fonda sakit yeniləmə edir).
  const load = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data: Section = await apiFetch("/partners");
      if (data) {
        setSection(data);
        setSectionTitle(data.title);
        setSectionDesc(data.description);
        setPartners(data.partners);
      }
    } catch {
      setSection(null);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveSection = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;
    setSectionSaving(true);
    try {
      const payload = { title: sectionTitle, description: sectionDesc };
      if (section) {
        await apiFetch(`/partners/section/${section.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/partners/section", { method: "POST", body: JSON.stringify(payload) });
      }
      load(true); // Sakit yeniləmə
    } finally {
      setSectionSaving(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = partners.findIndex((p) => p.id === active.id);
    const newIndex = partners.findIndex((p) => p.id === over.id);
    const newList = arrayMove(partners, oldIndex, newIndex);
    setPartners(newList);
    setReordering(true);
    try {
      await apiFetch("/partners/reorder", { method: "PATCH", body: JSON.stringify({ ids: newList.map((p) => p.id) }) });
    } finally {
      setReordering(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/webp") {
      alert("Yalnız WebP formatında şəkil qəbul edilir (.webp)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImageIfNeeded = async (): Promise<string> => {
    if (!imageFile) return image;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      const res = await fetch(`${API}/partners/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Şəkil yükləmə uğursuz oldu");
      const data = await res.json();
      return data.url as string;
    } finally {
      setImageUploading(false);
    }
  };

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview("");
    setImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreate = (e: React.MouseEvent) => {
    e.preventDefault();
    setEditItem(null);
    setName("");
    setAltText("");
    resetImageState();
    setModalOpen(true);
  };

  const openEdit = (p: Partner) => {
    setEditItem(p);
    setName(p.name);
    setAltText(p.altText ?? "");
    setImage(p.image);
    setImageFile(null);
    setImagePreview(p.image);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalOpen(true);
  };

  const closeModal = (e?: React.MouseEvent) => { 
    if (e) e.preventDefault();
    setModalOpen(false); 
    setEditItem(null); 
  };

  const savePartner = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const imageUrl = await uploadImageIfNeeded();
      if (editItem) {
        await apiFetch(`/partners/${editItem.id}`, {
          method: "PUT",
          body: JSON.stringify({ name, altText, image: imageUrl }),
        });
      } else {
        await apiFetch("/partners", {
          method: "POST",
          body: JSON.stringify({ name, altText, image: imageUrl, sectionId: section!.id }),
        });
      }
      closeModal();
      load(true); // Sakit yeniləmə
    } finally {
      setSaving(false);
    }
  };

  const toggleHomepage = async (p: Partner) => {
    try {
      await apiFetch(`/partners/${p.id}/homepage`, { method: "PATCH", body: JSON.stringify({ isHomepage: !p.isHomepage }) });
      load(true); // YENİLİK: load(true) ilə scroll-un yuxarı qaçması tamamilə bloklandı
    } catch (e) { console.error(e); }
  };

  const toggleVisibility = async (p: Partner) => {
    try {
      await apiFetch(`/partners/${p.id}/visibility`, { method: "PATCH", body: JSON.stringify({ isVisible: !p.isVisible }) });
      load(true); // YENİLİK: load(true) ilə scroll-un yuxarı qaçması tamamilə bloklandı
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!deleteId) return;
    await apiFetch(`/partners/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    load(true); // Sakit yeniləmə
  };

  if (loading) return <div className={styles.page}><div className={styles.empty}>Yüklənir...</div></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Partnyorlar</h1>
          <p className={styles.subtitle}>Partnyorları idarə edin</p>
        </div>
        {section && (
          <div className={styles.headerRight}>
            {reordering && <span className={styles.reorderingText}>Saxlanır...</span>}
            <button type="button" className={styles.addBtn} onClick={openCreate}>+ Yeni Partnyор</button>
          </div>
        )}
      </div>

      {/* ── Section məlumatları ── */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionCardTitle}>Home Tərəfdaşlarımız</h2>
        <div className={styles.sectionFields}>
          <div className={styles.field}>
            <label>Başlıq</label>
            <input
              className={styles.input}
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Tərəfdaşlarımız"
            />
          </div>
          <div className={styles.field}>
            <label>Təsvir <small>(mətni seçib 🔗 ilə link, H1–H6 ilə başlıq əlavə edə bilərsiniz)</small></label>
            {!loading && (
              <RichEditor
                value={sectionDesc}
                onChange={setSectionDesc}
                placeholder="Bölmə təsviri..."
              />
            )}
          </div>
        </div>
        <div className={styles.sectionFooter}>
          <button type="button" className={styles.saveBtn} onClick={saveSection} disabled={sectionSaving}>
            {sectionSaving ? "Saxlanır..." : section ? "Yenilə" : "Yarat"}
          </button>
        </div>
      </div>

      {/* ── Partners cədvəli ── */}
      {section && (
        <div className={styles.tableWrap}>
          {partners.length === 0 ? (
            <div className={styles.empty}>Hələ partnyор əlavə edilməyib</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Partnyор</th>
                  <th>Status</th>
                  <th>Əməliyyatlar</th>
                </tr>
              </thead>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={partners.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  <tbody>
                    {partners.map((p, i) => (
                      <SortableRow
                        key={p.id}
                        p={p}
                        index={i}
                        onEdit={openEdit}
                        onToggleHomepage={toggleHomepage}
                        onToggleVisibility={toggleVisibility}
                        onDelete={setDeleteId}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          )}
        </div>
      )}

      {/* ── Partner Modal ── */}
      {modalOpen && (
        <div className={styles.overlay} onClick={() => closeModal()}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editItem ? "Partnyoru Düzəlt" : "Yeni Partnyор"}</h2>
              <button type="button" className={styles.closeBtn} onClick={() => closeModal()}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>Təsvir <small>(H1–H6, B, I, 🔗 dəstəklənir)</small></label>
                <RichEditor
                  value={name}
                  onChange={setName}
                  placeholder="Partnyorun adı və ya təsviri..."
                />
              </div>
              <div className={styles.field}>
                <label>Şəkil</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/webp"
                  style={{ display: "none" }}
                  onChange={handleImageSelect}
                />
                <div className={styles.imageUploadArea} onClick={() => fileInputRef.current?.click()}>
                  {imagePreview ? (
                    <>
                      <img src={toAbsoluteUrl(imagePreview)} alt="preview" className={styles.imagePreview} />
                      <span className={styles.imageChangeHint}>Dəyişmək üçün klik et</span>
                    </>
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>🖼️</span>
                      <span>Şəkil seçin</span>
                      <small>WebP • maks 2MB</small>
                    </div>
                  )}
                </div>
                {imageUploading && <p className={styles.uploadingText}>Şəkil yüklənir...</p>}
              </div>
              <div className={styles.field}>
                <label>Şəkil Alt Text <small>(SEO)</small></label>
                <input
                  className={styles.input}
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Məsələn: Kapital Bank logosu"
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelBtn} onClick={() => closeModal()}>Ləğv et</button>
              <button type="button" className={styles.saveBtn} onClick={savePartner} disabled={saving || imageUploading}>
                {saving ? "Saxlanır..." : imageUploading ? "Şəkil yüklənir..." : "Saxla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Silmə təsdiq modalı ── */}
      {deleteId && (
        <div className={styles.overlay} onClick={() => setDeleteId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Silməyi təsdiq edin</h2>
              <button type="button" className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p>Bu partnyoru silmək istədiyinizə əminsiniz?</p>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Ləğv et</button>
              <button type="button" className={styles.deleteConfirmBtn} onClick={handleDelete}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}