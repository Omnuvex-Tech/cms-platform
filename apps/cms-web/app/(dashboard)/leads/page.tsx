"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Download, Users, ExternalLink, Clock } from "lucide-react";
import { api, downloadCsv } from "@/lib/api";
import {
    leadStatus,
    temperature as tempMeta,
    channelLabel,
    languageLabel,
} from "@/lib/status";
import { relativeTime, titleCase, initials } from "@/lib/format";
import { useReps } from "@/lib/hooks/useReps";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { SideSheet } from "@/components/ui/SideSheet";
import { Loading, EmptyState, Avatar } from "@/components/ui/States";
import ui from "@/styles/ui.module.css";
import styles from "@/styles/leads.module.css";

interface LeadListItem {
    id: number;
    name?: string | null;
    surname?: string | null;
    phone?: string | null;
    threadId?: string | null;
    channel: string;
    topProject?: string | null;
    budget?: string | null;
    salesStatus: string;
    temperature: string;
    updatedAt: string;
    owner?: { id: number; name: string | null; email: string } | null;
    _count?: { conversations: number; contactRequests: number };
}

interface TimelineEvent {
    id: number;
    type: string;
    description: string;
    createdAt: string;
}
interface LeadDetail extends LeadListItem {
    budgetFlexible: boolean;
    budgetRaw?: string | null;
    purpose?: string | null;
    bedrooms?: string | null;
    location?: string | null;
    timeframe?: string | null;
    language: string;
    interestedProjects: string[];
    botNotes?: string | null;
    nextAction?: string | null;
    timeline: TimelineEvent[];
    conversations: {
        id: number;
        threadId: string;
        channel: string;
        status: string;
    }[];
    contactRequests: {
        id: number;
        customerPhone: string;
        preferredChannel: string;
        status: string;
    }[];
}

const LEAD_STATUSES = Object.keys(leadStatus);
const TEMPS = ["hot", "warm", "cold"];
const CHANNELS = ["web", "whatsapp", "telegram", "instagram", "phone"];

