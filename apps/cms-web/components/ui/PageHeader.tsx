import ui from "@/styles/ui.module.css";

export function PageHeader({
    title,
    subtitle,
    actions,
}: {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}) {
    return (
        <div className={ui.pageHeader}>
            <div className={ui.pageTitleWrap}>
                <h1 className={ui.pageTitle}>{title}</h1>
                {subtitle && <p className={ui.pageSubtitle}>{subtitle}</p>}
            </div>
            {actions && <div className={ui.pageActions}>{actions}</div>}
        </div>
    );
}
