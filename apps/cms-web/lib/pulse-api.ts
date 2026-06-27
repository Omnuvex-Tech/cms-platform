const API = process.env.NEXT_PUBLIC_API_URL;

function getToken() { return document.cookie.split("access_token=")[1]?.split(";")[0] ?? ""; }

export async function apiFetch(path: string, options?: RequestInit) {
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...options?.headers },
    });
    if (!res.ok) {
        let message = "Xəta baş verdi";
        try {
            const err = await res.json();
            message = err?.message || err?.error || JSON.stringify(err);
        } catch {
            message = await res.text().catch(() => `HTTP ${res.status}`);
        }
        throw new Error(`[${res.status}] ${path}: ${message}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

export async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API}/pulse/upload`, {
        method: "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: formData,
    });
    if (!res.ok) throw new Error("Fayl yükləmə uğursuz");
    return (await res.json()).url;
}

export function toAbsUrl(path: string) {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${API}${path}`;
}

export function generateSlug(title: string) {
    return title.toLowerCase()
        .replace(/ə/g, "e").replace(/ğ/g, "g").replace(/ı/g, "i")
        .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c")
        .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").trim();
}
