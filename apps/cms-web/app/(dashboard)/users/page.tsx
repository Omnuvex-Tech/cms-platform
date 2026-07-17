"use client";

import { useMemo, useState } from "react";
import {
    Search,
    Plus,
    Users as UsersIcon,
    Pencil,
    KeyRound,
    Trash2,
    UserCheck,
    UserX,
} from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { SideSheet } from "@/components/ui/SideSheet";
import { Loading, EmptyState, Avatar } from "@/components/ui/States";
import { useCurrentUser } from "@/lib/auth";
import { relativeTime, initials } from "@/lib/format";
import { ApiError } from "@/lib/api";
import type { StatusMeta } from "@/lib/status";
import {
    useUsers,
    useUserMutations,
    type User,
    type UserRole,
} from "@/lib/hooks/useUsers";
import ui from "@/styles/ui.module.css";

const roleMeta: Record<UserRole, StatusMeta> = {
    admin: { label: "Administrator", bg: "#f0e9fb", fg: "#6b3fce" },
    sales_rep: { label: "Sales rep", bg: "#e7effc", fg: "#0148c2" },
};

const activeMeta: Record<"true" | "false", StatusMeta> = {
    true: { label: "Active", bg: "#e6f6ec", fg: "#1a7f3d" },
    false: { label: "Deactivated", bg: "#eef0f3", fg: "#555b63" },
};

const PASSWORD_HINT = "At least 6 characters, with one uppercase letter and one number.";

/** Client-side mirror of the API password policy, for instant feedback. */
function passwordProblem(pw: string): string | null {
    if (pw.length < 6) return "Password must be at least 6 characters.";
    if (!/[A-Z]/.test(pw)) return "Password must contain an uppercase letter.";
    if (!/[0-9]/.test(pw)) return "Password must contain a number.";
    return null;
}

