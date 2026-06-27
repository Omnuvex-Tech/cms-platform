"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch, uploadFile, toAbsUrl, generateSlug } from "@/lib/pulse-api";
import styles from "@/styles/blog.module.css";

type Author = { id: string; name: string; slug: string; title?: string; avatar?: string; description?: string };

export default function PulseAuthorsPage() {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<Author | null>(null);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [title, setTitle] = useState("");
    const [avatar, setAvatar] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const load = async () => {
        setLoading(true);
        try { setAuthors(await apiFetch("/pulse/authors")); } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setEditItem(null); setName(""); setSlug(""); setTitle(""); setAvatar(""); setDescription(""); setModalOpen(true); };
    const openEdit = (a: Author) => { setEditItem(a); setName(a.name); setSlug(a.slug); setTitle(a.title || ""); setAvatar(a.avatar || ""); setDescription(a.description || ""); setModalOpen(true); };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatar(await uploadFile(file));
    };

    const save = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            const body = { name, slug: slug || generateSlug(name), title, avatar: avatar || null, description };
            if (editItem) await apiFetch(`/pulse/authors/${editItem.id}`, { method: "PUT", body: JSON.stringify(body) });
            else await apiFetch("/pulse/authors", { method: "POST", body: JSON.stringify(body) });
            setModalOpen(false); load();
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await apiFetch(`/pulse/authors/${deleteId}`, { method: "DELETE" });
        setDeleteId(null); load();
    };

    return (
        <div>
            <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>Pulse Müəllifləri</h2>
                <button className={styles.addBtn} onClick={openCreate}>+ Yeni Müəllif</button>
            </div>
            {loading ? <div className={styles.empty}>Yüklənir...</div>
                : authors.length === 0 ? <div className={styles.empty}>Hələ müəllif yoxdur</div>
                    : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead><tr><th>Şəkil</th><th>Ad</th><th>Slug</th><th>Vəzifə</th><th>Əməliyyatlar</th></tr></thead>
                                <tbody>
                                    {authors.map(a => (
                                        <tr key={a.id}>
                                            <td>{a.avatar && <img src={toAbsUrl(a.avatar)} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />}</td>
                                            <td><strong>{a.name}</strong></td>
                                            <td><span className={styles.blogSlug}>/{a.slug}</span></td>
                                            <td>{a.title || "—"}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button className={styles.editBtn} onClick={() => openEdit(a)}>Düzəlt</button>
                                                    <button className={styles.deleteBtn} onClick={() => setDeleteId(a.id)}>Sil</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
            {modalOpen && (
                <div className={styles.overlay} onClick={() => setModalOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editItem ? "Müəllifi Düzəlt" : "Yeni Müəllif"}</h2>
                            <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.field}>
                                <label>Ad *</label>
                                <input className={styles.input} value={name} onChange={e => { setName(e.target.value); if (!editItem) setSlug(generateSlug(e.target.value)); }} />
                            </div>
                            <div className={styles.field}>
                                <label>Slug</label>
                                <input className={styles.input} value={slug} onChange={e => setSlug(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label>Vəzifə</label>
                                <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Baş redaktor" />
                            </div>
                            <div className={styles.field}>
                                <label>Şəkil</label>
                                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
                                <div onClick={() => fileRef.current?.click()} style={{ cursor: "pointer", border: "1px dashed #444", borderRadius: 8, padding: 12, textAlign: "center" }}>
                                    {avatar ? <img src={toAbsUrl(avatar)} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} /> : <span style={{ color: "#888" }}>Şəkil yüklə</span>}
                                </div>
                            </div>
                            <div className={styles.field}>
                                <label>Təsvir</label>
                                <textarea className={styles.input} rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Ləğv et</button>
                            <button className={styles.saveBtn} onClick={save} disabled={saving}>{saving ? "Saxlanır..." : "Saxla"}</button>
                        </div>
                    </div>
                </div>
            )}
            {deleteId && (
                <div className={styles.overlay} onClick={() => setDeleteId(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}><h2>Silməyi təsdiq edin</h2>
                            <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button></div>
                        <div className={styles.modalBody}><p>Bu müəllifi silmək istədiyinizə əminsiniz?</p></div>
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
