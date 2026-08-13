import { projectTags } from "@/lib/status";
import { StatusPill } from "@/components/ui/StatusPill";
import ui from "@/styles/ui.module.css";
import styles from "@/styles/projects.module.css";

/** A project's teaser tags as pills, in the fixed order the agent walks them
 * in (not the order they were clicked), so scanning the list is predictable. */
export function TagPills({ tags }: { tags?: string[] | null }) {
    const known = Object.keys(projectTags).filter((t) => tags?.includes(t));
    if (known.length === 0) return <span className={ui.muted}>—</span>;
    return (
        <div className={styles.tagList}>
            {known.map((t) => (
                <StatusPill key={t} meta={projectTags[t]} dot={false} />
            ))}
        </div>
    );
}