function UsersPage() {
    const me = useCurrentUser();
    const { data, isLoading } = useUsers();
    const { create, update, resetPassword, remove } = useUserMutations();

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [sheet, setSheet] = useState<
        | { mode: "create" }
        | { mode: "edit"; user: User }
        | { mode: "password"; user: User }
        | null
    >(null);

    const filtered = useMemo(() => {
        if (!data) return [];
        const q = search.trim().toLowerCase();
        return data.filter((u) => {
            if (roleFilter && u.role !== roleFilter) return false;
            if (!q) return true;
            return (
                u.email.toLowerCase().includes(q) ||
                (u.name ?? "").toLowerCase().includes(q)
            );
        });
    }, [data, search, roleFilter]);

    const closeSheet = () => setSheet(null);

    const handleToggleActive = (u: User) => {
        update.mutate({ id: u.id, input: { isActive: !u.isActive } });
    };

    const handleDelete = (u: User) => {
        if (
            !confirm(
                `Delete ${u.name || u.email}? This cannot be undone. ` +
                    `Users with assigned leads or handoffs cannot be deleted — deactivate them instead.`
            )
        )
            return;
        remove.mutate(u.id, {
            onError: (err) =>
                alert(err instanceof ApiError ? err.message : "Delete failed"),
        });
    };

    return (
        <div>
            <PageHeader
                title="Users"
                subtitle="Create and manage admins and sales reps who can sign in to the panel."
                actions={
                    <button
                        className={`${ui.btn} ${ui.btnPrimary}`}
                        onClick={() => setSheet({ mode: "create" })}
                    >
                        <Plus size={15} /> New user
                    </button>
                }
            />

            <div className={ui.toolbar}>
                <div className={ui.search}>
                    <Search size={15} className={ui.searchIcon} />
                    <input
                        className={ui.searchInput}
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className={ui.select}
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">All roles</option>
                    <option value="admin">Administrators</option>
                    <option value="sales_rep">Sales reps</option>
                </select>
            </div>

            <div className={ui.card}>
                {isLoading ? (
                    <Loading />
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={<UsersIcon size={26} />}
                        title="No users found"
                        hint="Create a user to give someone access to the panel."
                    />
                ) : (
                    <div className={ui.tableWrap}>
                        <table className={ui.table}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Last active</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u) => {
                                    const isMe = me?.id === u.id;
                                    return (
                                        <tr key={u.id}>
                                            <td>
                                                <div className={ui.avatarRow}>
                                                    <Avatar text={initials(u.name, u.email)} />
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: "#16181d" }}>
                                                            {u.name || "—"}
                                                            {isMe && (
                                                                <span className={ui.muted} style={{ fontWeight: 400 }}>
                                                                    {" "}
                                                                    (you)
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className={ui.muted} style={{ fontSize: 12 }}>
                                                            {u.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <StatusPill meta={roleMeta[u.role]} dot={false} />
                                            </td>
                                            <td>
                                                <StatusPill
                                                    meta={activeMeta[u.isActive ? "true" : "false"]}
                                                />
                                            </td>
                                            <td className={ui.muted}>
                                                {relativeTime(u.lastActivityAt)}
                                            </td>
                                            <td>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 4,
                                                        justifyContent: "flex-end",
                                                    }}
                                                >
                                                    <IconButton
                                                        title="Edit"
                                                        onClick={() => setSheet({ mode: "edit", user: u })}
                                                    >
                                                        <Pencil size={14} />
                                                    </IconButton>
                                                    <IconButton
                                                        title="Reset password"
                                                        onClick={() =>
                                                            setSheet({ mode: "password", user: u })
                                                        }
                                                    >
                                                        <KeyRound size={14} />
                                                    </IconButton>
                                                    <IconButton
                                                        title={u.isActive ? "Deactivate" : "Activate"}
                                                        disabled={isMe || update.isPending}
                                                        onClick={() => handleToggleActive(u)}
                                                    >
                                                        {u.isActive ? (
                                                            <UserX size={14} />
                                                        ) : (
                                                            <UserCheck size={14} />
                                                        )}
                                                    </IconButton>
                                                    <IconButton
                                                        title="Delete"
                                                        danger
                                                        disabled={isMe || remove.isPending}
                                                        onClick={() => handleDelete(u)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {sheet?.mode === "create" && (
                <UserFormSheet
                    mode="create"
                    onClose={closeSheet}
                    onSubmit={(input) =>
                        create.mutateAsync({
                            email: input.email,
                            password: input.password!,
                            name: input.name,
                            phone: input.phone,
                            role: input.role,
                            isActive: input.isActive,
                        }).then(closeSheet)
                    }
                    pending={create.isPending}
                />
            )}

            {sheet?.mode === "edit" && (
                <UserFormSheet
                    mode="edit"
                    user={sheet.user}
                    onClose={closeSheet}
                    onSubmit={(input) =>
                        update.mutateAsync({
                            id: sheet.user.id,
                            input: {
                                email: input.email,
                                name: input.name,
                                phone: input.phone,
                                role: input.role,
                                isActive: input.isActive,
                            },
                        }).then(closeSheet)
                    }
                    pending={update.isPending}
                />
            )}

            {sheet?.mode === "password" && (
                <ResetPasswordSheet
                    user={sheet.user}
                    onClose={closeSheet}
                    onSubmit={(password) =>
                        resetPassword
                            .mutateAsync({ id: sheet.user.id, password })
                            .then(closeSheet)
                    }
                    pending={resetPassword.isPending}
                />
            )}
        </div>
    );
}

function IconButton({
    children,
    title,
    onClick,
    disabled,
    danger,
}: {
    children: React.ReactNode;
    title: string;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
}) {
    return (
        <button
            title={title}
            aria-label={title}
            onClick={onClick}
            disabled={disabled}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.08)",
                background: "#fff",
                color: danger ? "#c0392b" : "#4b5159",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.4 : 1,
            }}
        >
            {children}
        </button>
    );
}

interface FormValues {
    email: string;
    name?: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    password?: string;
}

