"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/styles/sidebar.module.css";

import {
    LayoutDashboard,
    LogOut,
} from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const NAV_ITEMS = [
    {
        label: "Dashboard",
        href: "/",
        icon: <LayoutDashboard size={18} />,
    },
] satisfies NavItem[];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        router.replace("/login");
        router.refresh();
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoWrap}>
                <img src="/images/logo-svg.svg" alt="Trenders" className={styles.logo} />
            </div>

            <nav className={styles.nav}>
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ""}`}
                    >
                        <span className={styles.navIcon}>{item.icon}</span>
                        <span className={styles.navLabel}>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className={styles.logoutWrap}>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Çıxış</span>
                </button>
            </div>
        </aside>
    );
}
