import styles from "@/styles/dashboardhome.module.css";

export default function HomeHeroPage() {
    return (
        <div className={styles.page}>
            <div>
                <h1 className={styles.title}>Home Hero</h1>
                <p className={styles.subtitle}>
                    Hero bolmesi ucun idareetme sehifesi hele elave olunmayib.
                </p>
            </div>
        </div>
    );
}
