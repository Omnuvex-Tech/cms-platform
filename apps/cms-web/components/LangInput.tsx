"use client";

import React from "react";
import styles from "@/styles/blog.module.css";

type LocalizedValue = Record<string, string> | string | null | undefined;

interface LangInputProps {
  label: string;
  value: LocalizedValue;
  onChange: (val: Record<string, string>) => void;
  type?: "input" | "textarea";
  placeholder?: string;
  rows?: number;
}

const LANGS = ["az", "en", "ru"] as const;
const LANG_LABELS: Record<string, string> = { az: "AZ", en: "EN", ru: "RU" };

function toObj(val: LocalizedValue): Record<string, string> {
  if (!val) return { az: "", en: "", ru: "" };
  if (typeof val === "string") return { az: val, en: val, ru: val };
  return { az: val.az || "", en: val.en || "", ru: val.ru || "" };
}

/**
 * Üç dilin eyni anda redaktəsi.
 *
 * Dil kodu ayrıca sətirdə deyil, kontrolun içindəki sol relsdədir — beləcə bu
 * komponent adi bir sahə ilə eyni hündürlükdə olur və iki sütunlu sırada
 * kontrollar eyni xətdə oturur.
 */
export function LangInput({ label, value, onChange, type = "input", placeholder = "", rows = 3 }: LangInputProps) {
  const obj = toObj(value);
  const isTextarea = type === "textarea";

  const update = (lang: string, v: string) => {
    onChange({ ...obj, [lang]: v });
  };

  return (
    <div className={styles.langField}>
      <label>{label}</label>
      <div className={styles.langGrid}>
        {LANGS.map((lang) => (
          <div key={lang} className={styles.langCell}>
            <span className={`${styles.langBadge} ${isTextarea ? styles.langBadgeTop : ""}`}>
              {LANG_LABELS[lang]}
            </span>
            {isTextarea ? (
              <textarea
                className={`${styles.textarea} ${styles.langControl}`}
                value={obj[lang]}
                onChange={(e) => update(lang, e.target.value)}
                placeholder={placeholder}
                rows={rows}
                aria-label={`${label} (${LANG_LABELS[lang]})`}
              />
            ) : (
              <input
                className={`${styles.input} ${styles.langControl}`}
                value={obj[lang]}
                onChange={(e) => update(lang, e.target.value)}
                placeholder={placeholder}
                aria-label={`${label} (${LANG_LABELS[lang]})`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function getLocalized(val: LocalizedValue, locale: string, fallback = ""): string {
  if (!val) return fallback;
  if (typeof val === "string") return val || fallback;
  return val[locale] || val.az || val.en || val.ru || fallback;
}
