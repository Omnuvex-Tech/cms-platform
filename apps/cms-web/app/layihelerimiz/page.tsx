"use client";

import { useEffect, useState, useRef } from "react";
import { LangInput, getLocalized } from "@/components/LangInput";

const API = process.env.NEXT_PUBLIC_API_URL;

type LocalizedValue = Record<string, string> | string | null | undefined;

function toObj(val: LocalizedValue): { az: string; en: string; ru: string } {
  if (!val) return { az: "", en: "", ru: "" };
  if (typeof val === "string") return { az: val, en: val, ru: val };
  return { az: val.az || "", en: val.en || "", ru: val.ru || "" };
}

async function prepareImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const maxDimension = 1920;
  const quality = 0.85;

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    const { width, height } = bitmap;
    if (!width || !height) return file;

    const scale = Math.min(1, maxDimension / Math.max(width, height));
    if (scale === 1 && file.type === "image/webp" && file.size <= 1_500_000)
      return file;

    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", quality);
    });
    if (!blob) return file;

    if (blob.size >= file.size) return file;

    const safeBaseName =
      (file.name || "image")
        .replace(/\.[^.]+$/, "")
        .replace(/[^\w\-]+/g, "_")
        .slice(0, 60) || "image";

    return new File([blob], `${safeBaseName}.webp`, { type: blob.type });
  } finally {
    bitmap.close();
  }
}

interface LayihelerimizCategory {
  id: string;
  title?: LocalizedValue;
  slug: string;
  image: string | null;
  brandImage: string | null;
  description: LocalizedValue;
  brand: LocalizedValue;
  brandTextColor: string | null;
  order: number;
  isVisible: boolean;
  createdAt?: string;
}

function getToken() {
  return document.cookie.split("access_token=")[1]?.split(";")[0] ?? "";
}

