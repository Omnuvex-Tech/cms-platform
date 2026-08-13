"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import styles from "@/styles/privacyPolicy.module.css";

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

function LangTabs({ active, onChange }: { active: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className={styles.langTabs}>
      {(["az", "en", "ru"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={active === l ? styles.langTabActive : styles.langTab}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function RichEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      Link.configure({ openOnClick: false, autolink: false }),
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
    setLinkUrl(editor?.getAttributes("link").href || "");
    setShowLinkPopup(true);
  };

  const applyLink = () => {
    if (linkUrl) {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setShowLinkPopup(false);
    setLinkUrl("");
  };

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
    setShowLinkPopup(false);
    setLinkUrl("");
  };

  return (
    <div className={styles.richEditorWrap}>
      <div className={styles.richToolbar}>
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive("bold") ? styles.toolbarBtnActive : styles.toolbarBtn}><b>B</b></button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive("italic") ? styles.toolbarBtnActive : styles.toolbarBtn}><i>I</i></button>
        <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={editor?.isActive("underline") ? styles.toolbarBtnActive : styles.toolbarBtn}><u>U</u></button>
        <div className={styles.toolbarDivider} />
        {([1, 2, 3, 4, 5, 6] as const).map((level) => (
          <button key={level} type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
            className={editor?.isActive("heading", { level }) ? styles.toolbarBtnActive : styles.toolbarBtn}>
            H{level}
          </button>
        ))}
        <button type="button" onClick={() => editor?.chain().focus().setParagraph().run()}
          className={editor?.isActive("paragraph") ? styles.toolbarBtnActive : styles.toolbarBtn}>P</button>
        <div className={styles.toolbarDivider} />
        <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={editor?.isActive("bulletList") ? styles.toolbarBtnActive : styles.toolbarBtn}>• List</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={editor?.isActive("orderedList") ? styles.toolbarBtnActive : styles.toolbarBtn}>1. List</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={editor?.isActive("blockquote") ? styles.toolbarBtnActive : styles.toolbarBtn}>&ldquo;&rdquo;</button>
        <button type="button" onClick={openLinkPopup}
          className={editor?.isActive("link") ? styles.toolbarBtnActive : styles.toolbarBtn}>🔗</button>
      </div>

      {showLinkPopup && (
        <div className={styles.linkPopup}>
          <input
            className={styles.linkInput}
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            autoFocus
          />
          <button type="button" className={styles.linkApplyBtn} onClick={applyLink}>Tətbiq et</button>
          {editor?.isActive("link") && (
            <button type="button" className={styles.linkRemoveBtn} onClick={removeLink}>Sil</button>
          )}
          <button type="button" className={styles.linkCancelBtn} onClick={() => setShowLinkPopup(false)}>✕</button>
        </div>
      )}

      <EditorContent editor={editor} className={styles.richEditor} />
    </div>
  );
}

function LocalizedRichEditor({ value, lang, onChange }: {
  value: LocalizedString; lang: Lang; onChange: (v: LocalizedString) => void;
}) {
  return <RichEditor value={value?.[lang] || ""} onChange={(v) => onChange({ ...value, [lang]: v })} />;
}

const emptyLocalized = (): LocalizedString => ({ az: "", en: "", ru: "" });

interface Section {
  id: number | string;
  title: LocalizedString;
  description: LocalizedString;
  order: number;
  isNew?: boolean;
  saveStatus?: "idle" | "success" | "error";
}

export default function PrivacyPolicyPage() {
  const [activeLang, setActiveLang] = useState<Lang>("az");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const [title, setTitle] = useState<LocalizedString>(emptyLocalized());
  const [description, setDescription] = useState<LocalizedString>(emptyLocalized());
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionError, setSectionError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/privacy-policy");
        setTitle(data.title ?? emptyLocalized());
        setDescription(data.description ?? emptyLocalized());
        setSections(
          (data.sections ?? [])
            .sort((a: Section, b: Section) => a.order - b.order)
            .map((s: any) => ({
              id: s.id,
              title: s.title ?? emptyLocalized(),
              description: s.description ?? emptyLocalized(),
              order: s.order,
            })),
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
      await apiFetch("/privacy-policy", {
        method: "PATCH",
        body: JSON.stringify({ title, description }),
      });
      setSaveStatus("success");
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        title: emptyLocalized(),
        description: emptyLocalized(),
        order: prev.length,
        isNew: true,
      },
    ]);
  };

  const updateSectionField = (id: Section["id"], field: "title" | "description", value: LocalizedString) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const saveSection = async (section: Section) => {
    setSectionError("");
    try {
      if (section.isNew) {
        const created = await apiFetch("/privacy-policy/sections", {
          method: "POST",
          body: JSON.stringify({ title: section.title, description: section.description, order: section.order }),
        });
        setSections((prev) =>
          prev.map((s) => (s.id === section.id ? { ...created, isNew: false, saveStatus: "success" } : s)),
        );
      } else {
        await apiFetch(`/privacy-policy/sections/${section.id}`, {
          method: "PATCH",
          body: JSON.stringify({ title: section.title, description: section.description }),
        });
        setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, saveStatus: "success" } : s)));
      }
    } catch {
      setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, saveStatus: "error" } : s)));
    } finally {
      setTimeout(() => {
        setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, saveStatus: "idle" } : s)));
      }, 2500);
    }
  };

  const deleteSection = async (section: Section) => {
    setSectionError("");
    try {
      if (!section.isNew) {
        await apiFetch(`/privacy-policy/sections/${section.id}`, { method: "DELETE" });
      }
      setSections((prev) => prev.filter((s) => s.id !== section.id));
    } catch {
      setSectionError("Bölməni silmək mümkün olmadı");
    }
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;

    const reordered = [...sections];
    const current = reordered[index];
    const swapWith = reordered[target];
    if (!current || !swapWith) return;

    reordered[index] = swapWith;
    reordered[target] = current;

    const withOrder = reordered.map((s, i) => ({ ...s, order: i }));
    setSections(withOrder);

    const persisted = withOrder.filter((s) => !s.isNew);
    if (persisted.length) {
      apiFetch("/privacy-policy/sections/reorder", {
        method: "PATCH",
        body: JSON.stringify({ items: persisted.map((s) => ({ id: s.id, order: s.order })) }),
      }).catch(() => setSectionError("Sıralamanı yadda saxlamaq mümkün olmadı"));
    }
  };

  if (loading) return <div className={styles.empty}>Yüklənir...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gizlilik Siyasəti</h1>
          <p className={styles.subtitle}>Əsas mətn və bölmələri idarə edin</p>
        </div>
        <div className={styles.headerRight}>
          {saveStatus === "success" && <span className={styles.statusSuccess}>✓ Saxlanıldı</span>}
          {saveStatus === "error" && <span className={styles.statusError}>✕ Xəta baş verdi</span>}
          <button className={styles.saveBtn} onClick={save} disabled={saving}>
            {saving ? "Saxlanır..." : "Saxla"}
          </button>
        </div>
      </div>

      <LangTabs active={activeLang} onChange={setActiveLang} />

      <div className={styles.sectionCard}>
        <h3 className={styles.sectionCardTitle}>Əsas Başlıq</h3>
        <div className={styles.sectionFields}>
          <div className={styles.field}>
            <label>Başlıq ({activeLang.toUpperCase()})</label>
            <LocalizedRichEditor value={title} lang={activeLang} onChange={setTitle} />
          </div>
          <div className={styles.field}>
            <label>Təsvir ({activeLang.toUpperCase()})</label>
            <LocalizedRichEditor value={description} lang={activeLang} onChange={setDescription} />
          </div>
        </div>
      </div>

      <div className={styles.header} style={{ marginTop: 8 }}>
        <h3 className={styles.sectionCardTitle} style={{ margin: 0 }}>Bölmələr</h3>
        <button type="button" className={styles.addBtn} onClick={addSection}>+ Bölmə əlavə et</button>
      </div>

      {sectionError && <p className={styles.errorText}>{sectionError}</p>}

      {sections.map((section, index) => (
        <div key={section.id} className={styles.sectionCard}>
          <div className={styles.sectionCardHeader}>
            <span className={styles.sectionIndex}>Bölmə {index + 1}</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button type="button" className={styles.iconBtn} onClick={() => moveSection(index, -1)} disabled={index === 0}>↑</button>
              <button type="button" className={styles.iconBtn} onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1}>↓</button>
              <button type="button" className={styles.deleteBtn} onClick={() => deleteSection(section)}>Sil</button>
            </div>
          </div>
          <div className={styles.sectionFields}>
            <div className={styles.field}>
              <label>Kiçik başlıq ({activeLang.toUpperCase()})</label>
              <LocalizedRichEditor
                value={section.title}
                lang={activeLang}
                onChange={(v) => updateSectionField(section.id, "title", v)}
              />
            </div>
            <div className={styles.field}>
              <label>Təsvir ({activeLang.toUpperCase()})</label>
              <LocalizedRichEditor
                value={section.description}
                lang={activeLang}
                onChange={(v) => updateSectionField(section.id, "description", v)}
              />
            </div>
          </div>
          <div className={styles.sectionFooter}>
            {section.saveStatus === "success" && <span className={styles.statusSuccess}>✓ Saxlanıldı</span>}
            {section.saveStatus === "error" && <span className={styles.statusError}>✕ Xəta baş verdi</span>}
            <button type="button" className={styles.saveBtn} onClick={() => saveSection(section)}>
              Bölməni yadda saxla
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}