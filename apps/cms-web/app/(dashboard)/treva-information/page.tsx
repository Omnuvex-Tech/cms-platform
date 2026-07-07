"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Mail, Phone, Radio, Save, Send } from "lucide-react";
import { api } from "@/lib/api";
import { infoStatus } from "@/lib/status";
import { relativeTime } from "@/lib/format";
import { AdminGuard } from "@/components/AdminGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { Loading } from "@/components/ui/States";
import { Markdown } from "@/components/ui/Markdown";
import ui from "@/styles/ui.module.css";
import styles from "@/styles/treva-info.module.css";

interface TrevaInfo {
    id: number;
    mission?: string | null;
    vision?: string | null;
    whoWeAre?: string | null;
    whyChoose?: string | null;
    website?: string | null;
    email?: string | null;
    phone?: string | null;
    hotline?: string | null;
    status: "draft" | "published";
    updatedAt: string;
}

type Form = Omit<TrevaInfo, "id" | "status" | "updatedAt">;

const ABOUT_FIELDS: { key: keyof Form; label: string }[] = [
    { key: "mission", label: "Mission" },
    { key: "vision", label: "Vision" },
    { key: "whoWeAre", label: "Who We Are" },
    { key: "whyChoose", label: "Why Choose TREVA" },
];

function TrevaInformation() {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["treva-info"],
        queryFn: () => api.get<TrevaInfo>("/treva-info"),
    });

    const [form, setForm] = useState<Form>({});
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        if (data) {
            setForm({
                mission: data.mission ?? "",
                vision: data.vision ?? "",
                whoWeAre: data.whoWeAre ?? "",
                whyChoose: data.whyChoose ?? "",
                website: data.website ?? "",
                email: data.email ?? "",
                phone: data.phone ?? "",
                hotline: data.hotline ?? "",
            });
            setDirty(false);
        }
    }, [data]);

    const save = useMutation({
        mutationFn: (status: "draft" | "published") =>
            api.put<TrevaInfo>("/treva-info", { ...form, status }),
        onSuccess: (updated) => {
            qc.setQueryData(["treva-info"], updated);
            setDirty(false);
        },
    });

    const set = (key: keyof Form, value: string) => {
        setForm((f) => ({ ...f, [key]: value }));
        setDirty(true);
    };

    if (isLoading || !data) return <Loading />;

    return (
        <div>
            <PageHeader
                title="TREVA Information"
                subtitle="The single company record the agent shares with customers."
                actions={
                    <>
                        <StatusPill meta={infoStatus[data.status]} />
                        <span className={ui.muted} style={{ fontSize: 12 }}>
                            Updated {relativeTime(data.updatedAt)}
                        </span>
                        {dirty && (
                            <span className={styles.unsaved}>● Unsaved changes</span>
                        )}
                        <button
                            className={`${ui.btn} ${ui.btnGhost}`}
                            disabled={save.isPending}
                            onClick={() => save.mutate("draft")}
                        >
                            <Save size={15} /> Save draft
                        </button>
                        <button
                            className={`${ui.btn} ${ui.btnPrimary}`}
                            disabled={save.isPending}
                            onClick={() => save.mutate("published")}
                        >
                            <Send size={15} /> Publish
                        </button>
                    </>
                }
            />

            <div className={styles.split}>
                {/* Editor */}
                <div className={ui.card} style={{ padding: 22 }}>
                    <div className={ui.sectionTitle}>About TREVA</div>
                    {ABOUT_FIELDS.map((f) => (
                        <div className={ui.field} key={f.key}>
                            <label className={ui.label}>{f.label}</label>
                            <textarea
                                className={ui.textarea}
                                value={form[f.key] ?? ""}
                                onChange={(e) => set(f.key, e.target.value)}
                                placeholder={`${f.label} (markdown supported)`}
                            />
                        </div>
                    ))}

                    <div className={ui.sectionTitle} style={{ marginTop: 18 }}>
                        Contacts
                    </div>
                    <div className={ui.field}>
                        <label className={ui.label}>Website</label>
                        <input
                            className={ui.input}
                            value={form.website ?? ""}
                            onChange={(e) => set("website", e.target.value)}
                        />
                    </div>
                    <div className={ui.field}>
                        <label className={ui.label}>Email</label>
                        <input
                            className={ui.input}
                            value={form.email ?? ""}
                            onChange={(e) => set("email", e.target.value)}
                        />
                    </div>
                    <div className={styles.row2}>
                        <div className={ui.field}>
                            <label className={ui.label}>Phone</label>
                            <input
                                className={ui.input}
                                value={form.phone ?? ""}
                                onChange={(e) => set("phone", e.target.value)}
                            />
                        </div>
                        <div className={ui.field}>
                            <label className={ui.label}>Hotline / short code</label>
                            <input
                                className={ui.input}
                                value={form.hotline ?? ""}
                                onChange={(e) => set("hotline", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Live preview */}
                <div className={styles.preview}>
                    <div className={styles.previewLabel}>Customer preview</div>
                    <div className={ui.card} style={{ padding: 24 }}>
                        {ABOUT_FIELDS.map((f) => (
                            <div key={f.key} style={{ marginBottom: 16 }}>
                                <div className={styles.previewHeading}>{f.label}</div>
                                <div className={styles.previewBody}>
                                    <Markdown text={form[f.key]} />
                                </div>
                            </div>
                        ))}
                        <div className={styles.contactCard}>
                            <div className={styles.previewHeading}>Contacts</div>
                            <ul className={styles.contactList}>
                                <li>
                                    <Globe size={14} /> {form.website || "—"}
                                </li>
                                <li>
                                    <Mail size={14} /> {form.email || "—"}
                                </li>
                                <li>
                                    <Phone size={14} /> {form.phone || "—"}
                                </li>
                                <li>
                                    <Radio size={14} /> {form.hotline || "—"}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <AdminGuard>
            <TrevaInformation />
        </AdminGuard>
    );
}
