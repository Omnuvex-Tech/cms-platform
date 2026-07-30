const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function getToken(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("access_token="));
    return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers ?? {}),
        },
    });

    if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
            const body = await res.json();
            message = Array.isArray(body.message)
                ? body.message.join(", ")
                : body.message ?? message;
        } catch {
            /* ignore parse errors */
        }
        throw new ApiError(message, res.status);
    }

    if (res.status === 204) return undefined as T;
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
    patch: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
    put: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/** Pulls the server's chosen filename out of `Content-Disposition`, if it set one. */
function filenameFromHeaders(res: Response): string | null {
    const header = res.headers.get("Content-Disposition");
    if (!header) return null;
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * Downloads an authenticated export endpoint as a file (leads CSV, conversation
 * transcripts). The server names the file via Content-Disposition — which it
 * knows best, since the name encodes the thread id or date range — and
 * `fallbackName` only covers the case where that header is missing.
 */
export async function downloadFile(path: string, fallbackName: string) {
    const token = getToken();
    const res = await fetch(`${API_URL}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new ApiError("Export failed", res.status);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filenameFromHeaders(res) ?? fallbackName;
    // Firefox ignores a click on a detached anchor, and revoking the URL in the
    // same tick can cancel the download — so attach, click, then clean up after.
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

export { API_URL };
