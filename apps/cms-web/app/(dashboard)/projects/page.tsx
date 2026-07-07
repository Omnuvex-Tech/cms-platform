"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { projectStatus } from "@/lib/status";
import { relativeTime, money, range } from "@/lib/format";
import { AdminGuard } from "@/components/AdminGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { Loading, EmptyState } from "@/components/ui/States";
import ui from "@/styles/ui.module.css";

interface ProjectListItem {
    id: number;
    name: string;
    location?: string | null;
    status: string;
    pricePerM2Min?: number | null;
    pricePerM2Max?: number | null;
    totalPriceMin?: number | null;
    totalPriceMax?: number | null;
    completionYear?: number | null;
    updatedAt: string;
}

function ProjectsList() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (status) query.set("status", status);
    const qs = query.toString();

    const { data, isLoading } = useQuery({
        queryKey: ["projects", qs],
        queryFn: () => api.get<ProjectListItem[]>(`/projects${qs ? `?${qs}` : ""}`),
    });

    return (
        <div>
            <PageHeader
                title="Projects"
                subtitle="The agent's knowledge base — what the bot quotes to customers."
                actions={
                    <Link href="/projects/new" className={`${ui.btn} ${ui.btnPrimary}`}>
                        <Plus size={15} /> New project
                    </Link>
                }
            />

            <div className={ui.toolbar}>
                <div className={ui.search}>
                    <Search size={15} className={ui.searchIcon} />
                    <input
                        className={ui.searchInput}
                        placeholder="Search by name or location…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className={ui.select}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">All statuses</option>
                    {Object.keys(projectStatus).map((s) => (
                        <option key={s} value={s}>
                            {projectStatus[s]?.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={ui.card}>
                {isLoading ? (
                    <Loading />
                ) : !data || data.length === 0 ? (
                    <EmptyState
                        icon={<Building2 size={26} />}
                        title="No projects yet"
                        hint="Create your first project to populate the agent's knowledge base."
                    />
                ) : (
                    <div className={ui.tableWrap}>
                        <table className={ui.table}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Price range</th>
                                    <th>Completion</th>
                                    <th>Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((p) => (
                                    <tr key={p.id} className={ui.rowClickable}>
                                        <td>
                                            <Link
                                                href={`/projects/${p.id}`}
                                                style={{
                                                    color: "#16181d",
                                                    fontWeight: 600,
                                                    textDecoration: "none",
                                                }}
                                            >
                                                {p.name}
                                            </Link>
                                        </td>
                                        <td>{p.location ?? "—"}</td>
                                        <td>
                                            <StatusPill meta={projectStatus[p.status]} />
                                        </td>
                                        <td>
                                            {p.totalPriceMin != null
                                                ? range(p.totalPriceMin, p.totalPriceMax, money)
                                                : p.pricePerM2Min != null
                                                  ? `${range(p.pricePerM2Min, p.pricePerM2Max, money)}/m²`
                                                  : "—"}
                                        </td>
                                        <td>{p.completionYear ?? "—"}</td>
                                        <td className={ui.muted}>{relativeTime(p.updatedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <AdminGuard>
            <ProjectsList />
        </AdminGuard>
    );
}
