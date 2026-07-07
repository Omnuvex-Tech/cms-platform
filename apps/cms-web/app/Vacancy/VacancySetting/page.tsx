"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/vacancy.module.css";

type Lang = "az" | "en" | "ru";
type LocalizedString = Record<string, string>;
const EMPTY_L: LocalizedString = { az: "", en: "", ru: "" };

const API = process.env.NEXT_PUBLIC_API_URL;
function getToken() { return document.cookie.split("access_token=")[1]?.split(";")[0] ?? ""; }

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

interface VacancySettings {
  detailButtonLabel: LocalizedString;
  backLabel: LocalizedString;
  dropdownLabel: LocalizedString;
  applyTitle: LocalizedString;
  aboutRoleLabel: LocalizedString;
  skillsLabel: LocalizedString;
  responsibleLabel: LocalizedString;
  requirementsLabel: LocalizedString;
  email: string;
  emailHref: string;
  phone: string;
  phoneHref: string;
  location: LocalizedString;
  emailLabel: LocalizedString;
  phoneLabel: LocalizedString;
  locationLabel: LocalizedString;
  formNameLabel: LocalizedString;
  formNamePlaceholder: LocalizedString;
  formEmailLabel: LocalizedString;
  formEmailPlaceholder: LocalizedString;
  formPhoneLabel: LocalizedString;
  formPhonePlaceholder: LocalizedString;
  formMessageLabel: LocalizedString;
  formMessagePlaceholder: LocalizedString;
  formCvLabel: LocalizedString;
  formCvPlaceholder: LocalizedString;
  formSubmitLabel: LocalizedString;
}

const DEFAULT: VacancySettings = {
  detailButtonLabel: { ...EMPTY_L },
  backLabel: { ...EMPTY_L },
  dropdownLabel: { ...EMPTY_L },
  applyTitle: { ...EMPTY_L },
  aboutRoleLabel: { ...EMPTY_L },
  skillsLabel: { ...EMPTY_L },
  responsibleLabel: { ...EMPTY_L },
  requirementsLabel: { ...EMPTY_L },
  email: "",
  emailHref: "",
  phone: "",
  phoneHref: "",
  location: { ...EMPTY_L },
  emailLabel: { ...EMPTY_L },
  phoneLabel: { ...EMPTY_L },
  locationLabel: { ...EMPTY_L },
  formNameLabel: { ...EMPTY_L },
  formNamePlaceholder: { ...EMPTY_L },
  formEmailLabel: { ...EMPTY_L },
  formEmailPlaceholder: { ...EMPTY_L },
  formPhoneLabel: { ...EMPTY_L },
  formPhonePlaceholder: { ...EMPTY_L },
  formMessageLabel: { ...EMPTY_L },
  formMessagePlaceholder: { ...EMPTY_L },
  formCvLabel: { ...EMPTY_L },
  formCvPlaceholder: { ...EMPTY_L },
  formSubmitLabel: { ...EMPTY_L },
};

