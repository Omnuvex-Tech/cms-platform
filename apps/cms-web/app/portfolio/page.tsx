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
    .replace(/ə/g, "e").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-").trim();
}

// ---- Rich Editor ----
function RichEditor({ value, onChange }: {
  value: string;
  onChange: (val: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className={styles.richEditor}>
      <div className={styles.richToolbar}>
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive("bold") ? styles.toolbarBtnActive : styles.toolbarBtn}>
          <b>B</b>
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive("italic") ? styles.toolbarBtnActive : styles.toolbarBtn}>
          <i>I</i>
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={editor?.isActive("underline") ? styles.toolbarBtnActive : styles.toolbarBtn}>
          <u>U</u>
        </button>
        <div className={styles.toolbarDivider} />
        {([1, 2, 3, 4, 5, 6] as const).map(level => (
          <button
            key={level}
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
            className={editor?.isActive("heading", { level }) ? styles.toolbarBtnActive : styles.toolbarBtn}
          >
            H{level}
          </button>
        ))}
        <button type="button" onClick={() => editor?.chain().focus().setParagraph().run()}
          className={editor?.isActive("paragraph") ? styles.toolbarBtnActive : styles.toolbarBtn}>
          P
        </button>
      </div>
      <EditorContent editor={editor} className={styles.richContent} />
    </div>
  );
}

// ---- Sortable Image ----
function SortableImage({ id, src, onRemove }: {
  id: string;
  src: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.imageItem}>
      <div className={styles.imageDragHandle} {...attributes} {...listeners}>⠿</div>
      <img src={toAbsUrl(src)} alt="" className={styles.imageThumb} />
      <button type="button" className={styles.imageRemoveBtn} onClick={onRemove}>✕</button>
      {src === src && <span className={styles.heroLabel} style={{ display: 'none' }} />}
    </div>
  );
}
function ImageUploadArea({ images, onChange, maxImages, altText, onAltTextChange, altPlaceholder }: {
  images: string[];
  onChange: (imgs: string[]) => void;
  maxImages?: number;
  altText?: string;
  onAltTextChange?: (val: string) => void;
  altPlaceholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const urls: string[] = [];
    for (const file of files) {
      if (maxImages && images.length + urls.length >= maxImages) break;
      if (file.type !== "image/webp") { alert("Yalnız WebP"); continue; }
      const url = await uploadFile(file);
      urls.push(url);
    }
    onChange([...images, ...urls]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((_, i) => `img-${i}` === active.id);
    const newIndex = images.findIndex((_, i) => `img-${i}` === over.id);
    onChange(arrayMove(images, oldIndex, newIndex));
  };

  const canAdd = !maxImages || images.length < maxImages;

  return (
    <div className={styles.imageUploadWrap}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map((_, i) => `img-${i}`)} strategy={horizontalListSortingStrategy}>
          <div className={styles.imageGrid}>
            {images.map((img, i) => (
              <div key={`img-${i}`} className={styles.imageItem}>
                <SortableImage
                  id={`img-${i}`}
                  src={img}
                  onRemove={() => onChange(images.filter((_, idx) => idx !== i))}
                />
                {i === 0 && <span className={styles.heroLabel}>Hero</span>}
              </div>
            ))}
            {canAdd && (
              <div className={styles.imageAddBtn} onClick={() => inputRef.current?.click()}>
                <span>+</span>
                <small>WebP əlavə et</small>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {onAltTextChange !== undefined && (
        <div className={styles.field} style={{ marginTop: 8 }}>
          <label>Şəkil Alt Text <small>(SEO)</small></label>
          <input
            className={styles.input}
            value={altText ?? ""}
            onChange={e => onAltTextChange(e.target.value)}
            placeholder={altPlaceholder ?? "Şəkil alt text..."}
          />
        </div>
      )}


      <input ref={inputRef} type="file" accept="image/webp" multiple style={{ display: "none" }} onChange={handleSelect} />
    </div>
  );
}



function HeroSectionEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className={styles.sectionFields}>
      <div className={styles.field}>
        <label>Nömrə</label>
        <input className={styles.input} value={data.number ?? ""} onChange={e => onChange({ ...data, number: e.target.value })} placeholder="01" />
      </div>
      <div className={styles.field}>
        <label>Başlıq</label>
        <RichEditor value={data.title ?? ""} onChange={v => onChange({ ...data, title: v })} />
      </div>
      <div className={styles.field}>
        <label>Təsvir</label>
        <RichEditor value={data.description ?? ""} onChange={v => onChange({ ...data, description: v })} />
      </div>
      <div className={styles.field}>
        <label>Şəkillər <small>(birinci hero olacaq, sürüşdürüb sırala)</small></label>
        <ImageUploadArea
          images={data.images ?? []}
          onChange={imgs => onChange({ ...data, images: imgs })}
          altText={data.imagesAlt ?? ""}
          onAltTextChange={v => onChange({ ...data, imagesAlt: v })}
          altPlaceholder="Bütün şəkillər üçün alt text"
        />
      </div>
    </div>
  );
}

function StepsSectionEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const steps = data.steps ?? [];
  const sensors = useSensors(useSensor(PointerSensor));

  const addStep = () => onChange({ ...data, steps: [...steps, { number: String(steps.length + 1).padStart(2, "0"), label: "" }] });
  const removeStep = (i: number) => onChange({ ...data, steps: steps.filter((_: any, idx: number) => idx !== i) });
  const updateStep = (i: number, key: string, val: string) => {
    const arr = [...steps];
    arr[i] = { ...arr[i], [key]: val };
    onChange({ ...data, steps: arr });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = steps.findIndex((_: any, i: number) => `step-${i}` === active.id);
    const newIndex = steps.findIndex((_: any, i: number) => `step-${i}` === over.id);
    onChange({ ...data, steps: arrayMove(steps, oldIndex, newIndex) });
  };

  return (
    <div className={styles.sectionFields}>
      <div className={styles.field}>
        <label>Təsvir</label>
        <RichEditor value={data.description ?? ""} onChange={v => onChange({ ...data, description: v })} />
      </div>
      <div className={styles.field}>
        <label>Addımlar <small>(sürüşdürüb sırala)</small></label>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={steps.map((_: any, i: number) => `step-${i}`)} strategy={verticalListSortingStrategy}>
            {steps.map((step: any, i: number) => (
              <SortableStepRow
                key={`step-${i}`}
                id={`step-${i}`}
                step={step}
                onChange={(key, val) => updateStep(i, key, val)}
                onRemove={() => removeStep(i)}
              />
            ))}
          </SortableContext>
        </DndContext>
        <button type="button" className={styles.addRowBtn} onClick={addStep}>+ Addım əlavə et</button>
      </div>
    </div>
  );
}

function SortableStepRow({ id, step, onChange, onRemove }: {
  id: string;
  step: any;
  onChange: (key: string, val: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={styles.stepRow}>
      <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
      <input className={styles.inputSmall} value={step.number} onChange={e => onChange("number", e.target.value)} placeholder="01" />
      <input className={styles.input} value={step.label} onChange={e => onChange("label", e.target.value)} placeholder="Addım adı" />
      <button type="button" className={styles.removeBtn} onClick={onRemove}>✕</button>
    </div>
  );
}

function ServiceSectionEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const items = data.items ?? [];

  const addItem = () => onChange({ ...data, items: [...items, { number: String(items.length + 1).padStart(2, "0"), title: "", images: [] }] });
  const removeItem = (i: number) => onChange({ ...data, items: items.filter((_: any, idx: number) => idx !== i) });
  const updateItem = (i: number, key: string, val: any) => {
    const arr = [...items];
    arr[i] = { ...arr[i], [key]: val };
    onChange({ ...data, items: arr });
  };

  const getMaxImages = (i: number) => i === 0 ? 3 : 2;

  return (
    <div className={styles.sectionFields}>
      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label>Badge</label>
          <input className={styles.input} value={data.badge ?? ""} onChange={e => onChange({ ...data, badge: e.target.value })} placeholder="Brendinq" />
        </div>
        <div className={styles.field}>
          <label>Böyük Nömrə</label>
          <input className={styles.input} value={data.bigNumber ?? ""} onChange={e => onChange({ ...data, bigNumber: e.target.value })} placeholder="02" />
        </div>
      </div>
      <div className={styles.field}>
        <label>Başlıq</label>
        <RichEditor value={data.title ?? ""} onChange={v => onChange({ ...data, title: v })} />
      </div>
      <div className={styles.field}>
        <label>Təsvir 1</label>
        <RichEditor value={data.descriptions?.[0] ?? ""} onChange={v => onChange({ ...data, descriptions: [v, data.descriptions?.[1] ?? ""] })} />
      </div>
      <div className={styles.field}>
        <label>Təsvir 2</label>
        <RichEditor value={data.descriptions?.[1] ?? ""} onChange={v => onChange({ ...data, descriptions: [data.descriptions?.[0] ?? "", v] })} />
      </div>
      <div className={styles.field}>
        <label>Elementlər</label>
        {items.map((item: any, i: number) => (
          <div key={i} className={styles.serviceItemBlock}>
            <div className={styles.serviceItemHeader}>
              <input className={styles.inputSmall} value={item.number} onChange={e => updateItem(i, "number", e.target.value)} placeholder="01" />
              <input className={styles.input} value={item.title} onChange={e => updateItem(i, "title", e.target.value)} placeholder="Element adı" />
              <button type="button" className={styles.removeBtn} onClick={() => removeItem(i)}>✕</button>
            </div>
            <ImageUploadArea
              images={item.images ?? []}
              onChange={imgs => updateItem(i, "images", imgs)}
              maxImages={getMaxImages(i)}
              altText={item.imagesAlt ?? ""}
              onAltTextChange={v => updateItem(i, "imagesAlt", v)}
              altPlaceholder={i === 0 ? "3 şəkil üçün alt text" : "2 şəkil üçün alt text"}
            />
          </div>
        ))}
        {items.length < 2 && (
          <button type="button" className={styles.addRowBtn} onClick={addItem}>+ Element əlavə et</button>
        )}
      </div>
    </div>
  );
}

function StrategySectionEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className={styles.sectionFields}>
      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label>Badge</label>
          <input className={styles.input} value={data.badge ?? ""} onChange={e => onChange({ ...data, badge: e.target.value })} placeholder="Brendinq" />
        </div>
      </div>
      <div className={styles.field}>
        <label>Başlıq</label>
        <RichEditor value={data.title ?? ""} onChange={v => onChange({ ...data, title: v })} />
      </div>
      <div className={styles.field}>
        <label>Sitat</label>
        <RichEditor value={data.quote ?? ""} onChange={v => onChange({ ...data, quote: v })} />
      </div>
      <div className={styles.field}>
        <label>Təsvir 1</label>
        <RichEditor value={data.descriptions?.[0] ?? ""} onChange={v => onChange({ ...data, descriptions: [v, data.descriptions?.[1] ?? ""] })} />
      </div>
      <div className={styles.field}>
        <label>Təsvir 2</label>
        <RichEditor value={data.descriptions?.[1] ?? ""} onChange={v => onChange({ ...data, descriptions: [data.descriptions?.[0] ?? "", v] })} />
      </div>
      <div className={styles.field}>
        <label>Sitat şəkli</label>
        <ImageUploadArea
          images={data.quoteImage ? [data.quoteImage] : []}
          onChange={imgs => onChange({ ...data, quoteImage: imgs[0] ?? "" })}
          maxImages={1}
          altText={data.quoteImageAlt ?? ""}
          onAltTextChange={v => onChange({ ...data, quoteImageAlt: v })}
          altPlaceholder="Sitat şəkli alt text"
        />      </div>
      <div className={styles.field}>
        <label>Əsas şəkil</label>
        <ImageUploadArea images={data.mainImage ? [data.mainImage] : []} onChange={imgs => onChange({ ...data, mainImage: imgs[0] ?? "" })} maxImages={1} />
      </div>

      <div className={styles.field}>
        <label>Kiçik şəkillər</label>
        <ImageUploadArea
          images={data.smallImages ?? []}
          onChange={imgs => onChange({ ...data, smallImages: imgs })}
          maxImages={2}
          altText={data.smallImagesAlt ?? ""}
          onAltTextChange={v => onChange({ ...data, smallImagesAlt: v })}
          altPlaceholder="Kiçik şəkillər üçün alt text"
        />      </div>
    </div>
  );
}

function OverlaySectionEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className={styles.sectionFields}>
      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label>Badge</label>
          <input className={styles.input} value={data.badge ?? ""} onChange={e => onChange({ ...data, badge: e.target.value })} placeholder="Brendinq" />
        </div>
      </div>
      <div className={styles.field}>
        <label>Başlıq</label>
        <RichEditor value={data.title ?? ""} onChange={v => onChange({ ...data, title: v })} />
      </div>
      <div className={styles.field}>
        <label>Şəkil</label>
        <ImageUploadArea
          images={data.image ? [data.image] : []}
          onChange={imgs => onChange({ ...data, image: imgs[0] ?? "" })}
          maxImages={1}
          altText={data.imageAlt ?? ""}
          onAltTextChange={v => onChange({ ...data, imageAlt: v })}
          altPlaceholder="Şəkil alt text"
        />      </div>
      <div className={styles.field}>
        <label>Təsvir 1</label>
        <RichEditor value={data.descriptions?.[0] ?? ""} onChange={v => onChange({ ...data, descriptions: [v, data.descriptions?.[1] ?? ""] })} />
      </div>
      <div className={styles.field}>
        <label>Təsvir 2</label>
        <RichEditor value={data.descriptions?.[1] ?? ""} onChange={v => onChange({ ...data, descriptions: [data.descriptions?.[0] ?? "", v] })} />
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

