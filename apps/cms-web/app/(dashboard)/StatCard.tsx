"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/dashboardhome.module.css";

function useCountUp(target: number, duration = 1200) {
    const [count, setCount] = useState(target); // ← 0 yox, target ilə başla

    useEffect(() => {
        if (target === 0) { setCount(0); return; }
        
        setCount(0);
        
        let current = 0;
        const step = Math.ceil(target / (duration / 16));
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(current);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);

    return count;
}

interface StatCardProps {
    label: string;
    value: number | string;
    addHref: string;
    linkLabel: string;
}

export function StatCard({ label, value, addHref, linkLabel }: StatCardProps) {
    const count = useCountUp(typeof value === "number" ? value : 0);

    return (
        <div className={styles.card}>
            <p className={styles.cardValue}>
                {typeof value === "number" ? count : value}
            </p>
            <p className={styles.cardLabel}>{label}</p>
            <a
                href={addHref}
                style={{
                    marginTop: "16px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#0059ff",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    width: "fit-content",
                    padding: "5px 10px",
                    borderRadius: "20px",
                    background: "rgba(0, 89, 255, 0.07)",
                    marginLeft: "135px",
                }}
            >
                {linkLabel}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="#0059ff" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                </svg>
            </a>
        </div>
    );
}