"use client";

import { useEffect, useState } from "react";
import { getToken } from "./api";

export type Role = "admin" | "sales_rep";

export interface CurrentUser {
    id: number;
    email: string;
    role: Role;
}

function decodeToken(token: string): CurrentUser | null {
    try {
        const segment = token.split(".")[1];
        if (!segment) return null;
        const json = JSON.parse(
            atob(segment.replace(/-/g, "+").replace(/_/g, "/"))
        );
        return { id: json.sub, email: json.email, role: json.role };
    } catch {
        return null;
    }
}

/** Reads and decodes the JWT from the cookie on the client. */
export function useCurrentUser(): CurrentUser | null {
    const [user, setUser] = useState<CurrentUser | null>(null);

    useEffect(() => {
        const token = getToken();
        setUser(token ? decodeToken(token) : null);
    }, []);

    return user;
}

export function logout() {
    document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
}
