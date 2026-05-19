import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Trenders Admin",
    description: "Trenders Admin Panel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="az">
            <body>{children}</body>
        </html>
    );
}