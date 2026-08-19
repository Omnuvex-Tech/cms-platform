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

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API}/blog/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Fayl yükləmə uğursuz");
  return (await res.json()).url;
}

function toAbsUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${API}${path}`;
}

function generateSlug(name: string) {
  return name.toLowerCase()
    .replace(/ə/g, "e").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
    .replace(/^-|-$/g, "").trim();
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

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
    setShowLinkPopup(false);
  };

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
            onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}>
            H{level}
          </button>
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

function AvatarUpload({ value, onChange, label }: {
  value: string; onChange: (url: string) => void; label?: string;
}) {
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


function OurTeamSettingsPanel() {
  const [activeLang, setActiveLang] = useState<Lang>("az");
  const [title, setTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [description, setDescription] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [moreBtn, setMoreBtn] = useState<LocalizedString>({
    az: "",
    en: "",
    ru: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/blog/our-team-settings");
        setTitle(typeof data.title === "object" ? data.title : { az: data.title ?? "", en: "", ru: "" });
        setDescription(typeof data.description === "object" ? data.description : { az: data.description ?? "", en: "", ru: "" });
        setMoreBtn(
          typeof data.moreBtn === "object"
            ? data.moreBtn
            : { az: data.moreBtn ?? "", en: "", ru: "" }
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      await apiFetch("/blog/our-team-settings", {
        method: "PUT",
        body: JSON.stringify({
          title,
          description,
          moreBtn,
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
    <div className={styles.settingsCard} style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 className={styles.settingsGroupTitle} style={{ margin: 0 }}>
          Our Team Səhifəsi — Başlıq və Açıqlama
        </h3>
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

      <LangTabs active={activeLang} onChange={setActiveLang} />

      <div className={styles.field}>
        <label>
          Sol başlıq — "Komandamız" ({activeLang.toUpperCase()})
        </label>
        <LocalizedRichEditor value={title} lang={activeLang} onChange={setTitle} />
      </div>

      <div className={styles.field} style={{ marginTop: 16 }}>
        <label>
          Sağ açıqlama mətni(italic seçmək = mavi rəng) ({activeLang.toUpperCase()})
        </label>
        <LocalizedRichEditor value={description} lang={activeLang} onChange={setDescription} />
      </div>

      <div className={styles.field} style={{ marginTop: 16 }}>
        <label>
          More Button ({activeLang.toUpperCase()})
        </label>
        <input
          className={styles.input}
          value={moreBtn[activeLang] || ""}
          onChange={(e) =>
            setMoreBtn((prev) => ({
              ...prev,
              [activeLang]: e.target.value,
            }))
          }
          placeholder="Daha çox"
        />
      </div>
    </div>
  );
}

function AuthorSettingsPanel() {
  const [activeLang, setActiveLang] = useState<Lang>("az");
  const [readArticleLabel, setReadArticleLabel] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [recentBlogsTitle, setRecentBlogsTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [otherBlogsTitle, setOtherBlogsTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/blog/author-settings");
        setReadArticleLabel(data.readArticleLabel ?? { az: "", en: "", ru: "" });
        setRecentBlogsTitle(data.recentBlogsTitle ?? { az: "", en: "", ru: "" });
        setOtherBlogsTitle(data.otherBlogsTitle ?? { az: "", en: "", ru: "" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      await apiFetch("/blog/author-settings", {
        method: "PUT",
        body: JSON.stringify({ readArticleLabel, recentBlogsTitle, otherBlogsTitle }),
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
    <div className={styles.settingsCard} style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 className={styles.settingsGroupTitle} style={{ margin: 0 }}>
          Author Detail Səhifəsi
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saveStatus === "success" && <span style={{ color: "#16a34a", fontSize: 14, fontWeight: 600 }}>✓ Saxlanıldı</span>}
          {saveStatus === "error" && <span style={{ color: "#dc2626", fontSize: 14, fontWeight: 600 }}>✕ Xəta baş verdi</span>}
          <button className={styles.saveBtn} onClick={save} disabled={saving}>
            {saving ? "Saxlanır..." : "Saxla"}
          </button>
        </div>
      </div>

      <LangTabs active={activeLang} onChange={setActiveLang} />

      <div className={styles.field}>
        <label>Məqaləni oxu (buton) ({activeLang.toUpperCase()})</label>
        <input className={styles.input} value={readArticleLabel[activeLang] || ""}
          onChange={e => setReadArticleLabel(prev => ({ ...prev, [activeLang]: e.target.value }))}
          placeholder="Məqaləni oxu" />
      </div>

      <div className={styles.field} style={{ marginTop: 16 }}>
        <label>Son bloglar (başlıq) ({activeLang.toUpperCase()})</label>
        <input className={styles.input} value={recentBlogsTitle[activeLang] || ""}
          onChange={e => setRecentBlogsTitle(prev => ({ ...prev, [activeLang]: e.target.value }))}
          placeholder="Son bloglar" />
      </div>

      <div className={styles.field} style={{ marginTop: 16 }}>
        <label>Digər bloglar (başlıq) ({activeLang.toUpperCase()})</label>
        <input className={styles.input} value={otherBlogsTitle[activeLang] || ""}
          onChange={e => setOtherBlogsTitle(prev => ({ ...prev, [activeLang]: e.target.value }))}
          placeholder="Digər bloglar" />
      </div>
    </div>
  );
}


function SortableAuthorRow({ a, onEdit, onDelete, onToggleVisibility, onToggleOurTeam }: {
  a: any; onEdit: (a: any) => void; onDelete: (id: number) => void;
  onToggleVisibility: (a: any) => void; onToggleOurTeam: (a: any) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: a.id });
  const nameAz = typeof a.name === "object" ? (a.name?.az || "") : (a.name || "");
  const roleAz = typeof a.role === "object" ? (a.role?.az || "") : (a.role || "");

  return (
    <tr ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
      <td className={styles.num}>
        <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
      </td>
      <td>
        {a.avatar && (
          <img src={toAbsUrl(a.avatar)} alt="" className={styles.authorAvatar} />
        )}
      </td>
      <td className={styles.authorNameCell} dangerouslySetInnerHTML={{ __html: nameAz }} />
      <td className={styles.authorRoleCell}>{roleAz ? <div dangerouslySetInnerHTML={{ __html: roleAz }} /> : "—"}</td>
      <td>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button type="button"
            className={a.isVisible ? styles.activeToggle : styles.inactiveToggle}
            onClick={() => onToggleVisibility(a)}>
            {a.isVisible ? "Görünür" : "Gizli"}
          </button>
          <button type="button"
            className={a.isOurTeam ? styles.activeToggle : styles.inactiveToggle}
            onClick={() => onToggleOurTeam(a)}>
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

export default function BlogAuthorsPage() {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [activeLang, setActiveLang] = useState<Lang>("az");
  const [reordering, setReordering] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [name, setName] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [role, setRole] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [seoTitle, setSeoTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [seoDescription, setSeoDescription] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [seoKeywords, setSeoKeywords] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [schemaText, setSchemaText] = useState("");
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [schemaGenerating, setSchemaGenerating] = useState(false);
  const [schemaSaving, setSchemaSaving] = useState(false);
  const [schemaSaveStatus, setSchemaSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [avatar, setAvatar] = useState("");
  const [avatarAlt, setAvatarAlt] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [linkedinHref, setLinkedinHref] = useState("");
  const [bio, setBio] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [skillsTitle, setSkillsTitle] = useState<LocalizedString>({ az: "SKILLS", en: "SKILLS", ru: "SKILLS" });
  const [skills, setSkills] = useState<Record<string, string>[]>([]);
  const [linkedinIcon, setLinkedinIcon] = useState("");
  const [slug, setSlug] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [isOurTeam, setIsOurTeam] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  const load = async () => {
    setLoading(true);
    try { setAuthors(await apiFetch("/blog/authors")); }
    finally { setLoading(false); }
  };


  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!modalOpen) return;
    setSchemaText(editItem?.schema?.[activeLang] ? JSON.stringify(editItem.schema[activeLang], null, 2) : "");
    setSchemaError(null);
  }, [modalOpen, editItem, activeLang]);

  const openCreate = () => {
    setEditItem(null); setActiveLang("az");
    setName({ az: "", en: "", ru: "" }); setRole({ az: "", en: "", ru: "" });
    setAvatar(""); setAvatarAlt({ az: "", en: "", ru: "" });
    setLinkedinHref(""); setBio({ az: "", en: "", ru: "" });
    setSeoTitle({ az: "", en: "", ru: "" });
    setSeoDescription({ az: "", en: "", ru: "" });
    setSeoKeywords({ az: "", en: "", ru: "" });
    setSkillsTitle({ az: "SKILLS", en: "SKILLS", ru: "SKILLS" });
    setSkills([]); setLinkedinIcon(""); setSlug("");
    setIsVisible(true); setIsOurTeam(false);
    setSchemaText("");
    setSchemaError(null);
    setModalOpen(true);
  };

  const openEdit = (a: any) => {
    setEditItem(a); setActiveLang("az");
    setName(typeof a.name === "object" ? a.name : { az: a.name ?? "", en: "", ru: "" });
    setRole(typeof a.role === "object" ? a.role : { az: a.role ?? "", en: "", ru: "" });
    setSeoTitle(a.seoTitle ?? { az: "", en: "", ru: "" });
    setSeoDescription(a.seoDescription ?? { az: "", en: "", ru: "" });
    setSeoKeywords(a.seoKeywords ?? { az: "", en: "", ru: "" });
    setAvatar(a.avatar ?? "");
    setAvatarAlt(typeof a.avatarAlt === "object" ? a.avatarAlt : { az: a.avatarAlt ?? "", en: "", ru: "" });
    setLinkedinHref(a.linkedinHref ?? "");
    setBio(typeof a.bio === "object" ? a.bio : { az: a.bio ?? "", en: "", ru: "" });
    setSkillsTitle(typeof a.skillsTitle === "object" ? a.skillsTitle : { az: a.skillsTitle ?? "SKILLS", en: "SKILLS", ru: "SKILLS" });
    setSkills((a.skills ?? []).map((s: any) => typeof s === "string" ? { az: s, en: "", ru: "" } : s));
    setLinkedinIcon(a.linkedinIcon ?? "");
    setSlug(a.slug ?? "");
    setIsVisible(a.isVisible ?? true);
    setIsOurTeam(a.isOurTeam ?? false);
    setSchemaText(a.schema?.[activeLang] ? JSON.stringify(a.schema[activeLang], null, 2) : "");
    setSchemaError(null);
    setModalOpen(true);
  };

  const save = async () => {
    if (!name.az?.trim()) return;
    setSaving(true);
    try {
      const body = {
        name, slug: slug || null, role, avatar: avatar || null, avatarAlt,
        linkedinHref: linkedinHref || null, bio, skillsTitle, skills,
        linkedinIcon: linkedinIcon || null, isVisible, isOurTeam,
        seoTitle, seoDescription, seoKeywords,  // ← əlavə et
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
    setAuthors(newList); setReordering(true);
    try {
      await apiFetch("/blog/authors/reorder", {
        method: "PATCH",
        body: JSON.stringify({ ids: newList.map(a => a.id) }),
      });
    } finally { setReordering(false); }
  };

  const handleToggleVisibility = async (a: any) => {
    await apiFetch(`/blog/authors/${a.id}`, {
      method: "PUT",
      body: JSON.stringify({ isVisible: !a.isVisible }),
    });
    setAuthors(prev => prev.map(x => x.id === a.id ? { ...x, isVisible: !a.isVisible } : x));
  };

  const handleToggleOurTeam = async (a: any) => {
    await apiFetch(`/blog/authors/${a.id}`, {
      method: "PUT",
      body: JSON.stringify({ isOurTeam: !a.isOurTeam }),
    });
    setAuthors(prev => prev.map(x => x.id === a.id ? { ...x, isOurTeam: !a.isOurTeam } : x));
  };

  const addSkill = () => setSkills(prev => [...prev, { az: "", en: "", ru: "" }]);
  const updateSkill = (i: number, lang: Lang, val: string) =>
    setSkills(prev => prev.map((s, idx) => idx === i ? { ...s, [lang]: val } : s));
  const removeSkill = (i: number) =>
    setSkills(prev => prev.filter((_, idx) => idx !== i));

  const generateSchema = async () => {
    if (!editItem) return;
    setSchemaGenerating(true);
    setSchemaError(null);
    try {
      const generated = await apiFetch(`/blog/authors/${editItem.id}/schema/preview`);
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
      await apiFetch(`/blog/authors/${editItem.id}/schema`, {
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

 const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/ə/g, "e").replace(/ğ/g, "g").replace(/ı/g, "i")
      .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c");

  const filteredAuthors = authors.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = normalize(searchQuery);
    const nameAz = normalize(typeof a.name === "object" ? (a.name?.az || "") : (a.name || ""));
    const roleAz = normalize(typeof a.role === "object" ? (a.role?.az || "") : (a.role || ""));
    return nameAz.includes(q) || roleAz.includes(q);
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Our Team Səhifəsi</h1>
          <p className={styles.subtitle}>Komanda üzvlərini və səhifə mətnlərini idarə edin</p>
        </div>
      </div>

      <OurTeamSettingsPanel />
      <AuthorSettingsPanel />

     <div className={styles.tabHeader}>
        <input
          className={styles.input}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Ad və ya vəzifəyə görə axtar..."
          style={{ maxWidth: 320 }}
        />
        <div className={styles.headerRight}>
          {reordering && <span className={styles.reorderingText}>Saxlanır...</span>}
          <button className={styles.addBtn} onClick={openCreate}>+ Yeni Author</button>
        </div>
      </div>


      {loading ? (
        <div className={styles.empty}>Yüklənir...</div>
      ) : authors.length === 0 ? (
        <div className={styles.empty}>Hələ author yoxdur</div>
      ) : filteredAuthors.length === 0 ? (
        <div className={styles.empty}>Axtarışa uyğun nəticə tapılmadı</div>
      ) : (
        <div className={styles.tableWrap}>
          {searchQuery.trim() ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th></th><th>Avatar</th><th>Ad (AZ)</th>
                  <th>Vəzifə (AZ)</th><th>Placement</th><th>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuthors.map(a => (
                  <SortableAuthorRow key={a.id} a={a} onEdit={openEdit}
                    onDelete={setDeleteId} onToggleVisibility={handleToggleVisibility}
                    onToggleOurTeam={handleToggleOurTeam} />
                ))}
              </tbody>
            </table>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={authors.map(a => a.id)} strategy={verticalListSortingStrategy}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th></th><th>Avatar</th><th>Ad (AZ)</th>
                      <th>Vəzifə (AZ)</th><th>Placement</th><th>Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authors.map(a => (
                      <SortableAuthorRow key={a.id} a={a} onEdit={openEdit}
                        onDelete={setDeleteId} onToggleVisibility={handleToggleVisibility}
                        onToggleOurTeam={handleToggleOurTeam} />
                    ))}
                  </tbody>
                </table>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {modalOpen && (
        <div className={styles.overlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal}
            style={{ maxWidth: 860, width: "92vw", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editItem ? "Author Düzəlt" : "Yeni Author"}</h2>
              <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <LangTabs active={activeLang} onChange={setActiveLang} />
              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label>Görünürlük</label>
                  <button type="button"
                    className={isVisible ? styles.activeToggle : styles.inactiveToggle}
                    onClick={() => setIsVisible(v => !v)}>
                    {isVisible ? "Görünür" : "Gizli"}
                  </button>
                </div>
                <div className={styles.field}>
                  <label>Our Team səhifəsi</label>
                  <button type="button"
                    className={isOurTeam ? styles.activeToggle : styles.inactiveToggle}
                    onClick={() => setIsOurTeam(v => !v)}>
                    {isOurTeam ? "Aktiv" : "Deaktiv"}
                  </button>
                  <small style={{ color: "#94a3b8" }}>İlk 6-sı About Us-da da görünür</small>
                </div>
              </div>
              <div className={styles.twoCol}>
                <AvatarUpload label="Avatar" value={avatar} onChange={setAvatar} />
                <div className={styles.field}>
                  <label>Avatar Alt Text ({activeLang.toUpperCase()})</label>
                  <input className={styles.input} value={avatarAlt[activeLang] || ""}
                    onChange={e => setAvatarAlt(prev => ({ ...prev, [activeLang]: e.target.value }))}
                    placeholder="Almaz Abdullayeva şəkli" />
                </div>
              </div>
                     <div className={styles.field}>
                <label>Ad Soyad * ({activeLang.toUpperCase()})</label>
                <RichEditor
                  value={name[activeLang] || ""}
                  onChange={val => {
                    setName(prev => ({ ...prev, [activeLang]: val }));
                    if (activeLang === "az") setSlug(generateSlug(val.replace(/<[^>]*>/g, " ")));
                  }}
                />
              </div>
              <div className={styles.field}>
                <label>Slug</label>
                <input className={styles.input} value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="almaz-abdullayeva" />
              </div>
              <div className={styles.field}>
                <label>Vəzifə ({activeLang.toUpperCase()})</label>
                <LocalizedRichEditor value={role} lang={activeLang} onChange={setRole} />
              </div>
              <div className={styles.field}>
                <label>Bio ({activeLang.toUpperCase()})</label>
                <LocalizedRichEditor value={bio} lang={activeLang} onChange={setBio} />
              </div>
              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label>LinkedIn URL</label>
                  <input className={styles.input} value={linkedinHref}
                    onChange={e => setLinkedinHref(e.target.value)}
                    placeholder="https://linkedin.com/in/..." />
                </div>
                <div className={styles.field}>
                  <label>LinkedIn İkon</label>
                  <input className={styles.input} value={linkedinIcon}
                    onChange={e => setLinkedinIcon(e.target.value)}
                    placeholder="/uploads/blog/linkedin.svg" />
                </div>
              </div>
                           <div className={styles.field}>
                <label>Skills başlığı ({activeLang.toUpperCase()})</label>
                <LocalizedRichEditor value={skillsTitle} lang={activeLang} onChange={setSkillsTitle} />
              </div>
                      <div className={styles.field}>
                <label>Skills ({activeLang.toUpperCase()})</label>
                {skills.map((skill, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <RichEditor
                        value={skill[activeLang] || ""}
                        onChange={val => updateSkill(i, activeLang, val)}
                      />
                    </div>
                    <button type="button" onClick={() => removeSkill(i)}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, marginTop: 8 }}>
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" className={styles.addRowBtn} onClick={addSkill}>
                  + Skill əlavə et
                </button>
              </div>
              <div style={{ borderTop: "1px solid #222", paddingTop: 16, marginTop: 8 }}>
                <label style={{ fontWeight: 700, fontSize: 14, display: "block", marginBottom: 12 }}>SEO</label>
                <div className={styles.field}>
                  <label>SEO Title ({activeLang.toUpperCase()})</label>
                  <input className={styles.input} value={seoTitle[activeLang] || ""}
                    onChange={e => setSeoTitle(prev => ({ ...prev, [activeLang]: e.target.value }))}
                    placeholder={`SEO başlığı (${activeLang})`} />
                </div>
                <div className={styles.field}>
                  <label>SEO Description ({activeLang.toUpperCase()})</label>
                  <textarea className={styles.input} rows={3} value={seoDescription[activeLang] || ""}
                    onChange={e => setSeoDescription(prev => ({ ...prev, [activeLang]: e.target.value }))}
                    placeholder={`Qısa açıqlama (${activeLang})`} />
                </div>
                <div className={styles.field}>
                  <label>SEO Keywords ({activeLang.toUpperCase()})</label>
                  <input className={styles.input} value={seoKeywords[activeLang] || ""}
                    onChange={e => setSeoKeywords(prev => ({ ...prev, [activeLang]: e.target.value }))}
                    placeholder={`açar söz 1, açar söz 2 (${activeLang})`} />
                </div>
              </div>

              {editItem && (
                <div style={{ borderTop: "1px solid #222", paddingTop: 16, marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <label style={{ fontWeight: 700, fontSize: 14 }}>JSON-LD Schema ({activeLang.toUpperCase()})</label>
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
                  <textarea
                    className={styles.input}
                    rows={12}
                    value={schemaText}
                    placeholder='{"@context": "https://schema.org", ...}'
                    onChange={(e) => handleSchemaChange(e.target.value)}
                    style={{ fontFamily: "monospace", fontSize: 12 }}
                  />
                  {schemaError && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 4 }}>⚠ {schemaError}</p>}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Ləğv et</button>
              <button className={styles.saveBtn} onClick={save} disabled={saving}>
                {saving ? "Saxlanır..." : "Saxla"}
              </button>
            </div>
          </div>


        </div>


      )}
      {deleteId && (
        <div className={styles.overlay} onClick={() => setDeleteId(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Silməyi təsdiq edin</h2>
              <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p>Bu authoru silmək istədiyinizə əminsiniz?</p>
            </div>
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