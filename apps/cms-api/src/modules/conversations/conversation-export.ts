import { Prisma } from '@prisma/client';

/**
 * Rendering for conversation downloads (Conversations page -> Download).
 *
 * Three formats, on purpose:
 *  - `html` readable by anyone — double-click, opens in a browser, chat-bubble
 *           layout. This is the one to hand a non-technical person: opening a
 *           raw `.md` file on Windows just shows the `**bold**`/`>` markup in
 *           Notepad, which is worse than the transcript view it's replacing.
 *  - `md`   readable by a human with developer tooling (editor, GitHub), and
 *           still greppable/diffable as plain text.
 *  - `json` stable shape for scripts and notebooks doing real analysis.
 *
 * All three are built from the same `ExportConversation` payload so a thread
 * never carries different data depending on which button the operator clicked.
 */

/**
 * Notes are ascending here (unlike the detail view, which shows newest first):
 * an export is read top-to-bottom as a history, so it should run with the clock.
 */
export const exportInclude = {
  messages: { orderBy: { createdAt: 'asc' as const } },
  notes: {
    orderBy: { createdAt: 'asc' as const },
    include: { author: { select: { id: true, name: true } } },
  },
  assignedTo: { select: { id: true, name: true, email: true } },
  lead: { select: { id: true, salesStatus: true, temperature: true } },
  handoff: { select: { id: true, status: true, priority: true } },
} satisfies Prisma.ConversationInclude;

export type ExportConversation = Prisma.ConversationGetPayload<{
  include: typeof exportInclude;
}>;

export type ExportFormat = 'html' | 'md' | 'json';

export interface ExportMeta {
  /** Inclusive lower bound on last activity, when the operator picked a range. */
  since?: Date;
  /** Inclusive upper bound on last activity. */
  until?: Date;
  /** Inbox filters the export inherited, for the "what am I looking at" header. */
  filters?: Record<string, string | undefined>;
  /** Set when the conversation cap trimmed the result. */
  truncated?: boolean;
  limit?: number;
}

export interface ExportFile {
  filename: string;
  contentType: string;
  body: string;
}

// Mirrors the label maps in apps/cms-web/lib/status.ts. Duplicated rather than
// shared because an export is a document: it should read in plain English even
// when nobody has the panel open to translate the raw enum values.
const CHANNEL_LABEL: Record<string, string> = {
  webchat: 'Web Chat',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  instagram: 'Instagram',
  phone: 'Phone',
};

const LANGUAGE_LABEL: Record<string, string> = {
  en: 'English',
  ru: 'Russian',
  az: 'Azerbaijani',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  waiting_for_human: 'Waiting for human',
  assigned: 'Assigned',
  resolved: 'Resolved',
  closed: 'Closed',
  spam: 'Spam',
};

const ROLE_LABEL: Record<string, string> = {
  user: 'Customer',
  bot: 'Bot',
  human: 'Agent',
  system: 'System',
};

// [background, foreground] — mirrors the palette in apps/cms-web/lib/status.ts
// so the HTML export's status pill matches the one an operator already knows
// from the panel, instead of introducing a second color language.
const STATUS_COLOR: Record<string, [string, string]> = {
  active: ['#e6f6ec', '#1a7f3d'],
  waiting_for_human: ['#fdf3e2', '#b5730d'],
  assigned: ['#e7effc', '#0148c2'],
  resolved: ['#e2f5f3', '#0f8a7e'],
  closed: ['#eef0f3', '#555b63'],
  spam: ['#fdeaea', '#c0392b'],
};

const DASH = '—';

const label = (map: Record<string, string>, key?: string | null) =>
  key ? (map[key] ?? key) : DASH;

/**
 * Timestamps are rendered as UTC rather than through `toLocaleString` — the file
 * outlives the session that produced it, so "14:32" has to mean one thing no
 * matter which machine opens it later.
 */
