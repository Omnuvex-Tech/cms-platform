"use client";

import React, { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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

function TypeBadge({ type }: { type: string }) {
    const tone: Record<string, string | undefined> = {
        Kurjer: styles.toneGreen,
        Agent: styles.toneBlue,
        "Ofis müdiri": styles.toneAmber,
    };
    return (
        <span className={`${styles.statusBadge} ${tone[type] || styles.toneNeutral}`}>
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
    const [confirmTarget, setConfirmTarget] = useState<BrokerRegistration | null>(null);

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

    const handleDelete = async () => {
        const target = confirmTarget;
        if (!target) return;
        setDeleting(target.id);
        try {
            await fetch(`${API}/broker-registration/${target.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setRegistrations(prev => prev.filter(r => r.id !== target.id));
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
                    <h1 className={styles.title}>Broker Qeydiyyatları</h1>
                    <p className={styles.subtitle}>Cəmi {registrations.length} sorğu</p>
                </div>
            </div>

            <div className={styles.toolbar}>
                <input
                    className={styles.searchInput}
                    placeholder="Ad, email, telefon, şəhər və ya tip üzrə axtar..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {search && (
                    <span className={styles.resultCount}>{filtered.length} nəticə</span>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className={styles.empty}>
                    {search ? "Nəticə tapılmadı" : "Heç bir broker qeydiyyatı yoxdur"}
                </div>
            ) : (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.expandCell}></th>
                                <th>Ad</th>
                                <th>Email</th>
                                <th>Telefon</th>
                                <th>Şəhər</th>
                                <th>Tip</th>
                                <th>Tarix</th>
                                <th>Əməliyyat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(reg => {
                                const isOpen = expanded === reg.id;
                                return (
                                    <React.Fragment key={reg.id}>
                                        <tr onClick={() => setExpanded(isOpen ? null : reg.id)}>
                                            <td className={styles.expandCell}>
                                                <span
                                                    className={`${styles.expandBtn} ${isOpen ? styles.expandBtnOpen : ""}`}
                                                    aria-hidden="true"
                                                >
                                                    <ChevronDown size={15} />
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.blogInfo}>
                                                    <Avatar name={reg.name} className={styles.avatar} />
                                                    <span className={styles.cellMain}>{reg.name}</span>
                                                </div>
                                            </td>
                                            <td>{reg.email}</td>
                                            <td>{reg.phone}</td>
                                            <td className={styles.cellMuted}>{reg.city || "—"}</td>
                                            <td><TypeBadge type={reg.brokerType || ""} /></td>
                                            <td className={styles.cellMuted}>{formatDate(reg.createdAt)}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button
                                                        className={styles.deleteBtn}
                                                        onClick={(e) => { e.stopPropagation(); setConfirmTarget(reg); }}
                                                        disabled={deleting === reg.id}
                                                    >
                                                        Sil
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isOpen && (
                                            <tr>
                                                <td colSpan={8} className={styles.detailCell}>
                                                    <div className={styles.infoGrid}>
                                                        <div>
                                                            <p className={styles.infoLabel}>Təcrübə</p>
                                                            <p className={styles.infoValue}>{reg.experience || "—"}</p>
                                                        </div>
                                                        <div>
                                                            <p className={styles.infoLabel}>Vebsayt</p>
                                                            <p className={styles.infoValue}>
                                                                {reg.website
                                                                    ? <a href={reg.website} target="_blank" rel="noopener noreferrer" className={styles.link}>{reg.website}</a>
                                                                    : "—"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className={styles.infoLabel}>Şərhlər</p>
                                                            <p className={`${styles.infoValue} ${styles.infoValueMultiline}`}>{reg.message || "—"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDialog
                open={confirmTarget !== null}
                message="Bu broker qeydiyyatı silinəcək:"
                subject={confirmTarget?.name}
                busy={deleting !== null}
                onConfirm={handleDelete}
                onCancel={() => setConfirmTarget(null)}
            />
        </div>
    );
}
