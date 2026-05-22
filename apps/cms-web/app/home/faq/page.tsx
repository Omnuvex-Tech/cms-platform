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

interface Faq {
  id: number;
  question: string;
  answer: string;
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
  if (!res.ok) throw new Error("Xəta baş verdi");
  return res.json();
}

// Sortable row component
function SortableRow({
  faq,
  index,
  onEdit,
  onToggle,
  onDelete,
}: {
  faq: Faq;
  index: number;
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

  return (
    <tr ref={setNodeRef} style={style}>
      <td className={styles.num}>
        <span
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          title="Sürüşdür"
        >
          ⠿
        </span>
        {String(index + 1).padStart(2, "0")}
      </td>
      <td className={styles.question}>{faq.question}</td>
      <td className={styles.answerCell}>
        {faq.answer.length > 80 ? faq.answer.slice(0, 80) + "..." : faq.answer}
      </td>
      <td>
        <span className={`${styles.badge} ${faq.isVisible ? styles.badgeVisible : styles.badgeHidden}`}>
          {faq.isVisible ? "Görünür" : "Gizli"}
        </span>
      </td>
      <td>
        <div className={styles.actions}>
          <button className={styles.editBtn} onClick={() => onEdit(faq)}>
            Düzəlt
          </button>
          <button
            className={`${styles.visBtn} ${faq.isVisible ? styles.visBtnHide : styles.visBtnShow}`}
            onClick={() => onToggle(faq)}
          >
            {faq.isVisible ? "Gizlət" : "Göstər"}
          </button>
          <button className={styles.deleteBtn} onClick={() => onDelete(faq.id)}>
            Sil
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Faq | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/faq");
      setFaqs(data);
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
    } finally {
      setReordering(false);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setQuestion("");
    setAnswer("");
    setModalOpen(true);
  };

  const openEdit = (faq: Faq) => {
    setEditItem(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
    setQuestion("");
    setAnswer("");
  };

  const save = async () => {
    if (!question.trim() || !answer.trim()) return;
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
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (faq: Faq) => {
    await apiFetch(`/faq/${faq.id}/visibility`, {
      method: "PATCH",
      body: JSON.stringify({ isVisible: !faq.isVisible }),
    });
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await apiFetch(`/faq/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    load();
  };

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

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.empty}>Yüklənir...</div>
        ) : faqs.length === 0 ? (
          <div className={styles.empty}>Hələ FAQ əlavə edilməyib</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Sual</th>
                <th>Cavab</th>
                <th>Status</th>
                <th>Əməliyyatlar</th>
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={faqs.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {faqs.map((faq, index) => (
                    <SortableRow
                      key={faq.id}
                      faq={faq}
                      index={index}
                      onEdit={openEdit}
                      onToggle={toggleVisibility}
                      onDelete={setDeleteId}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editItem ? "FAQ Düzəlt" : "Yeni FAQ"}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>Sual</label>
                <input
                  className={styles.input}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Sualı daxil edin"
                />
              </div>
              <div className={styles.field}>
                <label>Cavab</label>
                <textarea
                  className={styles.textarea}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
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
                disabled={saving || !question.trim() || !answer.trim()}
              >
                {saving ? "Saxlanır..." : "Saxla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className={styles.overlay} onClick={() => setDeleteId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Silməyi təsdiq edin</h2>
              <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p>Bu FAQ-ı silmək istədiyinizə əminsiniz?</p>
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