"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Badges {
    conversations: number;
    handoffs: number;
    contactRequests: number;
    contactRequestsOverdue: number;
    leads: number;
}

export function useBadges() {
    return useQuery({
        queryKey: ["badges"],
        queryFn: () => api.get<Badges>("/stats/badges"),
        refetchInterval: 30_000,
    });
}
