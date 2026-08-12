"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
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

function toAbsUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${API}${path}`;
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API}/home/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Fayl yükləmə uğursuz");
  return (await res.json()).url;
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

function RichEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Heading.configure({ levels: [1, 2, 3, 4, 5, 6] })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value]);

  return (
    <div className={styles.richEditor}>
      <div className={styles.richToolbar}>
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive("bold") ? styles.toolbarBtnActive : styles.toolbarBtn}><b>B</b></button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive("italic") ? styles.toolbarBtnActive : styles.toolbarBtn}><i>I</i></button>
        <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={editor?.isActive("underline") ? styles.toolbarBtnActive : styles.toolbarBtn}><u>U</u></button>
        <div className={styles.toolbarDivider} />
        {([1, 2, 3, 4, 5, 6] as const).map(level => (
          <button key={level} type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
            className={editor?.isActive("heading", { level }) ? styles.toolbarBtnActive : styles.toolbarBtn}>
            H{level}
          </button>
        ))}
        <button type="button" onClick={() => editor?.chain().focus().setParagraph().run()}
          className={editor?.isActive("paragraph") ? styles.toolbarBtnActive : styles.toolbarBtn}>P</button>
      </div>
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

function ImageUpload({ value, onChange, label }: {
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
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleSelect} />
      <div className={styles.avatarUpload} onClick={() => inputRef.current?.click()}
        style={{ width: 160, height: 100, borderRadius: 8 }}>
        {value
          ? <img src={toAbsUrl(value)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
          : <span>+</span>
        }
      </div>
    </div>
  );
}

export default function HomeSettingsPage() {
  const [activeLang, setActiveLang] = useState<Lang>("az");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const [projectsTitle, setProjectsTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [projectsBtnText, setProjectsBtnText] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [projectsBtnLink, setProjectsBtnLink] = useState("");
  const [projectsBtnNewTab, setProjectsBtnNewTab] = useState(false);

  const [teamTitle, setTeamTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [teamBtnText, setTeamBtnText] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [teamBtnLink, setTeamBtnLink] = useState("");
  const [teamBtnNewTab, setTeamBtnNewTab] = useState(false);
  const [teamText, setTeamText] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [blogsTitle, setBlogsTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [blogsBtnText, setBlogsBtnText] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [blogsBtnLink, setBlogsBtnLink] = useState("");
  const [blogsBtnNewTab, setBlogsBtnNewTab] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/home");
        setProjectsTitle(data.projectsTitle ?? { az: "", en: "", ru: "" });
        setProjectsBtnText(data.projectsBtnText ?? { az: "", en: "", ru: "" });
        setProjectsBtnLink(data.projectsBtnLink ?? "");
        setProjectsBtnNewTab(data.projectsBtnNewTab ?? false);
        setTeamTitle(data.teamTitle ?? { az: "", en: "", ru: "" });
        setTeamBtnText(data.teamBtnText ?? { az: "", en: "", ru: "" });
        setTeamBtnLink(data.teamBtnLink ?? "");
        setTeamBtnNewTab(data.teamBtnNewTab ?? false);
        setTeamText(data.teamText ?? { az: "", en: "", ru: "" });
        setBlogsTitle(data.blogsTitle ?? { az: "", en: "", ru: "" });
        setBlogsBtnText(data.blogsBtnText ?? { az: "", en: "", ru: "" });
        setBlogsBtnLink(data.blogsBtnLink ?? "");
        setBlogsBtnNewTab(data.blogsBtnNewTab ?? false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      await apiFetch("/home", {
        method: "PUT",
        body: JSON.stringify({
          projectsTitle, projectsBtnText, projectsBtnLink, projectsBtnNewTab,
          teamTitle, teamBtnText, teamBtnLink, teamBtnNewTab, teamText,
          blogsTitle, blogsBtnText, blogsBtnLink, blogsBtnNewTab,
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
          <h1 className={styles.title}>Ana Səhifə Ayarları</h1>
          <p className={styles.subtitle}>Bölmə başlıqları və düymələri idarə edin</p>
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

      <LangTabs active={activeLang} onChange={setActiveLang} />

      <div className={styles.settingsCard} style={{ marginBottom: 24 }}>
        <h3 className={styles.settingsGroupTitle}>Proyektlər Bölməsi</h3>
        <div className={styles.field}>
          <label>Başlıq ({activeLang.toUpperCase()})</label>
          <LocalizedRichEditor value={projectsTitle} lang={activeLang} onChange={setProjectsTitle} />
        </div>
        <div className={styles.field}>
          <label>Düymə mətni ({activeLang.toUpperCase()})</label>
          <LocalizedRichEditor value={projectsBtnText} lang={activeLang} onChange={setProjectsBtnText} />
        </div>
        <div className={styles.field}>
          <label>Link</label>
          <input className={styles.input}
            value={projectsBtnLink}
            onChange={e => setProjectsBtnLink(e.target.value)}
            placeholder="/portfolio" />
        </div>
        <div className={styles.field}>
          <label>Yeni tabda aç</label>
          <button type="button"
            className={projectsBtnNewTab ? styles.activeToggle : styles.inactiveToggle}
            onClick={() => setProjectsBtnNewTab(v => !v)}>
            {projectsBtnNewTab ? "Yeni tab" : "Eyni tab"}
          </button>
        </div>
      </div>

      <div className={styles.settingsCard} style={{ marginBottom: 24 }}>
        <h3 className={styles.settingsGroupTitle}>Komanda Bölməsi</h3>
        <div className={styles.field}>
          <label>Başlıq ({activeLang.toUpperCase()})</label>
          <LocalizedRichEditor value={teamTitle} lang={activeLang} onChange={setTeamTitle} />
        </div>
        <div className={styles.field}>
          <label>Düymə mətni ({activeLang.toUpperCase()})</label>
          <LocalizedRichEditor value={teamBtnText} lang={activeLang} onChange={setTeamBtnText} />
        </div>
        <div className={styles.field}>
          <label>Link</label>
          <input className={styles.input}
            value={teamBtnLink}
            onChange={e => setTeamBtnLink(e.target.value)}
            placeholder="/OurTeam" />
        </div>
        <div className={styles.field}>
          <label>Yeni tabda aç</label>
          <button type="button"
            className={teamBtnNewTab ? styles.activeToggle : styles.inactiveToggle}
            onClick={() => setTeamBtnNewTab(v => !v)}>
            {teamBtnNewTab ? "Yeni tab" : "Eyni tab"}
          </button>
        </div>
        <div className={styles.field}>
          <label>Mətn ({activeLang.toUpperCase()})</label>
          <LocalizedRichEditor value={teamText} lang={activeLang} onChange={setTeamText} />
        </div>
      </div>

      <div className={styles.settingsCard}>
        <h3 className={styles.settingsGroupTitle}>Bloglar Bölməsi</h3>
        <div className={styles.field}>
          <label>Başlıq ({activeLang.toUpperCase()})</label>
          <LocalizedRichEditor value={blogsTitle} lang={activeLang} onChange={setBlogsTitle} />
        </div>
        <div className={styles.field}>
          <label>Düymə mətni ({activeLang.toUpperCase()})</label>
          <LocalizedRichEditor value={blogsBtnText} lang={activeLang} onChange={setBlogsBtnText} />
        </div>
        <div className={styles.field}>
          <label>Link</label>
          <input className={styles.input}
            value={blogsBtnLink}
            onChange={e => setBlogsBtnLink(e.target.value)}
            placeholder="/Blog" />
        </div>
        <div className={styles.field}>
          <label>Yeni tabda aç</label>
          <button type="button"
            className={blogsBtnNewTab ? styles.activeToggle : styles.inactiveToggle}
            onClick={() => setBlogsBtnNewTab(v => !v)}>
            {blogsBtnNewTab ? "Yeni tab" : "Eyni tab"}
          </button>
        </div>
      </div>
    </div>
  );
}