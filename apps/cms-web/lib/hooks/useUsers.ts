"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type UserRole = "admin" | "sales_rep";

export interface User {
    id: number;
    email: string;
    name: string | null;
    phone: string | null;
    role: UserRole;
    isActive: boolean;
    lastActivityAt: string | null;
}

export interface CreateUserInput {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, "password">>;

export function useUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: () => api.get<User[]>("/users"),
    });
}

export function useUserMutations() {
    const qc = useQueryClient();
    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["users"] });
        // Owner/assignee dropdowns read the same data through a separate key.
        qc.invalidateQueries({ queryKey: ["reps"] });
    };

    const create = useMutation({
        mutationFn: (input: CreateUserInput) => api.post<User>("/users", input),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ id, input }: { id: number; input: UpdateUserInput }) =>
            api.patch<User>(`/users/${id}`, input),
        onSuccess: invalidate,
    });

    const resetPassword = useMutation({
        mutationFn: ({ id, password }: { id: number; password: string }) =>
            api.patch(`/users/${id}/password`, { password }),
    });

    const remove = useMutation({
        mutationFn: (id: number) => api.delete(`/users/${id}`),
        onSuccess: invalidate,
    });

    return { create, update, resetPassword, remove };
}