function UserFormSheet({
    mode,
    user,
    onClose,
    onSubmit,
    pending,
}: {
    mode: "create" | "edit";
    user?: User;
    onClose: () => void;
    onSubmit: (values: FormValues) => Promise<unknown>;
    pending: boolean;
}) {
    const [email, setEmail] = useState(user?.email ?? "");
    const [name, setName] = useState(user?.name ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [role, setRole] = useState<UserRole>(user?.role ?? "sales_rep");
    const [isActive, setIsActive] = useState(user?.isActive ?? true);
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const submit = async () => {
        setError(null);
        if (!email.trim()) {
            setError("Email is required.");
            return;
        }
        if (mode === "create") {
            const problem = passwordProblem(password);
            if (problem) {
                setError(problem);
                return;
            }
        }
        try {
            await onSubmit({
                email: email.trim(),
                name: name.trim() || undefined,
                phone: phone.trim() || undefined,
                role,
                isActive,
                password: mode === "create" ? password : undefined,
            });
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Something went wrong.");
        }
    };

    return (
        <SideSheet
            open
            onClose={onClose}
            title={mode === "create" ? "New user" : "Edit user"}
            subtitle={
                mode === "create"
                    ? "They'll sign in with the email and password you set here."
                    : user?.email
            }
        >
            {error && <div className={`${ui.banner} ${ui.bannerDanger}`}>{error}</div>}

            <Field label="Email">
                <input
                    className={ui.input}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@omnuvex.com"
                    autoComplete="off"
                />
            </Field>

            <Field label="Full name">
                <input
                    className={ui.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nurlan Aliyev"
                />
            </Field>

            <Field label="Phone">
                <input
                    className={ui.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+994 …"
                />
            </Field>

            <Field label="Role">
                <select
                    className={ui.select}
                    style={{ width: "100%" }}
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                >
                    <option value="sales_rep">Sales rep</option>
                    <option value="admin">Administrator</option>
                </select>
            </Field>

            {mode === "create" && (
                <Field label="Initial password" hint={PASSWORD_HINT}>
                    <input
                        className={ui.input}
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Set an initial password"
                        autoComplete="new-password"
                    />
                </Field>
            )}

            <label
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "#4b5159",
                    cursor: "pointer",
                    marginBottom: 4,
                }}
            >
                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                />
                Active — can sign in
            </label>

            <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
                <button
                    className={`${ui.btn} ${ui.btnPrimary}`}
                    onClick={submit}
                    disabled={pending}
                >
                    {pending
                        ? "Saving…"
                        : mode === "create"
                          ? "Create user"
                          : "Save changes"}
                </button>
                <button className={`${ui.btn} ${ui.btnGhost}`} onClick={onClose}>
                    Cancel
                </button>
            </div>
        </SideSheet>
    );
}

function ResetPasswordSheet({
    user,
    onClose,
    onSubmit,
    pending,
}: {
    user: User;
    onClose: () => void;
    onSubmit: (password: string) => Promise<unknown>;
    pending: boolean;
}) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const submit = async () => {
        setError(null);
        const problem = passwordProblem(password);
        if (problem) {
            setError(problem);
            return;
        }
        try {
            await onSubmit(password);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Something went wrong.");
        }
    };

    return (
        <SideSheet
            open
            onClose={onClose}
            title="Reset password"
            subtitle={`Set a new password for ${user.name || user.email}.`}
        >
            {error && <div className={`${ui.banner} ${ui.bannerDanger}`}>{error}</div>}

            <Field label="New password" hint={PASSWORD_HINT}>
                <input
                    className={ui.input}
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set a new password"
                    autoComplete="new-password"
                />
            </Field>

            <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
                <button
                    className={`${ui.btn} ${ui.btnPrimary}`}
                    onClick={submit}
                    disabled={pending}
                >
                    {pending ? "Saving…" : "Set password"}
                </button>
                <button className={`${ui.btn} ${ui.btnGhost}`} onClick={onClose}>
                    Cancel
                </button>
            </div>
        </SideSheet>
    );
}

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={ui.field}>
            <label className={ui.label}>{label}</label>
            {children}
            {hint && (
                <span className={ui.muted} style={{ fontSize: 12 }}>
                    {hint}
                </span>
            )}
        </div>
    );
}

export default function Page() {
    return (
        <AdminGuard>
            <UsersPage />
        </AdminGuard>
    );
}
