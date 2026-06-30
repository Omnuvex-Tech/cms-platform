"use client";

import { useEffect, useState } from "react";
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/vacancy.module.css";

type Lang = "az" | "en" | "ru";
type LocalizedString = Record<string, string>;
type BulletType = "BULLET" | "NUMBERED" | "DASH";

const EMPTY_L: LocalizedString = { az: "", en: "", ru: "" };

interface VacancyCategory {
  id: number;
  name: LocalizedString;
  order: number;
}

interface Vacancy {
  id: number;
  title: LocalizedString;
  slug: string;
  tags: LocalizedString[];
  isNew: boolean;
  newLabel: LocalizedString | null;
  isVisible: boolean;
  order: number;
  categoryId: number;
  category: VacancyCategory;
  startDate: string | null;
  isStartDateVisible: boolean;
  closingDate: string | null;
  isDateVisible: boolean;
  aboutRole: LocalizedString | null;
  skills: LocalizedString[];
  responsible: LocalizedString[];
  responsibleType: BulletType;
  requirements: LocalizedString[];
  requirementsType: BulletType;
  seoTitle?: LocalizedString;
  seoDescription?: LocalizedString;
  seoKeywords?: LocalizedString;
  schema?: Record<string, any> | null;
}

const API = process.env.NEXT_PUBLIC_API_URL;
function getToken() { return document.cookie.split("access_token=")[1]?.split(";")[0] ?? ""; }

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-").trim();
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

