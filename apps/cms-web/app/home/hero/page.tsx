"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import TiptapLink from "@tiptap/extension-link";
import { HardBreak } from "@tiptap/extension-hard-break";
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

export default function HeroSettingsPage() {
  const [activeLang, setActiveLang] = useState<Lang>("az");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const [title, setTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [description, setDescription] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [primaryBtnText, setPrimaryBtnText] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [primaryBtnLink, setPrimaryBtnLink] = useState("");
  const [primaryBtnNewTab, setPrimaryBtnNewTab] = useState(false);
  const [secondaryBtnText, setSecondaryBtnText] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [secondaryBtnLink, setSecondaryBtnLink] = useState("");
  const [secondaryBtnNewTab, setSecondaryBtnNewTab] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/hero");
        setTitle(data.title ?? { az: "", en: "", ru: "" });
        setDescription(data.description ?? { az: "", en: "", ru: "" });
        setPrimaryBtnText(data.primaryBtnText ?? { az: "", en: "", ru: "" });
        setPrimaryBtnLink(data.primaryBtnLink ?? "");
        setPrimaryBtnNewTab(data.primaryBtnNewTab ?? false);
        setSecondaryBtnText(data.secondaryBtnText ?? { az: "", en: "", ru: "" });
        setSecondaryBtnLink(data.secondaryBtnLink ?? "");
        setSecondaryBtnNewTab(data.secondaryBtnNewTab ?? false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      await apiFetch("/hero", {
        method: "PUT",
        body: JSON.stringify({
          title,
          description,
          primaryBtnText,
          primaryBtnLink,
          primaryBtnNewTab,
          secondaryBtnText,
          secondaryBtnLink,
          secondaryBtnNewTab,
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
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Hero Bölməsi</h1>
          <p className={styles.subtitle}>Ana səhifənin hero hissəsini idarə edin</p>
        </div>
      </div>

      <div className={styles.settingsCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 className={styles.settingsGroupTitle} style={{ margin: 0 }}>Mətn və Düymələr</h3>
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
          <label>Başlıq ({activeLang.toUpperCase()})</label>
          <LocalizedRichEditor value={title} lang={activeLang} onChange={setTitle} />
        </div>
        <div className={styles.field} style={{ marginTop: 16 }}>
          <label>Açıqlama ({activeLang.toUpperCase()})</label>
          <LocalizedRichEditor value={description} lang={activeLang} onChange={setDescription} />
        </div>
        <div style={{ borderTop: "1px solid #222", paddingTop: 16, marginTop: 20 }}>
          <label style={{ fontWeight: 700, fontSize: 14, display: "block", marginBottom: 12 }}>
            Əsas Düymə (Primary)
          </label>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label>Düymə mətni ({activeLang.toUpperCase()})</label>
              <input className={styles.input}
                value={primaryBtnText[activeLang] || ""}
                onChange={e => setPrimaryBtnText(prev => ({ ...prev, [activeLang]: e.target.value }))}
                placeholder="Bizimlə əlaqə" />
            </div>
            <div className={styles.field}>
              <label>Link(əgər boş buraxılsa səhifənin aşağısındaki Contacta scroll olacaq)</label>
              <input className={styles.input}
                value={primaryBtnLink}
                onChange={e => setPrimaryBtnLink(e.target.value)}
                placeholder="/Contact" />
            </div>
          </div>
          <div className={styles.field}>
            <label>Yeni tabda aç</label>
            <button type="button"
              className={primaryBtnNewTab ? styles.activeToggle : styles.inactiveToggle}
              onClick={() => setPrimaryBtnNewTab(v => !v)}>
              {primaryBtnNewTab ? "Yeni tab" : "Eyni tab"}
            </button>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #222", paddingTop: 16, marginTop: 16 }}>
          <label style={{ fontWeight: 700, fontSize: 14, display: "block", marginBottom: 12 }}>
            İkinci Düymə (Secondary)
          </label>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label>Düymə mətni ({activeLang.toUpperCase()})</label>
              <input className={styles.input}
                value={secondaryBtnText[activeLang] || ""}
                onChange={e => setSecondaryBtnText(prev => ({ ...prev, [activeLang]: e.target.value }))}
                placeholder="Services" />
            </div>
            <div className={styles.field}>
              <label>Link</label>
              <input className={styles.input}
                value={secondaryBtnLink}
                onChange={e => setSecondaryBtnLink(e.target.value)}
                placeholder="/service" />
            </div>
          </div>
          <div className={styles.field}>
            <label>Yeni tabda aç</label>
            <button type="button"
              className={secondaryBtnNewTab ? styles.activeToggle : styles.inactiveToggle}
              onClick={() => setSecondaryBtnNewTab(v => !v)}>
              {secondaryBtnNewTab ? "Yeni tab" : "Eyni tab"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}