

"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/vacancy.module.css";

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
    backLabel: string;
    applyTitle: string;
    aboutRoleLabel: string;
    skillsLabel: string;
    responsibleLabel: string;
    requirementsLabel: string;
    email: string;
    emailHref: string;
    phone: string;
    phoneHref: string;
    location: string;
    emailLabel: string;
    phoneLabel: string;
    locationLabel: string;
    // Form sahələri
    formNameLabel: string;
    formNamePlaceholder: string;
    formEmailLabel: string;
    formEmailPlaceholder: string;
    formPhoneLabel: string;
    formPhonePlaceholder: string;
    formMessageLabel: string;
    formMessagePlaceholder: string;
    formCvLabel: string;
    formCvPlaceholder: string;
    formSubmitLabel: string;
}

const DEFAULT: VacancySettings = {
    backLabel: "",
    applyTitle: "",
    aboutRoleLabel: "",
    skillsLabel: "",
    responsibleLabel: "",
    requirementsLabel: "",
    email: "",
    emailHref: "",
    phone: "",
    phoneHref: "",
    location: "",
    emailLabel: "",
    phoneLabel: "",
    locationLabel: "",
    formNameLabel: "",
    formNamePlaceholder: "",
    formEmailLabel: "",
    formEmailPlaceholder: "",
    formPhoneLabel: "",
    formPhonePlaceholder: "",
    formMessageLabel: "",
    formMessagePlaceholder: "",
    formCvLabel: "",
    formCvPlaceholder: "",
    formSubmitLabel: "",
};

export default function VacancySettingPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<"success" | "error" | null>(null);
    const [settings, setSettings] = useState<VacancySettings>(DEFAULT);

    useEffect(() => {
        apiFetch("/vacancy/settings")
            .then((data) => { if (data) setSettings(data); })
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (key: keyof VacancySettings, value: string) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const save = async () => {
        setSaving(true);
        try {
            await apiFetch("/vacancy/settings", {
                method: "PATCH",
                body: JSON.stringify(settings),
            });
            setToast("success");
        } catch {
            setToast("error");
        } finally {
            setSaving(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    if (loading) return <div className={styles.page}><div className={styles.empty}>Yüklənir...</div></div>;

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

            {/* Detail səhifəsi başlıqları */}
            <div className={styles.sectionCard}>
                <h2 className={styles.sectionCardTitle}>Detail səhifəsi başlıqları</h2>
                <p className={styles.sectionDesc}>Vakansiya detail səhifəsindəki bölmə adları</p>
                {([
                    { key: "backLabel", label: "Geri düyməsi mətni", hint: "← geri linki" },
                    { key: "applyTitle", label: "Müraciət başlığı", hint: "APPLY NOW" },
                    { key: "aboutRoleLabel", label: "About the Role başlığı", hint: "Vakansiya təsviri bölməsi" },
                    { key: "skillsLabel", label: "Skills başlığı", hint: "Bacarıqlar bölməsi" },
                    { key: "responsibleLabel", label: "Responsible başlığı", hint: "Məsuliyyətlər bölməsi" },
                    { key: "requirementsLabel", label: "Requirements başlığı", hint: "Tələblər bölməsi" },
                ] as { key: keyof VacancySettings; label: string; hint: string }[]).map(({ key, label, hint }) => (
                    <div className={styles.field} key={key}>
                        <label>{label}<span className={styles.hint}> — {hint}</span></label>
                        <input className={styles.input} value={settings[key]}
                            onChange={(e) => handleChange(key, e.target.value)} />
                    </div>
                ))}
            </div>

            <div className={styles.sectionCard}>
                <h2 className={styles.sectionCardTitle}>Kontakt məlumatları</h2>
                <p className={styles.sectionDesc}>Detail səhifəsinin sağ altındakı kontakt bloku</p>
                {([
                    { key: "emailLabel", label: "Email bölməsinin adı", hint: "\"Email Adres\" yazısı" },
                    { key: "email", label: "Email ünvanı", hint: "Göstərilən email mətn" },
                    { key: "emailHref", label: "Email link", hint: "mailto:... formatında" },
                    { key: "phoneLabel", label: "Telefon bölməsinin adı", hint: "\"Phone\" yazısı" },
                    { key: "phone", label: "Telefon nömrəsi", hint: "Göstərilən telefon mətn" },
                    { key: "phoneHref", label: "Telefon link", hint: "tel:... formatında" },
                    { key: "locationLabel", label: "Ünvan bölməsinin adı", hint: "\"Location\" yazısı" },
                    { key: "location", label: "Ünvan", hint: "Göstərilən ünvan mətni" },
                ] as { key: keyof VacancySettings; label: string; hint: string }[]).map(({ key, label, hint }) => (
                    <div className={styles.field} key={key}>
                        <label>{label}<span className={styles.hint}> — {hint}</span></label>
                        <input className={styles.input} value={settings[key]}
                            onChange={(e) => handleChange(key, e.target.value)} />
                    </div>
                ))}
            </div>

            {/* Apply Now Formu */}
            <div className={styles.sectionCard}>
                <h2 className={styles.sectionCardTitle}>Apply Now Formu</h2>
                <p className={styles.sectionDesc}>Müraciət formasındakı sahə adları və placeholder-lər</p>

                {([
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
                ] as { key: keyof VacancySettings; label: string; hint: string }[]).map(({ key, label, hint }) => (
                    <div className={styles.field} key={key}>
                        <label>{label}<span className={styles.hint}> — {hint}</span></label>
                        <input className={styles.input} value={settings[key]}
                            onChange={(e) => handleChange(key, e.target.value)} />
                    </div>
                ))}
            </div>

        </div>
    );
}