function dateTime(value: Date): string {
  return `${value.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

function day(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** Display name for a thread, matching how the inbox labels it. */
function customerName(conv: ExportConversation): string {
  return conv.customerHandle ?? conv.customerPhone ?? conv.threadId;
}

/** `|` would otherwise break out of a markdown table cell. */
function cell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

/**
 * Message bodies go into blockquotes: it keeps the speaker's text visually
 * separate from our own headings, and survives content that is itself markdown
 * (the bot sends formatted replies) instead of letting it restyle the document.
 */
function blockquote(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => (line.trim() ? `> ${line}` : '>'))
    .join('\n');
}

function fallback(value?: string | null): string {
  return value?.trim() ? value : DASH;
}

/**
 * Every value interpolated into the HTML export must go through this — the
 * content is customer- and bot-authored text landing in a file that gets
 * double-clicked open in a browser. Unescaped it would be a stored-XSS-shaped
 * hole the moment a message contains `<script>` or an `onerror=` attribute.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// JSON
// ---------------------------------------------------------------------------

/**
 * Shaped explicitly instead of handing back the Prisma row so the file stays a
 * documented contract — adding a column to the table should not silently change
 * what past scripts parse.
 */
export function conversationToJson(conv: ExportConversation) {
  return {
    id: conv.id,
    threadId: conv.threadId,
    customer: {
      name: customerName(conv),
      handle: conv.customerHandle,
      phone: conv.customerPhone,
    },
    channel: conv.channel,
    language: conv.language,
    status: conv.status,
    stage: conv.stage,
    budget: conv.budget,
    topProject: conv.topProject,
    selectedUnits: conv.selectedUnits,
    botActive: conv.botActive,
    assignedTo: conv.assignedTo,
    lead: conv.lead,
    handoff: conv.handoff,
    createdAt: conv.createdAt.toISOString(),
    lastMessageAt: conv.lastMessageAt.toISOString(),
    messageCount: conv.messages.length,
    messages: conv.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      channel: m.channel,
      createdAt: m.createdAt.toISOString(),
    })),
    // Sales-only in the UI, and sales-only here too: the export is an
    // authenticated staff download, never something handed to a customer.
    internalNotes: conv.notes.map((n) => ({
      id: n.id,
      body: n.body,
      author: n.author?.name ?? null,
      createdAt: n.createdAt.toISOString(),
    })),
  };
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

/**
 * `depth` shifts the headings so the same renderer works for a standalone file
 * (depth 1) and for a thread nested inside a bundle under its own title
 * (depth 2).
 */
export function conversationToMarkdown(
  conv: ExportConversation,
  depth = 1,
): string {
  const h = '#'.repeat(depth);
  const sub = '#'.repeat(depth + 1);

  const lines: string[] = [
    `${h} Conversation #${conv.id} — ${customerName(conv)}`,
    '',
    `- **Thread:** \`${conv.threadId}\``,
    `- **Channel:** ${label(CHANNEL_LABEL, conv.channel)} · **Language:** ${label(LANGUAGE_LABEL, conv.language)}`,
    `- **Status:** ${label(STATUS_LABEL, conv.status)} · **Bot:** ${conv.botActive ? 'active' : 'paused'}`,
    `- **Handle:** ${fallback(conv.customerHandle)} · **Phone:** ${fallback(conv.customerPhone)}`,
    `- **Stage:** ${fallback(conv.stage)} · **Budget:** ${fallback(conv.budget)}`,
    `- **Preferred project:** ${fallback(conv.topProject)} · **Selected units:** ${conv.selectedUnits.length ? conv.selectedUnits.join(', ') : DASH}`,
    `- **Assigned to:** ${fallback(conv.assignedTo?.name ?? conv.assignedTo?.email)}`,
    `- **Lead:** ${conv.lead ? `#${conv.lead.id} (${conv.lead.salesStatus} · ${conv.lead.temperature})` : DASH} · **Handoff:** ${conv.handoff ? `${conv.handoff.status} (${conv.handoff.priority})` : DASH}`,
    `- **Started:** ${dateTime(conv.createdAt)} · **Last activity:** ${dateTime(conv.lastMessageAt)} · **Messages:** ${conv.messages.length}`,
    '',
    `${sub} Transcript`,
    '',
  ];

  if (conv.messages.length === 0) {
    lines.push('_No messages on this thread._', '');
  } else {
    for (const m of conv.messages) {
      const channel = m.channel ? ` · ${label(CHANNEL_LABEL, m.channel)}` : '';
      lines.push(
        `**${label(ROLE_LABEL, m.role)}** · ${dateTime(m.createdAt)}${channel}`,
        blockquote(m.content),
        '',
      );
    }
  }

  if (conv.notes.length > 0) {
    lines.push(
      `${sub} Internal notes`,
      '',
      '_Sales-only — never shown to the customer._',
      '',
    );
    for (const n of conv.notes) {
      lines.push(
        `**${n.author?.name ?? 'Agent'}** · ${dateTime(n.createdAt)}`,
        blockquote(n.body),
        '',
      );
    }
  }

  return lines.join('\n');
}

