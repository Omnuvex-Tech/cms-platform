"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/auth";
import { Loading } from "@/components/ui/States";

/**
 * Client guard for admin-only screens (Projects, TREVA Information).
 * The sidebar already hides these links for reps; this stops direct URL access.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const user = useCurrentUser();

    useEffect(() => {
        if (user && user.role !== "admin") {
            router.replace("/");
        }
    }, [user, router]);

    if (!user) return <Loading />;
    if (user.role !== "admin") return <Loading label="Redirecting…" />;

    return <>{children}</>;
}