function LangTabs({ active, onChange }: { active: Lang; onChange: (l: Lang) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {(["az", "en", "ru"] as Lang[]).map((l) => (
        <button key={l} type="button" onClick={() => onChange(l)}
          style={{
            padding: "4px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600,
            border: "1.5px solid",
            borderColor: active === l ? "#3b82f6" : "#333",
            background: active === l ? "#1e3a5f" : "transparent",
            color: active === l ? "#fff" : "#888",
            cursor: "pointer",
          }}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function VacancySettingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<"success" | "error" | null>(null);
  const [lang, setLang] = useState<Lang>("az");
  const [settings, setSettings] = useState<VacancySettings>(DEFAULT);

  useEffect(() => {
    apiFetch("/vacancy/settings")
      .then((data) => {
       if (data) setSettings({
          detailButtonLabel: data.detailButtonLabel ?? { ...EMPTY_L },
          backLabel: data.backLabel ?? { ...EMPTY_L },
          dropdownLabel: data.dropdownLabel ?? { ...EMPTY_L },
          applyTitle: data.applyTitle ?? { ...EMPTY_L },
          aboutRoleLabel: data.aboutRoleLabel ?? { ...EMPTY_L },
          skillsLabel: data.skillsLabel ?? { ...EMPTY_L },
          responsibleLabel: data.responsibleLabel ?? { ...EMPTY_L },
          requirementsLabel: data.requirementsLabel ?? { ...EMPTY_L },
          email: data.email ?? "",
          emailHref: data.emailHref ?? "",
          phone: data.phone ?? "",
          phoneHref: data.phoneHref ?? "",
          location: data.location ?? { ...EMPTY_L },
          emailLabel: data.emailLabel ?? { ...EMPTY_L },
          phoneLabel: data.phoneLabel ?? { ...EMPTY_L },
          locationLabel: data.locationLabel ?? { ...EMPTY_L },
          formNameLabel: data.formNameLabel ?? { ...EMPTY_L },
          formNamePlaceholder: data.formNamePlaceholder ?? { ...EMPTY_L },
          formEmailLabel: data.formEmailLabel ?? { ...EMPTY_L },
          formEmailPlaceholder: data.formEmailPlaceholder ?? { ...EMPTY_L },
          formPhoneLabel: data.formPhoneLabel ?? { ...EMPTY_L },
          formPhonePlaceholder: data.formPhonePlaceholder ?? { ...EMPTY_L },
          formMessageLabel: data.formMessageLabel ?? { ...EMPTY_L },
          formMessagePlaceholder: data.formMessagePlaceholder ?? { ...EMPTY_L },
          formCvLabel: data.formCvLabel ?? { ...EMPTY_L },
          formCvPlaceholder: data.formCvPlaceholder ?? { ...EMPTY_L },
          formSubmitLabel: data.formSubmitLabel ?? { ...EMPTY_L },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const updL = (key: keyof VacancySettings, val: string) =>
    setSettings((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as LocalizedString), [lang]: val },
    }));

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch("/vacancy/settings", { method: "PATCH", body: JSON.stringify(settings) });
      setToast("success");
    } catch {
      setToast("error");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) return <div className={styles.page}><div className={styles.empty}>Yüklənir...</div></div>;

  const localizedFields = (fields: { key: keyof VacancySettings; label: string; hint: string }[]) =>
    fields.map(({ key, label, hint }) => (
      <div className={styles.field} key={key}>
        <label>{label} ({lang.toUpperCase()})<span className={styles.hint}> — {hint}</span></label>
        <input className={styles.input}
          value={(settings[key] as LocalizedString)[lang] ?? ""}
          onChange={(e) => updL(key, e.target.value)} />
      </div>
    ));

  return (
    <div className={styles.page}>
      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 9999,
          padding: "12px 20px", borderRadius: "8px", fontWeight: 500,
          background: toast === "success" ? "#22c55e" : "#ef4444",
          color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}>
          {toast === "success" ? "✓ Uğurla saxlanıldı" : "✕ Xəta baş verdi"}
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Vakansiya Ayarları</h1>
          <p className={styles.subtitle}>Vakansiya səhifəsinin mətn və kontakt məlumatlarını idarə edin</p>
        </div>
        <button className={styles.saveBtn} onClick={save} disabled={saving}>
          {saving ? "Saxlanır..." : "Yadda saxla"}
        </button>
      </div>

      <div style={{ marginBottom: 8 }}>
        <LangTabs active={lang} onChange={setLang} />
      </div>

      <div className={styles.sectionCard}>
        <h2 className={styles.sectionCardTitle}>Detail səhifəsi başlıqları</h2>
       {localizedFields([
          { key: "detailButtonLabel", label: "Daha ətraflı düyməsi mətni", hint: "DAHA ƏTRAFLI" },
          { key: "backLabel", label: "Geri düyməsi mətni", hint: "← geri linki" },
          { key: "dropdownLabel", label: "Vakansiya dropdown mətni", hint: "Vakansiya seçin" },
          { key: "applyTitle", label: "Müraciət başlığı", hint: "APPLY NOW" },
          { key: "aboutRoleLabel", label: "About the Role başlığı", hint: "Vakansiya təsviri bölməsi" },
          { key: "skillsLabel", label: "Skills başlığı", hint: "Bacarıqlar bölməsi" },
          { key: "responsibleLabel", label: "Responsible başlığı", hint: "Məsuliyyətlər bölməsi" },
          { key: "requirementsLabel", label: "Requirements başlığı", hint: "Tələblər bölməsi" },
        ])}
      </div>

      <div className={styles.sectionCard}>
        <h2 className={styles.sectionCardTitle}>Kontakt məlumatları</h2>
        {localizedFields([
          { key: "emailLabel", label: "Email bölməsinin adı", hint: "\"Email Adres\" yazısı" },
          { key: "phoneLabel", label: "Telefon bölməsinin adı", hint: "\"Phone\" yazısı" },
          { key: "locationLabel", label: "Ünvan bölməsinin adı", hint: "\"Location\" yazısı" },
          { key: "location", label: "Ünvan", hint: "Göstərilən ünvan mətni" },
        ])}
        {(["email", "emailHref", "phone", "phoneHref"] as const).map((key) => (
          <div className={styles.field} key={key}>
            <label>{key}</label>
            <input className={styles.input} value={settings[key] as string}
              onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))} />
          </div>
        ))}
      </div>

      <div className={styles.sectionCard}>
        <h2 className={styles.sectionCardTitle}>Apply Now Formu</h2>
        {localizedFields([
          { key: "formNameLabel", label: "Ad — label", hint: "Name" },
          { key: "formNamePlaceholder", label: "Ad — placeholder", hint: "Your name*" },
          { key: "formEmailLabel", label: "Email — label", hint: "Email" },
          { key: "formEmailPlaceholder", label: "Email — placeholder", hint: "Your email*" },
          { key: "formPhoneLabel", label: "Telefon — label", hint: "Phone" },
          { key: "formPhonePlaceholder", label: "Telefon — placeholder", hint: "Your phone*" },
          { key: "formMessageLabel", label: "Mesaj — label", hint: "Message" },
          { key: "formMessagePlaceholder", label: "Mesaj — placeholder", hint: "Your message" },
          { key: "formCvLabel", label: "CV — label", hint: "CV yüklə*" },
          { key: "formCvPlaceholder", label: "CV — placeholder", hint: "pdf, png, jpg" },
          { key: "formSubmitLabel", label: "Submit düyməsi yazısı", hint: "Göndər" },
        ])}
      </div>
    </div>
  );
}