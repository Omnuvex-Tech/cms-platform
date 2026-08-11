"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Search,
    Send,
    Bot,
    BotOff,
    ExternalLink,
    Trash2,
    MessagesSquare,
    Download,
    FileCode,
    FileText,
    FileJson,
} from "lucide-react";
import { api, downloadFile } from "@/lib/api";
import { conversationStatus, channelLabel, languageLabel } from "@/lib/status";
import { relativeTime, initials } from "@/lib/format";
import { useReps } from "@/lib/hooks/useReps";
import { StatusPill } from "@/components/ui/StatusPill";
import { Menu, MenuItem } from "@/components/ui/Menu";
import { Transcript, TranscriptMessage } from "@/components/ui/Transcript";
import { ChannelBadge } from "@/components/ui/ChannelIcon";
import { Loading, EmptyState, Avatar } from "@/components/ui/States";
import ui from "@/styles/ui.module.css";
import styles from "@/styles/conversations.module.css";

interface ConvListItem {
    id: number;
    threadId: string;
    channel: string;
    language: string;
    status: string;
    customerHandle?: string | null;
    customerPhone?: string | null;
    botActive: boolean;
    unreadCount: number;
    lastMessageAt: string;
    assignedTo?: { id: number; name: string | null; email: string } | null;
    leadId?: number | null;
}

interface ConvDetail extends ConvListItem {
    stage?: string | null;
    budget?: string | null;
    topProject?: string | null;
    selectedUnits?: string[];
    messages: TranscriptMessage[];
    notes: {
        id: number;
        body: string;
        createdAt: string;
        author?: { id: number; name: string | null } | null;
    }[];
    lead?: { id: number; salesStatus: string; temperature: string } | null;
}

const STATUSES = Object.keys(conversationStatus);
const CHANNELS = ["webchat", "whatsapp", "telegram", "instagram", "phone"];

