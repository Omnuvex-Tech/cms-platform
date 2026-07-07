"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, PhoneCall, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { contactStatus, channelLabel } from "@/lib/status";
import { relativeTime, formatDateTime, initials } from "@/lib/format";
import { useReps } from "@/lib/hooks/useReps";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { SideSheet } from "@/components/ui/SideSheet";
import { Loading, EmptyState, Avatar } from "@/components/ui/States";
import ui from "@/styles/ui.module.css";
import styles from "@/styles/contact-requests.module.css";

interface ContactRequest {
    id: number;
    customerPhone: string;
    preferredChannel: string;
    availabilityText?: string | null;
    availabilityAt?: string | null;
    isFlexible: boolean;
    status: string;
    customerWords?: string | null;
    followUpOutcome?: string | null;
    createdAt: string;
    isOverdue?: boolean;
    isDueToday?: boolean;
    owner?: { id: number; name: string | null; email: string } | null;
    lead?: { id: number; salesStatus: string; temperature: string } | null;
    conversation?: { id: number; threadId: string; channel?: string } | null;
}

interface ListResponse {
    items: ContactRequest[];
    overdueCount: number;
    dueTodayCount: number;
}

const STATUS_OPTIONS = [
    "new",
    "assigned",
    "contacted",
    "scheduled",
    "completed",
    "no_answer",
    "cancelled",
];

const QUICK_ACTIONS = ["contacted", "scheduled", "completed", "no_answer"];

