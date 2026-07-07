"use client";

import { AdminGuard } from "@/components/AdminGuard";
import { ProjectEditor } from "@/components/projects/ProjectEditor";

export default function NewProjectPage() {
    return (
        <AdminGuard>
            <ProjectEditor />
        </AdminGuard>
    );
}
