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

  // Schema state-ləri
  const [schemaByLang, setSchemaByLang] = useState<Record<string, any>>({});
  const [schemaText, setSchemaText] = useState("");
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [schemaGenerating, setSchemaGenerating] = useState(false);
  const [schemaSaving, setSchemaSaving] = useState(false);
  const [schemaSaveStatus, setSchemaSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Səhifə dəyişəndə bütün məlumatları yüklə
  useEffect(() => {
    setLoading(true);
    setSchemaError(null);
    apiFetch(`/page-meta/${selectedKey}`)
      .then((d) => {
        setData(d ?? {});
        const schemaObj = d?.schema ?? {};
        setSchemaByLang(schemaObj);
        setSchemaText(schemaObj[activeLang] ? JSON.stringify(schemaObj[activeLang], null, 2) : "");
      })
      .catch(() => {
        setData({});
        setSchemaByLang({});
        setSchemaText("");
      })
      .finally(() => setLoading(false));
  }, [selectedKey]);

  // Dil dəyişəndə schema mətnini yenilə
  useEffect(() => {
    setSchemaText(schemaByLang[activeLang] ? JSON.stringify(schemaByLang[activeLang], null, 2) : "");
    setSchemaError(null);
  }, [activeLang]);

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

  // ── Schema funksiyaları ──

  const handleSchemaChange = (val: string) => {
    setSchemaText(val);
    setSchemaError(null);
    try {
      if (val.trim()) JSON.parse(val);
    } catch {
      setSchemaError("JSON formatı səhvdir");
    }
  };

  const generateSchema = async () => {
    setSchemaGenerating(true);
    setSchemaError(null);
    try {
      const generated = await apiFetch(`/page-meta/${selectedKey}/schema/preview`);
      const langSchema = generated[activeLang];
      setSchemaText(JSON.stringify(langSchema, null, 2));
      setSchemaByLang((prev) => ({ ...prev, [activeLang]: langSchema }));
    } catch {
      setSchemaError("Schema yaradılarkən xəta baş verdi");
    } finally {
      setSchemaGenerating(false);
    }
  };

  const saveSchema = async () => {
    if (schemaError) return;
    setSchemaSaving(true);
    setSchemaSaveStatus("idle");
    try {
      let parsed = null;
      if (schemaText.trim()) {
        parsed = JSON.parse(schemaText);
      }
      const updatedSchema = { ...schemaByLang, [activeLang]: parsed };
      await apiFetch(`/page-meta/${selectedKey}/schema`, {
        method: "PATCH",
        body: JSON.stringify({ schema: updatedSchema }),
      });
      setSchemaByLang(updatedSchema);
      setSchemaSaveStatus("success");
    } catch {
      setSchemaSaveStatus("error");
    } finally {
      setSchemaSaving(false);
      setTimeout(() => setSchemaSaveStatus("idle"), 3000);
    }
  };

  const resetSchema = async () => {
    setSchemaError(null);
    try {
      const generated = await apiFetch(`/page-meta/${selectedKey}/schema/preview`);
      const langSchema = generated[activeLang];
      setSchemaText(JSON.stringify(langSchema, null, 2));
      const updatedSchema = { ...schemaByLang, [activeLang]: langSchema };
      setSchemaByLang(updatedSchema);
      await apiFetch(`/page-meta/${selectedKey}/schema`, {
        method: "PATCH",
        body: JSON.stringify({ schema: updatedSchema }),
      });
      setSchemaSaveStatus("success");
      setTimeout(() => setSchemaSaveStatus("idle"), 3000);
    } catch {
      setSchemaError("Sıfırlanarkən xəta baş verdi");
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

            {/* Schema bölməsi */}
            <div className={styles.fullDrawerSection}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 className={styles.drawerSectionTitle} style={{ marginBottom: 0 }}>
                  JSON-LD Schema ({activeLang.toUpperCase()})
                </h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={resetSchema}
                    style={{
                      padding: "4px 12px", borderRadius: 6, fontSize: 13,
                      border: "1.5px solid #333", background: "transparent",
                      color: "#888", cursor: "pointer",
                    }}
                  >
                    Sıfırla
                  </button>
                  <button
                    type="button"
                    onClick={generateSchema}
                    disabled={schemaGenerating}
                    style={{
                      padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                      border: "1.5px solid #3b82f6", background: "#1e3a5f",
                      color: "#fff", cursor: "pointer",
                    }}
                  >
                    {schemaGenerating ? "Yaradılır..." : "⚡ Generate Et"}
                  </button>
                  <button
                    type="button"
                    onClick={saveSchema}
                    disabled={schemaSaving || !!schemaError}
                    style={{
                      padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                      border: "1.5px solid #16a34a", background: "#14532d",
                      color: "#fff", cursor: "pointer",
                    }}
                  >
                    {schemaSaving ? "Saxlanır..." : "Saxla"}
                  </button>
                </div>
              </div>

              {schemaSaveStatus === "success" && (
                <p style={{ color: "#16a34a", fontSize: 13, marginBottom: 8 }}>✓ Schema saxlanıldı</p>
              )}
              {schemaSaveStatus === "error" && (
                <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 8 }}>✕ Xəta baş verdi</p>
              )}

              <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>
                ℹ Hər dil üçün ayrı schema generasiya olunur. "Generate Et" ilə yarat, lazım gəlsə redaktə et, "Saxla" ilə yadda saxla. "Sıfırla" kodun avtomatik yaratdığına qaytarır və dərhal saxlayır.
              </p>

              <div className={styles.field}>
                <textarea
                  className={styles.input}
                  rows={16}
                  value={schemaText}
                  placeholder='{"@context": "https://schema.org", ...}'
                  onChange={(e) => handleSchemaChange(e.target.value)}
                  style={{ fontFamily: "monospace", fontSize: 12 }}
                />
              </div>

              {schemaError && (
                <p style={{ color: "#dc2626", fontSize: 13, marginTop: 4 }}>⚠ {schemaError}</p>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}