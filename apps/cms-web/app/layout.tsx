import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "EmlaX Admin Panel",
    description: "TREVA Sales Agent — Admin Panel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
                <Script
                    src="http://localhost:3000/webchat/widget.js"
                    data-title="TREVA Assistant"
                    strategy="lazyOnload"
                />
            </body>
        </html>
    );
}
