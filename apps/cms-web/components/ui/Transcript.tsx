import { channelLabel } from "@/lib/status";
import { formatDateTime } from "@/lib/format";
import styles from "@/styles/transcript.module.css";

export interface TranscriptMessage {
    id: number;
    role: "user" | "bot" | "human" | "system";
    content: string;
    channel?: string | null;
    createdAt: string;
}

const ROLE_LABEL: Record<string, string> = {
    user: "Customer",
    bot: "Bot",
    human: "Agent",
    system: "System",
};

export function Transcript({ messages }: { messages: TranscriptMessage[] }) {
    if (!messages.length) {
        return <div className={styles.empty}>No messages yet.</div>;
    }
    return (
        <div className={styles.transcript}>
            {messages.map((m) => {
                if (m.role === "system") {
                    return (
                        <div key={m.id} className={styles.system}>
                            <span>{m.content}</span>
                            <span className={styles.systemTime}>
                                {formatDateTime(m.createdAt)}
                            </span>
                        </div>
                    );
                }
                return (
                    <div
                        key={m.id}
                        className={`${styles.row} ${styles[`row_${m.role}`] ?? ""}`}
                    >
                        <div className={`${styles.bubble} ${styles[`bubble_${m.role}`] ?? ""}`}>
                            <div className={styles.meta}>
                                <span className={styles.author}>{ROLE_LABEL[m.role]}</span>
                                <span className={styles.time}>
                                    {m.channel ? `${channelLabel[m.channel]} · ` : ""}
                                    {formatDateTime(m.createdAt)}
                                </span>
                            </div>
                            <div className={styles.content}>{m.content}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
