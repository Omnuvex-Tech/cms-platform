"use client";

import React from "react";

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

export function LangInput({ label, value, onChange, type = "input", placeholder = "", rows = 3 }: LangInputProps) {
  const obj = toObj(value);

  const update = (lang: string, v: string) => {
    onChange({ ...obj, [lang]: v });
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
        {label}
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        {LANGS.map((lang) => (
          <div key={lang} style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4, textTransform: "uppercase" }}>
              {LANG_LABELS[lang]}
            </div>
            {type === "textarea" ? (
              <textarea
                value={obj[lang]}
                onChange={(e) => update(lang, e.target.value)}
                placeholder={placeholder}
                rows={rows}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            ) : (
              <input
                value={obj[lang]}
                onChange={(e) => update(lang, e.target.value)}
                placeholder={placeholder}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: "inherit",
                }}
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
