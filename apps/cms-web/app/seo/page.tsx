"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "@/styles/blog.module.css";
import seo from "./seo.module.css";
import { Spinner } from "@/components/Spinner";

const API = process.env.NEXT_PUBLIC_API_URL;

type Lang = "en" | "az" | "ru";

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "az", flag: "🇦🇿", label: "Azərbaycan" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
];

/** Sol siyahıda görünən statik səhifələr — detal deyil, əsas səhifələrin özü. */
const PAGES: readonly { key: string; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "about-us", label: "About Us" },
  { key: "projects", label: "Projects" },
  { key: "off-plan", label: "Off Plan" },
  { key: "resale", label: "Resale" },
  { key: "brokers", label: "Brokers" },
  { key: "developers", label: "Developers" },
  { key: "pulse", label: "Pulse" },
  { key: "contact", label: "Contact" },
  { key: "privacy-policy", label: "Privacy Policy" },
  { key: "author", label: "Author" },
];

/** Açılıb-bağlanan "Dynamic Pages" qrupundakı detal tipləri. */
const DYNAMIC_TYPES: readonly { type: string; label: string }[] = [
  { type: "author", label: "Author Detail" },
  { type: "project", label: "Project Detail" },
  { type: "pulse", label: "Pulse Detail" },
];

interface DynItem {
  id: string;
  slug: string;
  label: string;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform .15s ease",
        transform: open ? "rotate(180deg)" : "none",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

type LocalizedString = Record<string, string>;
type SchemaByLang = Record<string, Record<string, unknown>>;

interface MetaState {
  seoTitle: LocalizedString;
  seoDescription: LocalizedString;
  seoKeywords: LocalizedString;
}

const emptyMeta = (): MetaState => ({
  seoTitle: { en: "", az: "", ru: "" },
  seoDescription: { en: "", az: "", ru: "" },
  seoKeywords: { en: "", az: "", ru: "" },
});

const emptyByLang = <T,>(v: T): Record<Lang, T> => ({ en: v, az: v, ru: v });

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

const pretty = (v: unknown) => JSON.stringify(v ?? {}, null, 2);

export default function SeoPage() {
  const [selectedKey, setSelectedKey] = useState<string>("home");
  const [activeLang, setActiveLang] = useState<Lang>("en");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveMsg, setSaveMsg] = useState("");

  const [meta, setMeta] = useState<MetaState>(emptyMeta());
  const [generated, setGenerated] = useState<Record<Lang, Record<string, unknown>>>(
    emptyByLang({})
  );
  const [savedSchema, setSavedSchema] = useState<SchemaByLang>({});
  const [schemaText, setSchemaText] = useState<Record<Lang, string>>(emptyByLang(""));
  const [schemaErr, setSchemaErr] = useState<Record<Lang, string | null>>(
    emptyByLang(null)
  );

  // Sol siyahının "Dynamic Pages" hissəsi
  const [dynamicOpen, setDynamicOpen] = useState(false);
  const [openTypes, setOpenTypes] = useState<Record<string, boolean>>({});
  const [dynItems, setDynItems] = useState<Record<string, DynItem[] | undefined>>({});
  const [dynLoading, setDynLoading] = useState<Record<string, boolean>>({});
  const [dynSearch, setDynSearch] = useState<Record<string, string>>({});

  const loadDynItems = useCallback(
    async (type: string) => {
      if (dynItems[type] || dynLoading[type]) return;
      setDynLoading((p) => ({ ...p, [type]: true }));
      try {
        const rows = await apiFetch(`/page-meta/dynamic/${type}`);
        setDynItems((p) => ({ ...p, [type]: Array.isArray(rows) ? rows : [] }));
      } catch {
        setDynItems((p) => ({ ...p, [type]: [] }));
      } finally {
        setDynLoading((p) => ({ ...p, [type]: false }));
      }
    },
    [dynItems, dynLoading]
  );

