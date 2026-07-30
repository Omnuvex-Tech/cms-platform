"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/login.module.css";
import { API_URL } from "@/lib/api";


export default function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Invalid credentials");
                return;
            }

            const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
            document.cookie = `access_token=${data.access_token}; path=/; SameSite=Lax${secureFlag}`;
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
                    <span className={styles.logo}>
                        Emla<span className={styles.logoAccent}>X</span> Agent
                    </span>
                </div>
                <h1 className={styles.title}>Admin Panel</h1>
                <p className={styles.subtitle}>Hesabınıza daxil olun</p>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            placeholder="johndoe@gmail.com"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Şifrə</label>
                        <div className={styles.passwordWrap}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={`${styles.input} ${styles.passwordInput}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className={`${styles.eyeBtn} ${showPassword ? styles.eyeOpen : ""}`}
                                onClick={() => setShowPassword(p => !p)}
                                aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
                            >
                                <svg className={styles.eyeIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <ellipse className={styles.eyeOuter} cx="12" cy="12" rx="9" ry="6" stroke="currentColor" strokeWidth="1.8" />
                                    <circle className={styles.eyePupil} cx="12" cy="12" r="2.5" fill="currentColor" />
                                    <line className={styles.eyeLine} x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
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