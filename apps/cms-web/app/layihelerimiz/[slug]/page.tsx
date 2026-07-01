"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LangInput } from "@/components/LangInput";

const API = process.env.NEXT_PUBLIC_API_URL;
const TREVA_API = process.env.NEXT_PUBLIC_TREVA_API_URL;
type LocalizedValue = Record<string, string> | string | null | undefined;

function toObj(val: LocalizedValue): Record<string, string> {
  if (!val) return { az: "", en: "", ru: "" };
  if (typeof val === "string") return { az: val, en: val, ru: val };
  return { az: val.az || "", en: val.en || "", ru: val.ru || "" };
}

interface FeatureSection {
  id: string;
  titleItalic: string;
  titleRest: string;
  subtitle: string;
  items: string[];
  dark: boolean;
  image: string;
  imageLeft: boolean;
}

interface OverviewDataRow {
  key: string;
  value: string;
}

interface HeroImage {
  url: string;
  alt: string;
}

interface ProjectDetailData {
  id?: string;
  categorySlug: string;
  heroTitle: any;
  heroDesktopDesc: any;
  heroMobileDesc: any;
  heroImages: HeroImage[];
  heroCtaText: any;
  heroCtaLink: string;
  overviewTitleLight: any;
  overviewTitleBold: any;
  overviewBrandName: any;
  overviewDebutText: any;
  overviewLocationText: any;
  overviewDebutTextEnd: any;
  overviewDescription: any;
  overviewImageLarge: string;
  overviewImageLargeLabel: any;
  overviewImageMedium: string;
  overviewImageMediumLabel: any;
  overviewImageSmall: string;
  overviewImageSmallLabel: any;
  overviewDataRows: OverviewDataRow[];
  featuresHeaderMain: any;
  featuresHeaderSub: any;
  featuresTitleLight: any;
  featuresTitleBold: any;
  featuresSections: FeatureSection[];
  brochureFile: string;
  locationTitleLight: any;
  locationTitleBold: any;
  locationBrandName: any;
  locationMainLead: any;
  locationSubText: any;
  locationMapImage: string;
  locationFooterAddress: any;
  locationGoogleMapsUrl: string;
  seoTitle: any;
  seoDescription: any;
  ogImage: string;
}

function getToken() {
  return document.cookie.split("access_token=")[1]?.split(";")[0] ?? "";
}

async function cmsFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options?.headers,
    },
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

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API}/layihelerimiz/project-details/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Fayl yükləmə uğursuz");
  return (await res.json()).url;
}