  const toggleType = (type: string) => {
    const willOpen = !openTypes[type];
    setOpenTypes((p) => ({ ...p, [type]: !p[type] }));
    if (willOpen) loadDynItems(type);
  };

  const load = useCallback(async (key: string) => {
    setLoading(true);
    setSaveStatus("idle");
    setSchemaErr(emptyByLang(null));
    try {
      const [record, gen] = await Promise.all([
        apiFetch(`/page-meta/${key}`).catch(() => null),
        apiFetch(`/page-meta/${key}/schema/preview`).catch(() => ({})),
      ]);

      const nextMeta = emptyMeta();
      for (const f of ["seoTitle", "seoDescription", "seoKeywords"] as const) {
        nextMeta[f] = { en: "", az: "", ru: "", ...(record?.[f] ?? {}) };
      }
      setMeta(nextMeta);

      const genByLang: Record<Lang, Record<string, unknown>> = emptyByLang({});
      for (const { code } of LANGS) genByLang[code] = gen?.[code] ?? {};
      setGenerated(genByLang);

      const saved: SchemaByLang = record?.schema ?? {};
      setSavedSchema(saved);

      const text: Record<Lang, string> = emptyByLang("");
      for (const { code } of LANGS) {
        text[code] = pretty(saved?.[code] ?? genByLang[code]);
      }
      setSchemaText(text);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(selectedKey);
  }, [selectedKey, load]);

  const updateMeta = (
    field: keyof MetaState,
    lang: Lang,
    value: string
  ) => {
    setMeta((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
  };

  const updateSchemaText = (lang: Lang, value: string) => {
    setSchemaText((prev) => ({ ...prev, [lang]: value }));
    setSchemaErr((prev) => (prev[lang] ? { ...prev, [lang]: null } : prev));
  };

  /** schemaText-i bütün dillər üzrə parse edir; xətaları qeyd edir. */
  const buildSchema = (): { ok: boolean; schema: SchemaByLang } => {
    const schema: SchemaByLang = {};
    const errs: Record<Lang, string | null> = emptyByLang(null);
    let ok = true;
    for (const { code } of LANGS) {
      const raw = schemaText[code].trim();
      if (!raw) {
        schema[code] = generated[code];
        continue;
      }
      try {
        schema[code] = JSON.parse(raw);
      } catch {
        ok = false;
        errs[code] = "JSON sintaksis xətası";
      }
    }
    setSchemaErr(errs);
    return { ok, schema };
  };

  const flash = (status: "success" | "error", msg: string) => {
    setSaveStatus(status);
    setSaveMsg(msg);
    setTimeout(() => setSaveStatus("idle"), 3500);
  };

  const save = async () => {
    const { ok, schema } = buildSchema();
    if (!ok) {
      flash("error", "Schema JSON-u düzəldin");
      return;
    }
    setSaving(true);
    setSaveStatus("idle");
    try {
      await apiFetch(`/page-meta/${selectedKey}`, {
        method: "PATCH",
        body: JSON.stringify({
          seoTitle: meta.seoTitle,
          seoDescription: meta.seoDescription,
          seoKeywords: meta.seoKeywords,
        }),
      });
      await apiFetch(`/page-meta/${selectedKey}/schema`, {
        method: "PATCH",
        body: JSON.stringify({ schema }),
      });
      setSavedSchema(schema);
      flash("success", "Saxlanıldı");
    } catch {
      flash("error", "Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  };

  /** Aktiv dilin schema-sını avtomatik generasiyaya qaytarır və saxlayır. */
  const resetSchema = async () => {
    const genText = pretty(generated[activeLang]);
    const nextText = { ...schemaText, [activeLang]: genText };
    setSchemaText(nextText);
    setSchemaErr(emptyByLang(null));

    const schema: SchemaByLang = {};
    for (const { code } of LANGS) {
      if (code === activeLang) {
        schema[code] = generated[code];
        continue;
      }
      const raw = nextText[code].trim();
      try {
        schema[code] = raw ? JSON.parse(raw) : generated[code];
      } catch {
        schema[code] = savedSchema?.[code] ?? generated[code];
      }
    }

    setSaving(true);
    try {
      await apiFetch(`/page-meta/${selectedKey}/schema`, {
        method: "PATCH",
        body: JSON.stringify({ schema }),
      });
      setSavedSchema(schema);
      flash("success", `Schema (${activeLang.toUpperCase()}) sıfırlandı`);
    } catch {
      flash("error", "Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  };

  const schemaIsAuto = savedSchema?.[activeLang] == null;

  // Sağ panelin başlığı üçün seçilmiş elementin adı
  const dynSep = selectedKey.indexOf(":");
  let currentLabel: string;
  if (dynSep === -1) {
    currentLabel = PAGES.find((p) => p.key === selectedKey)?.label ?? selectedKey;
  } else {
    const t = selectedKey.slice(0, dynSep);
    const id = selectedKey.slice(dynSep + 1);
    const typeLabel = DYNAMIC_TYPES.find((d) => d.type === t)?.label ?? t;
    const item = dynItems[t]?.find((i) => i.id === id);
    currentLabel = item ? `${typeLabel} — ${item.label}` : typeLabel;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>SEO</h1>
          <p className={styles.subtitle}>
            Statik və dinamik səhifələr üçün meta məlumatları və JSON-LD schema
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saveStatus === "success" && (
            <span style={{ color: "#16a34a", fontSize: 14, fontWeight: 600 }}>
              ✓ {saveMsg}
            </span>
          )}
          {saveStatus === "error" && (
            <span style={{ color: "#dc2626", fontSize: 14, fontWeight: 600 }}>
              ✕ {saveMsg}
            </span>
          )}
          <button className={styles.saveBtn} onClick={save} disabled={saving || loading}>
            {saving ? "Saxlanır..." : "Saxla"}
          </button>
        </div>
      </div>

      <div className={seo.wrap}>
        {/* Sol: səhifə siyahısı */}
        <div className={seo.list}>
          {PAGES.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`${seo.listItem} ${
                selectedKey === p.key ? seo.listItemActive : ""
              }`}
              onClick={() => setSelectedKey(p.key)}
            >
              {p.label}
            </button>
          ))}

          {/* Dynamic Pages — açılıb-bağlanan */}
          <button
            type="button"
            className={seo.groupHeader}
            onClick={() => setDynamicOpen((v) => !v)}
            aria-expanded={dynamicOpen}
          >
            <span>Dynamic Pages</span>
            <Chevron open={dynamicOpen} />
          </button>

          {dynamicOpen &&
            DYNAMIC_TYPES.map((d) => (
              <div key={d.type}>
                <button
                  type="button"
                  className={seo.subGroupHeader}
                  onClick={() => toggleType(d.type)}
                  aria-expanded={!!openTypes[d.type]}
                >
                  <span>{d.label}</span>
                  <Chevron open={!!openTypes[d.type]} />
                </button>

                {openTypes[d.type] && (
                  <>
                    {dynLoading[d.type] && (
                      <div className={seo.mutedRow}>Yüklənir…</div>
                    )}

                    {!dynLoading[d.type] && (dynItems[d.type]?.length ?? 0) > 0 && (
                      <div className={seo.searchRow}>
                        <input
                          className={seo.searchInput}
                          type="search"
                          placeholder="Axtar…"
                          value={dynSearch[d.type] ?? ""}
                          onChange={(e) =>
                            setDynSearch((p) => ({ ...p, [d.type]: e.target.value }))
                          }
                        />
                      </div>
                    )}

                    {!dynLoading[d.type] &&
                      dynItems[d.type]?.length === 0 && (
                        <div className={seo.mutedRow}>Element yoxdur</div>
                      )}

                    {(() => {
                      const q = (dynSearch[d.type] ?? "").trim().toLowerCase();
                      const list = (dynItems[d.type] ?? []).filter(
                        (item) =>
                          !q ||
                          item.label.toLowerCase().includes(q) ||
                          item.slug.toLowerCase().includes(q)
                      );
                      if (
                        !dynLoading[d.type] &&
                        (dynItems[d.type]?.length ?? 0) > 0 &&
                        list.length === 0
                      ) {
                        return <div className={seo.mutedRow}>Nəticə yoxdur</div>;
                      }
                      return list.map((item) => {
                        const key = `${d.type}:${item.id}`;
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`${seo.listItem} ${seo.listItemNested} ${
                              selectedKey === key ? seo.listItemActive : ""
                            }`}
                            onClick={() => setSelectedKey(key)}
                            title={item.slug}
                          >
                            {item.label}
                          </button>
                        );
                      });
                    })()}
                  </>
                )}
              </div>
            ))}
        </div>

        {/* Sağ: seçilmiş səhifənin idarəetməsi */}
        <div className={seo.panel}>
          {loading ? (
            <Spinner block />
          ) : (
            <>
              <div className={seo.langTabs}>
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={`${seo.langTab} ${
                      activeLang === l.code ? seo.langTabActive : ""
                    }`}
                    onClick={() => setActiveLang(l.code)}
                  >
                    <span className={seo.langFlag}>{l.flag}</span>
                    {l.label}
                  </button>
                ))}
              </div>

              <div className={styles.fullDrawerSection}>
                <h3 className={styles.drawerSectionTitle}>
                  {currentLabel} — Meta ({activeLang.toUpperCase()})
                </h3>

                <div className={styles.field}>
                  <label>Meta Title</label>
                  <input
                    className={styles.input}
                    value={meta.seoTitle[activeLang] ?? ""}
                    placeholder={`Meta title (${activeLang})`}
                    onChange={(e) =>
                      updateMeta("seoTitle", activeLang, e.target.value)
                    }
                  />
                </div>

                <div className={styles.field}>
                  <label>Meta Description</label>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={meta.seoDescription[activeLang] ?? ""}
                    placeholder={`Meta description (${activeLang})`}
                    onChange={(e) =>
                      updateMeta("seoDescription", activeLang, e.target.value)
                    }
                  />
                </div>

                <div className={styles.field}>
                  <label>Meta Keywords</label>
                  <input
                    className={styles.input}
                    value={meta.seoKeywords[activeLang] ?? ""}
                    placeholder={`açar söz 1, açar söz 2 (${activeLang})`}
                    onChange={(e) =>
                      updateMeta("seoKeywords", activeLang, e.target.value)
                    }
                  />
                </div>
              </div>

              <div className={styles.fullDrawerSection}>
                <div className={seo.sectionRow}>
                  <h3 className={styles.drawerSectionTitle} style={{ border: "none", padding: 0 }}>
                    Schema (JSON-LD) ({activeLang.toUpperCase()})
                  </h3>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={resetSchema}
                    disabled={saving}
                  >
                    Sıfırla
                  </button>
                </div>

                <p className={seo.hint}>
                  {schemaIsAuto
                    ? "Bu schema səhifə tipinə görə avtomatik generasiya olunub. Redaktə edib saxlaya bilərsiniz."
                    : "Admin tərəfindən redaktə olunmuş schema. «Sıfırla» avtomatik variantı geri qaytarır."}
                </p>

                <textarea
                  className={`${seo.jsonArea} ${
                    schemaErr[activeLang] ? seo.jsonAreaError : ""
                  }`}
                  spellCheck={false}
                  value={schemaText[activeLang]}
                  onChange={(e) => updateSchemaText(activeLang, e.target.value)}
                />
                {schemaErr[activeLang] && (
                  <p className={seo.jsonError}>{schemaErr[activeLang]}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