/** Index table at the top of a bundle, so a 200-thread file is still navigable. */
function summaryTable(conversations: ExportConversation[]): string {
  const head = [
    '| # | Customer | Channel | Status | Messages | Last activity |',
    '| --- | --- | --- | --- | --- | --- |',
  ];
  const rows = conversations.map((c) =>
    [
      c.id,
      cell(customerName(c)),
      label(CHANNEL_LABEL, c.channel),
      label(STATUS_LABEL, c.status),
      c.messages.length,
      dateTime(c.lastMessageAt),
    ].join(' | '),
  );
  return [...head, ...rows.map((r) => `| ${r} |`)].join('\n');
}

function rangeLabel(meta: ExportMeta): string {
  if (meta.since && meta.until)
    return `${day(meta.since)} → ${day(meta.until)}`;
  if (meta.since) return `${day(meta.since)} → now`;
  if (meta.until) return `up to ${day(meta.until)}`;
  return 'All time';
}

function filterLabel(filters?: Record<string, string | undefined>): string {
  const active = Object.entries(filters ?? {}).filter(([, v]) => v);
  return active.length
    ? active.map(([k, v]) => `${k}=${cell(String(v))}`).join(', ')
    : 'None';
}

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------
//
// This is the format meant for the person on the other end of the deal, not
// the person who built the panel: open by double-clicking, chat-bubble layout
// matching the transcript the operator already sees on screen, and a search
// box for a bundle instead of scrolling. Self-contained (inline CSS/JS, no
// external requests) so the file still opens if it's emailed and read offline.

function messageBubbleHtml(
  m: ExportConversation['messages'][number],
): string {
  if (m.role === 'system') {
    return `<div class="sys"><span>${escapeHtml(m.content)}</span><span class="sys-t">${dateTime(m.createdAt)}</span></div>`;
  }
  const channel = m.channel
    ? ` · ${escapeHtml(label(CHANNEL_LABEL, m.channel))}`
    : '';
  return `<div class="row row-${m.role}">
    <div class="bubble bubble-${m.role}">
      <div class="bmeta"><span class="bauthor">${escapeHtml(label(ROLE_LABEL, m.role))}</span><span class="btime">${dateTime(m.createdAt)}${channel}</span></div>
      <div class="bcontent">${escapeHtml(m.content)}</div>
    </div>
  </div>`;
}

