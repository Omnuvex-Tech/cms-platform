import type { MetadataRoute } from "next";

// Admin paneli indeksləşdirilməməlidir.
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            disallow: "/",
        },
    };
}
