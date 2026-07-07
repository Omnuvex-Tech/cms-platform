import type { StatusMeta } from "@/lib/status";
import ui from "@/styles/ui.module.css";

export function StatusPill({
    meta,
    dot = true,
}: {
    meta: StatusMeta | undefined;
    dot?: boolean;
}) {
    if (!meta) return <span className={ui.muted}>—</span>;
    return (
        <span
            className={ui.pill}
            style={{ background: meta.bg, color: meta.fg }}
        >
            {dot && <span className={ui.dot} />}
            {meta.label}
        </span>
    );
}
