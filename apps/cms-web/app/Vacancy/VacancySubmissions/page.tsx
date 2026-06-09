"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/vacancy.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;
function getToken() { return document.cookie.split("access_token=")[1]?.split(";")[0] ?? ""; }

async function apiFetch(path: string) {
    const res = await fetch(`${API}${path}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Xəta baş verdi");
    return res.json();
}

interface VacancySubmission {
    id: number;
    name: string;
    email: string;
    phone: string;
    message: string | null;
    cvUrl: string;
    vacancyId: number | null;
    vacancyTitle: string | null;
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

function SubmissionCard({ sub, isOpen, onToggle }: {
    sub: VacancySubmission;
    isOpen: boolean;
    onToggle: () => void;
}) {
    const cvFileName = sub.cvUrl.split("/").pop() ?? "CV";
    const cvFullUrl = sub.cvUrl.startsWith("http") ? sub.cvUrl : `${API}${sub.cvUrl}`;

    return (
        <div style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 10,
            overflow: "hidden",
            transition: "box-shadow 0.15s",
            boxShadow: isOpen ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
        }}>
            {/* Header */}
            <div onClick={onToggle} style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px", cursor: "pointer", gap: 12,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <Avatar name={sub.name} />
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {sub.name}
                        </p>
                        <p style={{ fontSize: 12, color: "#999", margin: 0 }}>{sub.email}</p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    {sub.vacancyTitle && (
                        <span style={{
                            fontSize: 12, fontWeight: 500,
                            padding: "3px 10px",
                            background: "#f4f4f5",
                            color: "#444",
                            borderRadius: 20,
                            whiteSpace: "nowrap",
                        }}>
                            {sub.vacancyTitle}
                        </span>
                    )}
                    <span style={{ fontSize: 12, color: "#bbb", whiteSpace: "nowrap" }}>
                        {formatDate(sub.createdAt)}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"
                        style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </div>

            {/* Body */}
            {isOpen && (
                <div style={{
                    padding: "0 20px 20px",
                    borderTop: "1px solid #f0f0f0",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0 24px",
                }}>
                    <InfoRow label="Telefon" value={sub.phone || "—"} />
                    <InfoRow label="Email" value={sub.email} />
                    {sub.message && (
                        <div style={{ gridColumn: "1 / -1" }}>
                            <InfoRow label="Mesaj" value={sub.message} multiline />
                        </div>
                    )}
                    <div style={{ gridColumn: "1 / -1", paddingTop: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#bbb", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            CV
                        </p>
                        <a
                            href={cvFullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 8,
                                padding: "7px 14px", borderRadius: 8,
                                background: "#f4f4f5", color: "#1a1a1a",
                                fontSize: 13, fontWeight: 500, textDecoration: "none",
                                border: "1px solid #e5e5e5",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            {cvFileName}
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
    return (
        <div style={{ paddingTop: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#bbb", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label}
            </p>
            <p style={{ fontSize: 13, color: "#444", margin: 0, whiteSpace: multiline ? "pre-wrap" : "normal", lineHeight: 1.6 }}>
                {value}
            </p>
        </div>
    );
}

export default function VacancySubmissionsPage() {
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<VacancySubmission[]>([]);
    const [openId, setOpenId] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        apiFetch("/vacancy/submissions")
            .then(setSubmissions)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = submissions.filter(s => {
        const q = search.toLowerCase();
        return (
            s.name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            (s.vacancyTitle ?? "").toLowerCase().includes(q)
        );
    });

    const toggle = (id: number) => setOpenId(prev => prev === id ? null : id);

    if (loading) return <div className={styles.page}><div className={styles.empty}>Yüklənir...</div></div>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Müraciətlər</h1>
                    <p className={styles.subtitle}>Cəmi {submissions.length} müraciət</p>
                </div>
            </div>

            <div style={{ marginBottom: 16 }}>
                <input
                    className={styles.input}
                    placeholder="Ad, email və ya vakansiya üzrə axtar..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: 400 }}
                />
            </div>

            {filtered.length === 0 ? (
                <div className={styles.empty}>
                    {search ? "Nəticə tapılmadı" : "Heç bir müraciət yoxdur"}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {filtered.map(sub => (
                        <SubmissionCard
                            key={sub.id}
                            sub={sub}
                            isOpen={openId === sub.id}
                            onToggle={() => toggle(sub.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}