function LocalizedTagInput({ label, items, setItems, lang, large }: {
  label: string;
  items: LocalizedString[];
  setItems: (v: LocalizedString[]) => void;
  lang: Lang;
  large?: boolean;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (!t) return;
    setItems([...items, { ...EMPTY_L, [lang]: t }]);
    setInput("");
  };
  const updateItem = (i: number, val: string) => {
    const arr = [...items];
    arr[i] = { ...arr[i], [lang]: val };
    setItems(arr);
  };
  return (
    <div className={styles.field}>
      <label>{label} ({lang.toUpperCase()})</label>
      <div className={styles.tagInputRow}>
        {large ? (
          <textarea className={`${styles.input} ${styles.textarea}`} rows={2}
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); add(); } }}
            placeholder="Enter ilə əlavə et" />
        ) : (
          <input className={styles.input} value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            placeholder="Enter ilə əlavə et" />
        )}
        <button className={styles.addTagBtn} type="button" onClick={add}>+</button>
      </div>
      {items.length > 0 && (
        <div className={styles.tagList}>
          {items.map((item, i) => (
            <span key={i} className={styles.tagChip}>
              <input
                style={{ background: "transparent", border: "none", color: "inherit", width: 120, outline: "none" }}
                value={item[lang] ?? ""}
                onChange={(e) => updateItem(i, e.target.value)}
              />
              <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SortableCategoryRow({ cat, index, lang, onEdit, onDelete }: {
  cat: VacancyCategory; index: number; lang: Lang;
  onEdit: (c: VacancyCategory) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
  return (
    <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
      <td className={styles.num}>
        <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
        {String(index + 1).padStart(2, "0")}
      </td>
      <td>{cat.name?.[lang] || cat.name?.az || ""}</td>
      <td>
        <div className={styles.actions}>
          <button className={styles.editBtn} onClick={() => onEdit(cat)}>Düzəlt</button>
          <button className={styles.deleteBtn} onClick={() => onDelete(cat.id)}>Sil</button>
        </div>
      </td>
    </tr>
  );
}

function SortableVacancyRow({ v, index, lang, onEdit, onDelete, onToggleVisibility }: {
  v: Vacancy; index: number; lang: Lang;
  onEdit: (v: Vacancy) => void;
  onDelete: (id: number) => void;
  onToggleVisibility: (id: number, val: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: v.id });
  const title = v.title?.[lang] || v.title?.az || "";
  const newLabelText = v.newLabel?.[lang] || v.newLabel?.az || "";
  return (
    <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
      <td className={styles.num}>
        <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
        {String(index + 1).padStart(2, "0")}
      </td>
      <td>
        <div><div>{title}</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>/{v.slug}</div>
        </div>
      </td>
      <td>{v.category.name?.[lang] || v.category.name?.az || ""}</td>
      <td>
        <div className={styles.tagsCell}>
          {v.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className={styles.tag}>{tag[lang] || tag.az || ""}</span>
          ))}
          {v.tags.length > 2 && <span className={styles.tag}>+{v.tags.length - 2}</span>}
        </div>
      </td>
      <td>
        <span className={newLabelText ? styles.activeToggle : styles.inactiveToggle}>
          {newLabelText || "—"}
        </span>
      </td>
      <td>
        <button className={v.isVisible ? styles.activeToggle : styles.inactiveToggle}
          onClick={() => onToggleVisibility(v.id, !v.isVisible)}>
          {v.isVisible ? "Görünür" : "Gizli"}
        </button>
      </td>
      <td>
        <div className={styles.actions}>
          <button className={styles.editBtn} onClick={() => onEdit(v)}>Düzəlt</button>
          <button className={styles.deleteBtn} onClick={() => onDelete(v.id)}>Sil</button>
        </div>
      </td>
    </tr>
  );
}

function VacancyModal({ open, onClose, editVac, categories, onSaved }: {
  open: boolean; onClose: () => void;
  editVac: Vacancy | null;
  categories: VacancyCategory[];
  onSaved: () => void;
}) {
  const [tab, setTab] = useState<"main" | "detail">("main");
  const [lang, setLang] = useState<Lang>("az");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState<LocalizedString>({ ...EMPTY_L });
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [tags, setTags] = useState<LocalizedString[]>([]);
  const [newLabel, setNewLabel] = useState<LocalizedString>({ ...EMPTY_L });
  const [isVisible, setIsVisible] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [isStartDateVisible, setIsStartDateVisible] = useState(true);
  const [closingDate, setClosingDate] = useState("");
  const [isDateVisible, setIsDateVisible] = useState(true);
  const [aboutRole, setAboutRole] = useState<LocalizedString>({ ...EMPTY_L });
  const [seoTitle, setSeoTitle] = useState<LocalizedString>({ ...EMPTY_L });
  const [seoDescription, setSeoDescription] = useState<LocalizedString>({ ...EMPTY_L });
  const [seoKeywords, setSeoKeywords] = useState<LocalizedString>({ ...EMPTY_L });
  const [schemaText, setSchemaText] = useState("");
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [schemaGenerating, setSchemaGenerating] = useState(false);
  const [schemaSaving, setSchemaSaving] = useState(false);
  const [schemaSaveStatus, setSchemaSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [responsible, setResponsible] = useState<LocalizedString[]>([]);
  const [responsibleType, setResponsibleType] = useState<BulletType>("BULLET");
  const [requirements, setRequirements] = useState<LocalizedString[]>([]);
  const [requirementsType, setRequirementsType] = useState<BulletType>("BULLET");
  const [skills, setSkills] = useState<LocalizedString[]>([]);

useEffect(() => {
    if (!open) return;
    setTab("main");
    setLang("az");
    setFormError(null);
    if (editVac) {
      setTitle(editVac.title ?? { ...EMPTY_L });
      setSlug(editVac.slug ?? "");
      setCategoryId(editVac.categoryId);
      setTags(editVac.tags ?? []);
      setNewLabel(editVac.newLabel ?? { ...EMPTY_L });
      setIsVisible(editVac.isVisible);
      setStartDate(editVac.startDate ? editVac.startDate.slice(0, 10) : "");
      setIsStartDateVisible(editVac.isStartDateVisible);
      setClosingDate(editVac.closingDate ? editVac.closingDate.slice(0, 10) : "");
      setIsDateVisible(editVac.isDateVisible);
      setAboutRole(editVac.aboutRole ?? { ...EMPTY_L });
      setSeoTitle(editVac.seoTitle ?? { ...EMPTY_L });
      setSeoDescription(editVac.seoDescription ?? { ...EMPTY_L });
      setSeoKeywords(editVac.seoKeywords ?? { ...EMPTY_L });
      setResponsible(editVac.responsible ?? []);
      setResponsibleType(editVac.responsibleType);
      setRequirements(editVac.requirements ?? []);
      setRequirementsType(editVac.requirementsType);
      setSkills(editVac.skills ?? []);
    } else {
      setTitle({ ...EMPTY_L }); setSlug(""); setCategoryId(""); setTags([]);
      setNewLabel({ ...EMPTY_L }); setIsVisible(true);
      setStartDate(""); setIsStartDateVisible(true);
      setClosingDate(""); setIsDateVisible(true);
      setAboutRole({ ...EMPTY_L });
      setSeoTitle({ ...EMPTY_L });
      setSeoDescription({ ...EMPTY_L });
      setSeoKeywords({ ...EMPTY_L });
      setResponsible([]); setResponsibleType("BULLET");
      setRequirements([]); setRequirementsType("BULLET");
      setSkills([]);
    }
  }, [open, editVac]);

  useEffect(() => {
    if (!open) return;
    setSchemaText(editVac?.schema?.[lang] ? JSON.stringify(editVac.schema[lang], null, 2) : "");
    setSchemaError(null);
  }, [open, editVac, lang]);

  
  const handleTitleChange = (val: string) => {
    setTitle((prev) => ({ ...prev, [lang]: val }));
    if (lang === "az") setSlug(generateSlug(val));
  };

  const validate = (): string | null => {
    if (!title.az?.trim()) return "Başlıq (AZ) boş ola bilməz";
    if (!slug.trim()) return "Slug boş ola bilməz";
    if (!categoryId) return "Kateqoriya seçilməlidir";
    return null;
  };

  const generateSchema = async () => {
    if (!editVac) return;
    setSchemaGenerating(true);
    setSchemaError(null);
    try {
      const generated = await apiFetch(`/vacancy/${editVac.id}/schema/preview`);
      setSchemaText(JSON.stringify(generated[lang], null, 2));
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
    if (!editVac || schemaError) return;
    setSchemaSaving(true);
    setSchemaSaveStatus("idle");
    try {
      let parsed = null;
      if (schemaText.trim()) parsed = JSON.parse(schemaText);
      const current = editVac.schema ?? {};
      const updatedSchema = { ...current, [lang]: parsed };
      await apiFetch(`/vacancy/${editVac.id}/schema`, {
        method: "PATCH",
        body: JSON.stringify({ schema: updatedSchema }),
      });
      setSchemaSaveStatus("success");
    } catch {
      setSchemaSaveStatus("error");
    } finally {
      setSchemaSaving(false);
      setTimeout(() => setSchemaSaveStatus("idle"), 3000);
    }
  };


  const save = async () => {
    setFormError(null);
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setSaving(true);
    try {
      const body = {
        title, slug, categoryId: Number(categoryId),
        tags, skills,
        newLabel: newLabel.az?.trim() ? newLabel : null,
        isNew: !!newLabel.az?.trim(),
        isVisible,
        startDate: startDate || null, isStartDateVisible,
        closingDate: closingDate || null, isDateVisible,
        aboutRole: aboutRole.az?.trim() ? aboutRole : null,
        responsible, responsibleType,
        requirements, requirementsType, seoTitle, seoDescription, seoKeywords,
      };
      if (editVac) {
        await apiFetch(`/vacancy/${editVac.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch("/vacancy", { method: "POST", body: JSON.stringify(body) });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setFormError(err.message ?? "Vakansiya saxlanılarkən xəta baş verdi");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const bulletOptions = [
    { value: "BULLET", label: "• Nöqtəli" },
    { value: "NUMBERED", label: "1. Nömrəli" },
    { value: "DASH", label: "- Tire" },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{editVac ? "Vakansiyanı Düzəlt" : "Yeni Vakansiya"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalTabs}>
          <button className={tab === "main" ? styles.tabActive : styles.tabInactive}
            onClick={() => setTab("main")}>Əsas məlumat</button>
          <button className={tab === "detail" ? styles.tabActive : styles.tabInactive}
            onClick={() => setTab("detail")}>Detail səhifəsi</button>
        </div>

        <div style={{ paddingLeft: 20 }}>
          <LangTabs active={lang} onChange={setLang} />
        </div>

        <div className={styles.modalBody}>
          {formError && (
            <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
              ⚠ {formError}
            </p>
          )}

          {tab === "main" && (
            <>
              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label>Başlıq * ({lang.toUpperCase()})</label>
                  <input className={styles.input} value={title[lang] ?? ""}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Senior UI/UX Designer" />
                </div>
                <div className={styles.field}>
                  <label>Slug</label>
                  <input className={styles.input} value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="senior-ui-ux-designer" />
                </div>
              </div>

              <div className={styles.field}>
                <label>Kateqoriya *</label>
                <select className={styles.input} value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}>
                  <option value="">Seçin...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name?.[lang] || c.name?.az || ""}
                    </option>
                  ))}
                </select>
              </div>

              <LocalizedTagInput label="Taqlər / Skills" items={tags} setItems={setTags} lang={lang} />

              <div className={styles.field}>
                <label>Badge mətni ({lang.toUpperCase()}) <span className={styles.hint}>(boş olsa badge görünməz)</span></label>
                <input className={styles.input} value={newLabel[lang] ?? ""}
                  onChange={(e) => setNewLabel((prev) => ({ ...prev, [lang]: e.target.value }))}
                  placeholder="NEW, Açıqdır, Tezliklə..." />
              </div>

              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label>Başlama tarixi</label>
                  <input type="date" className={styles.input} value={startDate}
                    onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label>Başlama tarixini göstər</label>
                  <button className={isStartDateVisible ? styles.activeToggle : styles.inactiveToggle}
                    onClick={() => setIsStartDateVisible(!isStartDateVisible)}>
                    {isStartDateVisible ? "Görünür" : "Gizli"}
                  </button>
                </div>
              </div>
              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label>Bağlanma tarixi</label>
                  <input type="date" className={styles.input} value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label>Bağlanma tarixini göstər</label>
                  <button className={isDateVisible ? styles.activeToggle : styles.inactiveToggle}
                    onClick={() => setIsDateVisible(!isDateVisible)}>
                    {isDateVisible ? "Görünür" : "Gizli"}
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label>Vakansiya görünüşü</label>
                <button className={isVisible ? styles.activeToggle : styles.inactiveToggle}
                  onClick={() => setIsVisible(!isVisible)}>
                  {isVisible ? "Görünür" : "Gizli"}
                </button>
              </div>
            </>
          )}

          {tab === "detail" && (
            <>
              <div className={styles.field}>
                <label>About the Role ({lang.toUpperCase()})</label>
                <textarea className={styles.textarea} rows={5}
                  value={aboutRole[lang] ?? ""}
                  onChange={(e) => setAboutRole((prev) => ({ ...prev, [lang]: e.target.value }))}
                  placeholder="Vakansiya haqqında ümumi məlumat..." />
              </div>

              <div className={styles.field}>
                <label>Responsible — siyahı tipi</label>
                <select className={styles.input} value={responsibleType}
                  onChange={(e) => setResponsibleType(e.target.value as BulletType)}>
                  {bulletOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <LocalizedTagInput label="Responsible" items={responsible} setItems={setResponsible} lang={lang} large />

              <div className={styles.field}>
                <label>Requirements — siyahı tipi</label>
                <select className={styles.input} value={requirementsType}
                  onChange={(e) => setRequirementsType(e.target.value as BulletType)}>
                  {bulletOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <LocalizedTagInput label="Requirements" items={requirements} setItems={setRequirements} lang={lang} large />
            </>
          )}
          <div className={styles.field} style={{ borderTop: "1px solid #222", paddingTop: 16, marginTop: 8 }}>
            <label style={{ fontWeight: 700, fontSize: 14 }}>SEO</label>
          </div>
          <div className={styles.field}>
            <label>SEO Title ({lang.toUpperCase()})</label>
            <input
              className={styles.input}
              value={seoTitle[lang] ?? ""}
              onChange={e => setSeoTitle(prev => ({ ...prev, [lang]: e.target.value }))}
              placeholder={`SEO başlığı (${lang})`}
            />
          </div>
          <div className={styles.field}>
            <label>SEO Description ({lang.toUpperCase()})</label>
            <textarea
              className={styles.textarea}
              rows={3}
              value={seoDescription[lang] ?? ""}
              onChange={e => setSeoDescription(prev => ({ ...prev, [lang]: e.target.value }))}
              placeholder={`Qısa açıqlama (${lang})`}
            />
          </div>
          <div className={styles.field}>
            <label>SEO Keywords ({lang.toUpperCase()})</label>
            <input
              className={styles.input}
              value={seoKeywords[lang] ?? ""}
              onChange={e => setSeoKeywords(prev => ({ ...prev, [lang]: e.target.value }))}
              placeholder={`açar söz 1, açar söz 2 (${lang})`}
            />
          </div>
          <div className={styles.field} style={{ borderTop: "1px solid #222", paddingTop: 16, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontWeight: 700, fontSize: 14 }}>JSON-LD Schema ({lang.toUpperCase()})</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={generateSchema} disabled={schemaGenerating || !editVac}
                  style={{ padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "1.5px solid #3b82f6", background: "#1e3a5f", color: "#fff", cursor: "pointer" }}>
                  {schemaGenerating ? "Yaradılır..." : "⚡ Generate Et"}
                </button>
                <button type="button" onClick={saveSchema} disabled={schemaSaving || !!schemaError || !editVac}
                  style={{ padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "1.5px solid #16a34a", background: "#14532d", color: "#fff", cursor: "pointer" }}>
                  {schemaSaving ? "Saxlanır..." : "Saxla"}
                </button>
              </div>
            </div>
            {!editVac && (
              <p style={{ fontSize: 12, color: "#f59e0b", marginBottom: 8 }}>
                ℹ Schema yaratmaq üçün əvvəlcə vakansiyanı saxlamalısınız
              </p>
            )}
            {schemaSaveStatus === "success" && <p style={{ color: "#16a34a", fontSize: 13, marginBottom: 8 }}>✓ Schema saxlanıldı</p>}
            {schemaSaveStatus === "error" && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 8 }}>✕ Xəta baş verdi</p>}
            <textarea
              className={styles.textarea}
              rows={12}
              value={schemaText}
              placeholder='{"@context": "https://schema.org", ...}'
              onChange={(e) => handleSchemaChange(e.target.value)}
              style={{ fontFamily: "monospace", fontSize: 12 }}
            />
            {schemaError && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 4 }}>⚠ {schemaError}</p>}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Ləğv et</button>
          <button className={styles.saveBtn} onClick={save} disabled={saving}>
            {saving ? "Saxlanır..." : "Saxla"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function VacancyPage() {
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("az");
  const [headerTitle, setHeaderTitle] = useState<LocalizedString>({ ...EMPTY_L });
  const [headerSaving, setHeaderSaving] = useState(false);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [categories, setCategories] = useState<VacancyCategory[]>([]);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editCat, setEditCat] = useState<VacancyCategory | null>(null);
  const [catName, setCatName] = useState<LocalizedString>({ ...EMPTY_L });
  const [catLang, setCatLang] = useState<Lang>("az");
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<number | null>(null);
  const [deleteCatError, setDeleteCatError] = useState<string | null>(null);
  const [catReordering, setCatReordering] = useState(false);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [vacModalOpen, setVacModalOpen] = useState(false);
  const [editVac, setEditVac] = useState<Vacancy | null>(null);
  const [deleteVacId, setDeleteVacId] = useState<number | null>(null);
  const [deleteVacError, setDeleteVacError] = useState<string | null>(null);
  const [vacReordering, setVacReordering] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const load = async () => {
    setLoading(true);
    try {
      const [headerData, catsData, vacsData] = await Promise.all([
        apiFetch("/vacancy/header"),
        apiFetch("/vacancy/categories"),
        apiFetch("/vacancy"),
      ]);
      setHeaderTitle(headerData?.title ?? { ...EMPTY_L });
      setCategories(catsData ?? []);
      setVacancies(vacsData ?? []);
      setListError(null);
    } catch (err: any) {
      setListError(err.message ?? "Məlumatlar yüklənərkən xəta baş verdi");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const saveHeader = async () => {
    setHeaderError(null);
    if (!headerTitle.az?.trim()) {
      setHeaderError("Başlıq (AZ) boş ola bilməz");
      return;
    }
    setHeaderSaving(true);
    try {
      await apiFetch("/vacancy/header", { method: "PUT", body: JSON.stringify({ title: headerTitle }) });
    } catch (err: any) {
      setHeaderError(err.message ?? "Başlıq saxlanılarkən xəta baş verdi");
    } finally { setHeaderSaving(false); }
  };

  const handleCatDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const newList = arrayMove(categories,
      categories.findIndex((c) => c.id === active.id),
      categories.findIndex((c) => c.id === over.id));
    setCategories(newList);
    setCatReordering(true);
    try {
      await apiFetch("/vacancy/categories/reorder", {
        method: "PUT",
        body: JSON.stringify({ items: newList.map((c, i) => ({ id: c.id, order: i })) }),
      });
    } catch (err: any) {
      alert(err.message ?? "Sıralama saxlanılarkən xəta baş verdi");
      load();
    } finally { setCatReordering(false); }
  };

  const handleVacDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const newList = arrayMove(vacancies,
      vacancies.findIndex((v) => v.id === active.id),
      vacancies.findIndex((v) => v.id === over.id));
    setVacancies(newList);
    setVacReordering(true);
    try {
      await apiFetch("/vacancy/reorder", {
        method: "PUT",
        body: JSON.stringify({ items: newList.map((v, i) => ({ id: v.id, order: i })) }),
      });
    } catch (err: any) {
      alert(err.message ?? "Sıralama saxlanılarkən xəta baş verdi");
      load();
    } finally { setVacReordering(false); }
  };

  const saveCat = async () => {
    setCatError(null);
    if (!catName.az?.trim()) {
      setCatError("Ad (AZ) boş ola bilməz");
      return;
    }
    setCatSaving(true);
    try {
      if (editCat) {
        await apiFetch(`/vacancy/categories/${editCat.id}`, { method: "PUT", body: JSON.stringify({ name: catName }) });
      } else {
        await apiFetch("/vacancy/categories", { method: "POST", body: JSON.stringify({ name: catName }) });
      }
      setCatModalOpen(false);
      load();
    } catch (err: any) {
      setCatError(err.message ?? "Kateqoriya saxlanılarkən xəta baş verdi");
    } finally { setCatSaving(false); }
  };

  const handleDeleteCat = async () => {
    if (!deleteCatId) return;
    setDeleteCatError(null);
    try {
      await apiFetch(`/vacancy/categories/${deleteCatId}`, { method: "DELETE" });
      setDeleteCatId(null);
      load();
    } catch (err: any) {
      setDeleteCatError(err.message ?? "Silinərkən xəta baş verdi");
    }
  };

  const handleDeleteVac = async () => {
    if (!deleteVacId) return;
    setDeleteVacError(null);
    try {
      await apiFetch(`/vacancy/${deleteVacId}`, { method: "DELETE" });
      setDeleteVacId(null);
      load();
    } catch (err: any) {
      setDeleteVacError(err.message ?? "Silinərkən xəta baş verdi");
    }
  };

  const toggleVisibility = async (id: number, val: boolean) => {
    const prevVacancies = vacancies;
    setVacancies((prev) => prev.map((v) => v.id === id ? { ...v, isVisible: val } : v));
    try {
      await apiFetch(`/vacancy/${id}/visibility`, { method: "PATCH", body: JSON.stringify({ isVisible: val }) });
    } catch (err: any) {
      alert(err.message ?? "Status dəyişdirilərkən xəta baş verdi");
      setVacancies(prevVacancies);
    }
  };

  if (loading) return <div className={styles.page}><div className={styles.empty}>Yüklənir...</div></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Vakansiyalar</h1>
          <p className={styles.subtitle}>Vakansiya səhifəsini idarə edin</p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <LangTabs active={lang} onChange={setLang} />
        </div>
      </div>

      {listError && (
        <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
          ⚠ {listError}
        </p>
      )}

      {/* Səhifə Başlığı */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionCardTitle}>Səhifə Başlığı</h2>
        <div className={styles.field}>
          <label>Başlıq ({lang.toUpperCase()})</label>
          <input className={styles.input} value={headerTitle[lang] ?? ""}
            onChange={(e) => setHeaderTitle((prev) => ({ ...prev, [lang]: e.target.value }))}
            placeholder="Vakansiyalar" />
        </div>
        {headerError && (
          <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 500, marginTop: 4 }}>
            ⚠ {headerError}
          </p>
        )}
        <div className={styles.sectionFooter}>
          <button className={styles.saveBtn} onClick={saveHeader} disabled={headerSaving}>
            {headerSaving ? "Saxlanır..." : "Yadda saxla"}
          </button>
        </div>
      </div>

      {/* Kateqoriyalar */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>
          <h2 className={styles.sectionCardTitle}>Kateqoriyalar</h2>
          <div className={styles.headerRight}>
            {catReordering && <span className={styles.reorderingText}>Saxlanır...</span>}
            <button className={styles.addBtn}
              onClick={() => { setEditCat(null); setCatName({ ...EMPTY_L }); setCatLang("az"); setCatError(null); setCatModalOpen(true); }}>
              + Yeni Kateqoriya
            </button>
          </div>
        </div>
        {categories.length === 0 ? (
          <div className={styles.empty}>Hələ kateqoriya yoxdur</div>
        ) : (
          <div className={styles.tableWrap}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCatDragEnd}>
              <table className={styles.table}>
                <thead><tr><th>#</th><th>Ad ({lang.toUpperCase()})</th><th>Əməliyyatlar</th></tr></thead>
                <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <tbody>
                    {categories.map((cat, i) => (
                      <SortableCategoryRow key={cat.id} cat={cat} index={i} lang={lang}
                        onEdit={(c) => { setEditCat(c); setCatName(c.name ?? { ...EMPTY_L }); setCatLang("az"); setCatError(null); setCatModalOpen(true); }}
                        onDelete={setDeleteCatId} />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          </div>
        )}
      </div>

      {/* Vakansiyalar */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>
          <h2 className={styles.sectionCardTitle}>Vakansiyalar</h2>
          <div className={styles.headerRight}>
            {vacReordering && <span className={styles.reorderingText}>Saxlanır...</span>}
            <button className={styles.addBtn} onClick={() => { setEditVac(null); setVacModalOpen(true); }}>
              + Yeni Vakansiya
            </button>
          </div>
        </div>
        {vacancies.length === 0 ? (
          <div className={styles.empty}>Hələ vakansiya yoxdur</div>
        ) : (
          <div className={styles.tableWrap}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleVacDragEnd}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th><th>Başlıq</th><th>Kateqoriya</th>
                    <th>Taqlər</th><th>Badge</th><th>Görünüş</th><th>Əməliyyatlar</th>
                  </tr>
                </thead>
                <SortableContext items={vacancies.map((v) => v.id)} strategy={verticalListSortingStrategy}>
                  <tbody>
                    {vacancies.map((v, i) => (
                      <SortableVacancyRow key={v.id} v={v} index={i} lang={lang}
                        onEdit={(vac) => { setEditVac(vac); setVacModalOpen(true); }}
                        onDelete={setDeleteVacId}
                        onToggleVisibility={toggleVisibility} />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          </div>
        )}
      </div>

      <VacancyModal open={vacModalOpen} onClose={() => setVacModalOpen(false)}
        editVac={editVac} categories={categories} onSaved={load} />

      {/* Category Modal */}
      {catModalOpen && (
        <div className={styles.overlay} onClick={() => setCatModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editCat ? "Kateqoriyanı Düzəlt" : "Yeni Kateqoriya"}</h2>
              <button className={styles.closeBtn} onClick={() => setCatModalOpen(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <LangTabs active={catLang} onChange={setCatLang} />

              {catError && (
                <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                  ⚠ {catError}
                </p>
              )}

              <div className={styles.field}>
                <label>Ad ({catLang.toUpperCase()})</label>
                <input className={styles.input} value={catName[catLang] ?? ""}
                  onChange={(e) => setCatName((prev) => ({ ...prev, [catLang]: e.target.value }))}
                  placeholder="SMM, Motion..." />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setCatModalOpen(false)}>Ləğv et</button>
              <button className={styles.saveBtn} onClick={saveCat} disabled={catSaving}>
                {catSaving ? "Saxlanır..." : "Saxla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modals */}
      {deleteCatId && (
        <div className={styles.overlay} onClick={() => { setDeleteCatId(null); setDeleteCatError(null); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Kateqoriyanı sil</h2>
              <button className={styles.closeBtn} onClick={() => { setDeleteCatId(null); setDeleteCatError(null); }}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p>Bu kateqoriyanı silmək istədiyinizə əminsiniz?</p>
              {deleteCatError && (
                <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 500, marginTop: 8 }}>
                  ⚠ {deleteCatError}
                </p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => { setDeleteCatId(null); setDeleteCatError(null); }}>Ləğv et</button>
              <button className={styles.deleteConfirmBtn} onClick={handleDeleteCat}>Sil</button>
            </div>
          </div>
        </div>
      )}

      {deleteVacId && (
        <div className={styles.overlay} onClick={() => { setDeleteVacId(null); setDeleteVacError(null); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Vakansiyanı sil</h2>
              <button className={styles.closeBtn} onClick={() => { setDeleteVacId(null); setDeleteVacError(null); }}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p>Bu vakansiyanı silmək istədiyinizə əminsiniz?</p>
              {deleteVacError && (
                <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 500, marginTop: 8 }}>
                  ⚠ {deleteVacError}
                </p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => { setDeleteVacId(null); setDeleteVacError(null); }}>Ləğv et</button>
              <button className={styles.deleteConfirmBtn} onClick={handleDeleteVac}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}