async function cmsApiFetch(path: string, options?: RequestInit) {
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
  const res = await fetch(`${API}/layihelerimiz/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const trimmed = text.trim();
    if (res.status === 413) {
      throw new Error(
        `Fayl çox böyük (HTTP 413). Server/proxy limitini artırın (nginx client_max_body_size). ${
          trimmed ? `Cavab: ${trimmed.slice(0, 200)}` : ""
        }`.trim(),
      );
    }
    let message = `HTTP ${res.status}`;
    try {
      const json = trimmed ? JSON.parse(trimmed) : null;
      message =
        json?.message ||
        json?.error ||
        (typeof json === "string" ? json : message);
    } catch {
      if (trimmed) message = trimmed.slice(0, 200);
    }
    throw new Error(`Fayl yükləmə uğursuz: ${message}`);
  }
  return (await res.json()).url;
}

function toAbsUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${API}${path}`;
}

interface FormState {
  title: Record<string, string>;
  slug: string;
  image: string;
  imageFile: File | null;
  imagePreview: string;
  brandImage: string;
  brandImageFile: File | null;
  brandImagePreview: string;
  description: Record<string, string>;
  brand: Record<string, string>;
  brandTextColor: string;
  order: number;
  isVisible: boolean;
}

const emptyForm: FormState = {
  title: { az: "", en: "", ru: "" },
  slug: "",
  image: "",
  imageFile: null,
  imagePreview: "",
  brandImage: "",
  brandImageFile: null,
  brandImagePreview: "",
  description: { az: "", en: "", ru: "" },
  brand: { az: "", en: "", ru: "" },
  brandTextColor: "white",
  order: 0,
  isVisible: true,
};

export default function LayihelerimizPage() {
  const [items, setItems] = useState<LayihelerimizCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LayihelerimizCategory | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [imageUploading, setImageUploading] = useState(false);
  const [brandImageUploading, setBrandImageUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const brandFileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data: LayihelerimizCategory[] = await cmsApiFetch("/layihelerimiz/categories");
      data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditingItem(null);
    setIsNew(true);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (item: LayihelerimizCategory) => {
    setEditingItem(item);
    setIsNew(false);
    setForm({
      title: toObj(item.title),
      slug: item.slug,
      image: item.image || "",
      imageFile: null,
      imagePreview: item.image ? toAbsUrl(item.image) : "",
      brandImage: item.brandImage || "",
      brandImageFile: null,
      brandImagePreview: item.brandImage ? toAbsUrl(item.brandImage) : "",
      description: toObj(item.description),
      brand: toObj(item.brand),
      brandTextColor: item.brandTextColor || "white",
      order: item.order ?? 0,
      isVisible: item.isVisible ?? true,
    });
    setModalOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/webp", "image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Yalnız WebP, JPEG və PNG formatları qəbul edilir");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    void (async () => {
      const prepared = await prepareImageFile(file);
      setForm((f) => ({
        ...f,
        imageFile: prepared,
        imagePreview: URL.createObjectURL(prepared),
      }));
    })();
  };

  const handleBrandImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/webp", "image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Yalnız WebP, JPEG və PNG formatları qəbul edilir");
      if (brandFileInputRef.current) brandFileInputRef.current.value = "";
      return;
    }
    void (async () => {
      const prepared = await prepareImageFile(file);
      setForm((f) => ({
        ...f,
        brandImageFile: prepared,
        brandImagePreview: URL.createObjectURL(prepared),
      }));
    })();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrl = form.image;
      if (form.imageFile) {
        setImageUploading(true);
        imageUrl = await uploadFile(form.imageFile);
        setImageUploading(false);
      }

      let brandImageUrl = form.brandImage;
      if (form.brandImageFile) {
        setBrandImageUploading(true);
        brandImageUrl = await uploadFile(form.brandImageFile);
        setBrandImageUploading(false);
      }

      const payload: Record<string, unknown> = {
        title: (form.title.az || form.title.en || form.title.ru) ? form.title : null,
        image: imageUrl || null,
        brandImage: brandImageUrl || null,
        description: (form.description.az || form.description.en || form.description.ru) ? form.description : null,
        brand: (form.brand.az || form.brand.en || form.brand.ru) ? form.brand : null,
        brandTextColor: form.brandTextColor,
        order: form.order,
        isVisible: form.isVisible,
      };

      if (isNew) {
        if (form.slug) payload.slug = form.slug;
        await cmsApiFetch("/layihelerimiz/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else if (editingItem) {
        if (form.slug) payload.slug = form.slug;
        await cmsApiFetch(`/layihelerimiz/categories/${editingItem.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert("Xəta: " + msg);
    } finally {
      setSaving(false);
      setImageUploading(false);
      setBrandImageUploading(false);
    }
  };

  const handleDelete = async (item: LayihelerimizCategory) => {
    const name = getLocalized(item.title, "az") || item.slug;
    const confirmed = window.confirm(`"${name}" silinsin?`);
    if (!confirmed) return;
    try {
      const token = getToken();
      const res = await fetch(`${API}/layihelerimiz/categories/${item.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || err?.error || `HTTP ${res.status}`);
      }
      load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      window.alert("Xəta: " + msg);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Layihelerimiz</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Layiheleri buradan idarə edin. Kateqoriyalar müstəqildir.
          </p>
        </div>
        <button
          onClick={openNew}
          style={{
            padding: "10px 20px",
            background: "#1e3a5f",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          + Yeni Layihə
        </button>
      </div>

      {loading ? (
        <p>Yüklənir...</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          <p style={{ fontSize: 16 }}>Hələ heç bir kateqoriya yoxdur</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Yuxarıdakı "Yeni Kateqoriya" düyməsinə klikləyin</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: 16,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
              }}
            >
              {item.image ? (
                <img
                  src={toAbsUrl(item.image)}
                  alt={getLocalized(item.title, "az") || ""}
                  style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 8 }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 60,
                    background: "#f3f4f6",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#9ca3af",
                  }}
                >
                  Şəkil yoxdur
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {getLocalized(item.title, "az") || item.slug}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  /{item.slug}
                  {item.brand && (
                    <> · {getLocalized(item.brand, "az")}</>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 12,
                    background: item.isVisible ? "#dcfce7" : "#fee2e2",
                    color: item.isVisible ? "#166534" : "#991b1b",
                  }}
                >
                  {item.isVisible ? "Görünür" : "Gizli"}
                </span>
                <button
                  onClick={() => openEdit(item)}
                  style={{
                    padding: "6px 12px",
                    background: "#1e3a5f",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Redaktə
                </button>
                <a
                  href={`/layihelerimiz/${item.slug}`}
                  style={{
                    padding: "6px 12px",
                    background: "#059669",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Layihə Detalları
                </a>
                <button
                  onClick={() => handleDelete(item)}
                  style={{
                    padding: "6px 12px",
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 32,
              width: 560,
              maxHeight: "85vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
              {isNew ? "Yeni Kateqoriya" : "Kateqoriyanı Redaktə Et"}
            </h2>

            {/* Title (multilingual) */}
            <LangInput label="Başlıq (Az/En/Ru)" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />

            {/* Slug */}
            <label style={labelStyle}>Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="avtomatik yaranacaq"
              style={inputStyle}
            />

            {/* Image */}
            <label style={labelStyle}>Şəkil</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/webp,image/jpeg,image/png"
              style={{ display: "none" }}
              onChange={handleImageSelect}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed #d1d5db",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
                cursor: "pointer",
                marginBottom: 16,
                background: "#f9fafb",
              }}
            >
              {form.imagePreview ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={form.imagePreview}
                    alt="Preview"
                    style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm((f) => ({ ...f, image: "", imageFile: null, imagePreview: "" }));
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "#dc2626",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{ color: "#9ca3af" }}>
                  <p>Şəkil yükləmək üçün klikləyin</p>
                  <small>WebP, JPEG, PNG (max 50MB)</small>
                </div>
              )}
            </div>

            {/* Brand Image */}
            <label style={labelStyle}>Brand Şəkli</label>
            <input
              ref={brandFileInputRef}
              type="file"
              accept="image/webp,image/jpeg,image/png"
              style={{ display: "none" }}
              onChange={handleBrandImageSelect}
            />
            <div
              onClick={() => brandFileInputRef.current?.click()}
              style={{
                border: "2px dashed #d1d5db",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
                cursor: "pointer",
                marginBottom: 16,
                background: "#f9fafb",
              }}
            >
              {form.brandImagePreview ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={form.brandImagePreview}
                    alt="Brand Preview"
                    style={{ maxWidth: "100%", maxHeight: 120, borderRadius: 8 }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm((f) => ({ ...f, brandImage: "", brandImageFile: null, brandImagePreview: "" }));
                      if (brandFileInputRef.current) brandFileInputRef.current.value = "";
                    }}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "#dc2626",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{ color: "#9ca3af" }}>
                  <p>Brend loqosu yüklə</p>
                  <small>WebP, JPEG, PNG (max 50MB)</small>
                </div>
              )}
            </div>

            {/* Description */}
            <LangInput label="Təsvir" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} type="textarea" placeholder="Qısa təsvir" />

            {/* Brand */}
            <LangInput label="Brand" value={form.brand} onChange={(v) => setForm((f) => ({ ...f, brand: v }))} placeholder="Reportage." />

            {/* Brand Text Color */}
            <label style={labelStyle}>Brend Mətn Rəngi</label>
            <select
              value={form.brandTextColor}
              onChange={(e) => setForm((f) => ({ ...f, brandTextColor: e.target.value }))}
              style={inputStyle}
            >
              <option value="white">Ağ (White)</option>
              <option value="black">Qara (Black)</option>
            </select>

            {/* Order */}
            <label style={labelStyle}>Sıra (Order)</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
              placeholder="0"
              style={inputStyle}
            />

            {/* Is Visible */}
            <label style={labelStyle}>Görünür</label>
            <select
              value={form.isVisible ? "true" : "false"}
              onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.value === "true" }))}
              style={inputStyle}
            >
              <option value="true">Bəli</option>
              <option value="false">Xeyr</option>
            </select>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
              <button
                onClick={handleSave}
                disabled={saving || imageUploading || brandImageUploading}
                style={{
                  flex: 1,
                  padding: "10px 20px",
                  background: "#1e3a5f",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                  opacity: saving || imageUploading || brandImageUploading ? 0.6 : 1,
                }}
              >
                {saving ? "Saxlanılır..." : imageUploading ? "Şəkil yüklənir..." : brandImageUploading ? "Brand şəkli yüklənir..." : "Saxla"}
              </button>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  padding: "10px 20px",
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Ləğv
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 4,
  marginTop: 12,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};
