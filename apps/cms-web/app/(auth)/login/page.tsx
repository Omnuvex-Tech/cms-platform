"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/login.module.css";

export default function LoginPage() {
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
          console.log("API URL:", process.env.NEXT_PUBLIC_API_URL); // ← bura
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Invalid credentials");
                return;
            }

            document.cookie = `access_token=${data.access_token}; path=/`;
            router.push("/");
        } catch {
            setError("Serverlə əlaqə qurmaq mümkün olmadı");
        } finally {
            setLoading(false);
        }
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
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? "Yüklənir..." : "Daxil ol"}
                    </button>
                </form>
            </div>
        </div>
    );
}