function LeadsInner() {
    const qc = useQueryClient();
    const params = useSearchParams();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [temp, setTemp] = useState("");
    const [channel, setChannel] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        const open = params.get("open");
        if (open) setSelectedId(Number(open));
    }, [params]);

    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (status) query.set("status", status);
    if (temp) query.set("temperature", temp);
    if (channel) query.set("channel", channel);
    const qs = query.toString();

    const { data: leads, isLoading } = useQuery({
        queryKey: ["leads", qs],
        queryFn: () => api.get<LeadListItem[]>(`/leads${qs ? `?${qs}` : ""}`),
    });

    const { data: detail } = useQuery({
        queryKey: ["lead", selectedId],
        queryFn: () => api.get<LeadDetail>(`/leads/${selectedId}`),
        enabled: !!selectedId,
    });

    const { data: reps } = useReps();

    const update = useMutation({
        mutationFn: (body: Record<string, unknown>) =>
            api.patch<LeadDetail>(`/leads/${selectedId}`, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["leads"] });
            qc.invalidateQueries({ queryKey: ["lead", selectedId] });
            qc.invalidateQueries({ queryKey: ["badges"] });
        },
    });

    return (
        <div>
            <PageHeader
                title="Leads"
                subtitle="The CRM view of qualified users — where deals get worked."
                actions={
                    <button
                        className={`${ui.btn} ${ui.btnGhost}`}
                        onClick={() =>
                            downloadCsv(`/leads/export${qs ? `?${qs}` : ""}`, "leads.csv")
                        }
                    >
                        <Download size={15} /> Export CSV
                    </button>
                }
            />

            <div className={ui.toolbar}>
                <div className={ui.search}>
                    <Search size={15} className={ui.searchIcon} />
                    <input
                        className={ui.searchInput}
                        placeholder="Search phone, thread, project, notes…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select className={ui.select} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All statuses</option>
                    {LEAD_STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {leadStatus[s]?.label}
                        </option>
                    ))}
                </select>
                <select className={ui.select} value={temp} onChange={(e) => setTemp(e.target.value)}>
                    <option value="">All temps</option>
                    {TEMPS.map((t) => (
                        <option key={t} value={t}>
                            {tempMeta[t]?.label}
                        </option>
                    ))}
                </select>
                <select className={ui.select} value={channel} onChange={(e) => setChannel(e.target.value)}>
                    <option value="">All channels</option>
                    {CHANNELS.map((c) => (
                        <option key={c} value={c}>
                            {channelLabel[c]}
                        </option>
                    ))}
                </select>
            </div>

            <div className={ui.card}>
                {isLoading ? (
                    <Loading />
                ) : !leads || leads.length === 0 ? (
                    <EmptyState icon={<Users size={26} />} title="No leads match" />
                ) : (
                    <div className={ui.tableWrap}>
                        <table className={ui.table}>
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Budget</th>
                                    <th>Sales status</th>
                                    <th>Temp</th>
                                    <th>Owner</th>
                                    <th>Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((l) => (
                                    <tr
                                        key={l.id}
                                        className={`${ui.rowClickable} ${selectedId === l.id ? ui.rowActive : ""}`}
                                        onClick={() => setSelectedId(l.id)}
                                    >
                                        <td>
                                            <div className={styles.customer}>
                                                {(l.name || l.surname) && (
                                                    <span className={styles.custName}>
                                                        {[l.name, l.surname].filter(Boolean).join(" ")}
                                                    </span>
                                                )}
                                                <span className={styles.custTop}>
                                                    {channelLabel[l.channel]} ·{" "}
                                                    <span className={ui.mono}>
                                                        {l.phone ?? l.threadId}
                                                    </span>
                                                </span>
                                                {l.topProject && (
                                                    <span className={styles.custSub}>
                                                        {l.topProject}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{l.budget ?? "—"}</td>
                                        <td>
                                            <StatusPill meta={leadStatus[l.salesStatus]} />
                                        </td>
                                        <td>
                                            <StatusPill meta={tempMeta[l.temperature]} dot={false} />
                                        </td>
                                        <td>
                                            {l.owner ? (
                                                <span className={ui.avatarRow}>
                                                    <Avatar text={initials(l.owner.name, l.owner.email)} />
                                                    {l.owner.name ?? l.owner.email}
                                                </span>
                                            ) : (
                                                <span className={ui.muted}>Unassigned</span>
                                            )}
                                        </td>
                                        <td className={ui.muted}>{relativeTime(l.updatedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <SideSheet
                open={!!selectedId}
                onClose={() => setSelectedId(null)}
                wide
                title={
                    detail ? (
                        <span>
                            {[detail.name, detail.surname].filter(Boolean).join(" ")}
                            {(detail.name || detail.surname) && (detail.phone || detail.threadId) && " · "}
                            {detail.phone ?? (detail.name ? null : detail.threadId)}{" "}
                            <span className={ui.muted} style={{ fontWeight: 400, fontSize: 13 }}>
                                · {channelLabel[detail.channel]}
                            </span>
                        </span>
                    ) : (
                        "Lead"
                    )
                }
                subtitle={detail?.topProject ?? undefined}
            >
                {!detail ? (
                    <Loading />
                ) : (
                    <div className={styles.detailGrid}>
                        {/* Sales controls */}
                        <div className={styles.controls}>
                            <div className={ui.sectionTitle}>Sales controls</div>
                            <div className={ui.field}>
                                <label className={ui.label}>Status</label>
                                <select
                                    className={ui.select}
                                    style={{ width: "100%" }}
                                    value={detail.salesStatus}
                                    onChange={(e) => update.mutate({ salesStatus: e.target.value })}
                                >
                                    {LEAD_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {leadStatus[s]?.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={ui.field}>
                                <label className={ui.label}>Temperature</label>
                                <select
                                    className={ui.select}
                                    style={{ width: "100%" }}
                                    value={detail.temperature}
                                    onChange={(e) => update.mutate({ temperature: e.target.value })}
                                >
                                    {TEMPS.map((t) => (
                                        <option key={t} value={t}>
                                            {tempMeta[t]?.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={ui.field}>
                                <label className={ui.label}>Owner</label>
                                <select
                                    className={ui.select}
                                    style={{ width: "100%" }}
                                    value={detail.owner?.id ?? ""}
                                    onChange={(e) =>
                                        update.mutate({
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
                            <NextAction
                                key={detail.id}
                                initial={detail.nextAction ?? ""}
                                onSave={(text) => update.mutate({ nextAction: text })}
                                saving={update.isPending}
                            />
                        </div>

                        {/* Preferences */}
                        <div className={ui.section}>
                            <div className={ui.sectionTitle}>Bot-captured preferences</div>
                            <div className={ui.kv}>
                                <span className={ui.kvKey}>Purpose</span>
                                <span className={ui.kvVal}>{detail.purpose ?? "—"}</span>
                                <span className={ui.kvKey}>Budget</span>
                                <span className={ui.kvVal}>
                                    {detail.budget ?? "—"}
                                    {detail.budgetFlexible && " (flexible)"}
                                </span>
                                {detail.budgetRaw && (
                                    <>
                                        <span className={ui.kvKey}>Raw budget</span>
                                        <span className={ui.kvVal} style={{ fontStyle: "italic" }}>
                                            “{detail.budgetRaw}”
                                        </span>
                                    </>
                                )}
                                <span className={ui.kvKey}>Bedrooms</span>
                                <span className={ui.kvVal}>{detail.bedrooms ?? "—"}</span>
                                <span className={ui.kvKey}>Location</span>
                                <span className={ui.kvVal}>{detail.location ?? "—"}</span>
                                <span className={ui.kvKey}>Timeframe</span>
                                <span className={ui.kvVal}>{detail.timeframe ?? "—"}</span>
                                <span className={ui.kvKey}>Language</span>
                                <span className={ui.kvVal}>{languageLabel[detail.language]}</span>
                            </div>
                            {detail.interestedProjects.length > 0 && (
                                <div className={styles.chips}>
                                    {detail.interestedProjects.map((p) => (
                                        <span key={p} className={styles.chip}>
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {detail.botNotes && (
                                <p className={styles.botNotes}>{detail.botNotes}</p>
                            )}
                        </div>

                        {/* Linked records */}
                        {(detail.conversations.length > 0 ||
                            detail.contactRequests.length > 0) && (
                            <div className={ui.section}>
                                <div className={ui.sectionTitle}>Linked records</div>
                                {detail.conversations.map((c) => (
                                    <Link
                                        key={c.id}
                                        href={`/conversations?open=${c.id}`}
                                        className={styles.linkRow}
                                    >
                                        <span>
                                            <span className={styles.linkType}>Conversation</span>
                                            {" · "}
                                            {channelLabel[c.channel] ?? c.channel}
                                        </span>
                                        <ExternalLink size={13} />
                                    </Link>
                                ))}
                                {detail.contactRequests.map((c) => (
                                    <Link
                                        key={c.id}
                                        href={`/contact-requests?open=${c.id}`}
                                        className={styles.linkRow}
                                    >
                                        <span>
                                            <span className={styles.linkType}>Contact request</span>
                                            {" · "}
                                            {c.customerPhone}
                                        </span>
                                        <ExternalLink size={13} />
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Timeline */}
                        <div className={ui.section}>
                            <div className={ui.sectionTitle}>Activity timeline</div>
                            <ul className={styles.timeline}>
                                {detail.timeline.map((ev) => (
                                    <li key={ev.id} className={styles.timelineItem}>
                                        <div className={styles.timelineDot}>
                                            <Clock size={11} />
                                        </div>
                                        <div>
                                            <div className={styles.timelineType}>
                                                {titleCase(ev.type)}
                                            </div>
                                            <div className={styles.timelineDesc}>
                                                {ev.description}
                                            </div>
                                            <div className={styles.timelineTime}>
                                                {relativeTime(ev.createdAt)}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </SideSheet>
        </div>
    );
}

function NextAction({
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
        <div className={ui.field}>
            <label className={ui.label}>Next action</label>
            <textarea
                className={ui.textarea}
                value={text}
                placeholder="What's the next step for this lead?"
                onChange={(e) => setText(e.target.value)}
            />
            <button
                className={`${ui.btn} ${ui.btnPrimary} ${ui.btnSm}`}
                style={{ marginTop: 8, alignSelf: "flex-start" }}
                disabled={saving || text === initial}
                onClick={() => onSave(text)}
            >
                Save
            </button>
        </div>
    );
}

export default function LeadsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <LeadsInner />
        </Suspense>
    );
}
