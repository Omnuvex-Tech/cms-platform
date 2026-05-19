import styles from "@/styles/dashboardhome.module.css";

export default function DashboardPage() {
    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Hi, Admin !</p>
            <div className={styles.cards}>
                {[
                    { label: "Blog Yazıları", value: "12" },
                    { label: "Vakansiyalar", value: "6" },
                    { label: "Portfolio", value: "24" },
                    { label: "Komanda", value: "8" },
                ].map((card) => (
                    <div key={card.label} className={styles.card}>
                        <p className={styles.cardValue}>{card.value}</p>
                        <p className={styles.cardLabel}>{card.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}