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

type Lang = "az" | "en" | "ru";
type LocalizedString = Record<string, string>;

interface Partner {
  id: number;
  image: string;
  altText: LocalizedString;
  name: LocalizedString;
  isHomepage: boolean;
  isVisible: boolean;
  order: number;
}

interface Section {
  id: number;
  title: LocalizedString;
  description: LocalizedString;
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
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (Array.isArray(body?.message) ? body.message.join(", ") : body?.message) ??
      `Xəta baş verdi (${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

function lv(field: any): LocalizedString {
  if (typeof field === "object" && field !== null && !Array.isArray(field)) return field;
  return { az: field ?? "", en: "", ru: "" };
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

function RichEditor({ value, onChange, placeholder }: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ paragraph: { HTMLAttributes: { class: "editor-p" } } }),
      Underline,
      TiptapHeading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
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

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value]);

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
      editor.chain().focus().extendMarkRange("link")
        .setLink({ href: linkUrl.trim(), target: openInNewTab ? "_blank" : "_self" }).run();
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
        <button type="button"
          className={editor?.isActive("bold") ? styles.toolbarBtnActive : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBold().run(); }}>
          <strong>B</strong>
        </button>
        <button type="button"
          className={editor?.isActive("italic") ? styles.toolbarBtnActive : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run(); }}>
          <em>I</em>
        </button>
        <div className={styles.toolbarDivider} />
        {([1, 2, 3, 4, 5, 6] as const).map((level) => (
          <button key={level} type="button"
            className={editor?.isActive("heading", { level }) ? styles.toolbarBtnActive : styles.toolbarBtn}
            onMouseDown={(e) => {
              e.preventDefault();
              if (editor?.isActive("heading", { level })) editor?.chain().focus().setParagraph().run();
              else editor?.chain().focus().toggleHeading({ level }).run();
            }}>
            H{level}
          </button>
        ))}
        <div className={styles.toolbarDivider} />
        <button type="button"
          className={editor?.isActive("link") ? styles.toolbarBtnActive : styles.toolbarBtn}
          onMouseDown={(e) => { e.preventDefault(); openLinkPopup(e); }}>
          🔗
        </button>
      </div>

      {showLinkPopup && (
        <div className={styles.linkPopup} style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12 }}>
          <input className={styles.linkInput} type="url" placeholder="https://..."
            value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setShowLinkPopup(false); }}
            autoFocus />
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={openInNewTab} onChange={(e) => setOpenInNewTab(e.target.checked)} />
            Yeni tabda açılsın (_blank)
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" className={styles.linkApplyBtn} onClick={applyLink}>Əlavə et</button>
            <button type="button" className={styles.linkRemoveBtn} onClick={removeLink}>Sil</button>
            <button type="button" className={styles.linkCancelBtn}
              onClick={(e) => { e.preventDefault(); setShowLinkPopup(false); }}>✕</button>
          </div>
        </div>
      )}
      <EditorContent editor={editor} className={styles.richEditor} />
    </div>
  );
}

function LocalizedRichEditor({ value, lang, onChange, placeholder }: {
  value: LocalizedString; lang: Lang;
  onChange: (v: LocalizedString) => void; placeholder?: string;
}) {
  return (
    <RichEditor
      value={value?.[lang] || ""}
      onChange={(v) => onChange({ ...value, [lang]: v })}
      placeholder={placeholder}
    />
  );
}

function SortableRow({ p, index, onEdit, onToggleHomepage, onToggleVisibility, onDelete }: {
  p: Partner; index: number;
  onEdit: (p: Partner) => void;
  onToggleHomepage: (p: Partner) => void;
  onToggleVisibility: (p: Partner) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: p.id });

  const nameAz = lv(p.name).az || "";

  return (
    <tr ref={setNodeRef} style={{
      transform: CSS.Transform.toString(transform), transition,
      opacity: isDragging ? 0.5 : 1, background: isDragging ? "#f0f7ff" : undefined,
    }}>
      <td className={styles.num}>
        <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
        {String(index + 1).padStart(2, "0")}
      </td>
      <td>
        <div className={styles.authorCell}>
          <img src={toAbsoluteUrl(p.image)} alt={lv(p.altText).az || nameAz} className={styles.avatar} />
          <div>
            <div className={styles.authorName} data-admin-preview="true">
              <style dangerouslySetInnerHTML={{
                __html: `[data-admin-preview="true"] h1,[data-admin-preview="true"] h2,
                [data-admin-preview="true"] h3,[data-admin-preview="true"] h4,
                [data-admin-preview="true"] h5,[data-admin-preview="true"] h6,
                [data-admin-preview="true"] p{font-size:inherit!important;font-weight:inherit!important;margin:0!important;padding:0!important;display:inline!important;}`
              }} />
              <span dangerouslySetInnerHTML={{ __html: nameAz }} />
            </div>
            {lv(p.altText).az && <p className={styles.authorRole}>{lv(p.altText).az}</p>}
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
          <button type="button" className={styles.editBtn} onClick={() => onEdit(p)}>Düzəlt</button>
          <button type="button"
            className={`${styles.visBtn} ${p.isHomepage ? styles.visBtnHide : styles.visBtnShow}`}
            onClick={() => onToggleHomepage(p)}>
            {p.isHomepage ? "Ana səhifən çıxar" : "Ana səhifəyə əlavə et"}
          </button>
          <button type="button"
            className={`${styles.visBtn} ${p.isVisible ? styles.visBtnHide : styles.visBtnShow}`}
            onClick={() => onToggleVisibility(p)}>
            {p.isVisible ? "Gizlət" : "Göstər"}
          </button>
          <button type="button" className={styles.deleteBtn} onClick={() => onDelete(p.id)}>Sil</button>
        </div>
      </td>
    </tr>
  );
}

export default function PartnersPage() {
  const [section, setSection] = useState<Section | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<Lang>("az");

  const [sectionTitle, setSectionTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [sectionDesc, setSectionDesc] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [sectionSaving, setSectionSaving] = useState(false);
  const [sectionError, setSectionError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLang, setModalLang] = useState<Lang>("az");
  const [editItem, setEditItem] = useState<Partner | null>(null);
  const [name, setName] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [altText, setAltText] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const load = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data: Section = await apiFetch("/partners");
      if (data) {
        setSection(data);
        setSectionTitle(lv(data.title));
        setSectionDesc(lv(data.description));
        setPartners(data.partners);
        setListError(null);
      }
    } catch (err: any) {
      setSection(null);
      setListError(err.message ?? "Partnyorlar yüklənərkən xəta baş verdi");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const validateSection = (): string | null => {
    if (!sectionTitle.az?.trim()) return "Başlıq (AZ) boş ola bilməz";
    return null;
  };

  const saveSection = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSectionError(null);
    const validationError = validateSection();
    if (validationError) {
      setSectionError(validationError);
      return;
    }
    setSectionSaving(true);
    try {
      const payload = {
        title: sectionTitle,
        description: sectionDesc,
      };
      if (section) {
        await apiFetch(`/partners/section/${section.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/partners/section", { method: "POST", body: JSON.stringify(payload) });
      }
      load(true);
    } catch (err: any) {
      setSectionError(err.message ?? "Bölmə saxlanılarkən xəta baş verdi");
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
    setPartners(newList); setReordering(true);
    try {
      await apiFetch("/partners/reorder", { method: "PATCH", body: JSON.stringify({ ids: newList.map((p) => p.id) }) });
    } catch (err: any) {
      alert(err.message ?? "Sıralama saxlanılarkən xəta baş verdi");
      load(true);
    } finally { setReordering(false); }
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
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Şəkil yükləmə uğursuz oldu");
      }
      const data = await res.json();
      return data.url as string;
    } finally { setImageUploading(false); }
  };

  const resetImageState = () => {
    setImageFile(null); setImagePreview(""); setImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreate = (e: React.MouseEvent) => {
    e.preventDefault();
    setEditItem(null);
    setName({ az: "", en: "", ru: "" });
    setAltText({ az: "", en: "", ru: "" });
    resetImageState();
    setModalLang("az");
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (p: Partner) => {
    setEditItem(p);
    setName(lv(p.name));
    setAltText(lv(p.altText));
    setImage(p.image);
    setImageFile(null);
    setImagePreview(p.image);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalLang("az");
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditItem(null); setFormError(null); };

  const validatePartner = (): string | null => {
    if (!name.az?.trim() || name.az.trim() === "<p></p>") return "Ad / Təsvir (AZ) boş ola bilməz";
    if (!imageFile && !image) return "Şəkil seçilməlidir";
    return null;
  };

  const savePartner = async (e: React.MouseEvent) => {
    e.preventDefault();
    setFormError(null);
    const validationError = validatePartner();
    if (validationError) {
      setFormError(validationError);
      return;
    }
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
      load(true);
    } catch (err: any) {
      setFormError(err.message ?? "Partnyor saxlanılarkən xəta baş verdi");
    } finally { setSaving(false); }
  };

  const toggleHomepage = async (p: Partner) => {
    try {
      await apiFetch(`/partners/${p.id}/homepage`, { method: "PATCH", body: JSON.stringify({ isHomepage: !p.isHomepage }) });
      load(true);
    } catch (err: any) {
      alert(err.message ?? "Status dəyişdirilərkən xəta baş verdi");
    }
  };

  const toggleVisibility = async (p: Partner) => {
    try {
      await apiFetch(`/partners/${p.id}/visibility`, { method: "PATCH", body: JSON.stringify({ isVisible: !p.isVisible }) });
      load(true);
    } catch (err: any) {
      alert(err.message ?? "Status dəyişdirilərkən xəta baş verdi");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!deleteId) return;
    setDeleteError(null);
    try {
      await apiFetch(`/partners/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      load(true);
    } catch (err: any) {
      setDeleteError(err.message ?? "Silinərkən xəta baş verdi");
    }
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

      {listError && (
        <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
          ⚠ {listError}
        </p>
      )}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionCardTitle}>Home Tərəfdaşlarımız</h2>
        <LangTabs active={activeLang} onChange={setActiveLang} />
        <div className={styles.sectionFields}>
          <div className={styles.field}>
            <label>Başlıq ({activeLang.toUpperCase()})</label>
            <LocalizedRichEditor
              value={sectionTitle} lang={activeLang}
              onChange={setSectionTitle} placeholder="Tərəfdaşlarımız" />
          </div>
          <div className={styles.field}>
            <label>
              Təsvir ({activeLang.toUpperCase()})
              <small> (Dizaynda mavi hissə üçün seçib B-yə klik edin)</small>
            </label>
            <LocalizedRichEditor
              value={sectionDesc} lang={activeLang}
              onChange={setSectionDesc} placeholder="Bölmə təsviri..." />
          </div>

        </div>
        {sectionError && (
          <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 500, marginTop: 4 }}>
            ⚠ {sectionError}
          </p>
        )}
        <div className={styles.sectionFooter}>
          <button type="button" className={styles.saveBtn} onClick={saveSection} disabled={sectionSaving}>
            {sectionSaving ? "Saxlanır..." : section ? "Yenilə" : "Yarat"}
          </button>
        </div>
      </div>

      {section && (
        <div className={styles.tableWrap}>
          {partners.length === 0 ? (
            <div className={styles.empty}>Hələ partnyор əlavə edilməyib</div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <table className={styles.table}>
                <thead>
                  <tr><th>#</th><th>Partnyор</th><th>Status</th><th>Əməliyyatlar</th></tr>
                </thead>
                <SortableContext items={partners.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  <tbody>
                    {partners.map((p, i) => (
                      <SortableRow key={p.id} p={p} index={i}
                        onEdit={openEdit} onToggleHomepage={toggleHomepage}
                        onToggleVisibility={toggleVisibility} onDelete={setDeleteId} />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          )}
        </div>
      )}

      {modalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editItem ? "Partnyoru Düzəlt" : "Yeni Partnyор"}</h2>
              <button type="button" className={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <LangTabs active={modalLang} onChange={setModalLang} />

              {formError && (
                <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                  ⚠ {formError}
                </p>
              )}

              <div className={styles.field}>
                <label>Ad / Təsvir ({modalLang.toUpperCase()}) <small>(H1–H6, B, I, 🔗 dəstəklənir)</small></label>
                <LocalizedRichEditor
                  value={name} lang={modalLang} onChange={setName}
                  placeholder="Partnyorun adı və ya təsviri..." />
              </div>
              <div className={styles.field}>
                <label>Şəkil</label>
                <input ref={fileInputRef} type="file" accept="image/webp"
                  style={{ display: "none" }} onChange={handleImageSelect} />
                <div className={styles.imageUploadArea} onClick={() => fileInputRef.current?.click()}>
                  {imagePreview ? (
                    <>
                      <img src={toAbsoluteUrl(imagePreview)} alt="preview" className={styles.imagePreview} />
                      <span className={styles.imageChangeHint}>Dəyişmək üçün klik et</span>
                    </>
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>🖼️</span><span>Şəkil seçin</span><small>WebP • maks 2MB</small>
                    </div>
                  )}
                </div>
                {imageUploading && <p className={styles.uploadingText}>Şəkil yüklənir...</p>}
              </div>
              <div className={styles.field}>
                <label>Şəkil Alt Text ({modalLang.toUpperCase()}) <small>(SEO)</small></label>
                <input className={styles.input} value={altText[modalLang] || ""}
                  onChange={(e) => setAltText(prev => ({ ...prev, [modalLang]: e.target.value }))}
                  placeholder="Məsələn: Kapital Bank logosu" />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelBtn} onClick={closeModal}>Ləğv et</button>
              <button type="button" className={styles.saveBtn} onClick={savePartner}
                disabled={saving || imageUploading}>
                {saving ? "Saxlanır..." : imageUploading ? "Şəkil yüklənir..." : "Saxla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className={styles.overlay} onClick={() => { setDeleteId(null); setDeleteError(null); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Silməyi təsdiq edin</h2>
              <button type="button" className={styles.closeBtn} onClick={() => { setDeleteId(null); setDeleteError(null); }}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p>Bu partnyoru silmək istədiyinizə əminsiniz?</p>
              {deleteError && (
                <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 500, marginTop: 8 }}>
                  ⚠ {deleteError}
                </p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelBtn} onClick={() => { setDeleteId(null); setDeleteError(null); }}>Ləğv et</button>
              <button type="button" className={styles.deleteConfirmBtn} onClick={handleDelete}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}