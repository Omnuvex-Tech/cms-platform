"use client";

import { useState, useEffect } from "react";

/** Addan baş hərfləri çıxarır: "Əli Məmmədov" → "ƏM" */
function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0]!.slice(0, 2);
    return (parts[0]![0] ?? "") + (parts[parts.length - 1]![0] ?? "");
}

/**
 * Siyahılarda şəxs avatarı.
 *
 * Şəkil yoxdursa və ya yüklənmirsə baş hərflərə keçir — belədə cədvəldə boş
 * sütun qalmır. Stil sinifləri prop kimi gəlir (səhifə öz CSS modulunu işlədir).
 */
export function Avatar({
    src,
    name,
    className,
    imgClassName,
}: {
    src?: string | null;
    name?: string;
    className?: string;
    imgClassName?: string;
}) {
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [src]);

    const label = initials(name || "");

    return (
        <span className={className} title={name || undefined}>
            {src && !failed ? (
                <img
                    src={src}
                    alt=""
                    className={imgClassName}
                    loading="lazy"
                    onError={() => setFailed(true)}
                />
            ) : (
                label
            )}
        </span>
    );
}
