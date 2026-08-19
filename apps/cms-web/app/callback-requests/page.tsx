"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import styles from "@/styles/blog.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
    return document.cookie.split("access_token=")[1]?.split(";")[0] ?? "";
}

async function apiFetch(path: string) {
    const res = await fetch(`${API}${path}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Xəta baş verdi");
    return res.json();
}

interface CallbackRequest {
    id: string;
    name: string;
    phone: string;
    role: string;
    createdAt: string;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("az-AZ", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function RoleBadge({ role }: { role: string }) {
    const tone: Record<string, string | undefined> = {
        Client: styles.toneGreen,
        Developer: styles.toneBlue,
        Broker: styles.toneAmber,
    };
    return (
        <span className={`${styles.statusBadge} ${tone[role] || styles.toneNeutral}`}>
            {role}
        </span>
    );
}

export default function CallbackRequestsPage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<CallbackRequest[]>([]);
    const [search, setSearch] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmTarget, setConfirmTarget] = useState<CallbackRequest | null>(null);

    useEffect(() => {
        apiFetch("/callback")
            .then(setRequests)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = requests.filter(r => {
        const q = search.toLowerCase();
        return (
            r.name.toLowerCase().includes(q) ||
            r.phone.toLowerCase().includes(q) ||
            r.role.toLowerCase().includes(q)
        );
    });

    const handleDelete = async () => {
        const target = confirmTarget;
        if (!target) return;
        setDeleting(target.id);
        try {
            await fetch(`${API}/callback/${target.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setRequests(prev => prev.filter(r => r.id !== target.id));
            setConfirmTarget(null);
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(null);
        }
    };

    if (loading) return <div className={styles.empty}>Yüklənir...</div>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Callback Sorğuları</h1>
                    <p className={styles.subtitle}>Cəmi {requests.length} sorğu</p>
                </div>
            </div>

            <div className={styles.toolbar}>
                <input
                    className={styles.searchInput}
                    placeholder="Ad, telefon və ya rol üzrə axtar..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {search && (
                    <span className={styles.resultCount}>
                        {filtered.length} nəticə
                    </span>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className={styles.empty}>
                    {search ? "Nəticə tapılmadı" : "Heç bir callback sorğusu yoxdur"}
                </div>
            ) : (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Ad</th>
                                <th>Telefon</th>
                                <th>Rol</th>
                                <th>Tarix</th>
                                <th>Əməliyyat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(req => (
                                <tr key={req.id}>
                                    <td>
                                        <div className={styles.blogInfo}>
                                            <Avatar name={req.name} className={styles.avatar} />
                                            <span className={styles.cellMain}>{req.name}</span>
                                        </div>
                                    </td>
                                    <td>{req.phone}</td>
                                    <td><RoleBadge role={req.role} /></td>
                                    <td className={styles.cellMuted}>{formatDate(req.createdAt)}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => setConfirmTarget(req)}
                                                disabled={deleting === req.id}
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDialog
                open={confirmTarget !== null}
                message="Bu callback sorğusu silinəcək:"
                subject={confirmTarget?.name}
                busy={deleting !== null}
                onConfirm={handleDelete}
                onCancel={() => setConfirmTarget(null)}
            />
        </div>
    );
}
