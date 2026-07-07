"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    LifeBuoy,
    AlertTriangle,
    Bot,
    BotOff,
    Undo2,
    Check,
    ExternalLink,
    Hand,
} from "lucide-react";
import { api } from "@/lib/api";
import {
    handoffStatus,
    handoffPriority,
    slaState,
    channelLabel,
} from "@/lib/status";
import { relativeTime, initials } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { Transcript, TranscriptMessage } from "@/components/ui/Transcript";
import { Loading, EmptyState, Avatar } from "@/components/ui/States";
import ui from "@/styles/ui.module.css";
import styles from "@/styles/handoffs.module.css";

interface HandoffConversation {
    id: number;
    threadId: string;
    channel: string;
    customerHandle?: string | null;
    customerPhone?: string | null;
    status: string;
    botActive: boolean;
    leadId?: number | null;
    messages?: TranscriptMessage[];
    lead?: { id: number; salesStatus: string } | null;
}

interface HandoffItem {
    id: number;
    status: string;
    priority: string;
    slaState: string;
    reason?: string | null;
    notes?: string | null;
    dueAt?: string | null;
    createdAt: string;
    assignedTo?: { id: number; name: string | null; email: string } | null;
    conversation: HandoffConversation;
}

const STATUS_FILTERS = [
    { value: "open", label: "Open" },
    { value: "new", label: "New" },
    { value: "assigned", label: "Assigned" },
    { value: "resolved", label: "Resolved" },
    { value: "cancelled", label: "Cancelled" },
];

