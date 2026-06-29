"use client";

import { useEffect, useState } from "react";
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

function Avatar({ name }: { name: string }) {
    const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
    return (
        <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "#f0f0f0", border: "1px solid #e5e5e5",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#555", flexShrink: 0,
        }}>
            {initials}
        </div>
    );
}

function RoleBadge({ role }: { role: string }) {
    const colors: Record<string, { bg: string; fg: string }> = {
        Client: { bg: "#e8f5e9", fg: "#2e7d32" },
        Developer: { bg: "#e3f2fd", fg: "#1565c0" },
        Broker: { bg: "#fff3e0", fg: "#e65100" },
    };
    const c = colors[role] || { bg: "#f4f4f5", fg: "#444" };
    return (
        <span style={{
            fontSize: 12, fontWeight: 500,
            padding: "3px 10px",
            background: c.bg, color: c.fg,
            borderRadius: 20, whiteSpace: "nowrap",
        }}>
            {role}
        </span>
    );
}

export default function CallbackRequestsPage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<CallbackRequest[]>([]);
    const [search, setSearch] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

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

    const handleDelete = async (id: string) => {
        if (!confirm("Bu sorğunu silmək istədiyinizə əminsiniz?")) return;
        setDeleting(id);
        try {
            await fetch(`${API}/callback/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setRequests(prev => prev.filter(r => r.id !== id));
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

            <div style={{ marginBottom: 16 }}>
                <input
                    className={styles.input}
                    placeholder="Ad, telefon və ya rol üzrə axtar..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: 400 }}
                />
            </div>

            {filtered.length === 0 ? (
                <div className={styles.empty}>
                    {search ? "Nəticə tapılmadı" : "Heç bir callback sorğusu yoxdur"}
                </div>
            ) : (
                <div style={{
                    background: "#fff",
                    border: "1px solid #e8e8e8",
                    borderRadius: 10,
                    overflow: "hidden",
                }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
                                <th style={{ textAlign: "left", padding: "12px 20px", fontWeight: 600, color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ad</th>
                                <th style={{ textAlign: "left", padding: "12px 20px", fontWeight: 600, color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Telefon</th>
                                <th style={{ textAlign: "left", padding: "12px 20px", fontWeight: 600, color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Rol</th>
                                <th style={{ textAlign: "left", padding: "12px 20px", fontWeight: 600, color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tarix</th>
                                <th style={{ textAlign: "right", padding: "12px 20px", fontWeight: 600, color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Əməliyyat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(req => (
                                <tr key={req.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                    <td style={{ padding: "14px 20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <Avatar name={req.name} />
                                            <span style={{ fontWeight: 500, color: "#1a1a1a" }}>{req.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 20px", color: "#444" }}>{req.phone}</td>
                                    <td style={{ padding: "14px 20px" }}><RoleBadge role={req.role} /></td>
                                    <td style={{ padding: "14px 20px", color: "#999", fontSize: 13 }}>{formatDate(req.createdAt)}</td>
                                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                                        <button
                                            onClick={() => handleDelete(req.id)}
                                            disabled={deleting === req.id}
                                            style={{
                                                background: "none", border: "1px solid #e5e5e5",
                                                borderRadius: 6, padding: "5px 10px", cursor: "pointer",
                                                color: deleting === req.id ? "#ccc" : "#e53e3e",
                                                fontSize: 12, fontWeight: 500,
                                                transition: "all 0.15s",
                                            }}
                                        >
                                            {deleting === req.id ? "Silinir..." : "Sil"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
