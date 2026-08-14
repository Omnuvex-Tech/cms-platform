import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Treva Admin",
    description: "Treva Admin Panel",
    robots: {
        index: false,
        follow: false,
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="az">
            <body suppressHydrationWarning>{children}</body>
        </html>
    );
}