export default function HandoffsPage() {
    const qc = useQueryClient();
    const [statusFilter, setStatusFilter] = useState("open");
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const { data: list, isLoading } = useQuery({
        queryKey: ["handoffs", statusFilter],
        queryFn: () => api.get<HandoffItem[]>(`/handoffs?status=${statusFilter}`),
    });

    const { data: detail } = useQuery({
        queryKey: ["handoff", selectedId],
        queryFn: () => api.get<HandoffItem>(`/handoffs/${selectedId}`),
        enabled: !!selectedId,
    });

    useEffect(() => {
        if (list && list.length > 0) {
            if (!selectedId || !list.find((h) => h.id === selectedId)) {
                setSelectedId(list[0]!.id);
            }
        } else if (list && list.length === 0) {
            setSelectedId(null);
        }
    }, [list, selectedId]);

    const refresh = () => {
        qc.invalidateQueries({ queryKey: ["handoffs"] });
        qc.invalidateQueries({ queryKey: ["handoff", selectedId] });
        qc.invalidateQueries({ queryKey: ["badges"] });
    };

    const accept = useMutation({
        mutationFn: () => api.post(`/handoffs/${selectedId}/accept`),
        onSuccess: refresh,
    });
    const botControl = useMutation({
        mutationFn: (action: string) =>
            api.patch(`/handoffs/${selectedId}/bot`, { action }),
        onSuccess: refresh,
    });
    const resolve = useMutation({
        mutationFn: () => api.post(`/handoffs/${selectedId}/resolve`),
        onSuccess: refresh,
    });
    const saveNotes = useMutation({
        mutationFn: (notes: string) =>
            api.patch(`/handoffs/${selectedId}/notes`, { notes }),
        onSuccess: refresh,
    });

    return (
        <div>
            <PageHeader
                title="Handoff Queue"
                subtitle="The safety net between an AI conversation and a missed sale."
                actions={
                    <select
                        className={ui.select}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        {STATUS_FILTERS.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                }
            />

            <div className={styles.wrap}>
                {/* Queue */}
                <div className={styles.queue}>
                    {isLoading ? (
                        <Loading />
                    ) : !list || list.length === 0 ? (
                        <EmptyState icon={<LifeBuoy size={24} />} title="Queue is clear" />
                    ) : (
                        list.map((h) => {
                            const breached = h.slaState === "breached";
                            return (
                                <button
                                    key={h.id}
                                    className={`${styles.queueItem} ${selectedId === h.id ? styles.queueItemActive : ""} ${breached ? styles.queueItemBreached : ""}`}
                                    onClick={() => setSelectedId(h.id)}
                                >
                                    <div className={styles.queueTop}>
                                        <StatusPill meta={handoffPriority[h.priority]} dot={false} />
                                        <StatusPill meta={slaState[h.slaState]} dot={false} />
                                        {breached && (
                                            <AlertTriangle size={14} color="#c0392b" />
                                        )}
                                    </div>
                                    <div className={styles.queueName}>
                                        {h.conversation.customerHandle ??
                                            h.conversation.customerPhone ??
                                            h.conversation.threadId}
                                    </div>
                                    <div className={styles.queueReason}>{h.reason}</div>
                                    <div className={styles.queueMeta}>
                                        <span>{channelLabel[h.conversation.channel]}</span>
                                        <span>·</span>
                                        <span>{relativeTime(h.createdAt)}</span>
                                        {h.assignedTo && (
                                            <span className={styles.queueOwner}>
                                                <Avatar
                                                    text={initials(
                                                        h.assignedTo.name,
                                                        h.assignedTo.email
                                                    )}
                                                />
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Work area */}
                <div className={styles.work}>
                    {!detail ? (
                        <EmptyState
                            icon={<LifeBuoy size={26} />}
                            title="Select a handoff to work it"
                        />
                    ) : (
                        <>
                            <div className={styles.workHead}>
                                <div>
                                    <div className={styles.workTitle}>
                                        {detail.conversation.customerHandle ??
                                            detail.conversation.customerPhone ??
                                            detail.conversation.threadId}
                                    </div>
                                    <div className={styles.workPills}>
                                        <StatusPill meta={handoffStatus[detail.status]} />
                                        <StatusPill meta={handoffPriority[detail.priority]} dot={false} />
                                        <StatusPill meta={slaState[detail.slaState]} dot={false} />
                                    </div>
                                </div>
                                <div className={styles.workActions}>
                                    {detail.status !== "assigned" &&
                                        detail.status !== "resolved" && (
                                            <button
                                                className={`${ui.btn} ${ui.btnPrimary} ${ui.btnSm}`}
                                                disabled={accept.isPending}
                                                onClick={() => accept.mutate()}
                                            >
                                                <Hand size={14} /> Accept
                                            </button>
                                        )}
                                    <button
                                        className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                                        onClick={() =>
                                            botControl.mutate(
                                                detail.conversation.botActive ? "pause" : "resume"
                                            )
                                        }
                                    >
                                        {detail.conversation.botActive ? (
                                            <BotOff size={14} />
                                        ) : (
                                            <Bot size={14} />
                                        )}
                                        {detail.conversation.botActive ? "Pause bot" : "Resume bot"}
                                    </button>
                                    <button
                                        className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                                        onClick={() => botControl.mutate("return_to_bot")}
                                    >
                                        <Undo2 size={14} /> Return to bot
                                    </button>
                                    {detail.status !== "resolved" && (
                                        <button
                                            className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                                            onClick={() => resolve.mutate()}
                                        >
                                            <Check size={14} /> Resolve
                                        </button>
                                    )}
                                </div>
                            </div>

                            {detail.slaState === "breached" && (
                                <div className={`${ui.banner} ${ui.bannerDanger}`} style={{ margin: "14px 18px 0" }}>
                                    <AlertTriangle size={16} />
                                    SLA breached{detail.dueAt ? ` — was due ${relativeTime(detail.dueAt)}` : ""}. Work this now.
                                </div>
                            )}

                            <div className={styles.reasonBox}>
                                <span className={ui.sectionTitle}>Escalation reason</span>
                                <p>{detail.reason ?? "—"}</p>
                                {detail.conversation.lead && (
                                    <Link
                                        href={`/leads?open=${detail.conversation.lead.id}`}
                                        className={ui.linkBtn}
                                        style={{ marginTop: 6 }}
                                    >
                                        Open linked lead #{detail.conversation.lead.id}
                                        <ExternalLink size={13} />
                                    </Link>
                                )}
                                {" "}
                                <Link
                                    href={`/conversations?open=${detail.conversation.id}`}
                                    className={ui.linkBtn}
                                    style={{ marginTop: 6, marginLeft: 12 }}
                                >
                                    Open conversation
                                    <ExternalLink size={13} />
                                </Link>
                            </div>

                            <div className={styles.workTranscript}>
                                <Transcript messages={detail.conversation.messages ?? []} />
                            </div>

                            <div className={styles.notesBox}>
                                <HandoffNotes
                                    key={detail.id}
                                    initial={detail.notes ?? ""}
                                    onSave={(n) => saveNotes.mutate(n)}
                                    saving={saveNotes.isPending}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function HandoffNotes({
    initial,
    onSave,
    saving,
}: {
    initial: string;
    onSave: (n: string) => void;
    saving: boolean;
}) {
    const [text, setText] = useState(initial);
    return (
        <div>
            <span className={ui.sectionTitle}>Handoff notes</span>
            <textarea
                className={ui.textarea}
                value={text}
                placeholder="Context for whoever picks this up…"
                onChange={(e) => setText(e.target.value)}
            />
            <button
                className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                style={{ marginTop: 8 }}
                disabled={saving || text === initial}
                onClick={() => onSave(text)}
            >
                Save notes
            </button>
        </div>
    );
}
