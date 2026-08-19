"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { ChevronDown } from "lucide-react";
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

interface Submission {
    id: number;
    name: string;
    email: string;
    phone: string;
    service: string;
    budget: string;
    timeline: string;
    message: string;
    createdAt: string;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("az-AZ", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function decode(str: string | null | undefined) {
    if (!str) return '';
    return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}

function SubmissionCard({ sub, isOpen, onToggle }: {
    sub: Submission; isOpen: boolean; onToggle: () => void;
}) {
    return (
        <div className={`${styles.accordionItem} ${isOpen ? styles.accordionItemOpen : ""}`}>
            <button
                type="button"
                className={styles.accordionHead}
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span className={styles.accordionMain}>
                    <Avatar name={sub.name} className={styles.avatar} />
                    <span className={styles.cellStack}>
                        <span className={styles.cellMain}>{sub.name}</span>
                        <span className={styles.cellSub}>{sub.email}</span>
                    </span>
                </span>

                <span className={styles.accordionMeta}>
                    {sub.service && (
                        <span className={`${styles.statusBadge} ${styles.toneNeutral}`}>
                            {decode(sub.service)}
                        </span>
                    )}
                    <span className={styles.cellMuted}>{formatDate(sub.createdAt)}</span>
                    <span className={`${styles.accordionChevron} ${isOpen ? styles.accordionChevronOpen : ""}`}>
                        <ChevronDown size={16} />
                    </span>
                </span>
            </button>

            {isOpen && (
                <div className={styles.accordionBody}>
                    <div className={styles.infoGrid}>
                        <InfoRow label="Telefon" value={sub.phone || "—"} />
                        <InfoRow label="Servis" value={decode(sub.service) || "—"} />
                        <InfoRow label="Büdcə" value={sub.budget || "—"} />
                        <InfoRow label="Timeline" value={sub.timeline || "—"} />
                        <div className={styles.infoWide}>
                            <InfoRow label="Mesaj" value={sub.message || "—"} multiline />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
    return (
        <div>
            <p className={styles.infoLabel}>{label}</p>
            <p className={`${styles.infoValue} ${multiline ? styles.infoValueMultiline : ""}`}>
                {value}
            </p>
        </div>
    );
}

export default function SubmissionsPage() {
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [openId, setOpenId] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        apiFetch("/contact/submissions")
            .then(setSubmissions)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = submissions.filter(s => {
        const q = search.toLowerCase();
        return (
            s.name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            (s.service || "").toLowerCase().includes(q)
        );
    });

    const toggle = (id: number) => setOpenId(prev => prev === id ? null : id);

    if (loading) return <div className={styles.empty}>Yüklənir...</div>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Müraciətlər</h1>
                    <p className={styles.subtitle}>Cəmi {submissions.length} müraciət</p>
                </div>
            </div>

            <div className={styles.toolbar}>
                <input
                    className={styles.searchInput}
                    placeholder="Ad, email və ya servis üzrə axtar..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {search && (
                    <span className={styles.resultCount}>{filtered.length} nəticə</span>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className={styles.empty}>
                    {search ? "Nəticə tapılmadı" : "Heç bir müraciət yoxdur"}
                </div>
            ) : (
                <div className={styles.accordionList}>
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