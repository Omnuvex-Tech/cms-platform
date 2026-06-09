"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/sidebar.module.css";

import {
    LayoutDashboard,
    Home,
    Settings,
    FolderOpen,
    FileText,
    Users,
    Briefcase,
    Info,
    Phone,
    Menu,
    Handshake,
    ChevronDown,
    LogOut,
    PanelsTopLeft,
} from "lucide-react";


interface NavChild {
    label: string;
    href: string;
}

interface NavItem {
    label: string;
    href?: string;
    icon: React.ReactNode;
    children?: NavChild[];
}
const NAV_ITEMS = [
    {
        label: "Dashboard",
        href: "/",
        icon: <LayoutDashboard size={18} />,
    },
    {
        label: "Home",
        icon: <Home size={18} />,
        children: [
            { label: "Hero", href: "/home/hero" },
            { label: "Testimonials", href: "/home/testimonials" },
            { label: "Faq", href: "/home/faq" },
        ],
    },

    { label: "Service", href: "/service", icon: <Settings size={18} /> },
    { label: "Partners", href: "/partners", icon: <Handshake size={18} /> },
    { label: "Portfolio", href: "/portfolio", icon: <FolderOpen size={18} /> },
    { label: "Blog", href: "/blog", icon: <FileText size={18} /> },
    { label: "Team", href: "/team", icon: <Users size={18} /> },
    {
        label: "Vacancy",
        icon: <Briefcase size={18} />,
        children: [
            { label: "Vakansiyalar", href: "/Vacancy" },
            { label: "Settings", href: "/Vacancy/VacancySetting" },
        ],
    },
    { label: "About", href: "/about", icon: <Info size={18} /> },

    {
        label: "Contact",
        icon: <Phone size={18} />,
        children: [
            { label: "Contact", href: "/contact" },
            { label: "Contact Submissions", href: "/contact-submissions" },
        ],
    },

    {
        label: "Navbar",
        href: "/navbar",
        icon: <Menu size={18} />,
    },
    {
        label: "Footer",
        href: "/footer",
        icon: <PanelsTopLeft size={18} />,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [openItems, setOpenItems] = useState<string[]>(["Home"]);

    const toggleItem = (label: string) => {
        setOpenItems((prev) =>
            prev.includes(label)
                ? prev.filter((i) => i !== label)
                : [...prev, label]
        );
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoWrap}>
                <img src="/images/logo-svg.svg" alt="Trenders" className={styles.logo} />
            </div>

            <nav className={styles.nav}>
                {NAV_ITEMS.map((item) => (
                    <div key={item.label}>
                        {item.children ? (
                            <>
                                <button
                                    className={`${styles.navItem} ${styles.navItemDropdown} ${openItems.includes(item.label) ? styles.navItemOpen : ""}`}
                                    onClick={() => toggleItem(item.label)}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    <span className={styles.navLabel}>{item.label}</span>  {/* ← əlavə et */}
                                    <ChevronDown
                                        size={14}
                                        className={`${styles.chevron} ${openItems.includes(item.label) ? styles.chevronOpen : ""}`}
                                    />
                                </button>
                                {openItems.includes(item.label) && (
                                    <div className={styles.dropdown}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={`${styles.dropdownItem} ${pathname === child.href ? styles.dropdownItemActive : ""}`}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link
                                href={item.href!}
                                className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ""}`}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                <span className={styles.navLabel}>{item.label}</span>
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            <div className={styles.logoutWrap}>
                <button className={styles.logoutBtn}>
                    <LogOut size={16} />
                    <span>Çıxış</span>
                </button>
            </div>
        </aside>
    );
}