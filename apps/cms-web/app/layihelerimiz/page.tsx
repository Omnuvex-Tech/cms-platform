"use client";

import { useEffect, useState, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;
const TREVA_API = "http://localhost:10011/api/v1";

interface OffPlanCategory {
  id: string;
  title: string;
  name: string;
  slug: string;
  image?: string | null;
}

interface CmsDisplayData {
  id: string;
  slug: string;
  image: string | null;
  description: string | null;
  brand: string | null;
  order: number;
  isVisible: boolean;
}

interface MergedCategory {
  id: string;
  offPlanId: string;
  title: string;
  slug: string;
  image: string | null;
  cmsId: string | null;
  description: string | null;
  brand: string | null;
  order: number;
  isVisible: boolean;
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
  if (!res.ok) throw new Error("Fayl yükləmə uğursuz");
  return (await res.json()).url;
}

function toAbsUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${API}${path}`;
}

export default function LayihelerimizPage() {
  const [items, setItems] = useState<MergedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MergedCategory | null>(null);
  const [saving, setSaving] = useState(false);

  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [offPlanCategories, cmsCategories]: [OffPlanCategory[], CmsDisplayData[]] = await Promise.all([
        fetch(`${TREVA_API}/categories`).then((r) => r.json()),
        cmsApiFetch("/layihelerimiz/categories"),
      ]);

      const cmsBySlug: Record<string, CmsDisplayData> = {};
      for (const cat of cmsCategories) {
        cmsBySlug[cat.slug] = cat;
      }

      const merged: MergedCategory[] = offPlanCategories.map((cat) => {
        const cms = cmsBySlug[cat.slug];
        return {
          id: cat.id,
          offPlanId: cat.id,
          title: cat.title,
          slug: cat.slug,
          image: cms?.image || cat.image || null,
          cmsId: cms?.id || null,
          description: cms?.description || null,
          brand: cms?.brand || null,
          order: cms?.order ?? 0,
          isVisible: cms?.isVisible ?? true,
        };
      });

      setItems(merged);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (item: MergedCategory) => {
    setEditingItem(item);
    setImage(item.image || "");
    setImageFile(null);
    setImagePreview(item.image ? toAbsUrl(item.image) : "");
    setDescription(item.description || "");
    setBrand(item.brand || "");
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
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!editingItem) return;
    setSaving(true);
    try {
      let imageUrl = image;
      if (imageFile) {
        setImageUploading(true);
        imageUrl = await uploadFile(imageFile);
        setImageUploading(false);
      }

      const payload = {
        title: editingItem.title,
        slug: editingItem.slug,
        image: imageUrl || null,
        description: description.trim() || null,
        brand: brand.trim() || null,
        order: editingItem.order,
        isVisible: editingItem.isVisible,
      };

      if (editingItem.cmsId) {
        await cmsApiFetch(`/layihelerimiz/categories/${editingItem.cmsId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await cmsApiFetch("/layihelerimiz/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      load();
    } catch (e: any) {
      alert("Xəta: " + e.message);
    } finally {
      setSaving(false);
      setImageUploading(false);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Layihelerimiz</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
          Kateqoriyalar off-plan-dan avtomatik gəlir. Şəkil və brand məlumatlarını buradan əlavə edin.
        </p>
      </div>

      {loading ? (
        <p>Yüklənir...</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {items.map((item) => (
            <div
              key={item.slug}
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
                  alt={item.title}
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
                <div style={{ fontWeight: 600, fontSize: 15 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  /{item.slug}
                  {item.brand && (
                    <> · {item.brand}</>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {item.cmsId ? (
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 12,
                      background: "#dcfce7",
                      color: "#166534",
                    }}
                  >
                    Şəkil var
                  </span>
                ) : (
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 12,
                      background: "#fef3c7",
                      color: "#92400e",
                    }}
                  >
                    Şəkil yoxdur
                  </span>
                )}
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
                  {item.cmsId ? "Redaktə" : "Şəkil əlavə et"}
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && editingItem && (
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
              width: 500,
              maxHeight: "85vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              {editingItem.title}
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              Slug: {editingItem.slug}
            </p>

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
              {imagePreview ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage("");
                      setImageFile(null);
                      setImagePreview("");
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
                  <small>WebP, JPEG, PNG (max 10MB)</small>
                </div>
              )}
            </div>

            {/* Description */}
            <label style={labelStyle}>Təsvir</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qısa təsvir"
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />

            {/* Brand */}
            <label style={labelStyle}>Brand</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Reportage."
              style={inputStyle}
            />

            {/* Buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
              <button
                onClick={handleSave}
                disabled={saving || imageUploading}
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
                  opacity: saving || imageUploading ? 0.6 : 1,
                }}
              >
                {saving ? "Saxlanılır..." : imageUploading ? "Şəkil yüklənir..." : "Saxla"}
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
