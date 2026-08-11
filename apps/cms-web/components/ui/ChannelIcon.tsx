import type { ReactNode } from "react";
import { MessageCircle, Phone, Globe } from "lucide-react";
import { channelLabel } from "@/lib/status";
import ui from "@/styles/ui.module.css";

/**
 * Per-channel marks so a thread's origin is readable at a glance.
 *
 * Telegram / Instagram / WhatsApp are inlined SVGs on purpose: lucide dropped its
 * brand icons, and a generic bubble for all three defeats the point — the whole
 * value here is that the operator recognises the channel without reading a word.
 */

interface ChannelStyle {
    /** Brand colour, used for the glyph. */
    fg: string;
    /** Tinted chip behind the glyph. */
    bg: string;
    glyph: (size: number) => ReactNode;
}

const telegram = (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.07-.062-.174-.041-.249-.024-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.12.098.153.23.169.324.015.094.034.308.019.475z" />
    </svg>
);

const instagram = (size: number) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <rect x="2" y="2" width="20" height="20" rx="5.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.6" cy="6.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
);

const whatsapp = (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
    </svg>
);

const CHANNEL_STYLES: Record<string, ChannelStyle> = {
    telegram: { fg: "#1e93cf", bg: "rgba(34, 158, 217, 0.12)", glyph: telegram },
    instagram: { fg: "#d62b74", bg: "rgba(214, 43, 116, 0.11)", glyph: instagram },
    whatsapp: { fg: "#1da851", bg: "rgba(37, 211, 102, 0.14)", glyph: whatsapp },
    webchat: {
        fg: "#0148c2",
        bg: "rgba(1, 72, 194, 0.1)",
        glyph: (size) => <MessageCircle size={size} />,
    },
    phone: {
        fg: "#5c6470",
        bg: "rgba(92, 100, 112, 0.12)",
        glyph: (size) => <Phone size={size} />,
    },
};

const FALLBACK: ChannelStyle = {
    fg: "#8a9099",
    bg: "rgba(138, 144, 153, 0.14)",
    glyph: (size) => <Globe size={size} />,
};

/** The glyph on its own, inheriting the surrounding colour box. */
export function ChannelIcon({ channel, size = 15 }: { channel: string; size?: number }) {
    return <>{(CHANNEL_STYLES[channel] ?? FALLBACK).glyph(size)}</>;
}

/** Glyph in a brand-tinted chip — the scannable version for list rows and headers. */
export function ChannelBadge({
    channel,
    size = 30,
}: {
    channel: string;
    size?: number;
}) {
    const style = CHANNEL_STYLES[channel] ?? FALLBACK;
    const label = channelLabel[channel] ?? channel;
    return (
        <span
            className={ui.channelBadge}
            style={{ width: size, height: size, background: style.bg, color: style.fg }}
            title={label}
            aria-label={label}
            role="img"
        >
            {style.glyph(Math.round(size * 0.55))}
        </span>
    );
}
