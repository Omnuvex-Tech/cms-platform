"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ChevronDown,
    Save,
    Send,
    Archive,
    Trash2,
    Plus,
    Copy,
    X,
    CheckCircle2,
    AlertTriangle,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { projectStatus, projectTags, projectAudience } from "@/lib/status";
import { money, range } from "@/lib/format";
import { StatusPill } from "@/components/ui/StatusPill";
import { Loading } from "@/components/ui/States";
import { Markdown } from "@/components/ui/Markdown";
import ui from "@/styles/ui.module.css";
import styles from "@/styles/projects.module.css";

interface BedroomRow {
    label: string;
    areaMin?: number | null;
    areaMax?: number | null;
    priceMin?: number | null;
    priceMax?: number | null;
    note?: string | null;
}
interface StdPlan {
    downPaymentPct?: number | null;
    discountPct?: number | null;
    installmentMonths?: number | null;
    optionDiscountPct?: number | null;
}
interface IntlTier {
    downPaymentPct?: number | null;
    discountPct?: number | null;
    interestFreeMonths?: number | null;
}
interface ProjectForm {
    name: string;
    slug: string;
    location: string;
    latitude?: number | null;
    longitude?: number | null;
    status: string;
    tags: string[];
    /** "" = not set here, i.e. leave whatever the bot already has. */
    audience: string;
    aboutProject: string;
    advantages: string;
    targetAudience: string;
    investmentAdvantages: string;
    services: string;
    pricePerM2Min?: number | null;
    pricePerM2Max?: number | null;
    areaMin?: number | null;
    areaMax?: number | null;
    totalPriceMin?: number | null;
    totalPriceMax?: number | null;
    readyToMoveIn: boolean;
    completionYear?: number | null;
    handoverCondition: string;
    paymentPlanAvailable: boolean;
    bulkDiscountAvailable: boolean;
    bedroomPricing: BedroomRow[];
    standardPlans: StdPlan[];
    internationalTiers: IntlTier[];
}

const EMPTY: ProjectForm = {
    name: "",
    slug: "",
    location: "",
    status: "draft",
    tags: [],
    audience: "",
    aboutProject: "",
    advantages: "",
    targetAudience: "",
    investmentAdvantages: "",
    services: "",
    readyToMoveIn: false,
    handoverCondition: "",
    paymentPlanAvailable: false,
    bulkDiscountAvailable: false,
    bedroomPricing: [],
    standardPlans: [],
    internationalTiers: [],
};

const DESC_FIELDS: { key: keyof ProjectForm; label: string }[] = [
    { key: "aboutProject", label: "About Project" },
    { key: "advantages", label: "Project Advantages" },
    { key: "targetAudience", label: "Target Audience" },
    { key: "investmentAdvantages", label: "Investment Advantages" },
    { key: "services", label: "Services" },
];

/** `issues` block publishing; `warnings` don't — the project publishes, it just
 * reaches fewer customers than the admin probably intends. */
interface Validation {
    ready: boolean;
    issues: string[];
    warnings?: string[];
}

const num = (v: string): number | null => (v === "" ? null : Number(v));

