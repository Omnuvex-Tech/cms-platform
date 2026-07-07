"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/faq.module.css";

type Lang = "az" | "en" | "ru";
type LocalizedString = Record<string, string>;

interface Faq {
  id: number;
  question: LocalizedString;
  answer: LocalizedString;
  isVisible: boolean;
  order: number;
}

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
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (Array.isArray(body?.message) ? body.message.join(", ") : body?.message) ??
      `Xəta baş verdi (${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

function LangTabs({ active, onChange }: { active: Lang; onChange: (l: Lang) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {(["az", "en", "ru"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          style={{
            padding: "4px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600,
            border: "1.5px solid",
            borderColor: active === l ? "#3b82f6" : "#333",
            background: active === l ? "#1e3a5f" : "transparent",
            color: active === l ? "#fff" : "#888",
            cursor: "pointer",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "");
}

function AnswerRichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(true);

 const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
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
    if (editor.state.selection.empty) {
      alert("Əvvəlcə link əlavə etmək istədiyiniz mətni seçin");
      return;
    }
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
    <div style={{ border: "1px solid #333", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 6, padding: 8, borderBottom: "1px solid #333", background: "#ffffff" }}>
        {[
          { label: <b>B</b>, action: () => editor?.chain().focus().toggleBold().run(), key: "bold" },
          { label: <i>I</i>, action: () => editor?.chain().focus().toggleItalic().run(), key: "italic" },
          { label: <u>U</u>, action: () => editor?.chain().focus().toggleUnderline().run(), key: "underline" },
        ].map(({ label, action, key }) => (
          <button
            key={key}
            type="button"
            onClick={action}
            style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 600,
              border: "1.5px solid", borderColor: editor?.isActive(key) ? "#3b82f6" : "#333",
              background: editor?.isActive(key) ? "#ffffff" : "transparent",
              color: editor?.isActive(key) ? "#fff" : "#888", cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
        <div style={{ width: 1, background: "#333", margin: "0 2px" }} />
        <button
          type="button"
          onClick={openLinkPopup}
          style={{
            padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 600,
            border: "1.5px solid", borderColor: editor?.isActive("link") ? "#3b82f6" : "#333",
            background: editor?.isActive("link") ? "#ffffff" : "transparent",
            color: editor?.isActive("link") ? "#fff" : "#888", cursor: "pointer",
          }}
        >
          🔗 Link
        </button>
      </div>

      {showLinkPopup && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: 8, borderBottom: "1px solid #333", background: "#ffffff", flexWrap: "wrap" }}>
          <input
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setShowLinkPopup(false); }}
            autoFocus
            style={{ flex: 1, minWidth: 180, padding: "6px 10px", borderRadius: 6, border: "1px solid #ffffff", background: "#a5aad1", color: "#fff" }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#ccc", whiteSpace: "nowrap" }}>
            <input type="checkbox" checked={linkNewTab} onChange={e => setLinkNewTab(e.target.checked)} />
            Yeni tab
          </label>
          <button type="button" onClick={applyLink}
            style={{ padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "1.5px solid #16a34a", background: "#14532d", color: "#fff", cursor: "pointer" }}>
            Əlavə et
          </button>
          <button type="button" onClick={removeLink}
            style={{ padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "1.5px solid #dc2626", background: "#450a0a", color: "#fff", cursor: "pointer" }}>
            Sil
          </button>
          <button type="button" onClick={() => setShowLinkPopup(false)}
            style={{ padding: "6px 10px", borderRadius: 6, fontSize: 13, border: "1.5px solid #333", background: "transparent", color: "#888", cursor: "pointer" }}>
            ✕
          </button>
        </div>
      )}

      <div className="faqAnswerEditor" style={{ padding: 10, minHeight: 120 }}>
        <EditorContent editor={editor} />
      </div>

      <style jsx>{`
        .faqAnswerEditor :global(.ProseMirror) {
          outline: none;
          color: #eee;
          font-size: 14px;
          line-height: 1.6;
          min-height: 100px;
        }
        .faqAnswerEditor :global(.ProseMirror p) {
          margin: 0 0 8px;
        }
        .faqAnswerEditor :global(a) {
          color: #3b82f6;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

function LocalizedAnswerEditor({ value, lang, onChange }: {
  value: LocalizedString; lang: Lang; onChange: (v: LocalizedString) => void;
}) {
  return (
    <AnswerRichEditor
      value={value?.[lang] || ""}
      onChange={v => onChange({ ...value, [lang]: v })}
    />
  );
}

function SortableRow({
  faq,
  index,
  activeLang,
  onEdit,
  onToggle,
  onDelete,
}: {
  faq: Faq;
  index: number;
  activeLang: Lang;
  onEdit: (faq: Faq) => void;
  onToggle: (faq: Faq) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "#f0f7ff" : undefined,
  };

 const question = faq.question?.[activeLang] || faq.question?.az || "";
  const answer = stripHtml(faq.answer?.[activeLang] || faq.answer?.az || "");

  return (
    <tr ref={setNodeRef} style={style}>
      <td className={styles.num}>
        <span className={styles.dragHandle} {...attributes} {...listeners} title="Sürüşdür">
          ⠿
        </span>
        {String(index + 1).padStart(2, "0")}
      </td>
      <td className={styles.question}>{question}</td>
      <td className={styles.answerCell}>
        {answer.length > 80 ? answer.slice(0, 80) + "..." : answer}
      </td>
      <td>
        <span className={`${styles.badge} ${faq.isVisible ? styles.badgeVisible : styles.badgeHidden}`}>
          {faq.isVisible ? "Görünür" : "Gizli"}
        </span>
      </td>
      <td>
        <div className={styles.actions}>
          <button className={styles.editBtn} onClick={() => onEdit(faq)}>Düzəlt</button>
          <button
            className={`${styles.visBtn} ${faq.isVisible ? styles.visBtnHide : styles.visBtnShow}`}
            onClick={() => onToggle(faq)}
          >
            {faq.isVisible ? "Gizlət" : "Göstər"}
          </button>
          <button className={styles.deleteBtn} onClick={() => onDelete(faq.id)}>Sil</button>
        </div>
      </td>
    </tr>
  );
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLang, setTableLang] = useState<Lang>("az");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLang, setModalLang] = useState<Lang>("az");
  const [editItem, setEditItem] = useState<Faq | null>(null);
  const [question, setQuestion] = useState<LocalizedString>({ az: "", en: "", ru: "" });
  const [answer, setAnswer] = useState<LocalizedString>({ az: "", en: "", ru: "" });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/faq");
      setFaqs(data);
    } catch (err: any) {
      setListError(err.message ?? "FAQ-lar yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = faqs.findIndex((f) => f.id === active.id);
    const newIndex = faqs.findIndex((f) => f.id === over.id);
    const newFaqs = arrayMove(faqs, oldIndex, newIndex);
    setFaqs(newFaqs);
    setReordering(true);
    try {
      await apiFetch("/faq/reorder", {
        method: "PATCH",
        body: JSON.stringify({ ids: newFaqs.map((f) => f.id) }),
      });
    } catch (err: any) {
      alert(err.message ?? "Sıralama saxlanılarkən xəta baş verdi");
      load();
    } finally {
      setReordering(false);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setQuestion({ az: "", en: "", ru: "" });
    setAnswer({ az: "", en: "", ru: "" });
    setModalLang("az");
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (faq: Faq) => {
    setEditItem(faq);
    setQuestion(faq.question || { az: "", en: "", ru: "" });
    setAnswer(faq.answer || { az: "", en: "", ru: "" });
    setModalLang("az");
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
    setFormError(null);
  };

 const validateFaq = (): string | null => {
    if (!question.az?.trim()) return "Sual (AZ) boş ola bilməz";
    if (!stripHtml(answer.az || "").trim()) return "Cavab (AZ) boş ola bilməz";
    return null;
  };
  const save = async () => {
    setFormError(null);
    const validationError = validateFaq();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        await apiFetch(`/faq/${editItem.id}`, {
          method: "PUT",
          body: JSON.stringify({ question, answer }),
        });
      } else {
        await apiFetch("/faq", {
          method: "POST",
          body: JSON.stringify({ question, answer }),
        });
      }
      closeModal();
      load();
    } catch (err: any) {
      setFormError(err.message ?? "FAQ saxlanılarkən xəta baş verdi");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (faq: Faq) => {
    try {
      await apiFetch(`/faq/${faq.id}/visibility`, {
        method: "PATCH",
        body: JSON.stringify({ isVisible: !faq.isVisible }),
      });
      load();
    } catch (err: any) {
      alert(err.message ?? "Status dəyişdirilərkən xəta baş verdi");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteError(null);
    try {
      await apiFetch(`/faq/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      load();
    } catch (err: any) {
      setDeleteError(err.message ?? "Silinərkən xəta baş verdi");
    }
  };

  const updL = (
    setter: React.Dispatch<React.SetStateAction<LocalizedString>>,
    lang: Lang,
    val: string,
  ) => setter((prev) => ({ ...prev, [lang]: val }));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>FAQ</h1>
          <p className={styles.subtitle}>Tez-tez verilən sualları idarə edin</p>
        </div>
        <div className={styles.headerRight}>
          {reordering && <span className={styles.reorderingText}>Saxlanır...</span>}
          <button className={styles.addBtn} onClick={openCreate}>+ Yeni FAQ</button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <LangTabs active={tableLang} onChange={setTableLang} />
      </div>

      {listError && (
        <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
          ⚠ {listError}
        </p>
      )}

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.empty}>Yüklənir...</div>
        ) : faqs.length === 0 ? (
          <div className={styles.empty}>Hələ FAQ əlavə edilməyib</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sual ({tableLang.toUpperCase()})</th>
                  <th>Cavab ({tableLang.toUpperCase()})</th>
                  <th>Status</th>
                  <th>Əməliyyatlar</th>
                </tr>
              </thead>
              <SortableContext items={faqs.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {faqs.map((faq, index) => (
                    <SortableRow
                      key={faq.id}
                      faq={faq}
                      index={index}
                      activeLang={tableLang}
                      onEdit={openEdit}
                      onToggle={toggleVisibility}
                      onDelete={setDeleteId}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        )}
      </div>

      {modalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editItem ? "FAQ Düzəlt" : "Yeni FAQ"}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <LangTabs active={modalLang} onChange={setModalLang} />

              {formError && (
                <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                  ⚠ {formError}
                </p>
              )}

              <div className={styles.field}>
                <label>Sual ({modalLang.toUpperCase()})</label>
                <input
                  className={styles.input}
                  value={question[modalLang] || ""}
                  onChange={(e) => updL(setQuestion, modalLang, e.target.value)}
                  placeholder="Sualı daxil edin"
                />
              </div>
              <div className={styles.field}>
                <label>Cavab ({modalLang.toUpperCase()})</label>
                <LocalizedAnswerEditor value={answer} lang={modalLang} onChange={setAnswer} />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Ləğv et</button>
              <button
                className={styles.saveBtn}
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saxlanır..." : "Saxla"}
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
              <button className={styles.closeBtn} onClick={() => { setDeleteId(null); setDeleteError(null); }}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p>Bu FAQ-ı silmək istədiyinizə əminsiniz?</p>
              {deleteError && (
                <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 500, marginTop: 8 }}>
                  ⚠ {deleteError}
                </p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => { setDeleteId(null); setDeleteError(null); }}>Ləğv et</button>
              <button className={styles.deleteConfirmBtn} onClick={handleDelete}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}