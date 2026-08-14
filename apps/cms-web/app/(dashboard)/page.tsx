import styles from "@/styles/dashboardhome.module.css";
import { StatCard } from "./StatCard";

async function getDashboardStats() {
    try {
        const res = await fetch(`${process.env.API_URL}/dashboard/stats`, {
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

    const cards = [
        { label: "Layihələr",            value: stats?.project ?? "-",             addHref: "/layihelerimiz",             linkLabel: "Bax" },
        { label: "Pulse Məqalələri",     value: stats?.pulseArticle ?? "-",        addHref: "/pulse",                     linkLabel: "Əlavə et" },
        { label: "Pulse Müəllifləri",    value: stats?.pulseAuthor ?? "-",         addHref: "/pulse/authors",             linkLabel: "Əlavə et" },
        { label: "Vacancy",              value: stats?.vacancy ?? "-",             addHref: "/Vacancy",                   linkLabel: "Əlavə et" },
        { label: "Contact Submissions",  value: stats?.contactSubmission ?? "-",   addHref: "/contact-submissions",       linkLabel: "Bax" },
        { label: "Callback Requests",    value: stats?.callbackRequest ?? "-",     addHref: "/callback-requests",         linkLabel: "Bax" },
        { label: "Broker Registrations", value: stats?.brokerRegistration ?? "-",  addHref: "/broker-registrations",      linkLabel: "Bax" },
        { label: "Vacancy Submissions",  value: stats?.vacancySubmission ?? "-",   addHref: "/Vacancy/VacancySubmissions", linkLabel: "Bax" },
        { label: "Abunəçilər",           value: stats?.subscriber ?? "-",          addHref: "/pulse",                     linkLabel: "Bax" },    ];

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Dashboard</h1>
            <div className={styles.cards}>
                {cards.map((card) => (
                    <StatCard
                        key={card.label}
                        label={card.label}
                        value={card.value}
                        addHref={card.addHref}
                        linkLabel={card.linkLabel}
                    />
                ))}
            </div>
        </div>
    );
}