"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import { relativeTime } from "@/lib/format";
import { AdminGuard } from "@/components/AdminGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Loading } from "@/components/ui/States";
import { Markdown } from "@/components/ui/Markdown";
import ui from "@/styles/ui.module.css";
import styles from "@/styles/treva-info.module.css";

interface TrevaInfoSection {
    id: number;
    heading: string;
    content: string;
    sortOrder: number;
}

interface TrevaInfo {
    id: number;
    updatedAt: string;
    sections: TrevaInfoSection[];
}

function TrevaInformation() {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["treva-info"],
        queryFn: () => api.get<TrevaInfo>("/treva-info"),
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editDraft, setEditDraft] = useState({ heading: "", content: "" });
    const [adding, setAdding] = useState(false);
    const [newSection, setNewSection] = useState({ heading: "", content: "" });

    const invalidate = () => qc.invalidateQueries({ queryKey: ["treva-info"] });

    const addSection = useMutation({
        mutationFn: (body: { heading: string; content: string }) =>
            api.post<TrevaInfoSection>("/treva-info/sections", body),
        onSuccess: () => {
            setAdding(false);
            setNewSection({ heading: "", content: "" });
            invalidate();
        },
    });

    const updateSection = useMutation({
        mutationFn: ({ id, ...body }: { id: number; heading: string; content: string }) =>
            api.patch<TrevaInfoSection>(`/treva-info/sections/${id}`, body),
        onSuccess: () => {
            setEditingId(null);
            invalidate();
        },
    });

    const deleteSection = useMutation({
        mutationFn: (id: number) => api.delete(`/treva-info/sections/${id}`),
        onSuccess: () => invalidate(),
    });

    const startEdit = (s: TrevaInfoSection) => {
        setEditingId(s.id);
        setEditDraft({ heading: s.heading, content: s.content });
    };

    if (isLoading || !data) return <Loading />;

    const sections = [...data.sections].sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <div>
            <PageHeader
                title="TREVA Information"
                subtitle="The company knowledge base the agent shares with customers — freely editable headings, always live and synced to the bot."
                actions={
                    <span className={ui.muted} style={{ fontSize: 12 }}>
                        Updated {relativeTime(data.updatedAt)}
                    </span>
                }
            />

            <div className={styles.split}>
                {/* Editor */}
                <div>
                    {sections.map((s) => (
                        <div className={ui.card} style={{ padding: 18, marginBottom: 14 }} key={s.id}>
                            {editingId === s.id ? (
                                <>
                                    <div className={ui.field}>
                                        <label className={ui.label}>Heading</label>
                                        <input
                                            className={ui.input}
                                            value={editDraft.heading}
                                            onChange={(e) =>
                                                setEditDraft((d) => ({ ...d, heading: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className={ui.field}>
                                        <label className={ui.label}>Content (markdown supported)</label>
                                        <textarea
                                            className={ui.textarea}
                                            style={{ minHeight: 160 }}
                                            value={editDraft.content}
                                            onChange={(e) =>
                                                setEditDraft((d) => ({ ...d, content: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button
                                            className={`${ui.btn} ${ui.btnPrimary} ${ui.btnSm}`}
                                            disabled={updateSection.isPending || !editDraft.heading.trim()}
                                            onClick={() =>
                                                updateSection.mutate({ id: s.id, ...editDraft })
                                            }
                                        >
                                            <Save size={13} /> Save
                                        </button>
                                        <button
                                            className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                                            onClick={() => setEditingId(null)}
                                        >
                                            <X size={13} /> Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <div className={ui.sectionTitle} style={{ marginBottom: 0 }}>
                                            {s.heading}
                                        </div>
                                        <div style={{ display: "flex", gap: 4 }}>
                                            <button
                                                className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                                                onClick={() => startEdit(s)}
                                                title="Edit heading"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                className={`${ui.btn} ${ui.btnDanger} ${ui.btnSm}`}
                                                disabled={deleteSection.isPending}
                                                onClick={() => {
                                                    if (confirm(`Delete "${s.heading}"?`)) {
                                                        deleteSection.mutate(s.id);
                                                    }
                                                }}
                                                title="Delete heading"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 13.5, color: "#6b7280" }}>
                                        <Markdown text={s.content} />
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {adding ? (
                        <div className={ui.card} style={{ padding: 18, marginBottom: 14 }}>
                            <div className={ui.field}>
                                <label className={ui.label}>Heading</label>
                                <input
                                    className={ui.input}
                                    autoFocus
                                    placeholder="e.g. Awards & Recognition"
                                    value={newSection.heading}
                                    onChange={(e) =>
                                        setNewSection((d) => ({ ...d, heading: e.target.value }))
                                    }
                                />
                            </div>
                            <div className={ui.field}>
                                <label className={ui.label}>Content (markdown supported)</label>
                                <textarea
                                    className={ui.textarea}
                                    style={{ minHeight: 160 }}
                                    value={newSection.content}
                                    onChange={(e) =>
                                        setNewSection((d) => ({ ...d, content: e.target.value }))
                                    }
                                />
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    className={`${ui.btn} ${ui.btnPrimary} ${ui.btnSm}`}
                                    disabled={addSection.isPending || !newSection.heading.trim()}
                                    onClick={() => addSection.mutate(newSection)}
                                >
                                    <Save size={13} /> Add heading
                                </button>
                                <button
                                    className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                                    onClick={() => {
                                        setAdding(false);
                                        setNewSection({ heading: "", content: "" });
                                    }}
                                >
                                    <X size={13} /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            className={`${ui.btn} ${ui.btnGhost}`}
                            style={{ width: "100%" }}
                            onClick={() => setAdding(true)}
                        >
                            <Plus size={15} /> Add heading
                        </button>
                    )}
                </div>

                {/* Live preview */}
                <div className={styles.preview}>
                    <div className={styles.previewLabel}>Customer preview</div>
                    <div className={ui.card} style={{ padding: 24 }}>
                        {sections.length === 0 && (
                            <p style={{ color: "#a0a6ad", fontStyle: "italic" }}>No headings yet.</p>
                        )}
                        {sections.map((s) => (
                            <div key={s.id} style={{ marginBottom: 16 }}>
                                <div className={styles.previewHeading}>{s.heading}</div>
                                <div className={styles.previewBody}>
                                    <Markdown text={s.content} />
                                </div>
                            </div>
                        ))}
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