function SectionEditor({ section, index, onChange, onRemove }: {
  section: any;
  index: number;
  onChange: (d: any) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `section-${index}-${section.type}` });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const renderEditor = () => {
    switch (section.type) {
      case "hero": return <HeroSectionEditor data={section} onChange={onChange} />;
      case "steps": return <StepsSectionEditor data={section} onChange={onChange} />;
      case "service": return <ServiceSectionEditor data={section} onChange={onChange} />;
      case "strategy": return <StrategySectionEditor data={section} onChange={onChange} />;
      case "overlay": return <OverlaySectionEditor data={section} onChange={onChange} />;
      default: return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.sectionBlock}>
      <div className={styles.sectionBlockHeader}>
        <div className={styles.sectionBlockLeft}>
          <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
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

// ---- Sortable Portfolio Row ----
function SortableRow({ p, onEdit, onToggle, onToggleHomepage, onDelete }: {
  p: any;
  onEdit: (p: any) => void;
  onToggle: (p: any) => void;
  onToggleHomepage: (p: any) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className={styles.num}>
        <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
      </td>
      <td>
        <div className={styles.portfolioInfo}>
          {p.coverImage && <img src={toAbsUrl(p.coverImage)} alt={p.title} className={styles.coverThumb} />}
          <div>
            <div
              className={styles.portfolioTitle}
              dangerouslySetInnerHTML={{ __html: p.title }}
            />            <p className={styles.portfolioSlug}>/{p.slug}</p>
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
          <button
            className={`${styles.visBtn} ${p.isHomepage ? styles.visBtnHide : styles.visBtnShow}`}
            onClick={() => onToggleHomepage(p)}
          >
            {p.isHomepage ? "Ana səhifədə" : "Ana səhifəyə əlavə et"}
          </button>
          <button className={styles.deleteBtn} onClick={() => onDelete(p.id)}>Sil</button>
        </div>
      </td>
    </tr>
  );
}

// ---- Main Page ----
export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [sections, setSections] = useState<any[]>([]);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/portfolio");
      setPortfolios(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setCoverImageAlt("");
    setTitle(""); setSlug(""); setTags(""); setCoverImage(""); setSections([]);
    setDrawerOpen(true);
  };

  const openEdit = (p: any) => {
    setEditItem(p);
    setTitle(p.title);
    setSlug(p.slug);
    setCoverImageAlt(p.coverImageAlt ?? "");
    setTags(p.tags?.join(", ") ?? "");
    setCoverImage(p.coverImage ?? "");
    setSections(p.sections ?? []);
    setDrawerOpen(true);
  };

  const closeDrawer = () => { setDrawerOpen(false); setEditItem(null); };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const plain = val.replace(/<[^>]*>/g, "");
    setSlug(generateSlug(plain));
  };

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/webp") { alert("Yalnız WebP"); return; }
    const url = await uploadFile(file);
    setCoverImage(url);
  };

  const addSection = (type: string) => {
    setSections(prev => [...prev, { type }]);
  };

  const updateSection = (i: number, data: any) => {
    setSections(prev => { const arr = [...prev]; arr[i] = data; return arr; });
  };

  const removeSection = (i: number) => {
    setSections(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s, i) => `section-${i}-${s.type}` === active.id);
    const newIndex = sections.findIndex((s, i) => `section-${i}-${s.type}` === over.id);
    setSections(prev => arrayMove(prev, oldIndex, newIndex));
  };

  const save = async () => {
    if (!title.trim() || !slug.trim()) return;
    setSaving(true);
    try {
      const payload = { title, slug, tags: tags.split(",").map(t => t.trim()).filter(Boolean), coverImage, coverImageAlt, sections };
      if (editItem) {
        await apiFetch(`/portfolio/${editItem.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/portfolio", { method: "POST", body: JSON.stringify(payload) });
      }
      closeDrawer();
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (p: any) => {
    try {
      await apiFetch(`/portfolio/${p.id}/visibility`, {
        method: "PATCH",
        body: JSON.stringify({ isVisible: !p.isVisible }),
      });
      load();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await apiFetch(`/portfolio/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    load();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = portfolios.findIndex(p => p.id === active.id);
    const newIndex = portfolios.findIndex(p => p.id === over.id);
    const newList = arrayMove(portfolios, oldIndex, newIndex);
    setPortfolios(newList);
    setReordering(true);
    try {
      await apiFetch("/portfolio/reorder", { method: "PATCH", body: JSON.stringify({ ids: newList.map(p => p.id) }) });
    } finally { setReordering(false); }
  };

  const toggleHomepage = async (p: any) => {
    try {
      await apiFetch(`/portfolio/${p.id}/homepage`, {
        method: "PATCH",
        body: JSON.stringify({ isHomepage: !p.isHomepage }),
      });
      load();
    } catch (e) { console.error(e); }
  };

  const usedTypes = sections.map(s => s.type);

  return (
    <div className={styles.page}>
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

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.empty}>Yüklənir...</div>
        ) : portfolios.length === 0 ? (
          <div className={styles.empty}>Hələ portfolio əlavə edilməyib</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th></th><th>Portfolio</th><th>Etiketlər</th><th>Status</th><th>Əməliyyatlar</th>
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={portfolios.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {portfolios.map(p => (
                    <SortableRow
                      key={p.id}
                      p={p}
                      onEdit={openEdit}
                      onToggle={toggleVisibility}
                      onToggleHomepage={toggleHomepage}
                      onDelete={setDeleteId}
                    />))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        )}
      </div>

      {/* Full screen drawer */}
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
            <div className={styles.fullDrawerSection}>
              <h3 className={styles.drawerSectionTitle}>Əsas Məlumatlar</h3>
              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label>Başlıq</label>
                  <RichEditor value={title} onChange={handleTitleChange} />
                </div>
                <div className={styles.field}>
                  <label>Slug</label>
                  <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} placeholder="marina-village" />
                </div>
              </div>
              <div className={styles.field}>
                <label>Etiketlər <small>(vergüllə ayırın)</small></label>
                <input className={styles.input} value={tags} onChange={e => setTags(e.target.value)} placeholder="SMM, Development" />
              </div>
              <div className={styles.field}>
                <label>Cover şəkil</label>
                <input ref={coverInputRef} type="file" accept="image/webp" style={{ display: "none" }} onChange={handleCoverSelect} />
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
              <div className={styles.field}>
                <label>Cover şəkil Alt Text <small>(SEO)</small></label>
                <input
                  className={styles.input}
                  value={coverImageAlt}
                  onChange={e => setCoverImageAlt(e.target.value)}
                  placeholder="Məsələn: Marina Village layihəsi cover şəkli"
                />
              </div>
            </div>

            <div className={styles.fullDrawerSection}>
              <h3 className={styles.drawerSectionTitle}>Detail Səhifəsi Sectionları</h3>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
                <SortableContext
                  items={sections.map((s, i) => `section-${i}-${s.type}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((section, i) => (
                    <SectionEditor
                      key={`section-${i}-${section.type}`}
                      section={section}
                      index={i}
                      onChange={data => updateSection(i, data)}
                      onRemove={() => removeSection(i)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
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
            <div className={styles.modalHeader}>
              <h2>Silməyi təsdiq edin</h2>
              <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p>Bu portfolionu silmək istədiyinizə əminsiniz?</p>
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