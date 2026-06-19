"use client";

import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import TiptapLink from "@tiptap/extension-link";
import { HardBreak } from "@tiptap/extension-hard-break";
import styles from "@/styles/blog.module.css";

type Lang = "az" | "en" | "ru";
type LocalizedString = Record<string, string>;

interface HeroStat {
  icon?: string;
  label: LocalizedString;
  value: string;
}

interface StoryBlock {
  title: LocalizedString;
  paragraphs: LocalizedString[];
  image?: string;
  imageAlt?: LocalizedString;
}

interface AboutData {
  heroImage: string;
  heroImageAlt: LocalizedString;
  heroBadge: LocalizedString;
  heroTitle: LocalizedString;
  heroParagraphs: LocalizedString[];
  heroStats: HeroStat[];
  storyBlocks: StoryBlock[];
  teamTitle: LocalizedString;
  teamDescription: LocalizedString;
  teamCtaLabel: LocalizedString;
  teamCtaHref: string;
}

const EMPTY_LOCALIZED: LocalizedString = { az: "", en: "", ru: "" };

const DEFAULT_DATA: AboutData = {
  heroImage: "",
  heroImageAlt: { ...EMPTY_LOCALIZED },
  heroBadge: { ...EMPTY_LOCALIZED },
  heroTitle: { ...EMPTY_LOCALIZED },
  heroParagraphs: [{ ...EMPTY_LOCALIZED }],
  heroStats: [],
  storyBlocks: [],
  teamTitle: { ...EMPTY_LOCALIZED },
  teamDescription: { ...EMPTY_LOCALIZED },
  teamCtaLabel: { ...EMPTY_LOCALIZED },
  teamCtaHref: "",
};

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

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API}/about/upload`, {
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

function SingleImageUpload({ value, onChange, label, accept = "image/webp,image/svg+xml" }: {
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
            <span>🖼️</span><span>{label ?? "Şəkil seçin"}</span><small>WebP / SVG</small>
          </div>
        )}
      </div>
    </div>
  );
}

function HeroSection({ data, onChange, lang }: { data: AboutData; onChange: (d: AboutData) => void; lang: Lang }) {
  const paragraphs = data.heroParagraphs;
  const stats = data.heroStats;

  const updL = (field: keyof AboutData, val: string) =>
    onChange({ ...data, [field]: { ...(data[field] as LocalizedString), [lang]: val } });

  const addStat = () => onChange({
    ...data,
    heroStats: [...stats, { icon: "", label: { ...EMPTY_LOCALIZED }, value: "" }],
  });

  const removeStat = (i: number) => onChange({
    ...data,
    heroStats: stats.filter((_, idx) => idx !== i),
  });

  const updateStat = (i: number, key: keyof HeroStat, val: any) => {
    const arr = [...stats];
    arr[i] = { ...arr[i], [key]: val } as HeroStat;
    onChange({ ...data, heroStats: arr });
  };

  return (
    <div className={styles.fullDrawerSection}>
      <h3 className={styles.drawerSectionTitle}>Hero Bölməsi</h3>

      <SingleImageUpload label="Hero şəkil" accept="image/webp"
        value={data.heroImage} onChange={v => onChange({ ...data, heroImage: v })} />

      <div className={styles.field}>
        <label>Hero şəkil alt mətn ({lang.toUpperCase()})</label>
        <input className={styles.input} value={data.heroImageAlt[lang] ?? ""}
          onChange={e => updL("heroImageAlt", e.target.value)} />
      </div>

      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label>Badge ({lang.toUpperCase()})</label>
          <input className={styles.input} value={data.heroBadge[lang] ?? ""}
            placeholder="Haqqımızda" onChange={e => updL("heroBadge", e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Başlıq ({lang.toUpperCase()})</label>
          <input className={styles.input} value={data.heroTitle[lang] ?? ""}
            placeholder="SİZİN RƏQƏMSAL KOMANDANIZ" onChange={e => updL("heroTitle", e.target.value)} />
        </div>
      </div>

      <div className={styles.sectionDivider} />
      <label className={styles.sectionGroupLabel}>Paraqraflar ({lang.toUpperCase()})</label>

      {paragraphs.map((p, i) => (
        <div key={i} className={styles.contentItemBlock}>
          <div className={styles.contentItemHeader}>
            <span className={styles.contentItemLabel}>Paraqraf {i + 1}</span>
            {paragraphs.length > 1 && (
              <button type="button" className={styles.removeBtn}
                onClick={() => onChange({ ...data, heroParagraphs: paragraphs.filter((_, idx) => idx !== i) })}>✕</button>
            )}
          </div>
          <RichEditor value={p[lang] ?? ""}
            onChange={v => {
              const arr = [...paragraphs];
              arr[i] = { ...arr[i], [lang]: v };
              onChange({ ...data, heroParagraphs: arr });
            }} />
        </div>
      ))}
      <button type="button" className={styles.addRowBtn}
        onClick={() => onChange({ ...data, heroParagraphs: [...paragraphs, { ...EMPTY_LOCALIZED }] })}>
        + Paraqraf əlavə et
      </button>

      <div className={styles.sectionDivider} />
      <label className={styles.sectionGroupLabel}>Statistikalar</label>

      {stats.map((stat, i) => (
        <div key={i} className={styles.contentItemBlock}>
          <div className={styles.contentItemHeader}>
            <span className={styles.contentItemLabel}>Stat #{i + 1}</span>
            <button type="button" className={styles.removeBtn} onClick={() => removeStat(i)}>✕</button>
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label>Label ({lang.toUpperCase()})</label>
              <input className={styles.input}
                value={stat.label?.[lang] ?? ""}
                placeholder="TƏƏSSÜRATlAR"
                onChange={e => updateStat(i, "label", { ...stat.label, [lang]: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Dəyər</label>
              <input className={styles.input}
                value={stat.value ?? ""}
                placeholder="2.3M"
                onChange={e => updateStat(i, "value", e.target.value)} />
            </div>
          </div>
          <SingleImageUpload
            label="Icon (WebP / SVG)"
            value={stat.icon ?? ""}
            onChange={v => updateStat(i, "icon", v)} />
        </div>
      ))}
      <button type="button" className={styles.addRowBtn} onClick={addStat}>
        + Stat əlavə et
      </button>
    </div>
  );
}

function StorySection({ data, onChange, lang }: { data: AboutData; onChange: (d: AboutData) => void; lang: Lang }) {
  const blocks = data.storyBlocks;

  const addBlock = () => onChange({
    ...data,
    storyBlocks: [...blocks, { title: { ...EMPTY_LOCALIZED }, paragraphs: [{ ...EMPTY_LOCALIZED }], image: "", imageAlt: { ...EMPTY_LOCALIZED } }],
  });

  const removeBlock = (i: number) => onChange({ ...data, storyBlocks: blocks.filter((_, idx) => idx !== i) });

  const updateBlock = (i: number, key: keyof StoryBlock, val: any) => {
    const arr = [...blocks];
    arr[i] = { ...arr[i], [key]: val } as StoryBlock;
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
            <label>Başlıq ({lang.toUpperCase()})</label>
            <input className={styles.input} value={block.title[lang] ?? ""}
              onChange={e => updateBlock(i, "title", { ...block.title, [lang]: e.target.value })} />
          </div>
          <label className={styles.sectionGroupLabel}>Paraqraflar ({lang.toUpperCase()})</label>
          {block.paragraphs.map((p, j) => (
            <div key={j} className={styles.field}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label>Paraqraf {j + 1}</label>
                {block.paragraphs.length > 1 && (
                  <button type="button" className={styles.removeBtn} style={{ fontSize: 11 }}
                    onClick={() => { const arr = [...block.paragraphs]; arr.splice(j, 1); updateBlock(i, "paragraphs", arr); }}>✕</button>
                )}
              </div>
              <RichEditor value={p[lang] ?? ""}
                onChange={v => { const arr = [...block.paragraphs]; arr[j] = { ...arr[j], [lang]: v }; updateBlock(i, "paragraphs", arr); }} />
            </div>
          ))}
          <button type="button" className={styles.addRowBtn}
            onClick={() => updateBlock(i, "paragraphs", [...block.paragraphs, { ...EMPTY_LOCALIZED }])}>
            + Paraqraf əlavə et
          </button>
          <div className={styles.sectionDivider} />
          <SingleImageUpload label="Şəkil (optional)" accept="image/webp"
            value={block.image ?? ""} onChange={v => updateBlock(i, "image", v)} />
          <div className={styles.field}>
            <label>Şəkil alt mətn ({lang.toUpperCase()})</label>
            <input className={styles.input} value={block.imageAlt?.[lang] ?? ""}
              onChange={e => updateBlock(i, "imageAlt", { ...block.imageAlt, [lang]: e.target.value })} />
          </div>
        </div>
      ))}
      <button type="button" className={styles.addRowBtn} onClick={addBlock}>+ Blok əlavə et</button>
    </div>
  );
}

function TeamSection({ data, onChange, lang }: { data: AboutData; onChange: (d: AboutData) => void; lang: Lang }) {
  const updL = (field: keyof AboutData, val: string) =>
    onChange({ ...data, [field]: { ...(data[field] as LocalizedString), [lang]: val } });

  return (
    <div className={styles.fullDrawerSection}>
      <h3 className={styles.drawerSectionTitle}>Team Bölməsi (Sol Yazı)</h3>
      <div className={styles.field}>
        <label>Başlıq ({lang.toUpperCase()})</label>
        <input className={styles.input} value={data.teamTitle[lang] ?? ""}
          placeholder="İLHAM VERƏN KOMANDA" onChange={e => updL("teamTitle", e.target.value)} />
      </div>
      <div className={styles.field}>
        <label>Təsvir ({lang.toUpperCase()})</label>
        <textarea className={styles.input} value={data.teamDescription[lang] ?? ""}
          placeholder="Biz tipik bir marketinq şirkəti deyilik..."
          rows={4} style={{ resize: "vertical", minHeight: 100 }}
          onChange={e => updL("teamDescription", e.target.value)} />
      </div>
      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label>Button mətni ({lang.toUpperCase()})</label>
          <input className={styles.input} value={data.teamCtaLabel[lang] ?? ""}
            placeholder="Keçid edin →" onChange={e => updL("teamCtaLabel", e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Button linki</label>
          <input className={styles.input} value={data.teamCtaHref ?? ""}
            placeholder="/OurTeam" onChange={e => onChange({ ...data, teamCtaHref: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [lang, setLang] = useState<Lang>("az");
  const [data, setData] = useState<AboutData>(DEFAULT_DATA);

  useEffect(() => {
    apiFetch("/about/settings")
      .then(d => {
        if (!d) return;
        setData({
          heroImage: d.heroImage ?? "",
          heroImageAlt: d.heroImageAlt ?? { ...EMPTY_LOCALIZED },
          heroBadge: d.heroBadge ?? { ...EMPTY_LOCALIZED },
          heroTitle: d.heroTitle ?? { ...EMPTY_LOCALIZED },
          heroParagraphs: Array.isArray(d.heroParagraphs) && d.heroParagraphs.length > 0
            ? d.heroParagraphs : [{ ...EMPTY_LOCALIZED }],
          heroStats: Array.isArray(d.heroStats) ? d.heroStats : [],
          storyBlocks: Array.isArray(d.storyBlocks) ? d.storyBlocks : [],
          teamTitle: d.teamTitle ?? { ...EMPTY_LOCALIZED },
          teamDescription: d.teamDescription ?? { ...EMPTY_LOCALIZED },
          teamCtaLabel: d.teamCtaLabel ?? { ...EMPTY_LOCALIZED },
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
      await apiFetch("/about/settings", { method: "PUT", body: JSON.stringify(data) });
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
          <h1 className={styles.title}>Haqqımızda</h1>
          <p className={styles.subtitle}>About Us səhifəsinin məzmununu idarə edin</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saveStatus === "success" && <span style={{ color: "#16a34a", fontSize: 14, fontWeight: 600 }}>✓ Saxlanıldı</span>}
          {saveStatus === "error" && <span style={{ color: "#dc2626", fontSize: 14, fontWeight: 600 }}>✕ Xəta baş verdi</span>}
          <button className={styles.saveBtn} onClick={save} disabled={saving}>
            {saving ? "Saxlanır..." : "Saxla"}
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <LangTabs active={lang} onChange={setLang} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <HeroSection data={data} onChange={setData} lang={lang} />
        <StorySection data={data} onChange={setData} lang={lang} />
        <TeamSection data={data} onChange={setData} lang={lang} />
      </div>
    </div>
  );
}