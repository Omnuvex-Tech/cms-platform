import { Sidebar } from "@/components/Sidebar/sidebar";
import styles from "@/styles/dashboard.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.layout}>
            <Sidebar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}