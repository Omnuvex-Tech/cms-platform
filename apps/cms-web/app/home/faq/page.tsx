"use client";

import { useEffect, useState } from "react";
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
  const answer = faq.answer?.[activeLang] || faq.answer?.az || "";

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
    if (!answer.az?.trim()) return "Cavab (AZ) boş ola bilməz";
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
                <textarea
                  className={styles.textarea}
                  value={answer[modalLang] || ""}
                  onChange={(e) => updL(setAnswer, modalLang, e.target.value)}
                  placeholder="Cavabı daxil edin"
                  rows={5}
                />
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