"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Rep {
    id: number;
    name: string | null;
    email: string;
    role: string;
}

export function useReps() {
    return useQuery({
        queryKey: ["reps"],
        queryFn: () => api.get<Rep[]>("/users?role=sales_rep"),
        staleTime: 5 * 60_000,
    });
}
