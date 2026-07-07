import ui from "@/styles/ui.module.css";

export function Loading({ label = "Loading…" }: { label?: string }) {
    return (
        <div className={ui.loading}>
            <div className={ui.spinner} />
            <span>{label}</span>
        </div>
    );
}

export function EmptyState({
    icon,
    title,
    hint,
}: {
    icon?: React.ReactNode;
    title: string;
    hint?: string;
}) {
    return (
        <div className={ui.empty}>
            {icon}
            <div style={{ fontWeight: 500, color: "#4b5159" }}>{title}</div>
            {hint && <div>{hint}</div>}
        </div>
    );
}

export function Avatar({ text }: { text: string }) {
    return <span className={ui.avatar}>{text}</span>;
}
