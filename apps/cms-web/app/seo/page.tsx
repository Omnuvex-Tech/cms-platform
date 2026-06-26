"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/blog.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;

type Lang = "az" | "en" | "ru";

const PAGE_KEYS = [
  { key: "home", label: "Ana Səhifə" },
  { key: "about", label: "Haqqımızda" },
  { key: "contact", label: "Əlaqə" },
  { key: "team", label: "Komanda" },
  { key: "partners", label: "Tərəfdaşlar" },
  { key: "services", label: "Xidmətlər" },
  { key: "blog", label: "Blog" },
  { key: "portfolio", label: "Portfolio" },
  { key: "vacancy", label: "Vakansiya" },
];

function getToken() {
  return document.cookie.split("access_token=")[1]?.split(";")[0] ?? "";
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error("Xəta baş verdi");
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function LangTabs({ active, onChange }: { active: Lang; onChange: (l: Lang) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {(["az", "en", "ru"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          style={{
            padding: "4px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600,
            border: "1.5px solid",
            borderColor: active === l ? "#3b82f6" : "#333",
            background: active === l ? "#1e3a5f" : "transparent",
            color: active === l ? "#fff" : "#888",
            cursor: "pointer",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

interface SeoData {
  seoTitle?: Record<string, string>;
  seoDescription?: Record<string, string>;
  seoKeywords?: Record<string, string>;
}

export default function SeoPage() {
  const [activeLang, setActiveLang] = useState<Lang>("az");
  const [selectedKey, setSelectedKey] = useState("home");
  const [data, setData] = useState<SeoData>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setLoading(true);
    apiFetch(`/page-meta/${selectedKey}`)
      .then((d) => setData(d ?? {}))
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, [selectedKey]);

  const updateField = (
    field: "seoTitle" | "seoDescription" | "seoKeywords",
    lang: Lang,
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  };

  const save = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      await apiFetch(`/page-meta/${selectedKey}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setSaveStatus("success");
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>SEO Ayarları</h1>
          <p className={styles.subtitle}>Hər səhifə üçün meta məlumatlarını idarə edin</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saveStatus === "success" && (
            <span style={{ color: "#16a34a", fontSize: 14, fontWeight: 600 }}>✓ Saxlanıldı</span>
          )}
          {saveStatus === "error" && (
            <span style={{ color: "#dc2626", fontSize: 14, fontWeight: 600 }}>✕ Xəta baş verdi</span>
          )}
          <button className={styles.saveBtn} onClick={save} disabled={saving}>
            {saving ? "Saxlanır..." : "Saxla"}
          </button>
        </div>
      </div>

      {/* Səhifə seçimi */}
      <div className={styles.fullDrawerSection} style={{ marginBottom: 24 }}>
        <h3 className={styles.drawerSectionTitle}>Səhifə seçin</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PAGE_KEYS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setSelectedKey(p.key)}
              style={{
                padding: "6px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: "1.5px solid",
                borderColor: selectedKey === p.key ? "#3b82f6" : "#333",
                background: selectedKey === p.key ? "#1e3a5f" : "transparent",
                color: selectedKey === p.key ? "#fff" : "#888",
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}>Yüklənir...</div>
      ) : (
        <>
          <LangTabs active={activeLang} onChange={setActiveLang} />

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div className={styles.fullDrawerSection}>
              <h3 className={styles.drawerSectionTitle}>SEO Title ({activeLang.toUpperCase()})</h3>
              <div className={styles.field}>
                <input
                  className={styles.input}
                  value={data.seoTitle?.[activeLang] ?? ""}
                  placeholder={`Səhifə başlığı (${activeLang})`}
                  onChange={(e) => updateField("seoTitle", activeLang, e.target.value)}
                />
              </div>
            </div>

            <div className={styles.fullDrawerSection}>
              <h3 className={styles.drawerSectionTitle}>SEO Description ({activeLang.toUpperCase()})</h3>
              <div className={styles.field}>
                <textarea
                  className={styles.input}
                  rows={3}
                  value={data.seoDescription?.[activeLang] ?? ""}
                  placeholder={`Qısa açıqlama (${activeLang})`}
                  onChange={(e) => updateField("seoDescription", activeLang, e.target.value)}
                />
              </div>
            </div>

            <div className={styles.fullDrawerSection}>
              <h3 className={styles.drawerSectionTitle}>SEO Keywords ({activeLang.toUpperCase()})</h3>
              <div className={styles.field}>
                <input
                  className={styles.input}
                  value={data.seoKeywords?.[activeLang] ?? ""}
                  placeholder={`açar söz 1, açar söz 2 (${activeLang})`}
                  onChange={(e) => updateField("seoKeywords", activeLang, e.target.value)}
                />
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}