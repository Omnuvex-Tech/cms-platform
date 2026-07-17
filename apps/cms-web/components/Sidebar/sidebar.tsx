"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/styles/sidebar.module.css";
import { useCurrentUser, logout } from "@/lib/auth";
import { useBadges } from "@/lib/hooks/useBadges";

import {
    LayoutDashboard,
    Building2,
    Info,
    MessagesSquare,
    LifeBuoy,
    PhoneCall,
    Users,
    UserCog,
    LogOut,
} from "lucide-react";

type BadgeKey =
    | "conversations"
    | "handoffs"
    | "contactRequests"
    | "leads"
    | null;

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
    badge?: BadgeKey;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
    { label: "Projects", href: "/projects", icon: <Building2 size={18} />, adminOnly: true },
    { label: "TREVA Information", href: "/treva-information", icon: <Info size={18} />, adminOnly: true },
    { label: "Users", href: "/users", icon: <UserCog size={18} />, adminOnly: true },
    { label: "Conversations", href: "/conversations", icon: <MessagesSquare size={18} />, badge: "conversations" },
    { label: "Escalations", href: "/handoffs", icon: <LifeBuoy size={18} />, badge: "handoffs" },
    { label: "Contact Requests", href: "/contact-requests", icon: <PhoneCall size={18} />, badge: "contactRequests" },
    { label: "Leads", href: "/leads", icon: <Users size={18} />, badge: "leads" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const user = useCurrentUser();
    const { data: badges } = useBadges();

    const handleLogout = () => {
        logout();
        router.replace("/login");
        router.refresh();
    };

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    const visibleItems = NAV_ITEMS.filter(
        (item) => !item.adminOnly || user?.role === "admin"
    );

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoWrap}>
                <img src="/images/logo-svg.svg" alt="TREVA" className={styles.logo} />
            </div>

            <nav className={styles.nav}>
                {visibleItems.map((item, index) => {
                    const count = item.badge ? badges?.[item.badge] ?? 0 : 0;
                    const overdue =
                        item.badge === "contactRequests" &&
                        (badges?.contactRequestsOverdue ?? 0) > 0;
                    const prevItem = visibleItems[index - 1];
                    const showSeparator =
                        prevItem != null && !prevItem.badge && !!item.badge;
                    return (
                        <React.Fragment key={item.label}>
                            {showSeparator && <div className={styles.navSeparator} />}
                            <Link
                                href={item.href}
                                className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ""}`}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                <span className={styles.navLabel}>{item.label}</span>
                                {item.badge && count > 0 && (
                                    <span
                                        className={`${styles.badge} ${overdue ? styles.badgeDanger : ""}`}
                                    >
                                        {count}
                                    </span>
                                )}
                            </Link>
                        </React.Fragment>
                    );
                })}
            </nav>

            <div className={styles.logoutWrap}>
                {user && (
                    <div className={styles.userRow}>
                        <div className={styles.userAvatar}>
                            {user.email[0]?.toUpperCase()}
                        </div>
                        <div className={styles.userMeta}>
                            <span className={styles.userEmail}>{user.email}</span>
                            <span className={styles.userRole}>
                                {user.role === "admin" ? "Administrator" : "Sales rep"}
                            </span>
                        </div>
                    </div>
                )}
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Log out</span>
                </button>
            </div>
        </aside>
    );
}
