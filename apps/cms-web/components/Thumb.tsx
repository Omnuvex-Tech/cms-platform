"use client";

import { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";

/**
 * Siyahı cədvəllərindəki kiçik önizləmə şəkli.
 *
 * Bazadakı yol qalsa da fayl diskdə olmaya bilər — o halda brauzer öz "sınıq
 * şəkil" ikonunu göstərir və cədvəl səliqəsiz görünür. Bu komponent belə halda
 * səssizcə neytral placeholder-ə keçir.
 *
 * Stil sinifləri prop kimi gəlir, çünki hər səhifə öz CSS modulunu işlədir
 * (bax: RichEditor-dakı eyni yanaşma).
 */
export function Thumb({
    src,
    className,
    fallbackClassName,
    alt = "",
}: {
    src?: string | null;
    className?: string;
    fallbackClassName?: string;
    alt?: string;
}) {
    const [failed, setFailed] = useState(false);

    // Sətir sıralananda və ya şəkil dəyişəndə xəta vəziyyəti sıfırlanmalıdır.
    useEffect(() => {
        setFailed(false);
    }, [src]);

    if (!src || failed) {
        return (
            <span className={fallbackClassName} aria-hidden="true">
                <ImageOff size={15} strokeWidth={1.8} />
            </span>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            loading="lazy"
            onError={() => setFailed(true)}
        />
    );
}
