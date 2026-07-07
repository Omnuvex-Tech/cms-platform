import styles from "@/styles/dashboardhome.module.css";

export default async function DashboardPage() {
    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>
                Sistem sadeleşdirildi. Bu panel hazırda yalnız admin girişini idare edir.
            </p>
            <div className={styles.card}>
                <p className={styles.cardValue}>1</p>
                <p className={styles.cardLabel}>Aktiv admin giriş paneli</p>
            </div>
        </div>
    );
}
