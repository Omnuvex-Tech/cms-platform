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
        { label: "Blog",                 value: stats?.blog ?? "-",                addHref: "/blog",                  linkLabel: "Əlavə et" },
        { label: "Service",              value: stats?.service ?? "-",             addHref: "/service",               linkLabel: "Əlavə et" },
        { label: "Vacancy",              value: stats?.vacancy ?? "-",             addHref: "/Vacancy",               linkLabel: "Əlavə et" },
        { label: "Portfolio",            value: stats?.portfolio ?? "-",           addHref: "/portfolio",             linkLabel: "Əlavə et" },
        { label: "Team",                 value: stats?.team ?? "-",               addHref: "/team",                      linkLabel: "Bax" },
        { label: "Contact Submissions",  value: stats?.contactSubmission ?? "-",   addHref: "/contact-submissions",       linkLabel: "Bax" },
        { label: "Vacancy Submissions",  value: stats?.vacancySubmission ?? "-",   addHref: "/Vacancy/VacancySubmissions",       linkLabel: "Bax" },
    ];

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