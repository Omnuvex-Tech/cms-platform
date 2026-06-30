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

interface BrokerRegistration {
    id: number;
    name: string;
    email: string;
    phone: string;
    city: string | null;
    brokerType: string | null;
    experience: string | null;
    website: string | null;
    message: string | null;
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

function TypeBadge({ type }: { type: string }) {
    const colors: Record<string, { bg: string; fg: string }> = {
        Kurjer: { bg: "#e8f5e9", fg: "#2e7d32" },
        Agent: { bg: "#e3f2fd", fg: "#1565c0" },
        "Ofis müdiri": { bg: "#fff3e0", fg: "#e65100" },
    };
    const c = colors[type] || { bg: "#f4f4f5", fg: "#444" };
    return (
        <span style={{
            fontSize: 12, fontWeight: 500,
            padding: "3px 10px",
            background: c.bg, color: c.fg,
            borderRadius: 20, whiteSpace: "nowrap",
        }}>
            {type || "—"}
        </span>
    );
}

export default function BrokerRegistrationsPage() {
    const [loading, setLoading] = useState(true);
    const [registrations, setRegistrations] = useState<BrokerRegistration[]>([]);
    const [search, setSearch] = useState("");
    const [deleting, setDeleting] = useState<number | null>(null);
    const [expanded, setExpanded] = useState<number | null>(null);

    useEffect(() => {
        apiFetch("/broker-registration")
            .then(setRegistrations)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = registrations.filter(r => {
        const q = search.toLowerCase();
        return (
            r.name.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            r.phone.toLowerCase().includes(q) ||
            (r.city && r.city.toLowerCase().includes(q)) ||
            (r.brokerType && r.brokerType.toLowerCase().includes(q))
        );
    });

    const handleDelete = async (id: number) => {
        if (!confirm("Bu sorğunu silmək istədiyinizə əminsiniz?")) return;
        setDeleting(id);
        try {
            await fetch(`${API}/broker-registration/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setRegistrations(prev => prev.filter(r => r.id !== id));
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
                    <h1 className={styles.title}>Broker Qeydiyyatları</h1>
                    <p className={styles.subtitle}>Cəmi {registrations.length} sorğu</p>
                </div>
            </div>

            <div style={{ marginBottom: 16 }}>
                <input
                    className={styles.input}
                    placeholder="Ad, email, telefon, şəhər və ya tip üzrə axtar..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: 400 }}
                />
            </div>

            {filtered.length === 0 ? (
                <div className={styles.empty}>
                    {search ? "Nəticə tapılmadı" : "Heç bir broker qeydiyyatı yoxdur"}
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
                                <th style={{ textAlign: "left", padding: "12px 20px", fontWeight: 600, color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                                <th style={{ textAlign: "left", padding: "12px 20px", fontWeight: 600, color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Telefon</th>
                                <th style={{ textAlign: "left", padding: "12px 20px", fontWeight: 600, color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Şəhər</th>
                                <th style={{ textAlign: "left", padding: "12px 20px", fontWeight: 600, color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tip</th>
                                <th style={{ textAlign: "left", padding: "12px 20px", fontWeight: 600, color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tarix</th>
                                <th style={{ textAlign: "right", padding: "12px 20px", fontWeight: 600, color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Əməliyyat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(reg => (
                                <>
                                    <tr key={reg.id} style={{ borderBottom: "1px solid #f0f0f0", cursor: "pointer" }} onClick={() => setExpanded(expanded === reg.id ? null : reg.id)}>
                                        <td style={{ padding: "14px 20px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <Avatar name={reg.name} />
                                                <span style={{ fontWeight: 500, color: "#1a1a1a" }}>{reg.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 20px", color: "#444" }}>{reg.email}</td>
                                        <td style={{ padding: "14px 20px", color: "#444" }}>{reg.phone}</td>
                                        <td style={{ padding: "14px 20px", color: "#666" }}>{reg.city || "—"}</td>
                                        <td style={{ padding: "14px 20px" }}><TypeBadge type={reg.brokerType || ""} /></td>
                                        <td style={{ padding: "14px 20px", color: "#999", fontSize: 13 }}>{formatDate(reg.createdAt)}</td>
                                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(reg.id); }}
                                                disabled={deleting === reg.id}
                                                style={{
                                                    background: "none", border: "1px solid #e5e5e5",
                                                    borderRadius: 6, padding: "5px 10px", cursor: "pointer",
                                                    color: deleting === reg.id ? "#ccc" : "#e53e3e",
                                                    fontSize: 12, fontWeight: 500,
                                                    transition: "all 0.15s",
                                                }}
                                            >
                                                {deleting === reg.id ? "Silinir..." : "Sil"}
                                            </button>
                                        </td>
                                    </tr>
                                    {expanded === reg.id && (
                                        <tr key={`${reg.id}-details`}>
                                            <td colSpan={7} style={{ padding: "14px 20px 20px", background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, fontSize: 13 }}>
                                                    <div>
                                                        <span style={{ color: "#999", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Təcrübə</span>
                                                        <p style={{ margin: "4px 0 0", color: "#333" }}>{reg.experience || "—"}</p>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: "#999", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Vebsayt</span>
                                                        <p style={{ margin: "4px 0 0", color: "#333" }}>{reg.website ? <a href={reg.website} target="_blank" rel="noopener noreferrer" style={{ color: "#1565c0" }}>{reg.website}</a> : "—"}</p>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: "#999", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Şərhlər</span>
                                                        <p style={{ margin: "4px 0 0", color: "#333" }}>{reg.message || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