export default function ContactRequestsPage() {
    const qc = useQueryClient();
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const { data: reps } = useReps();

    const { data, isLoading } = useQuery({
        queryKey: ["contact-requests", statusFilter],
        queryFn: () =>
            api.get<ListResponse>(
                `/contact-requests${statusFilter ? `?status=${statusFilter}` : ""}`
            ),
    });

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["contact-requests"] });
        qc.invalidateQueries({ queryKey: ["badges"] });
    };

    const setStatus = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            api.patch(`/contact-requests/${id}/status`, { status }),
        onSuccess: invalidate,
    });
    const assign = useMutation({
        mutationFn: ({ id, ownerId }: { id: number; ownerId: number | null }) =>
            api.patch(`/contact-requests/${id}/assign`, { ownerId }),
        onSuccess: invalidate,
    });
    const outcome = useMutation({
        mutationFn: ({ id, text }: { id: number; text: string }) =>
            api.patch(`/contact-requests/${id}/outcome`, { followUpOutcome: text }),
        onSuccess: invalidate,
    });

    const selected = data?.items.find((r) => r.id === selectedId) ?? null;

    return (
        <div>
            <PageHeader
                title="Contact Requests"
                subtitle="Callback promises — being late is the failure mode."
            />

            {(data?.overdueCount ?? 0) > 0 && (
                <div className={`${ui.banner} ${ui.bannerDanger}`}>
                    <AlertTriangle size={16} />
                    {data?.overdueCount} overdue callback
                    {data?.overdueCount === 1 ? "" : "s"} — contact these customers now.
                    {(data?.dueTodayCount ?? 0) > 0 &&
                        ` (${data?.dueTodayCount} more due today)`}
                </div>
            )}

            <div className={ui.toolbar}>
                <select
                    className={ui.select}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                            {contactStatus[s]?.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={ui.card}>
                {isLoading ? (
                    <Loading />
                ) : !data || data.items.length === 0 ? (
                    <EmptyState
                        icon={<PhoneCall size={26} />}
                        title="No contact requests"
                        hint="Callback requests from customers will appear here."
                    />
                ) : (
                    <div className={ui.tableWrap}>
                        <table className={ui.table}>
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Availability</th>
                                    <th>Status</th>
                                    <th>Owner</th>
                                    <th>Quick actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((r) => (
                                    <tr
                                        key={r.id}
                                        className={`${ui.rowClickable} ${selectedId === r.id ? ui.rowActive : ""}`}
                                        onClick={() => setSelectedId(r.id)}
                                    >
                                        <td>
                                            <div className={styles.customer}>
                                                <span className={ui.mono}>{r.customerPhone}</span>
                                                <span className={styles.chan}>
                                                    {channelLabel[r.preferredChannel]}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.avail}>
                                                <span>
                                                    {r.isFlexible
                                                        ? "Flexible"
                                                        : r.availabilityAt
                                                          ? formatDateTime(r.availabilityAt)
                                                          : r.availabilityText || "—"}
                                                </span>
                                                {r.isOverdue && (
                                                    <span className={styles.overdue}>Overdue</span>
                                                )}
                                                {r.isDueToday && (
                                                    <span className={styles.dueToday}>Due today</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <StatusPill meta={contactStatus[r.status]} />
                                        </td>
                                        <td>
                                            {r.owner ? (
                                                <span className={ui.avatarRow}>
                                                    <Avatar
                                                        text={initials(r.owner.name, r.owner.email)}
                                                    />
                                                    {r.owner.name ?? r.owner.email}
                                                </span>
                                            ) : (
                                                <span className={ui.muted}>Unassigned</span>
                                            )}
                                        </td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <div className={styles.quick}>
                                                {QUICK_ACTIONS.map((s) => (
                                                    <button
                                                        key={s}
                                                        className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                                                        disabled={r.status === s || setStatus.isPending}
                                                        onClick={() =>
                                                            setStatus.mutate({ id: r.id, status: s })
                                                        }
                                                    >
                                                        {contactStatus[s]?.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <SideSheet
                open={!!selected}
                onClose={() => setSelectedId(null)}
                title={selected?.customerPhone ?? ""}
                subtitle={
                    selected
                        ? `${channelLabel[selected.preferredChannel]} · created ${relativeTime(selected.createdAt)}`
                        : ""
                }
                headerExtra={
                    selected && (
                        <div style={{ marginTop: 8 }}>
                            <StatusPill meta={contactStatus[selected.status]} />
                        </div>
                    )
                }
            >
                {selected && (
                    <div>
                        <div className={ui.section}>
                            <div className={ui.sectionTitle}>Availability</div>
                            <p style={{ fontSize: 13.5 }}>
                                {selected.isFlexible
                                    ? "Flexible — any time"
                                    : selected.availabilityAt
                                      ? formatDateTime(selected.availabilityAt)
                                      : selected.availabilityText || "—"}
                            </p>
                            {selected.customerWords && (
                                <p className={styles.words}>“{selected.customerWords}”</p>
                            )}
                        </div>

                        <div className={ui.section}>
                            <div className={ui.sectionTitle}>Set status</div>
                            <div className={styles.statusGrid}>
                                {STATUS_OPTIONS.map((s) => (
                                    <button
                                        key={s}
                                        className={`${ui.btn} ${selected.status === s ? ui.btnPrimary : ui.btnGhost} ${ui.btnSm}`}
                                        onClick={() =>
                                            setStatus.mutate({ id: selected.id, status: s })
                                        }
                                    >
                                        {contactStatus[s]?.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={ui.section}>
                            <div className={ui.sectionTitle}>Owner</div>
                            <select
                                className={ui.select}
                                style={{ width: "100%" }}
                                value={selected.owner?.id ?? ""}
                                onChange={(e) =>
                                    assign.mutate({
                                        id: selected.id,
                                        ownerId: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                            >
                                <option value="">Unassigned</option>
                                {reps?.map((rep) => (
                                    <option key={rep.id} value={rep.id}>
                                        {rep.name ?? rep.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selected.lead && (
                            <div className={ui.section}>
                                <div className={ui.sectionTitle}>Lead snapshot</div>
                                <Link
                                    href={`/leads?open=${selected.lead.id}`}
                                    className={ui.linkBtn}
                                >
                                    Open lead #{selected.lead.id} · {selected.lead.salesStatus}
                                    <ExternalLink size={13} />
                                </Link>
                            </div>
                        )}

                        {selected.conversation && (
                            <div className={ui.section}>
                                <div className={ui.sectionTitle}>Source conversation</div>
                                <Link
                                    href={`/conversations?open=${selected.conversation.id}`}
                                    className={ui.linkBtn}
                                >
                                    {selected.conversation.threadId}
                                    <ExternalLink size={13} />
                                </Link>
                            </div>
                        )}

                        <div className={ui.section}>
                            <div className={ui.sectionTitle}>Follow-up outcome</div>
                            <OutcomeEditor
                                key={selected.id}
                                initial={selected.followUpOutcome ?? ""}
                                onSave={(text) =>
                                    outcome.mutate({ id: selected.id, text })
                                }
                                saving={outcome.isPending}
                            />
                        </div>
                    </div>
                )}
            </SideSheet>
        </div>
    );
}

function OutcomeEditor({
    initial,
    onSave,
    saving,
}: {
    initial: string;
    onSave: (text: string) => void;
    saving: boolean;
}) {
    const [text, setText] = useState(initial);
    return (
        <div>
            <textarea
                className={ui.textarea}
                value={text}
                placeholder="What happened on the call?"
                onChange={(e) => setText(e.target.value)}
            />
            <button
                className={`${ui.btn} ${ui.btnPrimary} ${ui.btnSm}`}
                style={{ marginTop: 8 }}
                disabled={saving || text === initial}
                onClick={() => onSave(text)}
            >
                Save outcome
            </button>
        </div>
    );
}