function toAbs(path: string) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${API}${path}`;
}

function ensureObj(val: any): Record<string, string> {
  return toObj(val);
}

const emptyDetail: ProjectDetailData = {
  categorySlug: "",
  heroTitle: { az: "", en: "", ru: "" },
  heroDesktopDesc: { az: "", en: "", ru: "" },
  heroMobileDesc: { az: "", en: "", ru: "" },
  heroImages: [],
  heroCtaText: { az: "", en: "", ru: "" },
  heroCtaLink: "",
  overviewTitleLight: { az: "Layihəyə ", en: "Project ", ru: "Обзор " },
  overviewTitleBold: { az: "Ümumi Baxış", en: "Overview", ru: "Проекта" },
  overviewBrandName: { az: "", en: "", ru: "" },
  overviewDebutText: { az: "", en: "", ru: "" },
  overviewLocationText: { az: "", en: "", ru: "" },
  overviewDebutTextEnd: { az: "", en: "", ru: "" },
  overviewDescription: { az: "", en: "", ru: "" },
  overviewImageLarge: "",
  overviewImageLargeLabel: { az: "", en: "", ru: "" },
  overviewImageMedium: "",
  overviewImageMediumLabel: { az: "", en: "", ru: "" },
  overviewImageSmall: "",
  overviewImageSmallLabel: { az: "", en: "", ru: "" },
  overviewDataRows: [
    { key: "Project Type", value: "" },
    { key: "Year of Completion", value: "" },
    { key: "Price Range", value: "" },
  ],
  featuresHeaderMain: { az: "", en: "", ru: "" },
  featuresHeaderSub: { az: "", en: "", ru: "" },
  featuresTitleLight: { az: "Layihənin ", en: "Project ", ru: "Детали " },
  featuresTitleBold: { az: "Detalları", en: "Details", ru: "Проекта" },
  featuresSections: [],
  brochureFile: "",
  locationTitleLight: { az: "Layihənin ", en: "Property ", ru: "Расположение " },
  locationTitleBold: { az: "Coğrafi Mövqeyi", en: "Location", ru: "Проекта" },
  locationBrandName: { az: "", en: "", ru: "" },
  locationMainLead: { az: "", en: "", ru: "" },
  locationSubText: { az: "", en: "", ru: "" },
  locationMapImage: "",
  locationFooterAddress: { az: "", en: "", ru: "" },
  locationGoogleMapsUrl: "",
  seoTitle: { az: "", en: "", ru: "" },
  seoDescription: { az: "", en: "", ru: "" },
  ogImage: "",
};

export default function ProjectDetailEditor() {
  const params = useParams();
  const slug = params?.slug as string;

  const [detail, setDetail] = useState<ProjectDetailData>({ ...emptyDetail, categorySlug: slug });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hero: true,
    overview: false,
    features: false,
    location: false,
    seo: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await cmsFetch(`/layihelerimiz/project-details/${slug}`);
      if (data) {
        setDetail({
          ...emptyDetail,
          ...data,
          heroTitle: ensureObj(data.heroTitle),
          heroDesktopDesc: ensureObj(data.heroDesktopDesc),
          heroMobileDesc: ensureObj(data.heroMobileDesc),
          heroCtaText: ensureObj(data.heroCtaText),
          overviewTitleLight: ensureObj(data.overviewTitleLight),
          overviewTitleBold: ensureObj(data.overviewTitleBold),
          overviewBrandName: ensureObj(data.overviewBrandName),
          overviewDebutText: ensureObj(data.overviewDebutText),
          overviewLocationText: ensureObj(data.overviewLocationText),
          overviewDebutTextEnd: ensureObj(data.overviewDebutTextEnd),
          overviewDescription: ensureObj(data.overviewDescription),
          overviewImageLargeLabel: ensureObj(data.overviewImageLargeLabel),
          overviewImageMediumLabel: ensureObj(data.overviewImageMediumLabel),
          overviewImageSmallLabel: ensureObj(data.overviewImageSmallLabel),
          featuresHeaderMain: ensureObj(data.featuresHeaderMain),
          featuresHeaderSub: ensureObj(data.featuresHeaderSub),
          featuresTitleLight: ensureObj(data.featuresTitleLight),
          featuresTitleBold: ensureObj(data.featuresTitleBold),
          locationTitleLight: ensureObj(data.locationTitleLight),
          locationTitleBold: ensureObj(data.locationTitleBold),
          locationBrandName: ensureObj(data.locationBrandName),
          locationMainLead: ensureObj(data.locationMainLead),
          locationSubText: ensureObj(data.locationSubText),
          locationFooterAddress: ensureObj(data.locationFooterAddress),
          seoTitle: ensureObj(data.seoTitle),
          seoDescription: ensureObj(data.seoDescription),
          heroImages: Array.isArray(data.heroImages) ? data.heroImages : [],
          overviewDataRows: Array.isArray(data.overviewDataRows) && data.overviewDataRows.length > 0
            ? data.overviewDataRows
            : emptyDetail.overviewDataRows,
          featuresSections: Array.isArray(data.featuresSections) ? data.featuresSections : [],
        });
      }
    } catch (err) {
      console.error("Failed to load project detail:", err);
      setLoadError("Məlumatları yükləmək mümkün olmadı. CMS API işləyir?");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleFileUpload = async (field: string, file: File) => {
    try {
      const url = await uploadFile(file);
      setDetail((prev) => ({ ...prev, [field]: url }));
    } catch (e: any) {
      alert("Yükləmə uğursuz: " + e.message);
    }
  };

  const handleMultiImageUpload = async (index: number, file: File) => {
    try {
      const url = await uploadFile(file);
      setDetail((prev) => {
        const images = [...(prev.heroImages || [])];
        while (images.length <= index) images.push({ url: "", alt: "" });
        images[index] = { url, alt: images[index]?.alt || "" };
        return { ...prev, heroImages: images };
      });
    } catch (e: any) {
      alert("Yükləmə uğursuz: " + e.message);
    }
  };

  const removeHeroImage = (index: number) => {
    setDetail((prev) => {
      const images = [...(prev.heroImages || [])];
      images.splice(index, 1);
      return { ...prev, heroImages: images };
    });
  };

  const addHeroImage = () => {
    setDetail((prev) => ({
      ...prev,
      heroImages: [...(prev.heroImages || []), { url: "", alt: "" }],
    }));
  };

  const updateHeroImageAlt = (index: number, alt: string) => {
    setDetail((prev) => {
      const images = [...(prev.heroImages || [])];
      while (images.length <= index) images.push({ url: "", alt: "" });
      images[index] = { url: images[index]?.url || "", alt };
      return { ...prev, heroImages: images };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...detail };
      if (detail.id) {
        await cmsFetch(`/layihelerimiz/project-details/${detail.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        const created = await cmsFetch("/layihelerimiz/project-details", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (created?.id) {
          setDetail((prev) => ({ ...prev, id: created.id }));
        }
      }
      alert("Saxlanıldı!");
    } catch (e: any) {
      alert("Xəta: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ProjectDetailData, value: any) => {
    setDetail((prev) => ({ ...prev, [field]: value }));
  };

  const addFeatureSection = () => {
    const sections = detail.featuresSections || [];
    const newId = String(sections.length + 1).padStart(2, "0");
    updateField("featuresSections", [
      ...sections,
      {
        id: newId,
        titleItalic: "",
        titleRest: "",
        subtitle: "",
        items: [""],
        dark: sections.length % 2 === 0,
        image: "",
        imageLeft: sections.length % 2 === 0,
      },
    ]);
  };

  const updateFeatureSection = (index: number, field: keyof FeatureSection, value: any) => {
    const sections = [...(detail.featuresSections || [])];
    sections[index] = { ...sections[index], [field]: value } as FeatureSection;
    updateField("featuresSections", sections);
  };

  const removeFeatureSection = (index: number) => {
    const sections = [...(detail.featuresSections || [])];
    sections.splice(index, 1);
    updateField("featuresSections", sections);
  };

  const addFeatureItem = (sectionIndex: number) => {
    const sections = [...(detail.featuresSections || [])];
    const sec = sections[sectionIndex];
    if (!sec) return;
    sections[sectionIndex] = { ...sec, items: [...sec.items, ""] } as FeatureSection;
    updateField("featuresSections", sections);
  };

  const updateFeatureItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const sections = [...(detail.featuresSections || [])];
    const sec = sections[sectionIndex];
    if (!sec) return;
    const items = [...sec.items];
    items[itemIndex] = value;
    sections[sectionIndex] = { ...sec, items } as FeatureSection;
    updateField("featuresSections", sections);
  };

  const removeFeatureItem = (sectionIndex: number, itemIndex: number) => {
    const sections = [...(detail.featuresSections || [])];
    const sec = sections[sectionIndex];
    if (!sec) return;
    const items = [...sec.items];
    items.splice(itemIndex, 1);
    sections[sectionIndex] = { ...sec, items } as FeatureSection;
    updateField("featuresSections", sections);
  };

  const addDataRow = () => {
    updateField("overviewDataRows", [
      ...(detail.overviewDataRows || []),
      { key: "", value: "" },
    ]);
  };

  const updateDataRow = (index: number, field: "key" | "value", value: string) => {
    const rows = [...(detail.overviewDataRows || [])];
    const row = rows[index];
    if (!row) return;
    rows[index] = { ...row, [field]: value } as OverviewDataRow;
    updateField("overviewDataRows", rows);
  };

  const removeDataRow = (index: number) => {
    const rows = [...(detail.overviewDataRows || [])];
    rows.splice(index, 1);
    updateField("overviewDataRows", rows);
  };

  if (loading) {
    return (
      <div style={{ padding: 32 }}>
        <p>Yüklənir...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: 32 }}>
        <p style={{ color: "#dc2626" }}>{loadError}</p>
        <button onClick={loadDetail} style={{ marginTop: 12, color: "#1e3a5f", textDecoration: "underline" }}>
          Yenidən cəhd et
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/layihelerimiz" style={{ color: "#1e3a5f", fontSize: 14 }}>
          ← Geri
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Layihə Detalları</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Slug: <code>{slug}</code>
          </p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 24px",
              background: "#1e3a5f",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saxlanılır..." : "Saxla"}
          </button>
        </div>
      </div>

      {/* ── HERO ── */}
      <Section title="Hero" open={openSections.hero} onToggle={() => toggleSection("hero")}>
        <LangInput label="Başlıq" value={detail.heroTitle} onChange={(v) => updateField("heroTitle", v)} />
        <LangInput label="Desktop Təsvir" value={detail.heroDesktopDesc} onChange={(v) => updateField("heroDesktopDesc", v)} type="textarea" />
        <LangInput label="Mobil Təsvir" value={detail.heroMobileDesc} onChange={(v) => updateField("heroMobileDesc", v)} type="textarea" />
        <Field label="Şəkillər (Swiper)">
          {(detail.heroImages || []).map((img, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <FileUploadButton
                currentUrl={img.url}
                onUpload={(file) => handleMultiImageUpload(idx, file)}
                onRemove={() => removeHeroImage(idx)}
              />
              <input
                value={img.alt}
                onChange={(e) => updateHeroImageAlt(idx, e.target.value)}
                placeholder="Alt text"
                style={{ ...input, flex: 1 }}
              />
            </div>
          ))}
          <button onClick={addHeroImage} style={addBtn}>+ Şəkil əlavə et</button>
        </Field>
        <LangInput label="CTA Mətni" value={detail.heroCtaText} onChange={(v) => updateField("heroCtaText", v)} placeholder="GET A CONSULTATION" />
        <Field label="CTA Link">
          <input value={detail.heroCtaLink} onChange={(e) => updateField("heroCtaLink", e.target.value)} style={input} placeholder="/consultation" />
        </Field>
      </Section>

      {/* ── OVERVIEW ── */}
      <Section title="Overview" open={openSections.overview} onToggle={() => toggleSection("overview")}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <LangInput label="Başlıq (Light)" value={detail.overviewTitleLight} onChange={(v) => updateField("overviewTitleLight", v)} />
          <LangInput label="Başlıq (Bold)" value={detail.overviewTitleBold} onChange={(v) => updateField("overviewTitleBold", v)} />
        </div>
        <LangInput label="Brand Adı" value={detail.overviewBrandName} onChange={(v) => updateField("overviewBrandName", v)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <LangInput label="Debut Text" value={detail.overviewDebutText} onChange={(v) => updateField("overviewDebutText", v)} />
          <LangInput label="Location Text" value={detail.overviewLocationText} onChange={(v) => updateField("overviewLocationText", v)} />
          <LangInput label="Debut Text End" value={detail.overviewDebutTextEnd} onChange={(v) => updateField("overviewDebutTextEnd", v)} />
        </div>
        <LangInput label="Təsvir" value={detail.overviewDescription} onChange={(v) => updateField("overviewDescription", v)} type="textarea" />
        <Field label="Böyük Şəkil">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <FileUploadButton currentUrl={detail.overviewImageLarge} onUpload={(f) => handleFileUpload("overviewImageLarge", f)} onRemove={() => updateField("overviewImageLarge", "")} />
            <div style={{ flex: 1 }}>
              <LangInput label="Label" value={detail.overviewImageLargeLabel} onChange={(v) => updateField("overviewImageLargeLabel", v)} />
            </div>
          </div>
        </Field>
        <Field label="Orta Şəkil">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <FileUploadButton currentUrl={detail.overviewImageMedium} onUpload={(f) => handleFileUpload("overviewImageMedium", f)} onRemove={() => updateField("overviewImageMedium", "")} />
            <div style={{ flex: 1 }}>
              <LangInput label="Label" value={detail.overviewImageMediumLabel} onChange={(v) => updateField("overviewImageMediumLabel", v)} />
            </div>
          </div>
        </Field>
        <Field label="Kiçik Şəkil">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <FileUploadButton currentUrl={detail.overviewImageSmall} onUpload={(f) => handleFileUpload("overviewImageSmall", f)} onRemove={() => updateField("overviewImageSmall", "")} />
            <div style={{ flex: 1 }}>
              <LangInput label="Label" value={detail.overviewImageSmallLabel} onChange={(v) => updateField("overviewImageSmallLabel", v)} />
            </div>
          </div>
        </Field>
        <Field label="Data Rows">
          {(detail.overviewDataRows || []).map((row, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input value={row.key} onChange={(e) => updateDataRow(idx, "key", e.target.value)} placeholder="Key" style={{ ...input, flex: 1 }} />
              <input value={row.value} onChange={(e) => updateDataRow(idx, "value", e.target.value)} placeholder="Value" style={{ ...input, flex: 2 }} />
              <button onClick={() => removeDataRow(idx)} style={removeBtn}>✕</button>
            </div>
          ))}
          <button onClick={addDataRow} style={addBtn}>+ Row əlavə et</button>
        </Field>
      </Section>

      {/* ── FEATURES ── */}
      <Section title="Features" open={openSections.features} onToggle={() => toggleSection("features")}>
        <LangInput label="Header Main" value={detail.featuresHeaderMain} onChange={(v) => updateField("featuresHeaderMain", v)} type="textarea" />
        <LangInput label="Header Sub" value={detail.featuresHeaderSub} onChange={(v) => updateField("featuresHeaderSub", v)} type="textarea" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <LangInput label="Başlıq (Light)" value={detail.featuresTitleLight} onChange={(v) => updateField("featuresTitleLight", v)} />
          <LangInput label="Başlıq (Bold)" value={detail.featuresTitleBold} onChange={(v) => updateField("featuresTitleBold", v)} />
        </div>
        <Field label="Brochure Faylı">
          <FileUploadButton
            currentUrl={detail.brochureFile}
            onUpload={(f) => handleFileUpload("brochureFile", f)}
            onRemove={() => updateField("brochureFile", "")}
            accept=".pdf,.docx,.jpg,.jpeg,.png,.webp"
            label="PDF, DOCX və ya Şəkil"
          />
        </Field>
        <Field label="Bölmələr">
          {(detail.featuresSections || []).map((sec, sIdx) => (
            <div key={sIdx} style={featureCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <strong>Bölmə {sec.id}</strong>
                <button onClick={() => removeFeatureSection(sIdx)} style={removeBtn}>Sil</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input value={sec.titleItalic} onChange={(e) => updateFeatureSection(sIdx, "titleItalic", e.target.value)} placeholder="Title Italic" style={input} />
                <input value={sec.titleRest} onChange={(e) => updateFeatureSection(sIdx, "titleRest", e.target.value)} placeholder="Title Rest" style={input} />
              </div>
              <input value={sec.subtitle} onChange={(e) => updateFeatureSection(sIdx, "subtitle", e.target.value)} placeholder="Subtitle" style={{ ...input, marginTop: 8 }} />
              <div style={{ marginTop: 8 }}>
                <FileUploadButton
                  currentUrl={sec.image}
                  onUpload={async (f) => {
                    try {
                      const url = await uploadFile(f);
                      const sections = [...(detail.featuresSections || [])];
                      sections[sIdx] = { ...sections[sIdx], image: url } as FeatureSection;
                      updateField("featuresSections", sections);
                    } catch (e: any) {
                      alert("Yükləmə uğursuz: " + e.message);
                    }
                  }}
                  onRemove={() => updateFeatureSection(sIdx, "image", "")}
                />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                  <input type="checkbox" checked={sec.dark} onChange={(e) => updateFeatureSection(sIdx, "dark", e.target.checked)} />
                  Dark
                </label>
                <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                  <input type="checkbox" checked={sec.imageLeft} onChange={(e) => updateFeatureSection(sIdx, "imageLeft", e.target.checked)} />
                  Image Left
                </label>
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Items:</span>
                {sec.items.map((item, iIdx) => (
                  <div key={iIdx} style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    <input value={item} onChange={(e) => updateFeatureItem(sIdx, iIdx, e.target.value)} placeholder={`Item ${iIdx + 1}`} style={{ ...input, flex: 1 }} />
                    <button onClick={() => removeFeatureItem(sIdx, iIdx)} style={removeBtn}>✕</button>
                  </div>
                ))}
                <button onClick={() => addFeatureItem(sIdx)} style={addBtnSmall}>+ Item</button>
              </div>
            </div>
          ))}
          <button onClick={addFeatureSection} style={addBtn}>+ Bölmə əlavə et</button>
        </Field>
      </Section>

      {/* ── LOCATION ── */}
      <Section title="Location" open={openSections.location} onToggle={() => toggleSection("location")}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <LangInput label="Başlıq (Light)" value={detail.locationTitleLight} onChange={(v) => updateField("locationTitleLight", v)} />
          <LangInput label="Başlıq (Bold)" value={detail.locationTitleBold} onChange={(v) => updateField("locationTitleBold", v)} />
        </div>
        <LangInput label="Brand Adı" value={detail.locationBrandName} onChange={(v) => updateField("locationBrandName", v)} placeholder="Panorama by ELIE SAAB" />
        <LangInput label="Main Lead" value={detail.locationMainLead} onChange={(v) => updateField("locationMainLead", v)} type="textarea" />
        <LangInput label="Sub Text" value={detail.locationSubText} onChange={(v) => updateField("locationSubText", v)} type="textarea" />
        <Field label="Xəritə Şəkli">
          <FileUploadButton currentUrl={detail.locationMapImage} onUpload={(f) => handleFileUpload("locationMapImage", f)} onRemove={() => updateField("locationMapImage", "")} />
        </Field>
        <LangInput label="Ünvan (Footer)" value={detail.locationFooterAddress} onChange={(v) => updateField("locationFooterAddress", v)} />
        <Field label="Google Maps Embed URL">
          <input value={detail.locationGoogleMapsUrl} onChange={(e) => updateField("locationGoogleMapsUrl", e.target.value)} style={input} placeholder="https://www.google.com/maps/embed?..." />
        </Field>
      </Section>

      {/* ── SEO ── */}
      <Section title="SEO" open={openSections.seo} onToggle={() => toggleSection("seo")}>
        <LangInput label="SEO Başlıq" value={detail.seoTitle} onChange={(v) => updateField("seoTitle", v)} />
        <LangInput label="SEO Təsvir" value={detail.seoDescription} onChange={(v) => updateField("seoDescription", v)} type="textarea" />
        <Field label="OG Şəkil">
          <FileUploadButton currentUrl={detail.ogImage} onUpload={(f) => handleFileUpload("ogImage", f)} onRemove={() => updateField("ogImage", "")} />
        </Field>
      </Section>

      {/* Bottom save */}
      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "12px 32px",
            background: "#1e3a5f",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saxlanılır..." : "Saxla"}
        </button>
      </div>
    </div>
  );
}

