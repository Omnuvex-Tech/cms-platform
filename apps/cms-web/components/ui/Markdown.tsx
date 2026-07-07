import React from "react";

/** Minimal markdown-lite renderer for preview panes (headings, bold, lists). */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>;
    });
}

export function Markdown({ text }: { text?: string | null }) {
    if (!text || !text.trim()) {
        return <p style={{ color: "#a0a6ad", fontStyle: "italic" }}>Not set</p>;
    }

    const lines = text.replace(/\r/g, "").split("\n");
    const blocks: React.ReactNode[] = [];
    let list: string[] = [];

    const flushList = (key: string) => {
        if (list.length) {
            blocks.push(
                <ul key={key} style={{ margin: "6px 0 10px 18px", lineHeight: 1.6 }}>
                    {list.map((li, i) => (
                        <li key={i}>{renderInline(li, `${key}-${i}`)}</li>
                    ))}
                </ul>
            );
            list = [];
        }
    };

    lines.forEach((raw, idx) => {
        const line = raw.trim();
        if (!line) {
            flushList(`ul-${idx}`);
            return;
        }
        if (line.startsWith("### ")) {
            flushList(`ul-${idx}`);
            blocks.push(
                <h4 key={idx} style={{ fontSize: 13, fontWeight: 600, margin: "8px 0 4px" }}>
                    {renderInline(line.slice(4), `h4-${idx}`)}
                </h4>
            );
        } else if (line.startsWith("## ")) {
            flushList(`ul-${idx}`);
            blocks.push(
                <h3 key={idx} style={{ fontSize: 15, fontWeight: 600, margin: "10px 0 6px" }}>
                    {renderInline(line.slice(3), `h3-${idx}`)}
                </h3>
            );
        } else if (line.startsWith("# ")) {
            flushList(`ul-${idx}`);
            blocks.push(
                <h2 key={idx} style={{ fontSize: 17, fontWeight: 700, margin: "10px 0 6px" }}>
                    {renderInline(line.slice(2), `h2-${idx}`)}
                </h2>
            );
        } else if (/^[-*]\s+/.test(line)) {
            list.push(line.replace(/^[-*]\s+/, ""));
        } else {
            flushList(`ul-${idx}`);
            blocks.push(
                <p key={idx} style={{ margin: "0 0 8px", lineHeight: 1.6 }}>
                    {renderInline(line, `p-${idx}`)}
                </p>
            );
        }
    });
    flushList("ul-end");

    return <div>{blocks}</div>;
}
