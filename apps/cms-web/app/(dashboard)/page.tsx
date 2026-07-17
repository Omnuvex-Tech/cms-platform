"use client";

import Link from "next/link";
import styles from "@/styles/dashboardhome.module.css";
import { useCurrentUser } from "@/lib/auth";
import { useBadges } from "@/lib/hooks/useBadges";
import {
    Building2,
    Info,
    MessagesSquare,
    LifeBuoy,
    PhoneCall,
    Users,
    ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
    const user = useCurrentUser();
    const { data: badges } = useBadges();

    const cards = [
        {
            label: "Conversations needing attention",
            value: badges?.conversations ?? 0,
            href: "/conversations",
            icon: <MessagesSquare size={20} />,
        },
        {
            label: "Open handoffs",
            value: badges?.handoffs ?? 0,
            href: "/handoffs",
            icon: <LifeBuoy size={20} />,
        },
        {
            label: "Open contact requests",
            value: badges?.contactRequests ?? 0,
            href: "/contact-requests",
            icon: <PhoneCall size={20} />,
            danger: (badges?.contactRequestsOverdue ?? 0) > 0,
            note:
                (badges?.contactRequestsOverdue ?? 0) > 0
                    ? `${badges?.contactRequestsOverdue} overdue`
                    : undefined,
        },
        {
            label: "New leads",
            value: badges?.leads ?? 0,
            href: "/leads",
            icon: <Users size={20} />,
        },
    ];

    const links = [
        { label: "Conversations", href: "/conversations", icon: <MessagesSquare size={18} /> },
        { label: "Escalations", href: "/handoffs", icon: <LifeBuoy size={18} /> },
        { label: "Contact Requests", href: "/contact-requests", icon: <PhoneCall size={18} /> },
        { label: "Leads", href: "/leads", icon: <Users size={18} /> },
        ...(user?.role === "admin"
            ? [
                  { label: "Projects", href: "/projects", icon: <Building2 size={18} /> },
                  { label: "TREVA Information", href: "/treva-information", icon: <Info size={18} /> },
              ]
            : []),
    ];

    return (
        <div className={styles.page}>
            <div>
                <h1 className={styles.title}>Sales Operations</h1>
                <p className={styles.subtitle}>
                    Welcome back. Here’s where work is piling up right now.
                </p>
            </div>

            <div className={styles.cards}>
                {cards.map((c) => (
                    <Link
                        key={c.label}
                        href={c.href}
                        className={styles.card}
                        style={{ textDecoration: "none" }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                color: c.danger ? "#c0392b" : "#0148c2",
                            }}
                        >
                            {c.icon}
                            <ArrowRight size={16} color="#b8bec6" />
                        </div>
                        <p
                            className={styles.cardValue}
                            style={c.danger ? { color: "#c0392b" } : undefined}
                        >
                            {c.value}
                        </p>
                        <p className={styles.cardLabel}>{c.label}</p>
                        {c.note && (
                            <p
                                style={{
                                    marginTop: 6,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#c0392b",
                                }}
                            >
                                {c.note}
                            </p>
                        )}
                    </Link>
                ))}
            </div>

            <div>
                <h2
                    style={{
                        fontFamily: "Poppins",
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#4b5159",
                        marginBottom: 14,
                    }}
                >
                    Jump to a module
                </h2>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {links.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "10px 16px",
                                background: "#fff",
                                border: "1px solid rgba(0,0,0,0.08)",
                                borderRadius: 12,
                                color: "#2a2d33",
                                fontFamily: "Poppins",
                                fontSize: 13.5,
                                fontWeight: 500,
                                textDecoration: "none",
                            }}
                        >
                            <span style={{ color: "#0148c2" }}>{l.icon}</span>
                            {l.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