/* ── Helper Components ── */

function Section({ title, open, onToggle, children }: { title: string; open?: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "16px 20px",
          background: open ? "#f9fafb" : "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        {title}
        <span style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "0.2s" }}>▼</span>
      </button>
      {open && <div style={{ padding: "16px 20px", borderTop: "1px solid #e5e7eb" }}>{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

function FileUploadButton({
  currentUrl,
  onUpload,
  onRemove,
  accept = "image/webp,image/jpeg,image/png",
  label = "Şəkil",
}: {
  currentUrl: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  accept?: string;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input ref={ref} type="file" accept={accept} style={{ display: "none" }} onChange={handleChange} />
      <button
        onClick={() => ref.current?.click()}
        disabled={uploading}
        style={{
          padding: "6px 12px",
          border: "1px solid #d1d5db",
          borderRadius: 6,
          background: "#f9fafb",
          cursor: "pointer",
          fontSize: 13,
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? "Yüklənir..." : currentUrl ? "Dəyişdir" : label + " yüklə"}
      </button>
      {currentUrl && (
        <>
          <img src={toAbs(currentUrl)} alt="" style={{ width: 40, height: 30, objectFit: "cover", borderRadius: 4 }} />
          <button onClick={onRemove} style={removeBtn}>✕</button>
        </>
      )}
    </div>
  );
}

/* ── Styles ── */

const input: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const addBtn: React.CSSProperties = {
  padding: "8px 16px",
  border: "1px dashed #d1d5db",
  borderRadius: 8,
  background: "#f9fafb",
  cursor: "pointer",
  fontSize: 13,
  color: "#6b7280",
  width: "100%",
  marginTop: 8,
};

const addBtnSmall: React.CSSProperties = {
  ...addBtn,
  width: "auto",
  padding: "4px 12px",
  marginTop: 4,
};

const removeBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  border: "none",
  borderRadius: 6,
  background: "#fee2e2",
  color: "#dc2626",
  cursor: "pointer",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const featureCard: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 16,
  marginBottom: 12,
  background: "#fafafa",
};
