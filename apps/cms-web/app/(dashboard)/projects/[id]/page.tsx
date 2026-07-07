"use client";

import { use } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { ProjectEditor } from "@/components/projects/ProjectEditor";

export default function ProjectEditPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    return (
        <AdminGuard>
            <ProjectEditor projectId={Number(id)} />
        </AdminGuard>
    );
}