export function ProjectEditor({ projectId }: { projectId?: number }) {
    const router = useRouter();
    const qc = useQueryClient();
    const isNew = projectId == null;

    const { data: loaded, isLoading } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => api.get<ProjectForm & { id: number }>(`/projects/${projectId}`),
        enabled: !isNew,
    });

    const [form, setForm] = useState<ProjectForm>(EMPTY);
    const [dirty, setDirty] = useState(false);
    const [validation, setValidation] = useState<Validation | null>(null);

    useEffect(() => {
        if (loaded) {
            setForm({
                ...EMPTY,
                ...loaded,
                slug: loaded.slug ?? "",
                location: loaded.location ?? "",
                tags: loaded.tags ?? [],
                audience: loaded.audience ?? "",
                aboutProject: loaded.aboutProject ?? "",
                advantages: loaded.advantages ?? "",
                targetAudience: loaded.targetAudience ?? "",
                investmentAdvantages: loaded.investmentAdvantages ?? "",
                services: loaded.services ?? "",
                handoverCondition: loaded.handoverCondition ?? "",
                bedroomPricing: loaded.bedroomPricing ?? [],
                standardPlans: loaded.standardPlans ?? [],
                internationalTiers: loaded.internationalTiers ?? [],
            });
            setDirty(false);
        }
    }, [loaded]);

    const set = <K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
        setDirty(true);
    };

    const save = useMutation({
        mutationFn: (status?: string) => {
            const payload = {
                ...form,
                // "" is the editor's "not set"; the API takes null for it.
                audience: form.audience || null,
                ...(status ? { status } : {}),
            };
            return isNew
                ? api.post<{ id: number }>("/projects", payload)
                : api.patch<{ id: number }>(`/projects/${projectId}`, payload);
        },
        onSuccess: (res) => {
            setDirty(false);
            qc.invalidateQueries({ queryKey: ["projects"] });
            if (isNew && res?.id) {
                router.replace(`/projects/${res.id}`);
            } else {
                qc.invalidateQueries({ queryKey: ["project", projectId] });
            }
        },
    });

    const publish = useMutation({
        mutationFn: async () => {
            // Persist edits first, then publish.
            await save.mutateAsync(undefined);
            return api.post<Validation & { published: boolean }>(
                `/projects/${projectId}/publish`
            );
        },
        onSuccess: (res) => {
            if (!res.published) {
                setValidation({ ready: false, issues: res.issues, warnings: res.warnings });
            } else {
                setValidation({ ready: true, issues: [], warnings: res.warnings });
                setForm((f) => ({ ...f, status: "published" }));
                qc.invalidateQueries({ queryKey: ["project", projectId] });
                qc.invalidateQueries({ queryKey: ["projects"] });
            }
        },
    });

    const checkReadiness = useMutation({
        mutationFn: () => api.get<Validation>(`/projects/${projectId}/validate`),
        onSuccess: (res) => setValidation(res),
    });

    const archive = useMutation({
        mutationFn: () => api.post(`/projects/${projectId}/archive`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["projects"] });
            router.push("/projects");
        },
    });

    const remove = useMutation({
        mutationFn: () => api.delete(`/projects/${projectId}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["projects"] });
            router.push("/projects");
        },
    });

    if (!isNew && isLoading) return <Loading />;

    return (
        <div>
            <div className={ui.pageHeader}>
                <div className={ui.pageTitleWrap}>
                    <Link href="/projects" className={styles.back}>
                        <ArrowLeft size={15} /> Projects
                    </Link>
                    <h1 className={ui.pageTitle}>
                        {form.name || (isNew ? "New project" : "Untitled project")}
                    </h1>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <StatusPill meta={projectStatus[form.status]} />
                        {dirty && <span className={styles.unsaved}>● Unsaved changes</span>}
                    </div>
                </div>
                <div className={ui.pageActions}>
                    {!isNew && form.status !== "archived" && (
                        <button
                            className={`${ui.btn} ${ui.btnGhost}`}
                            onClick={() => {
                                if (confirm("Archive this project? It will be hidden from the agent.")) {
                                    archive.mutate();
                                }
                            }}
                        >
                            <Archive size={15} /> Archive
                        </button>
                    )}
                    {!isNew && (
                        <button
                            className={`${ui.btn} ${ui.btnDanger}`}
                            onClick={() => {
                                if (confirm("Delete this project permanently? This cannot be undone.")) {
                                    remove.mutate();
                                }
                            }}
                        >
                            <Trash2 size={15} /> Delete
                        </button>
                    )}
                    <button
                        className={`${ui.btn} ${ui.btnGhost}`}
                        disabled={save.isPending}
                        onClick={() => save.mutate("draft")}
                    >
                        <Save size={15} /> Save draft
                    </button>
                    <button
                        className={`${ui.btn} ${ui.btnPrimary}`}
                        disabled={isNew || publish.isPending || save.isPending}
                        title={isNew ? "Save the project first" : undefined}
                        onClick={() => publish.mutate()}
                    >
                        <Send size={15} /> Publish
                    </button>
                </div>
            </div>

            {save.isError && (
                <div className={`${ui.banner} ${ui.bannerDanger}`}>
                    <AlertTriangle size={16} />
                    {(save.error as ApiError)?.message ?? "Save failed"}
                </div>
            )}

            {validation && (
                <div
                    className={`${ui.banner} ${validation.ready ? styles.bannerOk : ui.bannerDanger}`}
                >
                    {validation.ready ? (
                        <>
                            <CheckCircle2 size={16} /> Ready to publish.
                        </>
                    ) : (
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <AlertTriangle size={16} />
                                {validation.issues.length} field
                                {validation.issues.length === 1 ? "" : "s"} need attention:
                            </div>
                            <ul style={{ margin: "6px 0 0 26px" }}>
                                {validation.issues.map((i, idx) => (
                                    <li key={idx}>{i}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Separate banner: warnings don't block, so they survive alongside
                both "ready to publish" and the blocking-issues list. */}
            {validation && validation.warnings && validation.warnings.length > 0 && (
                <div className={`${ui.banner} ${styles.bannerWarn}`}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <AlertTriangle size={16} /> Worth a look — this doesn’t block
                            publishing:
                        </div>
                        <ul style={{ margin: "6px 0 0 26px" }}>
                            {validation.warnings.map((w, idx) => (
                                <li key={idx}>{w}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className={styles.split}>
                {/* Editor */}
                <div className={styles.editorCol}>
                    <Section title="Basics" defaultOpen>
                        <div className={ui.field}>
                            <label className={ui.label}>Project name</label>
                            <input
                                className={ui.input}
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                            />
                        </div>
                        <div className={styles.row2}>
                            <div className={ui.field}>
                                <label className={ui.label}>Slug</label>
                                <input
                                    className={ui.input}
                                    value={form.slug}
                                    onChange={(e) => set("slug", e.target.value)}
                                />
                            </div>
                            <div className={ui.field}>
                                <label className={ui.label}>Status</label>
                                <select
                                    className={ui.select}
                                    style={{ width: "100%" }}
                                    value={form.status}
                                    onChange={(e) => set("status", e.target.value)}
                                >
                                    {Object.keys(projectStatus).map((s) => (
                                        <option key={s} value={s}>
                                            {projectStatus[s]?.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className={ui.field}>
                            <label className={ui.label}>Location</label>
                            <input
                                className={ui.input}
                                value={form.location}
                                onChange={(e) => set("location", e.target.value)}
                            />
                        </div>
                        <div className={styles.row2}>
                            <NumField
                                label="Latitude"
                                value={form.latitude}
                                onChange={(v) => set("latitude", v)}
                            />
                            <NumField
                                label="Longitude"
                                value={form.longitude}
                                onChange={(v) => set("longitude", v)}
                            />
                        </div>
                    </Section>

                    <Section title="Tags & targeting" defaultOpen>
                        <div className={ui.field}>
                            <label className={ui.label}>Tags</label>
                            <div className={styles.tagPicker}>
                                {Object.keys(projectTags).map((t) => {
                                    const on = form.tags.includes(t);
                                    return (
                                        <button
                                            key={t}
                                            type="button"
                                            className={`${styles.tagToggle} ${on ? styles.tagToggleOn : ""}`}
                                            aria-pressed={on}
                                            onClick={() =>
                                                set(
                                                    "tags",
                                                    on
                                                        ? form.tags.filter((x) => x !== t)
                                                        : [...form.tags, t]
                                                )
                                            }
                                        >
                                            {projectTags[t]?.label ?? t}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className={styles.hint}>
                                When the agent introduces the portfolio it shows one project
                                per tag, so an untagged project can miss that intro entirely.
                            </p>
                        </div>
                        <div className={ui.field}>
                            <label className={ui.label}>Audience</label>
                            <select
                                className={ui.select}
                                style={{ width: "100%" }}
                                value={form.audience}
                                onChange={(e) => set("audience", e.target.value)}
                            >
                                <option value="">Not set</option>
                                {Object.keys(projectAudience).map((a) => (
                                    <option key={a} value={a}>
                                        {projectAudience[a]?.label}
                                    </option>
                                ))}
                            </select>
                            <p className={styles.hint}>
                                “Investment” hides this project from customers buying somewhere
                                to live. “Accommodation” still reaches investors, just ranked
                                below the investment-angled projects. Left unset, the agent keeps
                                whatever it already has for this project (treating it as mixed
                                if it has none).
                            </p>
                        </div>
                    </Section>

                    <Section title="Description">
                        {DESC_FIELDS.map((f) => (
                            <div className={ui.field} key={f.key}>
                                <label className={ui.label}>{f.label}</label>
                                <textarea
                                    className={ui.textarea}
                                    value={(form[f.key] as string) ?? ""}
                                    onChange={(e) => set(f.key, e.target.value as never)}
                                    placeholder="Markdown supported"
                                />
                            </div>
                        ))}
                    </Section>

                    <Section title="Metadata & pricing">
                        <div className={styles.row2}>
                            <NumField label="Price/m² min" value={form.pricePerM2Min} onChange={(v) => set("pricePerM2Min", v)} />
                            <NumField label="Price/m² max" value={form.pricePerM2Max} onChange={(v) => set("pricePerM2Max", v)} />
                            <NumField label="Area min (m²)" value={form.areaMin} onChange={(v) => set("areaMin", v)} />
                            <NumField label="Area max (m²)" value={form.areaMax} onChange={(v) => set("areaMax", v)} />
                            <NumField label="Total price min" value={form.totalPriceMin} onChange={(v) => set("totalPriceMin", v)} />
                            <NumField label="Total price max" value={form.totalPriceMax} onChange={(v) => set("totalPriceMax", v)} />
                            <NumField label="Completion year" value={form.completionYear} onChange={(v) => set("completionYear", v)} />
                        </div>
                        <div className={ui.field}>
                            <label className={ui.label}>Handover condition</label>
                            <input
                                className={ui.input}
                                value={form.handoverCondition}
                                onChange={(e) => set("handoverCondition", e.target.value)}
                            />
                        </div>
                        <div className={styles.checks}>
                            <Check label="Ready to move in" checked={form.readyToMoveIn} onChange={(v) => set("readyToMoveIn", v)} />
                            <Check label="Payment plan available" checked={form.paymentPlanAvailable} onChange={(v) => set("paymentPlanAvailable", v)} />
                            <Check label="Bulk discount available" checked={form.bulkDiscountAvailable} onChange={(v) => set("bulkDiscountAvailable", v)} />
                        </div>
                    </Section>

                    <Section title="Bedroom pricing">
                        <RowTable
                            rows={form.bedroomPricing as unknown as Record<string, unknown>[]}
                            columns={[
                                { key: "label", label: "Label", type: "text" },
                                { key: "areaMin", label: "Area min", type: "num" },
                                { key: "areaMax", label: "Area max", type: "num" },
                                { key: "priceMin", label: "Price min", type: "num" },
                                { key: "priceMax", label: "Price max", type: "num" },
                                { key: "note", label: "Note", type: "text" },
                            ]}
                            onChange={(rows) =>
                                set("bedroomPricing", rows as unknown as BedroomRow[])
                            }
                            makeEmpty={() => ({ label: "" })}
                        />
                    </Section>

                    <Section title="Standard payment plans">
                        <RowTable
                            rows={form.standardPlans as unknown as Record<string, unknown>[]}
                            columns={[
                                { key: "downPaymentPct", label: "Down %", type: "num" },
                                { key: "discountPct", label: "Discount %", type: "num" },
                                { key: "installmentMonths", label: "Months", type: "num" },
                                { key: "optionDiscountPct", label: "Option disc. %", type: "num" },
                            ]}
                            onChange={(rows) =>
                                set("standardPlans", rows as unknown as StdPlan[])
                            }
                            makeEmpty={() => ({})}
                        />
                    </Section>

                    <Section title="International plan tiers">
                        <RowTable
                            rows={form.internationalTiers as unknown as Record<string, unknown>[]}
                            columns={[
                                { key: "downPaymentPct", label: "Down %", type: "num" },
                                { key: "discountPct", label: "Discount %", type: "num" },
                                { key: "interestFreeMonths", label: "Interest-free months", type: "num" },
                            ]}
                            onChange={(rows) =>
                                set("internationalTiers", rows as unknown as IntlTier[])
                            }
                            makeEmpty={() => ({})}
                        />
                        {!isNew && (
                            <button
                                className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                                style={{ marginTop: 12 }}
                                disabled={checkReadiness.isPending}
                                onClick={() => checkReadiness.mutate()}
                            >
                                Check readiness to publish
                            </button>
                        )}
                    </Section>
                </div>

                {/* Live preview */}
                <div className={styles.previewCol}>
                    <div className={styles.previewLabel}>Live preview</div>
                    <div className={ui.card} style={{ padding: 22 }}>
                        <h2 className={styles.pvName}>{form.name || "Untitled project"}</h2>
                        <div className={styles.pvMeta}>
                            <StatusPill meta={projectStatus[form.status]} />
                            {form.location && <span>{form.location}</span>}
                            {form.completionYear && <span>· {form.completionYear}</span>}
                            {form.readyToMoveIn && <span>· Ready to move in</span>}
                        </div>

                        {(form.tags.length > 0 || form.audience) && (
                            <div className={styles.tagList} style={{ marginBottom: 16 }}>
                                {form.tags.map((t) => (
                                    <StatusPill key={t} meta={projectTags[t]} dot={false} />
                                ))}
                                {form.audience && (
                                    <StatusPill
                                        meta={projectAudience[form.audience]}
                                        dot={false}
                                    />
                                )}
                            </div>
                        )}

                        <div className={styles.pvStats}>
                            <div>
                                <span className={styles.pvStatLabel}>Total price</span>
                                <span className={styles.pvStatVal}>
                                    {range(form.totalPriceMin, form.totalPriceMax, money)}
                                </span>
                            </div>
                            <div>
                                <span className={styles.pvStatLabel}>Price / m²</span>
                                <span className={styles.pvStatVal}>
                                    {range(form.pricePerM2Min, form.pricePerM2Max, money)}
                                </span>
                            </div>
                            <div>
                                <span className={styles.pvStatLabel}>Area</span>
                                <span className={styles.pvStatVal}>
                                    {range(form.areaMin, form.areaMax)} m²
                                </span>
                            </div>
                        </div>

                        {DESC_FIELDS.map(
                            (f) =>
                                (form[f.key] as string)?.trim() && (
                                    <div key={f.key} style={{ marginBottom: 14 }}>
                                        <div className={styles.pvHeading}>{f.label}</div>
                                        <div className={styles.pvBody}>
                                            <Markdown text={form[f.key] as string} />
                                        </div>
                                    </div>
                                )
                        )}

                        {form.bedroomPricing.length > 0 && (
                            <div style={{ marginBottom: 14 }}>
                                <div className={styles.pvHeading}>Bedroom pricing</div>
                                <table className={styles.pvTable}>
                                    <tbody>
                                        {form.bedroomPricing.map((b, i) => (
                                            <tr key={i}>
                                                <td>{b.label || "—"}</td>
                                                <td>{range(b.areaMin, b.areaMax)} m²</td>
                                                <td>{range(b.priceMin, b.priceMax, money)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {form.standardPlans.length > 0 && (
                            <div>
                                <div className={styles.pvHeading}>Payment plans</div>
                                {form.standardPlans.map((p, i) => (
                                    <div key={i} className={styles.pvPlan}>
                                        {p.downPaymentPct ?? "—"}% down · {p.discountPct ?? 0}%
                                        discount · {p.installmentMonths ?? "—"} months
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---- sub-components ---- */

function Section({
    title,
    defaultOpen = false,
    children,
}: {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className={styles.section}>
            <button className={styles.sectionHead} onClick={() => setOpen((o) => !o)}>
                <span>{title}</span>
                <ChevronDown
                    size={16}
                    style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }}
                />
            </button>
            {open && <div className={styles.sectionBody}>{children}</div>}
        </div>
    );
}

function NumField({
    label,
    value,
    onChange,
}: {
    label: string;
    value?: number | null;
    onChange: (v: number | null) => void;
}) {
    return (
        <div className={ui.field}>
            <label className={ui.label}>{label}</label>
            <input
                className={ui.input}
                type="number"
                value={value ?? ""}
                onChange={(e) => onChange(num(e.target.value))}
            />
        </div>
    );
}

function Check({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className={styles.check}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            {label}
        </label>
    );
}

interface Column {
    key: string;
    label: string;
    type: "text" | "num";
}
function RowTable({
    rows,
    columns,
    onChange,
    makeEmpty,
}: {
    rows: Record<string, unknown>[];
    columns: Column[];
    onChange: (rows: Record<string, unknown>[]) => void;
    makeEmpty: () => Record<string, unknown>;
}) {
    const update = (i: number, key: string, value: unknown) => {
        const next = rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r));
        onChange(next);
    };
    return (
        <div>
            <div
                className={styles.rowTable}
                style={{ ["--cols" as string]: columns.length } as React.CSSProperties}
            >
                <div className={styles.rowHead}>
                    {columns.map((c) => (
                        <span key={c.key}>{c.label}</span>
                    ))}
                    <span />
                </div>
                {rows.map((row, i) => (
                    <div key={i} className={styles.rowLine}>
                        {columns.map((c) => (
                            <input
                                key={c.key}
                                className={styles.rowInput}
                                type={c.type === "num" ? "number" : "text"}
                                value={(row[c.key] as string | number | null) ?? ""}
                                onChange={(e) =>
                                    update(
                                        i,
                                        c.key,
                                        c.type === "num" ? num(e.target.value) : e.target.value
                                    )
                                }
                            />
                        ))}
                        <div className={styles.rowActions}>
                            <button
                                className={styles.iconBtn}
                                title="Duplicate"
                                onClick={() =>
                                    onChange([...rows.slice(0, i + 1), { ...row }, ...rows.slice(i + 1)])
                                }
                            >
                                <Copy size={13} />
                            </button>
                            <button
                                className={styles.iconBtn}
                                title="Remove"
                                onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
                            >
                                <X size={13} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button
                className={`${ui.btn} ${ui.btnGhost} ${ui.btnSm}`}
                style={{ marginTop: 10 }}
                onClick={() => onChange([...rows, makeEmpty()])}
            >
                <Plus size={13} /> Add row
            </button>
        </div>
    );
}
