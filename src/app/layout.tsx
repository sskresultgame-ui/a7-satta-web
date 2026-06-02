import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "A7 Satta | Live A7 Satta Result 2026 | Gali Desawar Faridabad Ghaziabad",
    template: "%s | A7 Satta",
  },
  description:
    "A7Satta.co - Get superfast live A7 Satta results for Gali, Desawar, Ghaziabad, Faridabad, Shri Ganesh, Delhi Bazar & 100+ games. Monthly chart records. Updated daily.",
  keywords: [
    "a7 satta",
    "satta king result",
    "satta king",
    "satta result",
    "gali result",
    "desawar result",
    "satta king 2026",
    "satta king live",
    "live satta result",
    "a7satta",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://a7satta.co",
    siteName: "A7 Satta",
    title: "A7 Satta | Live A7 Satta Result 2026",
    description:
      "Superfast live A7 Satta results for Gali, Desawar, Ghaziabad, Faridabad & 100+ games.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://a7satta.co" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        {/* <Footer /> */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