function metaGridHtml(conv: ExportConversation): string {
  const row = (k: string, v: string) =>
    `<div class="mk">${escapeHtml(k)}</div><div class="mv">${v}</div>`;
  return `<div class="meta-grid">
    ${row('Channel', `${escapeHtml(label(CHANNEL_LABEL, conv.channel))} · ${escapeHtml(label(LANGUAGE_LABEL, conv.language))}`)}
    ${row('Bot', conv.botActive ? 'Active' : 'Paused')}
    ${row('Handle', escapeHtml(fallback(conv.customerHandle)))}
    ${row('Phone', escapeHtml(fallback(conv.customerPhone)))}
    ${row('Stage', escapeHtml(fallback(conv.stage)))}
    ${row('Budget', escapeHtml(fallback(conv.budget)))}
    ${row('Preferred project', escapeHtml(fallback(conv.topProject)))}
    ${row('Selected units', conv.selectedUnits.length ? escapeHtml(conv.selectedUnits.join(', ')) : DASH)}
    ${row('Assigned to', escapeHtml(fallback(conv.assignedTo?.name ?? conv.assignedTo?.email)))}
    ${row('Lead', conv.lead ? `#${conv.lead.id} (${escapeHtml(conv.lead.salesStatus)} · ${escapeHtml(conv.lead.temperature)})` : DASH)}
    ${row('Handoff', conv.handoff ? `${escapeHtml(conv.handoff.status)} (${escapeHtml(conv.handoff.priority)})` : DASH)}
    ${row('Started', dateTime(conv.createdAt))}
    ${row('Last activity', dateTime(conv.lastMessageAt))}
  </div>`;
}

function notesHtml(conv: ExportConversation): string {
  if (conv.notes.length === 0) return '';
  return `<div class="notes">
    <div class="section-title">Internal notes</div>
    <p class="hint">Sales-only — never shown to the customer.</p>
    ${conv.notes
      .map(
        (n) => `<div class="note">
      <div class="note-body">${escapeHtml(n.body)}</div>
      <div class="note-meta">${escapeHtml(n.author?.name ?? 'Agent')} · ${dateTime(n.createdAt)}</div>
    </div>`,
      )
      .join('')}
  </div>`;
}

/**
 * The values that make a thread findable in the bundle search box — lower-cased
 * and HTML-escaped once here so the filter script can do a plain substring
 * match against `data-search` without re-processing anything at query time.
 */
function searchIndex(conv: ExportConversation): string {
  return escapeHtml(
    [
      customerName(conv),
      conv.threadId,
      conv.customerPhone,
      conv.customerHandle,
      label(CHANNEL_LABEL, conv.channel),
      label(STATUS_LABEL, conv.status),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  );
}

/** One thread, collapsible — used for every thread in a bundle. */
function threadDetailsHtml(conv: ExportConversation): string {
  const [bg, fg] = STATUS_COLOR[conv.status] ?? STATUS_COLOR.closed;
  const count = conv.messages.length;
  return `<details class="thread" data-search="${searchIndex(conv)}">
  <summary>
    <span class="t-name">${escapeHtml(customerName(conv))}</span>
    <span class="pill" style="background:${bg};color:${fg}">${escapeHtml(label(STATUS_LABEL, conv.status))}</span>
    <span class="t-meta">${escapeHtml(label(CHANNEL_LABEL, conv.channel))} · ${count} message${count === 1 ? '' : 's'} · ${dateTime(conv.lastMessageAt)}</span>
  </summary>
  <div class="thread-body">
    <div class="t-id">Conversation #${conv.id} · <code>${escapeHtml(conv.threadId)}</code></div>
    ${metaGridHtml(conv)}
    <div class="section-title">Transcript</div>
    ${count === 0 ? '<p class="hint">No messages on this thread.</p>' : `<div class="transcript">${conv.messages.map(messageBubbleHtml).join('')}</div>`}
    ${notesHtml(conv)}
  </div>
</details>`;
}

/** The single-thread page: same content as `threadDetailsHtml`, laid out flat (no collapse — there's nothing else on the page to collapse it against). */
function threadPageHtml(conv: ExportConversation): string {
  const [bg, fg] = STATUS_COLOR[conv.status] ?? STATUS_COLOR.closed;
  const count = conv.messages.length;
  return `<div class="card">
    <div class="card-head">
      <div>
        <h1>${escapeHtml(customerName(conv))}</h1>
        <div class="t-id">Conversation #${conv.id} · <code>${escapeHtml(conv.threadId)}</code></div>
      </div>
      <span class="pill" style="background:${bg};color:${fg}">${escapeHtml(label(STATUS_LABEL, conv.status))}</span>
    </div>
    ${metaGridHtml(conv)}
    <div class="section-title">Transcript</div>
    ${count === 0 ? '<p class="hint">No messages on this thread.</p>' : `<div class="transcript">${conv.messages.map(messageBubbleHtml).join('')}</div>`}
    ${notesHtml(conv)}
  </div>`;
}

const DOCUMENT_STYLE = `
:root{ --bg:#f5f6f8; --card:#fff; --border:rgba(0,0,0,.08); --text:#16181d; --muted:#6b7280; --muted2:#9aa0a6; --accent:#0148c2; }
@media (prefers-color-scheme: dark){
  :root{ --bg:#15171b; --card:#1d2025; --border:rgba(255,255,255,.1); --text:#e7e9ec; --muted:#a7adb5; --muted2:#8a9099; --accent:#5b9dff; }
}
*{ box-sizing:border-box; }
body{ margin:0; background:var(--bg); color:var(--text); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }
.page{ max-width:880px; margin:0 auto; padding:28px 18px 70px; }
.doc-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:18px; }
.doc-head h1{ font-size:19px; margin:0 0 4px; }
.doc-sub{ font-size:12.5px; color:var(--muted); line-height:1.6; }
.btn{ display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 14px; border-radius:9px; border:1px solid var(--border); background:var(--card); color:var(--text); font-size:12.5px; font-family:inherit; cursor:pointer; white-space:nowrap; }
.btn:hover{ background:var(--border); }
.banner{ margin:14px 0; padding:10px 14px; border-radius:10px; background:#fdf3e2; color:#8a5a09; font-size:12.5px; }
@media (prefers-color-scheme: dark){ .banner{ background:#3a2f14; color:#f0c674; } }
.toolbar{ display:flex; align-items:center; gap:8px; margin:16px 0; }
.toolbar input[type=text]{ flex:1; height:36px; padding:0 12px; border-radius:9px; border:1px solid var(--border); background:var(--card); color:var(--text); font-size:13px; font-family:inherit; }
.summary-table{ width:100%; border-collapse:collapse; font-size:12.5px; margin:14px 0 22px; }
.summary-table th{ text-align:left; padding:8px 10px; color:var(--muted); font-weight:600; border-bottom:1px solid var(--border); }
.summary-table td{ padding:8px 10px; border-bottom:1px solid var(--border); }
.card{ background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px; margin-bottom:16px; }
.card-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:14px; }
.card-head h1{ font-size:16px; margin:0 0 3px; }
.thread{ background:var(--card); border:1px solid var(--border); border-radius:14px; margin-bottom:10px; overflow:hidden; }
.thread summary{ list-style:none; cursor:pointer; display:flex; align-items:center; gap:10px; padding:13px 16px; flex-wrap:wrap; }
.thread summary::-webkit-details-marker{ display:none; }
.thread summary::before{ content:"▸"; color:var(--muted2); font-size:11px; transition:transform .12s ease; flex-shrink:0; }
.thread[open] summary::before{ transform:rotate(90deg); }
.thread summary:hover{ background:rgba(1,72,194,.05); }
.t-name{ font-weight:600; font-size:13.5px; }
.t-meta{ font-size:11.5px; color:var(--muted2); margin-left:auto; }
.t-id{ font-size:11.5px; color:var(--muted); margin-bottom:12px; }
.thread-body{ padding:0 16px 16px; border-top:1px solid var(--border); }
.thread-body .t-id{ margin-top:14px; }
.pill{ display:inline-flex; padding:3px 9px; border-radius:999px; font-size:11px; font-weight:600; white-space:nowrap; }
.meta-grid{ display:grid; grid-template-columns:130px 1fr; gap:6px 12px; font-size:12.5px; margin-bottom:16px; }
.mk{ color:var(--muted); }
.mv{ font-weight:500; }
.section-title{ font-size:11px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--muted2); margin:16px 0 10px; }
.hint{ font-size:12px; color:var(--muted2); }
.transcript{ display:flex; flex-direction:column; gap:10px; }
.row{ display:flex; }
.row-human{ justify-content:flex-end; }
.bubble{ max-width:78%; padding:9px 13px; border-radius:14px; font-size:13.5px; line-height:1.5; }
.bubble-user{ background:var(--bg); border:1px solid var(--border); border-bottom-left-radius:4px; }
.bubble-bot{ background:rgba(1,72,194,.08); border-bottom-left-radius:4px; }
.bubble-human{ background:var(--accent); color:#fff; border-bottom-right-radius:4px; }
.bmeta{ display:flex; justify-content:space-between; gap:12px; margin-bottom:3px; }
.bauthor{ font-size:11px; font-weight:700; opacity:.85; }
.btime{ font-size:10.5px; opacity:.65; white-space:nowrap; }
.bcontent{ white-space:pre-wrap; word-break:break-word; }
.sys{ align-self:center; display:flex; align-items:center; gap:8px; padding:4px 12px; background:rgba(0,0,0,.05); border-radius:999px; font-size:11px; color:var(--muted2); }
@media (prefers-color-scheme: dark){ .sys{ background:rgba(255,255,255,.06); } }
.notes{ margin-top:18px; }
.note{ background:var(--bg); border-radius:10px; padding:10px 12px; margin-bottom:8px; }
.note-body{ font-size:13px; white-space:pre-wrap; }
.note-meta{ font-size:11px; color:var(--muted2); margin-top:6px; }
code{ font-family:ui-monospace,"SF Mono",Menlo,monospace; font-size:11.5px; }
@media print{
  body{ background:#fff; }
  .no-print{ display:none !important; }
  .thread, .card{ border:1px solid #ddd; box-shadow:none; break-inside:avoid; }
  .thread summary::before{ display:none; }
}
`.trim();

/**
 * `beforeprint` forces every collapsed thread open — a collapsed `<details>`
 * prints as empty in every major browser, so "Print" on an unopened bundle
 * would otherwise hand someone a stack of headers with no transcripts under
 * them. `afterprint` restores whatever the reader had open on screen.
 */
const DOCUMENT_SCRIPT = `
function printDoc(){ window.print(); }
(function(){
  var restore = [];
  window.addEventListener('beforeprint', function(){
    restore = [];
    document.querySelectorAll('details.thread').forEach(function(d){
      restore.push([d, d.open]);
      d.open = true;
    });
  });
  window.addEventListener('afterprint', function(){
    restore.forEach(function(pair){ pair[0].open = pair[1]; });
  });
  var input = document.getElementById('search');
  if (input) {
    input.addEventListener('input', function(){
      var q = input.value.trim().toLowerCase();
      document.querySelectorAll('.thread').forEach(function(t){
        var match = !q || (t.dataset.search || '').indexOf(q) !== -1;
        t.style.display = match ? '' : 'none';
        if (q && match) t.open = true;
      });
    });
  }
  var expand = document.getElementById('expand-all');
  if (expand) expand.addEventListener('click', function(){
    document.querySelectorAll('details.thread').forEach(function(d){ d.open = true; });
  });
  var collapse = document.getElementById('collapse-all');
  if (collapse) collapse.addEventListener('click', function(){
    document.querySelectorAll('details.thread').forEach(function(d){ d.open = false; });
  });
})();
`.trim();

function htmlDocument(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${DOCUMENT_STYLE}</style>
</head>
<body>
<div class="page">
${bodyHtml}
</div>
<script>${DOCUMENT_SCRIPT}</script>
</body>
</html>`;
}

function htmlRangeLabel(meta: ExportMeta): string {
  if (meta.since && meta.until)
    return `${day(meta.since)} → ${day(meta.until)}`;
  if (meta.since) return `${day(meta.since)} → now`;
  if (meta.until) return `up to ${day(meta.until)}`;
  return 'All time';
}

function htmlFilterLabel(filters?: Record<string, string | undefined>): string {
  const active = Object.entries(filters ?? {}).filter(([, v]) => v);
  return active.length
    ? active.map(([k, v]) => `${escapeHtml(k)}=${escapeHtml(String(v))}`).join(', ')
    : 'None';
}

// ---------------------------------------------------------------------------
// File assembly
// ---------------------------------------------------------------------------

/** Thread ids come from external channels, so they are not filename-safe. */
function slug(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 40);
}

export function buildSingleExport(
  conv: ExportConversation,
  format: ExportFormat,
): ExportFile {
  const base = `conversation-${conv.id}-${slug(conv.threadId)}`;
  if (format === 'json') {
    return {
      filename: `${base}.json`,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify(
        { exportedAt: new Date().toISOString(), conversation: conversationToJson(conv) },
        null,
        2,
      ),
    };
  }
  if (format === 'html') {
    const header = `<div class="doc-head">
      <div>
        <h1>Conversation transcript</h1>
        <div class="doc-sub">Generated ${dateTime(new Date())}</div>
      </div>
      <button class="btn no-print" onclick="printDoc()">Print / Save as PDF</button>
    </div>`;
    return {
      filename: `${base}.html`,
      contentType: 'text/html; charset=utf-8',
      body: htmlDocument(
        `${customerName(conv)} — Conversation #${conv.id}`,
        header + threadPageHtml(conv),
      ),
    };
  }
  return {
    filename: `${base}.md`,
    contentType: 'text/markdown; charset=utf-8',
    body: `${conversationToMarkdown(conv, 1)}`,
  };
}

export function buildBundleExport(
  conversations: ExportConversation[],
  format: ExportFormat,
  meta: ExportMeta,
): ExportFile {
  const now = new Date();
  const base = meta.since
    ? `conversations-${day(meta.since)}-to-${day(meta.until ?? now)}`
    : `conversations-all-${day(now)}`;

  const messageCount = conversations.reduce(
    (sum, c) => sum + c.messages.length,
    0,
  );

  if (format === 'json') {
    return {
      filename: `${base}.json`,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify(
        {
          exportedAt: now.toISOString(),
          range: {
            since: meta.since?.toISOString() ?? null,
            until: meta.until?.toISOString() ?? null,
            field: 'lastMessageAt',
          },
          filters: meta.filters ?? {},
          truncated: !!meta.truncated,
          limit: meta.limit ?? null,
          conversationCount: conversations.length,
          messageCount,
          conversations: conversations.map(conversationToJson),
        },
        null,
        2,
      ),
    };
  }

  if (format === 'html') {
    const truncatedBanner = meta.truncated
      ? `<div class="banner">Truncated: only the ${meta.limit} most recently active threads are included. Narrow the date range to export the rest.</div>`
      : '';
    const head = `<div class="doc-head">
      <div>
        <h1>Conversation export</h1>
        <div class="doc-sub">
          Generated ${dateTime(now)}<br>
          Range: ${escapeHtml(htmlRangeLabel(meta))} (by last activity) · Filters: ${htmlFilterLabel(meta.filters)}<br>
          ${conversations.length} thread${conversations.length === 1 ? '' : 's'} · ${messageCount} message${messageCount === 1 ? '' : 's'} · all timestamps are UTC
        </div>
      </div>
      <button class="btn no-print" onclick="printDoc()">Print / Save as PDF</button>
    </div>
    ${truncatedBanner}`;

    if (conversations.length === 0) {
      return {
        filename: `${base}.html`,
        contentType: 'text/html; charset=utf-8',
        body: htmlDocument(
          'Conversation export',
          `${head}<p class="hint">No conversations matched this range.</p>`,
        ),
      };
    }

    const toolbar = `<div class="toolbar no-print">
      <input type="text" id="search" placeholder="Filter by name, phone, thread id, channel, status…">
      <button class="btn" id="expand-all">Expand all</button>
      <button class="btn" id="collapse-all">Collapse all</button>
    </div>`;

    const threads = conversations.map(threadDetailsHtml).join('');

    return {
      filename: `${base}.html`,
      contentType: 'text/html; charset=utf-8',
      body: htmlDocument('Conversation export', `${head}${toolbar}${threads}`),
    };
  }

  const header = [
    '# Conversation export',
    '',
    `- **Generated:** ${dateTime(now)}`,
    `- **Range:** ${rangeLabel(meta)} (by last activity)`,
    `- **Filters:** ${filterLabel(meta.filters)}`,
    `- **Threads:** ${conversations.length} · **Messages:** ${messageCount}`,
    '',
    'All timestamps are UTC.',
    '',
  ];

  if (meta.truncated) {
    header.push(
      `> **Truncated:** only the ${meta.limit} most recently active threads are included.`,
      '> Narrow the date range to export the rest.',
      '',
    );
  }

  if (conversations.length === 0) {
    return {
      filename: `${base}.md`,
      contentType: 'text/markdown; charset=utf-8',
      body: [...header, '_No conversations matched this range._', ''].join('\n'),
    };
  }

  const body = [
    ...header,
    '## Threads in this export',
    '',
    summaryTable(conversations),
    '',
    ...conversations.flatMap((c) => ['---', '', conversationToMarkdown(c, 2)]),
  ];

  return {
    filename: `${base}.md`,
    contentType: 'text/markdown; charset=utf-8',
    body: body.join('\n'),
  };
}
