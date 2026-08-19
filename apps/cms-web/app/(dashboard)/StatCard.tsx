"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "@/styles/dashboardhome.module.css";

/** Counts up to `target` over `duration`. Renders the final value immediately
 *  when the user asks for reduced motion, or when there is nothing to count. */
function useCountUp(target: number | null, duration = 700) {
    const [count, setCount] = useState(target ?? 0);

    useEffect(() => {
        if (target === null) return;

        const reduced =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reduced || target <= 0) {
            setCount(target);
            return;
        }

        let frame = 0;
        const start = performance.now();

        const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            // easeOutCubic — fast first, settles rather than stopping dead.
            const eased = 1 - Math.pow(1 - t, 3);
            setCount(Math.round(target * eased));
            if (t < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return count;
}

interface StatCardProps {
    label: string;
    value: number | string;
    addHref: string;
    linkLabel: string;
    icon?: React.ReactNode;
}

export function StatCard({ label, value, addHref, linkLabel, icon }: StatCardProps) {
    const isNumber = typeof value === "number";
    const count = useCountUp(isNumber ? value : null);

    return (
        <Link href={addHref} className={styles.card}>
            {icon && <span className={styles.cardIcon}>{icon}</span>}

            <span
                className={`${styles.cardValue} ${isNumber ? "" : styles.cardValueEmpty}`}
            >
                {isNumber ? count.toLocaleString("az-AZ") : value}
            </span>
            <span className={styles.cardLabel}>{label}</span>

            <span className={styles.cardFoot}>
                {linkLabel}
                <span className={styles.cardArrow} aria-hidden="true">
                    <ArrowRight size={14} strokeWidth={2.2} />
                </span>
            </span>
        </Link>
    );
}
