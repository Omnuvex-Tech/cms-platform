"use client";

import { useState } from "react";
import styles from "@/styles/login.module.css";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.logoWrap}>
                    <img src="/images/logo-svg.svg" alt="Trenders" className={styles.logo} />
                </div>
                <h1 className={styles.title}>Admin Panel</h1>
                <p className={styles.subtitle}>Hesabınıza daxil olun</p>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            placeholder="admin@trenders.az"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Şifrə</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn}>
                        Daxil ol
                    </button>
                </form>
            </div>
        </div>
    );
}