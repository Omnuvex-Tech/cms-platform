"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    Search,
    Zap,
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
    hidden?: boolean;
}
const NAV_ITEMS = [
    {
        label: "Dashboard",
        href: "/",
        icon: <LayoutDashboard size={18} />,
        hidden: true,
    },
    {
        label: "Home",
        icon: <Home size={18} />,
        hidden: true,
        children: [
            { label: "Hero", href: "/home/hero" },
            { label: "Testimonials", href: "/home/testimonials" },
            { label: "Faq", href: "/home/faq" },
            { label: "Settings", href: "/home/settings" },
        ],
    },

    { label: "Service", href: "/service", icon: <Settings size={18} />, hidden: true },
    { label: "Partners", href: "/partners", icon: <Handshake size={18} />, hidden: true },
    { label: "Portfolio", href: "/portfolio", icon: <FolderOpen size={18} />, hidden: true },
    { label: "Blog", href: "/blog", icon: <FileText size={18} />, hidden: true },
    {
        label: "Pulse",
        icon: <Zap size={18} />,
        children: [
            { label: "Məqalələr", href: "/pulse" },
            { label: "Müəlliflər", href: "/pulse/authors" },
            { label: "Kateqoriyalar", href: "/pulse/categories" },
            { label: "Açar sözlər", href: "/pulse/keywords" },
            { label: "Layout", href: "/pulse/layout" },
        ],
    },
    {
        label: "Layihelerimiz",
        icon: <FolderOpen size={18} />,
        children: [
            { label: "Kateqoriyalar", href: "/layihelerimiz" },
        ],
    },
    { label: "Team", href: "/team", icon: <Users size={18} />, hidden: true },
    {
        label: "Vacancy",
        icon: <Briefcase size={18} />,
        hidden: true,
        children: [
            { label: "Vakansiyalar", href: "/Vacancy" },
            { label: "Settings", href: "/Vacancy/VacancySetting" },
            { label: "Vacancy Submissions", href: "/Vacancy/VacancySubmissions" },
        ],
    },
    { label: "About", href: "/about", icon: <Info size={18} />, hidden: true },

    {
        label: "Contact",
        icon: <Phone size={18} />,
        children: [
            { label: "Contact", href: "/contact" },
            { label: "Contact Submissions", href: "/contact-submissions" },
            { label: "Callback Requests", href: "/callback-requests" },
        ],
    },

    {
        label: "Navbar",
        href: "/navbar",
        icon: <Menu size={18} />,
        hidden: true,
    },
    {
        label: "Footer",
        href: "/footer",
        icon: <PanelsTopLeft size={18} />,
        hidden: true,
    },
    {
        label: "SEO",
        href: "/seo",
        icon: <Search size={18} />,
        hidden: true,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [openItems, setOpenItems] = useState<string[]>(["Home"]);

    const toggleItem = (label: string) => {
        setOpenItems((prev) =>
            prev.includes(label)
                ? prev.filter((i) => i !== label)
                : [...prev, label]
        );
    };

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
                {NAV_ITEMS.filter(item => !item.hidden).map((item) => (
                    <div key={item.label}>
                        {item.children ? (
                            <>
                                <button
                                    className={`${styles.navItem} ${styles.navItemDropdown} ${openItems.includes(item.label) ? styles.navItemOpen : ""}`}
                                    onClick={() => toggleItem(item.label)}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    <span className={styles.navLabel}>{item.label}</span>
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
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Çıxış</span>
                </button>
            </div>
        </aside>
    );
}