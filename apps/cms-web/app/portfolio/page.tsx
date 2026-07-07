"use client";

import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove, horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/portfolio.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;

type Lang = "az" | "en" | "ru";
type LocalizedString = Record<string, string>;
type LocalizedImages = Partial<Record<Lang, string[]>>;

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
    console.error("API error:", res.status, body);
    throw new Error(body?.message ?? `Xəta baş verdi (${res.status})`);
  }
  return res.json();
}



async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API}/portfolio/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Şəkil yükləmə uğursuz");
  const data = await res.json();
  return data.url;
}

function toAbsUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${API}${path}`;
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "and")
    .replace(/ə/g, "e").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

// --- Localized images helpers -------------------------------------------

// Supports legacy shape (plain string[]) so old sections don't break.
function normalizeImages(images: any): LocalizedImages {
  if (Array.isArray(images)) return images.length ? { az: images } : {};
  return images ?? {};
}

// mainImage used to be a single string; normalize to LocalizedImages (max 1 each).
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

// Localized image upload: each language can have its own set of images.
// If a language has none, it falls back to displaying another language's
// images (AZ -> EN -> RU priority) marked as "default".
function ImageUploadArea({ images, onChange, maxImages, altText, onAltTextChange, altPlaceholder, activeLang }: {
  images: LocalizedImages;
  onChange: (imgs: LocalizedImages) => void;
  maxImages?: number;
  altText?: LocalizedString;
  onAltTextChange?: (val: LocalizedString) => void;
  altPlaceholder?: string;
  activeLang: Lang;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  // Admin panelində hər dil YALNIZ öz şəkillərini göstərir/redaktə edir.
  // Dillər arası fallback (boş olan dil üçün default şəkil göstərmək)
  // yalnız canlı saytın render tərəfində tətbiq olunmalıdır, admin formada yox.
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
      if (file.type !== "image/webp") { alert("Yalnız WebP"); continue; }
      const url = await uploadFile(file);
      urls.push(url);
    }
    setLangImages([...base, ...urls]);
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
    <div className={styles.imageUploadWrap}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={currentList.map((_, i) => `img-${i}`)} strategy={horizontalListSortingStrategy}>
          <div className={styles.imageGrid}>
            {currentList.map((img, i) => (
              <div key={`img-${i}`} className={styles.imageItem}>
                <SortableImage id={`img-${i}`} src={img} onRemove={() => removeAt(i)} />
                {i === 0 && <span className={styles.heroLabel}>Hero</span>}
              </div>
            ))}
            {(!maxImages || currentList.length < maxImages) && (
              <div className={styles.imageAddBtn} onClick={() => inputRef.current?.click()}>
                <span>+</span><small>WebP əlavə et</small>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {onAltTextChange !== undefined && (
        <div className={styles.field} style={{ marginTop: 8 }}>
          <label>Şəkil Alt Text — SEO ({activeLang.toUpperCase()})</label>
          <input className={styles.input}
            value={altText?.[activeLang] || ""}
            onChange={e => onAltTextChange({ ...(altText ?? {}), [activeLang]: e.target.value })}
            placeholder={altPlaceholder ?? "Şəkil alt text..."} />
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/webp" multiple style={{ display: "none" }} onChange={handleSelect} />
    </div>
  );
}

function HeroSectionEditor({ data, onChange, activeLang }: { data: any; onChange: (d: any) => void; activeLang: Lang }) {
  return (
    <div className={styles.sectionFields}>
      <div className={styles.field}><label>Nömrə</label>
        <input className={styles.input} value={data.number ?? ""}
          onChange={e => onChange({ ...data, number: e.target.value })} placeholder="01" />
      </div>
      <div className={styles.field}><label>Button Yazısı ({activeLang.toUpperCase()})</label>
        <input className={styles.input}
          value={data.contactLabel?.[activeLang] || ""}
          onChange={e => onChange({ ...data, contactLabel: { ...data.contactLabel, [activeLang]: e.target.value } })}
          placeholder="Bizimlə əlaqə" />
      </div>
      <div className={styles.field}><label>Başlıq ({activeLang.toUpperCase()})</label>
        <LocalizedRichEditor value={data.title ?? {}} lang={activeLang}
          onChange={v => onChange({ ...data, title: v })} />
      </div>
      <div className={styles.field}><label>Təsvir ({activeLang.toUpperCase()})</label>
        <LocalizedRichEditor value={data.description ?? {}} lang={activeLang}
          onChange={v => onChange({ ...data, description: v })} />
      </div>
      <div className={styles.field}>
        <label>Şəkillər <small>(maksimum 4 — 1 hero + 3 qalereya)</small></label>
        <ImageUploadArea
          images={normalizeImages(data.images)}
          onChange={imgs => onChange({ ...data, images: imgs })}
          maxImages={4}
          altText={data.imagesAlt ?? {}}
          onAltTextChange={v => onChange({ ...data, imagesAlt: v })}
          altPlaceholder="Bütün şəkillər üçün alt text"
          activeLang={activeLang} />
      </div>
    </div>
  );
}

function StepsSectionEditor({ data, onChange, activeLang }: { data: any; onChange: (d: any) => void; activeLang: Lang }) {
  const steps = data.steps ?? [];
  const sensors = useSensors(useSensor(PointerSensor));

  const addStep = () => onChange({ ...data, steps: [...steps, { number: String(steps.length + 1).padStart(2, "0"), label: {} }] });
  const removeStep = (i: number) => onChange({ ...data, steps: steps.filter((_: any, idx: number) => idx !== i) });
  const updateStep = (i: number, key: string, val: any) => {
    const arr = [...steps]; arr[i] = { ...arr[i], [key]: val };
    onChange({ ...data, steps: arr });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oi = steps.findIndex((_: any, i: number) => `step-${i}` === active.id);
    const ni = steps.findIndex((_: any, i: number) => `step-${i}` === over.id);
    onChange({ ...data, steps: arrayMove(steps, oi, ni) });
  };

  return (
    <div className={styles.sectionFields}>
      <div className={styles.field}><label>Təsvir ({activeLang.toUpperCase()})</label>
        <LocalizedRichEditor value={data.description ?? {}} lang={activeLang}
          onChange={v => onChange({ ...data, description: v })} />
      </div>
      <div className={styles.field}>
        <label>Addımlar</label>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={steps.map((_: any, i: number) => `step-${i}`)} strategy={verticalListSortingStrategy}>
            {steps.map((step: any, i: number) => (
              <SortableStepRow key={`step-${i}`} id={`step-${i}`} step={step}
                activeLang={activeLang}
                onChange={(key, val) => updateStep(i, key, val)}
                onRemove={() => removeStep(i)} />
            ))}
          </SortableContext>
        </DndContext>
        <button type="button" className={styles.addRowBtn} onClick={addStep}>+ Addım əlavə et</button>
      </div>
    </div>
  );
}

function SortableStepRow({ id, step, activeLang, onChange, onRemove }: {
  id: string; step: any; activeLang: Lang;
  onChange: (key: string, val: any) => void; onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={styles.stepRow}>
      <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
      <input className={styles.inputSmall} value={step.number ?? ""}
        onChange={e => onChange("number", e.target.value)} placeholder="01" />
      <input className={styles.input}
        value={step.label?.[activeLang] || ""}
        onChange={e => onChange("label", { ...step.label, [activeLang]: e.target.value })}
        placeholder="Addım adı" />
      <button type="button" className={styles.removeBtn} onClick={onRemove}>✕</button>
    </div>
  );
}

function ServiceSectionEditor({ data, onChange, activeLang }: { data: any; onChange: (d: any) => void; activeLang: Lang }) {
  const items = data.items ?? [];

  const addItem = () => onChange({ ...data, items: [...items, { number: String(items.length + 1).padStart(2, "0"), title: {}, images: {} }] });
  const removeItem = (i: number) => onChange({ ...data, items: items.filter((_: any, idx: number) => idx !== i) });
  const updateItem = (i: number, key: string, val: any) => {
    const arr = [...items]; arr[i] = { ...arr[i], [key]: val };
    onChange({ ...data, items: arr });
  };

  return (
    <div className={styles.sectionFields}>
      <div className={styles.twoCol}>
        <div className={styles.field}><label>Badge ({activeLang.toUpperCase()})</label>
          <input className={styles.input}
            value={data.badge?.[activeLang] || ""}
            onChange={e => onChange({ ...data, badge: { ...data.badge, [activeLang]: e.target.value } })}
            placeholder="Brendinq" />
        </div>
        <div className={styles.field}><label>Böyük Nömrə</label>
          <input className={styles.input} value={data.bigNumber ?? ""}
            onChange={e => onChange({ ...data, bigNumber: e.target.value })} placeholder="02" />
        </div>
      </div>
      <div className={styles.field}><label>Başlıq ({activeLang.toUpperCase()})</label>
        <LocalizedRichEditor value={data.title ?? {}} lang={activeLang}
          onChange={v => onChange({ ...data, title: v })} />
      </div>
      <div className={styles.field}><label>Təsvir 1 ({activeLang.toUpperCase()})</label>
        <LocalizedRichEditor
          value={{ [activeLang]: data.descriptions?.[0]?.[activeLang] || "" }}
          lang={activeLang}
          onChange={v => onChange({ ...data, descriptions: [{ ...(data.descriptions?.[0] ?? {}), [activeLang]: v[activeLang] }, data.descriptions?.[1] ?? {}] })} />
      </div>
      <div className={styles.field}><label>Təsvir 2 ({activeLang.toUpperCase()})</label>
        <LocalizedRichEditor
          value={{ [activeLang]: data.descriptions?.[1]?.[activeLang] || "" }}
          lang={activeLang}
          onChange={v => onChange({ ...data, descriptions: [data.descriptions?.[0] ?? {}, { ...(data.descriptions?.[1] ?? {}), [activeLang]: v[activeLang] }] })} />
      </div>
      <div className={styles.field}>
        <label>Elementlər</label>
        {items.map((item: any, i: number) => (
          <div key={i} className={styles.serviceItemBlock}>
            <div className={styles.serviceItemHeader}>
              <input className={styles.inputSmall} value={item.number ?? ""}
                onChange={e => updateItem(i, "number", e.target.value)} placeholder="01" />
              <input className={styles.input}
                value={item.title?.[activeLang] || ""}
                onChange={e => updateItem(i, "title", { ...item.title, [activeLang]: e.target.value })}
                placeholder="Element adı" />
              <button type="button" className={styles.removeBtn} onClick={() => removeItem(i)}>✕</button>
            </div>
            <ImageUploadArea
              images={normalizeImages(item.images)}
              onChange={imgs => updateItem(i, "images", imgs)}
              maxImages={i === 0 ? 3 : 2}
              altText={item.imagesAlt ?? {}}
              onAltTextChange={v => updateItem(i, "imagesAlt", v)}
              altPlaceholder={i === 0 ? "3 şəkil üçün alt text" : "2 şəkil üçün alt text"}
              activeLang={activeLang} />
          </div>
        ))}
        {items.length < 2 && (
          <button type="button" className={styles.addRowBtn} onClick={addItem}>+ Element əlavə et</button>
        )}
      </div>
    </div>
  );
}

function StrategySectionEditor({ data, onChange, activeLang }: { data: any; onChange: (d: any) => void; activeLang: Lang }) {
  return (
    <div className={styles.sectionFields}>
      <div className={styles.twoCol}>
        <div className={styles.field}><label>Badge ({activeLang.toUpperCase()})</label>
          <input className={styles.input}
            value={data.badge?.[activeLang] || ""}
            onChange={e => onChange({ ...data, badge: { ...data.badge, [activeLang]: e.target.value } })}
            placeholder="Brendinq" />
        </div>

        <div className={styles.field}><label>Button Yazısı ({activeLang.toUpperCase()})</label>
          <input className={styles.input}
            value={data.contactLabel?.[activeLang] || ""}
            onChange={e => onChange({ ...data, contactLabel: { ...data.contactLabel, [activeLang]: e.target.value } })}
            placeholder="Bizimlə əlaqə" />
        </div>
      </div>
      <div className={styles.field}><label>Başlıq ({activeLang.toUpperCase()})</label>
        <LocalizedRichEditor value={data.title ?? {}} lang={activeLang}
          onChange={v => onChange({ ...data, title: v })} />
      </div>
      <div className={styles.field}><label>Sitat ({activeLang.toUpperCase()})</label>
        <LocalizedRichEditor value={data.quote ?? {}} lang={activeLang}
          onChange={v => onChange({ ...data, quote: v })} />
      </div>
      <div className={styles.field}><label>Təsvir 1 ({activeLang.toUpperCase()})</label>
        <LocalizedRichEditor
          value={{ [activeLang]: data.descriptions?.[0]?.[activeLang] || "" }}
          lang={activeLang}
          onChange={v => onChange({ ...data, descriptions: [{ ...(data.descriptions?.[0] ?? {}), [activeLang]: v[activeLang] }, data.descriptions?.[1] ?? {}] })} />
      </div>
      <div className={styles.field}><label>Təsvir 2 ({activeLang.toUpperCase()})</label>
        <LocalizedRichEditor
          value={{ [activeLang]: data.descriptions?.[1]?.[activeLang] || "" }}
          lang={activeLang}
          onChange={v => onChange({ ...data, descriptions: [data.descriptions?.[0] ?? {}, { ...(data.descriptions?.[1] ?? {}), [activeLang]: v[activeLang] }] })} />
      </div>
      <div className={styles.field}><label>Sitat şəkli</label>
        <ImageUploadArea
          images={normalizeImages(data.quoteImages)}
          onChange={imgs => onChange({ ...data, quoteImages: imgs })}
          altText={data.quoteImagesAlt ?? {}}
          onAltTextChange={v => onChange({ ...data, quoteImagesAlt: v })}
          altPlaceholder="Sitat şəkli üçün alt text"
          activeLang={activeLang} />
      </div>
      <div className={styles.field}><label>Əsas şəkil</label>
        <ImageUploadArea images={normalizeMainImage(data.mainImage)}
          onChange={imgs => onChange({ ...data, mainImage: imgs })}
          maxImages={1}
          activeLang={activeLang} />
      </div>
      <div className={styles.field}><label>Kiçik şəkillər</label>
        <ImageUploadArea
          images={normalizeImages(data.images)}
          onChange={imgs => onChange({ ...data, images: imgs })}
          altText={data.imagesAlt ?? {}}
          onAltTextChange={v => onChange({ ...data, imagesAlt: v })}
          altPlaceholder="Bütün şəkillər üçün alt text"
          activeLang={activeLang} />
      </div>
    </div>
  );
}

function OverlaySectionEditor({ data, onChange, activeLang }: { data: any; onChange: (d: any) => void; activeLang: Lang }) {
  return (
    <div className={styles.sectionFields}>
      <div className={styles.twoCol}>
        <div className={styles.field}><label>Badge ({activeLang.toUpperCase()})</label>
          <input className={styles.input}
            value={data.badge?.[activeLang] || ""}
            onChange={e => onChange({ ...data, badge: { ...data.badge, [activeLang]: e.target.value } })}
            placeholder="Brendinq" />
        </div>
      </div>
      <div className={styles.field}><label>Başlıq ({activeLang.toUpperCase()})</label>
        <LocalizedRichEditor value={data.title ?? {}} lang={activeLang}
          onChange={v => onChange({ ...data, title: v })} />
      </div>
      <div className={styles.field}><label>Şəkil</label>
        <ImageUploadArea
          images={normalizeImages(data.images)}
          onChange={imgs => onChange({ ...data, images: imgs })}
          altText={data.imagesAlt ?? {}}
          onAltTextChange={v => onChange({ ...data, imagesAlt: v })}
          altPlaceholder="Bütün şəkillər üçün alt text"
          activeLang={activeLang} />
      </div>
      <div className={styles.field}><label>Təsvir 1 ({activeLang.toUpperCase()})</label>
        <LocalizedRichEditor
          value={{ [activeLang]: data.descriptions?.[0]?.[activeLang] || "" }}
          lang={activeLang}
          onChange={v => onChange({ ...data, descriptions: [{ ...(data.descriptions?.[0] ?? {}), [activeLang]: v[activeLang] }, data.descriptions?.[1] ?? {}] })} />
      </div>
      <div className={styles.field}><label>Təsvir 2 ({activeLang.toUpperCase()})</label>
        <LocalizedRichEditor
          value={{ [activeLang]: data.descriptions?.[1]?.[activeLang] || "" }}
          lang={activeLang}
          onChange={v => onChange({ ...data, descriptions: [data.descriptions?.[0] ?? {}, { ...(data.descriptions?.[1] ?? {}), [activeLang]: v[activeLang] }] })} />
      </div>
    </div>
  );
}

const SECTION_TYPES = [
  { type: "hero", label: "Hero" },
  { type: "steps", label: "Steps" },
  { type: "service", label: "Service" },
  { type: "strategy", label: "Strategy" },
  { type: "overlay", label: "Overlay" },
];

function SectionEditor({ section, index, activeLang, onChange, onRemove }: {
  section: any; index: number; activeLang: Lang;
  onChange: (d: any) => void; onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);

  const renderEditor = () => {
    switch (section.type) {
      case "hero": return <HeroSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
      case "steps": return <StepsSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
      case "service": return <ServiceSectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
      case "strategy": return <StrategySectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
      case "overlay": return <OverlaySectionEditor data={section} onChange={onChange} activeLang={activeLang} />;
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
          <button
            type="button"
            className={section.isVisible === false ? styles.inactiveTogggle : styles.activeTogggle}
            onClick={() => onChange({ ...section, isVisible: section.isVisible === false ? true : false })}
          >
            {section.isVisible === false ? "Gizli" : "Görünür"}
          </button>
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

function SortableRow({ p, onEdit, onToggle, onToggleHomepage, onDelete }: {
  p: any; onEdit: (p: any) => void;
  onToggle: (p: any) => void; onToggleHomepage: (p: any) => void; onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const titleAz = typeof p.title === "object" ? (p.title?.az || "") : (p.title || "");

  return (
    <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
      <td className={styles.num}>
        <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
      </td>
      <td>
        <div className={styles.portfolioInfo}>
          {p.coverImage && <img src={toAbsUrl(p.coverImage)} alt="" className={styles.coverThumb} />}
          <div>
            <div className={styles.portfolioTitle} dangerouslySetInnerHTML={{ __html: titleAz }} />
            <p className={styles.portfolioSlug}>/{p.slug}</p>
          </div>
        </div>
      </td>
      <td>
        <div className={styles.tagList}>
          {p.tags?.map((tag: string, i: number) => <span key={i} className={styles.tag}>{tag}</span>)}
        </div>
      </td>
      <td>
        <span className={`${styles.badge} ${p.isVisible ? styles.badgeVisible : styles.badgeHidden}`}>
          {p.isVisible ? "Görünür" : "Gizli"}
        </span>
      </td>
      <td>
        <div className={styles.actions}>
          <button className={styles.editBtn} onClick={() => onEdit(p)}>Düzəlt</button>
          <button className={`${styles.visBtn} ${p.isVisible ? styles.visBtnHide : styles.visBtnShow}`} onClick={() => onToggle(p)}>
            {p.isVisible ? "Gizlət" : "Göstər"}
          </button>
          <button className={`${styles.visBtn} ${p.isHomepage ? styles.visBtnHide : styles.visBtnShow}`} onClick={() => onToggleHomepage(p)}>
            {p.isHomepage ? "Ana səhifədə" : "Ana səhifəyə əlavə et"}
          </button>
          <button className={styles.deleteBtn} onClick={() => onDelete(p.id)}>Sil</button>
        </div>
      </td>
    </tr>
  );
}

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>("az");

  const [title, setTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [sections, setSections] = useState<any[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<number | null>(null);
  const [seoTitle, setSeoTitle] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [seoDescription, setSeoDescription] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [seoKeywords, setSeoKeywords] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [schemaText, setSchemaText] = useState("");
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [schemaGenerating, setSchemaGenerating] = useState(false);
  const [schemaSaving, setSchemaSaving] = useState(false);
  const [schemaSaveStatus, setSchemaSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const [portfolioTitle, setPortfolioTitle] = useState<LocalizedString>({
    az: "",
    en: "",
    ru: "",
  });

  const [portfolioDescription, setPortfolioDescription] = useState<LocalizedString>({
    az: "",
    en: "",
    ru: "",
  });

  const [portfolioButtonText, setPortfolioButtonText] = useState<LocalizedString>({
    az: "",
    en: "",
    ru: "",
  });
  const coverInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor));
  const [gif, setGif] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/portfolio");
      setPortfolios(data);
    } finally { setLoading(false); }
  };


  const loadSettings = async () => {
    try {
      const data = await apiFetch("/portfolio/settings");
      if (!data) return;

      setSettingsId(data.id);
      setPortfolioTitle(data.sectionTitle ?? { az: "", en: "", ru: "" });
      setPortfolioDescription(data.dropdownLabel ?? { az: "", en: "", ru: "" });
      setPortfolioButtonText(data.moreButtonLabel ?? { az: "", en: "", ru: "" });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { load(); loadSettings(); }, []);


  useEffect(() => {
    if (editItem) {
      setSchemaText(editItem.schema?.[activeLang] ? JSON.stringify(editItem.schema[activeLang], null, 2) : "");
      setSchemaError(null);
    }
  }, [activeLang]);

  const openCreate = () => {
    setEditItem(null);
    setTitle({ az: "", en: "", ru: "" });
    setSlug(""); setTags(""); setCoverImage("");
    setCoverImageAlt({ az: "", en: "", ru: "" });
    setSeoTitle({ az: "", en: "", ru: "" });
    setSeoDescription({ az: "", en: "", ru: "" });
    setSeoKeywords({ az: "", en: "", ru: "" });
    setSchemaText("");
    setGif("");
    setSections([]);
    setDrawerOpen(true);

  };

  const openEdit = (p: any) => {
    setEditItem(p);
    setTitle(p.title ?? { az: "", en: "", ru: "" });
    setSeoTitle(p.seoTitle ?? { az: "", en: "", ru: "" });
    setSeoDescription(p.seoDescription ?? { az: "", en: "", ru: "" });
    setSeoKeywords(p.seoKeywords ?? { az: "", en: "", ru: "" });
    setSchemaText(p.schema?.[activeLang] ? JSON.stringify(p.schema[activeLang], null, 2) : "");
    setSlug(p.slug ?? "");
    setTags(p.tags?.join(", ") ?? "");
    setCoverImage(p.coverImage ?? "");
    setCoverImageAlt(
      typeof p.coverImageAlt === "object"
        ? (p.coverImageAlt ?? { az: "", en: "", ru: "" })
        : { az: p.coverImageAlt ?? "", en: "", ru: "" }
    );
    setGif(p.gif ?? "");
    setSections(p.sections ?? []);
    setDrawerOpen(true);
  };

  const closeDrawer = () => { setDrawerOpen(false); setEditItem(null); };

  const handleTitleChange = (val: LocalizedString) => {
    setTitle(val);
    setSlug(generateSlug(val.az || ""));
  };

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/webp") { alert("Yalnız WebP"); return; }
    const url = await uploadFile(file);
    setCoverImage(url);
  };

  const addSection = (type: string) => setSections(prev => [...prev, { type, isVisible: true }]);
  const updateSection = (i: number, data: any) => setSections(prev => { const arr = [...prev]; arr[i] = data; return arr; });
  const removeSection = (i: number) => setSections(prev => prev.filter((_, idx) => idx !== i));


  const generateSchema = async () => {
    if (!editItem) return;
    setSchemaGenerating(true);
    setSchemaError(null);
    try {
      const generated = await apiFetch(`/portfolio/${editItem.id}/schema/preview`);
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
      await apiFetch(`/portfolio/${editItem.id}/schema`, {
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
        title, slug,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        coverImage, coverImageAlt, gif: gif || null, sections, seoTitle, seoDescription, seoKeywords,
      };
      if (editItem) {
        await apiFetch(`/portfolio/${editItem.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/portfolio", { method: "POST", body: JSON.stringify(payload) });
      }
      closeDrawer(); load();
    } finally { setSaving(false); }
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      const payload = {
        sectionTitle: portfolioTitle,
        dropdownLabel: portfolioDescription,
        moreButtonLabel: portfolioButtonText,
      };
      if (settingsId) {
        await apiFetch(`/portfolio/settings/${settingsId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/portfolio/settings", { method: "POST", body: JSON.stringify(payload) });
      }
      await loadSettings();
      setSettingsOpen(false);
    } catch (err: any) {
      alert(err.message ?? "Settings saxlanılarkən xəta baş verdi");
    } finally {
      setSettingsSaving(false);
    }
  };

  const toggleVisibility = async (p: any) => {
    await apiFetch(`/portfolio/${p.id}/visibility`, {
      method: "PATCH", body: JSON.stringify({ isVisible: !p.isVisible }),
    });
    load();
  };

  const toggleHomepage = async (p: any) => {
    await apiFetch(`/portfolio/${p.id}/homepage`, {
      method: "PATCH", body: JSON.stringify({ isHomepage: !p.isHomepage }),
    });
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await apiFetch(`/portfolio/${deleteId}`, { method: "DELETE" });
    setDeleteId(null); load();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oi = portfolios.findIndex(p => p.id === active.id);
    const ni = portfolios.findIndex(p => p.id === over.id);
    const newList = arrayMove(portfolios, oi, ni);
    setPortfolios(newList);
    setReordering(true);
    try {
      await apiFetch("/portfolio/reorder", { method: "PATCH", body: JSON.stringify({ ids: newList.map(p => p.id) }) });
    } finally { setReordering(false); }
  };

  const usedTypes = sections.map(s => s.type);

  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/ə/g, "e").replace(/ğ/g, "g").replace(/ı/g, "i")
      .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c");

  const filteredPortfolios = portfolios.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = normalize(searchQuery);
    const titleAz = normalize((typeof p.title === "object" ? (p.title?.az || "") : (p.title || "")).replace(/<[^>]*>/g, ""));
    const slugVal = normalize(p.slug || "");
    const tagsVal = normalize((p.tags ?? []).join(" "));
    return titleAz.includes(q) || slugVal.includes(q) || tagsVal.includes(q);
  });

  return (


    <div className={styles.page}>
      <div className={styles.fullDrawerSection}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <h2>Settings</h2>
            <p>Portfolio səhifəsinin ümumi məlumatları</p>
          </div>

          <button
            className={styles.saveBtn}
            onClick={saveSettings}
            disabled={settingsSaving}
          >
            {settingsSaving ? "Saxlanır..." : "Save"}
          </button>
        </div>

        <LangTabs
          active={activeLang}
          onChange={setActiveLang}
        />

        <div className={styles.field}>
          <label>Başlıq ({activeLang.toUpperCase()})</label>

          <LocalizedRichEditor
            value={portfolioTitle}
            lang={activeLang}
            onChange={setPortfolioTitle}
          />
        </div>

        <div className={styles.field}>
          <label>Dropdown Label ({activeLang.toUpperCase()})</label>

          <LocalizedRichEditor
            value={portfolioDescription}
            lang={activeLang}
            onChange={setPortfolioDescription}
          />
        </div>

        <div className={styles.field}>
          <label>Button Yazısı ({activeLang.toUpperCase()})</label>

          <input
            className={styles.input}
            value={portfolioButtonText[activeLang] || ""}
            onChange={(e) =>
              setPortfolioButtonText({
                ...portfolioButtonText,
                [activeLang]: e.target.value,
              })
            }
            placeholder="Bizimlə əlaqə"
          />
        </div>
      </div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Portfolio</h1>
          <p className={styles.subtitle}>Portfolio işlərini idarə edin</p>
        </div>
        <div className={styles.headerRight}>
          {reordering && <span className={styles.reorderingText}>Saxlanır...</span>}
          <button className={styles.addBtn} onClick={openCreate}>+ Yeni Portfolio</button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          className={styles.input}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Başlıq, slug və ya etiketə görə axtar..."
          style={{ maxWidth: 320 }}
        />
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.empty}>Yüklənir...</div>
        ) : portfolios.length === 0 ? (
          <div className={styles.empty}>Hələ portfolio əlavə edilməyib</div>
        ) : filteredPortfolios.length === 0 ? (
          <div className={styles.empty}>Axtarışa uyğun nəticə tapılmadı</div>
        ) : searchQuery.trim() ? (
          <table className={styles.table}>
            <thead><tr><th></th><th>Portfolio</th><th>Etiketlər</th><th>Status</th><th>Əməliyyatlar</th></tr></thead>
            <tbody>
              {filteredPortfolios.map(p => (
                <SortableRow key={p.id} p={p} onEdit={openEdit}
                  onToggle={toggleVisibility} onToggleHomepage={toggleHomepage}
                  onDelete={setDeleteId} />
              ))}
            </tbody>
          </table>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className={styles.table}>
              <thead><tr><th></th><th>Portfolio</th><th>Etiketlər</th><th>Status</th><th>Əməliyyatlar</th></tr></thead>
              <SortableContext items={portfolios.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {portfolios.map(p => (
                    <SortableRow key={p.id} p={p} onEdit={openEdit}
                      onToggle={toggleVisibility} onToggleHomepage={toggleHomepage}
                      onDelete={setDeleteId} />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        )}
      </div>

      {drawerOpen && (
        <div className={styles.fullDrawer}>
          <div className={styles.fullDrawerHeader}>
            <h2>{editItem ? "Portfolio Düzəlt" : "Yeni Portfolio"}</h2>
            <div className={styles.fullDrawerHeaderRight}>
              <button className={styles.cancelBtn} onClick={closeDrawer}>Ləğv et</button>
              <button className={styles.saveBtn} onClick={save} disabled={saving}>
                {saving ? "Saxlanır..." : "Saxla"}
              </button>
            </div>
          </div>

          <div className={styles.fullDrawerBody}>
            <LangTabs active={activeLang} onChange={setActiveLang} />

            <div className={styles.fullDrawerSection}>
              <h3 className={styles.drawerSectionTitle}>Əsas Məlumatlar</h3>
              <div className={styles.twoCol}>
                <div className={styles.field}><label>Başlıq ({activeLang.toUpperCase()})</label>
                  <LocalizedRichEditor value={title} lang={activeLang}
                    onChange={handleTitleChange} />
                </div>
                <div className={styles.field}><label>Slug</label>
                  <input className={styles.input} value={slug}
                    onChange={e => setSlug(e.target.value)} placeholder="marina-village" />
                </div>
              </div>
              <div className={styles.field}><label>Etiketlər <small>(vergüllə ayırın)</small></label>
                <input className={styles.input} value={tags}
                  onChange={e => setTags(e.target.value)} placeholder="SMM, Development" />
              </div>
              <div className={styles.field}><label>Cover şəkil</label>
                <input ref={coverInputRef} type="file" accept="image/webp"
                  style={{ display: "none" }} onChange={handleCoverSelect} />
                <div className={styles.coverUploadArea} onClick={() => coverInputRef.current?.click()}>
                  {coverImage ? (
                    <img src={toAbsUrl(coverImage)} alt="cover" className={styles.coverPreview} />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>🖼️</span><span>Cover şəkil seçin</span><small>WebP</small>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.field}><label>Cover alt text ({activeLang.toUpperCase()})</label>
                <input className={styles.input}
                  value={coverImageAlt[activeLang] || ""}
                  onChange={e => setCoverImageAlt(prev => ({ ...prev, [activeLang]: e.target.value }))}
                  placeholder="Marina Village layihəsi cover şəkli" />
              </div>
              <div className={styles.field}>
                <label>GIF (optional)</label>
                <input
                  type="file"
                  accept="image/gif,image/webp,video/mp4"
                  style={{ display: "none" }}
                  id="gif-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadFile(file);
                    setGif(url);
                  }}
                />
                <div className={styles.coverUploadArea} onClick={() => document.getElementById("gif-upload")?.click()}>
                  {gif ? (
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <img src={toAbsUrl(gif)} alt="gif" className={styles.coverPreview} />
                      <button type="button" className={styles.imageRemoveBtn}
                        onClick={e => { e.stopPropagation(); setGif(""); }}>✕</button>
                    </div>
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>🎞️</span><span>GIF seçin</span><small>GIF / WebP</small>
                    </div>
                  )}
                </div>
              </div>



            </div>

            <div className={styles.fullDrawerSection}>
              <h3 className={styles.drawerSectionTitle}>Detail Səhifəsi Sectionları</h3>
              {sections.map((section, i) => (
                <SectionEditor key={`section-${i}-${section.type}`}
                  section={section} index={i} activeLang={activeLang}
                  onChange={data => updateSection(i, data)}
                  onRemove={() => removeSection(i)} />
              ))}
              <div className={styles.addSectionRow}>
                {SECTION_TYPES.filter(({ type }) => !usedTypes.includes(type)).map(({ type, label }) => (
                  <button key={type} type="button" className={styles.addSectionBtn}
                    onClick={() => addSection(type)}>+ {label}</button>
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
            </div>

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
      )}

      {deleteId && (
        <div className={styles.overlay} onClick={() => setDeleteId(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Silməyi təsdiq edin</h2>
              <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}><p>Bu portfolionu silmək istədiyinizə əminsiniz?</p></div>
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