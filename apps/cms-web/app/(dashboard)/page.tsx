import { cookies } from "next/headers";
import {
    FolderOpen,
    Zap,
    Users,
    Briefcase,
    MessageSquare,
    PhoneCall,
    UserPlus,
    FileText,
    Mail,
} from "lucide-react";
import styles from "@/styles/dashboardhome.module.css";
import { StatCard } from "./StatCard";

/** The stats endpoint is guarded, so the token has to travel with the request.
 *  This mirrors lib/api.ts, which reads the same cookie on the client. */
async function getDashboardStats() {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return null;

    const token = (await cookies()).get("access_token")?.value;
    if (!token) return null;

    try {
        const res = await fetch(`${base}/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    const content = [
        { label: "Layihələr",         value: stats?.project      ?? "—", addHref: "/layihelerimiz",  linkLabel: "Bax",       icon: <FolderOpen size={17} /> },
        { label: "Pulse Məqalələri",  value: stats?.pulseArticle ?? "—", addHref: "/pulse",          linkLabel: "Əlavə et",  icon: <Zap size={17} /> },
        { label: "Pulse Müəllifləri", value: stats?.pulseAuthor  ?? "—", addHref: "/pulse/authors",  linkLabel: "Əlavə et",  icon: <Users size={17} /> },
        { label: "Vakansiyalar",      value: stats?.vacancy      ?? "—", addHref: "/Vacancy",        linkLabel: "Əlavə et",  icon: <Briefcase size={17} /> },
    ];

    const inbox = [
        { label: "Contact Submissions",  value: stats?.contactSubmission   ?? "—", addHref: "/contact-submissions",       linkLabel: "Bax", icon: <MessageSquare size={17} /> },
        { label: "Callback Requests",    value: stats?.callbackRequest     ?? "—", addHref: "/callback-requests",         linkLabel: "Bax", icon: <PhoneCall size={17} /> },
        { label: "Broker Registrations", value: stats?.brokerRegistration  ?? "—", addHref: "/broker-registrations",      linkLabel: "Bax", icon: <UserPlus size={17} /> },
        { label: "Vacancy Submissions",  value: stats?.vacancySubmission   ?? "—", addHref: "/Vacancy/VacancySubmissions", linkLabel: "Bax", icon: <FileText size={17} /> },
        { label: "Abunəçilər",           value: stats?.subscriber          ?? "—", addHref: "/pulse",                     linkLabel: "Bax", icon: <Mail size={17} /> },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.head}>
                <div>
                    <h1 className={styles.title}>Dashboard</h1>
                    <p className={styles.subtitle}>
                        {stats
                            ? "Saytın məzmunu və daxil olan müraciətlərə ümumi baxış."
                            : "Statistika hazırda yüklənmədi — məzmun bölmələri işləkdir."}
                    </p>
                </div>
            </div>

            <p className={styles.sectionLabel}>Məzmun</p>
            <div className={styles.cards}>
                {content.map((card) => (
                    <StatCard key={card.label} {...card} />
                ))}
            </div>

            <p className={styles.sectionLabel}>Müraciətlər</p>
            <div className={styles.cards}>
                {inbox.map((card) => (
                    <StatCard key={card.label} {...card} />
                ))}
            </div>
        </div>
    );
}
