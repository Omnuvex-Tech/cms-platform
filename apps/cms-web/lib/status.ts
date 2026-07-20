// Central label + color maps for every status vocabulary in the panel.
// Colors are [background, foreground] and consumed via inline styles so we
// don't need one CSS class per enum value.

export interface StatusMeta {
    label: string;
    bg: string;
    fg: string;
}

const GREEN: [string, string] = ["#e6f6ec", "#1a7f3d"];
const BLUE: [string, string] = ["#e7effc", "#0148c2"];
const AMBER: [string, string] = ["#fdf3e2", "#b5730d"];
const RED: [string, string] = ["#fdeaea", "#c0392b"];
const GRAY: [string, string] = ["#eef0f3", "#555b63"];
const PURPLE: [string, string] = ["#f0e9fb", "#6b3fce"];
const TEAL: [string, string] = ["#e2f5f3", "#0f8a7e"];

function meta(label: string, [bg, fg]: [string, string]): StatusMeta {
    return { label, bg, fg };
}

export const conversationStatus: Record<string, StatusMeta> = {
    active: meta("Active", GREEN),
    waiting_for_human: meta("Waiting", AMBER),
    assigned: meta("Assigned", BLUE),
    resolved: meta("Resolved", TEAL),
    closed: meta("Closed", GRAY),
    spam: meta("Spam", RED),
};

export const handoffStatus: Record<string, StatusMeta> = {
    new: meta("New", AMBER),
    active: meta("Active", GREEN),
    assigned: meta("Assigned", BLUE),
    resolved: meta("Resolved", TEAL),
    cancelled: meta("Cancelled", GRAY),
};

export const handoffPriority: Record<string, StatusMeta> = {
    normal: meta("Normal", GRAY),
    high: meta("High", AMBER),
    urgent: meta("Urgent", RED),
};

export const slaState: Record<string, StatusMeta> = {
    on_track: meta("On track", GREEN),
    due_soon: meta("Due soon", AMBER),
    breached: meta("Breached", RED),
};

export const contactStatus: Record<string, StatusMeta> = {
    new: meta("New", AMBER),
    assigned: meta("Assigned", BLUE),
    contacted: meta("Contacted", TEAL),
    scheduled: meta("Scheduled", PURPLE),
    completed: meta("Completed", GREEN),
    no_answer: meta("No answer", RED),
    cancelled: meta("Cancelled", GRAY),
};

export const leadStatus: Record<string, StatusMeta> = {
    new: meta("New", AMBER),
    qualified: meta("Qualified", BLUE),
    contact_requested: meta("Contact requested", PURPLE),
    assigned: meta("Assigned", BLUE),
    in_follow_up: meta("In follow-up", TEAL),
    visit_scheduled: meta("Visit scheduled", PURPLE),
    negotiation: meta("Negotiation", AMBER),
    won: meta("Won", GREEN),
    lost: meta("Lost", RED),
    invalid: meta("Invalid", GRAY),
};

export const temperature: Record<string, StatusMeta> = {
    hot: meta("Hot", RED),
    warm: meta("Warm", AMBER),
    cold: meta("Cold", BLUE),
};

export const projectStatus: Record<string, StatusMeta> = {
    draft: meta("Draft", GRAY),
    published: meta("Published", GREEN),
    archived: meta("Archived", AMBER),
};

export const channelLabel: Record<string, string> = {
    webchat: "Web Chat",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    instagram: "Instagram",
    phone: "Phone",
};

export const languageLabel: Record<string, string> = {
    en: "English",
    ru: "Russian",
    az: "Azerbaijani",
};
