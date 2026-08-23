import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Masthead } from "@/components/Masthead";
import { SiteFooter } from "@/components/SiteFooter";

const display = Inter({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-mono-face", subsets: ["latin"], display: "swap" });

export const siteURL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteURL),
  title: {
    default: "Book Music — every book has a soundtrack",
    template: "%s · Book Music",
  },
  description:
    "A community soundtrack for every book. Find what you're reading, hear what other readers put to it, and vote on the songs that belong.",
  openGraph: {
    type: "website",
    siteName: "Book Music",
    url: siteURL,
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: { capable: true, title: "Book Music", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Masthead />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