function ConversationsInner() {
    const qc = useQueryClient();
    const params = useSearchParams();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [channelFilter, setChannelFilter] = useState("");
    // Deep link from a lead / handoff / contact-request card: ?open=<conversationId>.
    // Resolved during render (not in an effect) so the very first commit already
    // has the right thread selected — otherwise the "select the first thread"
    // effect below runs in the same commit, still sees a null selectedId, and
    // clobbers the deep link with the top of the inbox.
    const openParam = params.get("open");
    const openId =
        openParam && Number.isFinite(Number(openParam)) ? Number(openParam) : null;

    const [selectedId, setSelectedId] = useState<number | null>(openId);
    const { data: reps } = useReps();

    useEffect(() => {
        if (openId !== null) setSelectedId(openId);
    }, [openId]);

    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (statusFilter) query.set("status", statusFilter);
    if (channelFilter) query.set("channel", channelFilter);
    const qs = query.toString();

    const { data: list, isLoading } = useQuery({
        queryKey: ["conversations", qs],
        queryFn: () => api.get<ConvListItem[]>(`/conversations${qs ? `?${qs}` : ""}`),
        // Keep the inbox list (unread counts, last-message previews) live without
        // a manual refresh. Paused automatically when the tab isn't focused
        // (react-query's refetchIntervalInBackground defaults to false).
        refetchInterval: 5_000,
    });

    const { data: detail } = useQuery({
        queryKey: ["conversation", selectedId],
        queryFn: () => api.get<ConvDetail>(`/conversations/${selectedId}`),
        enabled: !!selectedId,
        // Poll the open thread so new messages appear as the conversation
        // happens, instead of requiring the operator to keep refreshing.
        refetchInterval: 2_000,
    });

    // Default to the newest thread, but never override an explicit deep link.
    useEffect(() => {
        if (openId === null && !selectedId && list && list.length > 0) {
            setSelectedId(list[0]!.id);
        }
    }, [list, selectedId, openId]);

    const refresh = () => {
        qc.invalidateQueries({ queryKey: ["conversations"] });
        qc.invalidateQueries({ queryKey: ["conversation", selectedId] });
        qc.invalidateQueries({ queryKey: ["badges"] });
    };

    const reply = useMutation({
        mutationFn: (content: string) =>
            api.post(`/conversations/${selectedId}/reply`, { content }),
        onSuccess: refresh,
    });
    const setBot = useMutation({
        mutationFn: (active: boolean) =>
            api.patch(`/conversations/${selectedId}/bot`, { active }),
        onSuccess: refresh,
    });
    const assign = useMutation({
        mutationFn: (assignedToId: number | null) =>
            api.patch(`/conversations/${selectedId}/assign`, { assignedToId }),
        onSuccess: refresh,
    });
    const addNote = useMutation({
        mutationFn: (body: string) =>
            api.post(`/conversations/${selectedId}/notes`, { body }),
        onSuccess: refresh,
    });
    const delNote = useMutation({
        mutationFn: (noteId: number) =>
            api.delete(`/conversations/${selectedId}/notes/${noteId}`),
        onSuccess: refresh,
    });

    const isClosedThread =
        detail && (detail.status === "closed" || detail.status === "spam");
    const canReply = detail && !isClosedThread && !detail.botActive;

    // Open a thread on its latest messages: jump the transcript to the bottom
    // whenever a different conversation loads or new messages arrive.
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [detail?.id, detail?.messages.length]);

    return (
        <div className={styles.wrap}>
            {/* Inbox */}
            <div className={styles.inbox}>
                <div className={styles.inboxHead}>
                    <div className={ui.search}>
                        <Search size={15} className={ui.searchIcon} />
                        <input
                            className={ui.searchInput}
                            placeholder="Search phone, thread, text…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className={styles.inboxFilters}>
                        <select
                            className={ui.select}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All statuses</option>
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {conversationStatus[s]?.label}
                                </option>
                            ))}
                        </select>
                        <select
                            className={ui.select}
                            value={channelFilter}
                            onChange={(e) => setChannelFilter(e.target.value)}
                        >
                            <option value="">All channels</option>
                            {CHANNELS.map((c) => (
                                <option key={c} value={c}>
                                    {channelLabel[c]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.inboxExportRow}>
                        <span className={ui.muted} style={{ fontSize: 12 }}>
                            {list ? `${list.length} thread${list.length === 1 ? "" : "s"}` : "—"}
                        </span>
                        <ExportAllMenu filterQs={qs} />
                    </div>
                </div>
                <div className={styles.inboxList}>
                    {isLoading ? (
                        <Loading />
                    ) : !list || list.length === 0 ? (
                        <EmptyState icon={<MessagesSquare size={24} />} title="No conversations" />
                    ) : (
                        list.map((c) => (
                            <button
                                key={c.id}
                                className={`${styles.inboxItem} ${selectedId === c.id ? styles.inboxItemActive : ""}`}
                                onClick={() => setSelectedId(c.id)}
                            >
                                <ChannelBadge channel={c.channel} />
                                <div className={styles.inboxItemMain}>
                                    <div className={styles.inboxItemTop}>
                                        <span className={styles.inboxName}>
                                            {c.customerHandle ?? c.customerPhone ?? c.threadId}
                                        </span>
                                        <span className={styles.inboxTime}>
                                            {relativeTime(c.lastMessageAt)}
                                        </span>
                                    </div>
                                    <div className={styles.inboxItemBottom}>
                                        <span className={styles.inboxChannel}>
                                            {channelLabel[c.channel]}
                                        </span>
                                        <StatusPill meta={conversationStatus[c.status]} />
                                        {c.unreadCount > 0 && (
                                            <span className={styles.unread}>{c.unreadCount}</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Transcript */}
            <div className={styles.center}>
                {!detail ? (
                    <EmptyState
                        icon={<MessagesSquare size={26} />}
                        title="Select a conversation"
                    />
                ) : (
                    <>
                        <div className={styles.centerHead}>
                            <div className={styles.centerIdentity}>
                                <ChannelBadge channel={detail.channel} size={34} />
                                <div>
                                    <div className={styles.centerTitle}>
                                        {detail.customerHandle ??
                                            detail.customerPhone ??
                                            detail.threadId}
                                    </div>
                                    <div className={styles.centerSub}>
                                        {channelLabel[detail.channel]} · {detail.threadId}
                                        {" · "}
                                        {detail.botActive ? "Bot active" : "Bot paused"}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.centerActions}>
                                <StatusPill meta={conversationStatus[detail.status]} />
                                <button
                                    className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                                    onClick={() => setBot.mutate(!detail.botActive)}
                                >
                                    {detail.botActive ? <BotOff size={14} /> : <Bot size={14} />}
                                    {detail.botActive ? "Pause bot" : "Resume bot"}
                                </button>
                                <ThreadDownloadMenu id={detail.id} />
                            </div>
                        </div>

                        <div className={styles.transcriptScroll} ref={scrollRef}>
                            <Transcript messages={detail.messages} />
                        </div>

                        <div className={styles.composer}>
                            <ReplyComposer
                                key={detail.id}
                                disabled={!canReply || reply.isPending}
                                placeholder={
                                    canReply
                                        ? "Type a reply… (Ctrl/⌘+Enter to send)"
                                        : isClosedThread
                                          ? "Replying is disabled for closed / spam threads"
                                          : "Pause the bot first to reply manually"
                                }
                                onSend={(text) => reply.mutate(text)}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Customer + notes */}
            {detail && (
                <div className={styles.right}>
                    <div className={ui.section}>
                        <div className={ui.sectionTitle}>Customer</div>
                        <div className={ui.kv}>
                            <span className={ui.kvKey}>Handle</span>
                            <span className={ui.kvVal}>{detail.customerHandle ?? "—"}</span>
                            <span className={ui.kvKey}>Phone</span>
                            <span className={ui.kvVal}>{detail.customerPhone ?? "—"}</span>
                            <span className={ui.kvKey}>Language</span>
                            <span className={ui.kvVal}>{languageLabel[detail.language]}</span>
                            <span className={ui.kvKey}>Stage</span>
                            <span className={ui.kvVal}>{detail.stage ?? "—"}</span>
                            <span className={ui.kvKey}>Budget</span>
                            <span className={ui.kvVal}>{detail.budget ?? "—"}</span>
                            <span className={ui.kvKey}>Preferred project</span>
                            <span className={ui.kvVal}>{detail.topProject ?? "—"}</span>
                            <span className={ui.kvKey}>Selected unit</span>
                            <span className={ui.kvVal}>
                                {detail.selectedUnits?.length
                                    ? detail.selectedUnits.join(", ")
                                    : "—"}
                            </span>
                        </div>
                    </div>

                    <div className={ui.section}>
                        <div className={ui.sectionTitle}>Assignment</div>
                        <select
                            className={ui.select}
                            style={{ width: "100%" }}
                            value={detail.assignedTo?.id ?? ""}
                            onChange={(e) =>
                                assign.mutate(e.target.value ? Number(e.target.value) : null)
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

                    {detail.lead && (
                        <div className={ui.section}>
                            <div className={ui.sectionTitle}>Linked lead</div>
                            <Link href={`/leads?open=${detail.lead.id}`} className={ui.linkBtn}>
                                Open lead #{detail.lead.id} · {detail.lead.salesStatus}
                                <ExternalLink size={13} />
                            </Link>
                        </div>
                    )}

                    <div className={ui.section}>
                        <div className={ui.sectionTitle}>Internal notes</div>
                        <p className={styles.notesHint}>Sales-only — never shown to the customer.</p>
                        <div className={styles.notesList}>
                            {detail.notes.length === 0 && (
                                <span className={ui.muted} style={{ fontSize: 12.5 }}>
                                    No notes yet.
                                </span>
                            )}
                            {detail.notes.map((n) => (
                                <div key={n.id} className={styles.note}>
                                    <div className={styles.noteBody}>{n.body}</div>
                                    <div className={styles.noteMeta}>
                                        <span className={ui.avatarRow}>
                                            <Avatar text={initials(n.author?.name)} />
                                            {n.author?.name ?? "Agent"} · {relativeTime(n.createdAt)}
                                        </span>
                                        <button
                                            className={styles.noteDelete}
                                            onClick={() => delNote.mutate(n.id)}
                                            aria-label="Delete note"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <NoteComposer
                            key={detail.id}
                            onAdd={(text) => addNote.mutate(text)}
                            saving={addNote.isPending}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

type ExportFormat = "html" | "md" | "json";

/** Download one thread's full transcript. */
function ThreadDownloadMenu({ id }: { id: number }) {
    const download = (format: ExportFormat) =>
        downloadFile(
            `/conversations/${id}/export?format=${format}`,
            `conversation-${id}.${format}`,
        );

    return (
        <Menu label="Download" icon={<Download size={14} />}>
            {(close) => (
                <>
                    <div className={ui.menuLabel}>This thread</div>
                    <MenuItem
                        icon={<FileCode size={14} />}
                        hint=".html"
                        onClick={() => {
                            download("html");
                            close();
                        }}
                    >
                        HTML (readable)
                    </MenuItem>
                    <MenuItem
                        icon={<FileText size={14} />}
                        hint=".md"
                        onClick={() => {
                            download("md");
                            close();
                        }}
                    >
                        Markdown
                    </MenuItem>
                    <MenuItem
                        icon={<FileJson size={14} />}
                        hint=".json"
                        onClick={() => {
                            download("json");
                            close();
                        }}
                    >
                        JSON
                    </MenuItem>
                </>
            )}
        </Menu>
    );
}

const RANGES = [
    { key: "7d", label: "Last 7 days", days: 7 },
    { key: "30d", label: "Last 30 days", days: 30 },
    { key: "90d", label: "Last 3 months", days: 90 },
    { key: "all", label: "All time", days: null },
    { key: "custom", label: "Custom range…", days: null },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

/**
 * Bulk export. The range bounds a thread's *last activity* (matching the API), so
 * "last 7 days" means threads that were live this week — not only ones opened in it.
 */
function ExportAllMenu({ filterQs }: { filterQs: string }) {
    const [range, setRange] = useState<RangeKey>("30d");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    // A custom range with no start would silently mean "all time", which is not
    // what someone who opened the date pickers is asking for.
    const ready = range !== "custom" || !!from;

    const download = (format: ExportFormat) => {
        const params = new URLSearchParams(filterQs);
        params.set("format", format);
        if (range === "custom") {
            if (from) params.set("since", from);
            if (to) params.set("until", to);
        } else {
            const preset = RANGES.find((r) => r.key === range);
            if (preset?.days) {
                const since = new Date();
                since.setDate(since.getDate() - preset.days);
                params.set("since", since.toISOString());
            }
        }
        downloadFile(`/conversations/export?${params}`, `conversations.${format}`);
    };

    return (
        <Menu
            label="Export all"
            icon={<Download size={14} />}
            align="right"
            panelClassName={styles.exportPanel}
        >
            {(close) => (
                <>
                    <div className={ui.menuLabel}>Threads active in</div>
                    <select
                        className={ui.select}
                        style={{ width: "100%" }}
                        value={range}
                        onChange={(e) => setRange(e.target.value as RangeKey)}
                    >
                        {RANGES.map((r) => (
                            <option key={r.key} value={r.key}>
                                {r.label}
                            </option>
                        ))}
                    </select>

                    {range === "custom" && (
                        <div className={styles.exportDates}>
                            <label className={styles.exportDate}>
                                <span>From</span>
                                <input
                                    type="date"
                                    className={ui.input}
                                    value={from}
                                    max={to || undefined}
                                    onChange={(e) => setFrom(e.target.value)}
                                />
                            </label>
                            <label className={styles.exportDate}>
                                <span>To</span>
                                <input
                                    type="date"
                                    className={ui.input}
                                    value={to}
                                    min={from || undefined}
                                    onChange={(e) => setTo(e.target.value)}
                                />
                            </label>
                        </div>
                    )}

                    {filterQs && (
                        <p className={styles.exportHint}>
                            The search and filters above are applied too.
                        </p>
                    )}

                    <div className={ui.menuDivider} />
                    <div className={ui.menuLabel}>Download as</div>
                    <div className={styles.exportFormats}>
                        <button
                            className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                            disabled={!ready}
                            onClick={() => {
                                download("html");
                                close();
                            }}
                        >
                            <FileCode size={14} /> .html
                        </button>
                        <button
                            className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                            disabled={!ready}
                            onClick={() => {
                                download("md");
                                close();
                            }}
                        >
                            <FileText size={14} /> .md
                        </button>
                        <button
                            className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                            disabled={!ready}
                            onClick={() => {
                                download("json");
                                close();
                            }}
                        >
                            <FileJson size={14} /> .json
                        </button>
                    </div>
                    <p className={styles.exportHint}>
                        HTML opens in any browser — the one to share with non-technical people.
                    </p>
                </>
            )}
        </Menu>
    );
}

function ReplyComposer({
    disabled,
    placeholder,
    onSend,
}: {
    disabled: boolean;
    placeholder: string;
    onSend: (text: string) => void;
}) {
    const [text, setText] = useState("");
    const send = () => {
        if (!text.trim() || disabled) return;
        onSend(text.trim());
        setText("");
    };
    return (
        <div className={styles.composerRow}>
            <textarea
                className={ui.textarea}
                style={{ minHeight: 44 }}
                value={text}
                disabled={disabled}
                placeholder={placeholder}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                        e.preventDefault();
                        send();
                    }
                }}
            />
            <button
                className={`${ui.btn} ${ui.btnPrimary}`}
                disabled={disabled || !text.trim()}
                onClick={send}
            >
                <Send size={15} /> Send
            </button>
        </div>
    );
}

function NoteComposer({
    onAdd,
    saving,
}: {
    onAdd: (text: string) => void;
    saving: boolean;
}) {
    const [text, setText] = useState("");
    return (
        <div style={{ marginTop: 10 }}>
            <textarea
                className={ui.textarea}
                style={{ minHeight: 60 }}
                value={text}
                placeholder="Add an internal note…"
                onChange={(e) => setText(e.target.value)}
            />
            <button
                className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                style={{ marginTop: 8 }}
                disabled={saving || !text.trim()}
                onClick={() => {
                    onAdd(text.trim());
                    setText("");
                }}
            >
                Add note
            </button>
        </div>
    );
}

export default function ConversationsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ConversationsInner />
        </Suspense>
    );
}
