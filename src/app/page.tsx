import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getHomeData } from "@/lib/home-data";
import { getHomepageSeo, getKhaiwal } from "@/lib/site-settings";
import { fillDate } from "@/lib/khaiwal";

// Re-render the server data at most every 60s (matches the getHomeData memo and
// the /api/home edge cache). Saving in the admin panel refreshes it instantly.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getHomepageSeo();
  const title = fillDate(seo.metaTitle);
  const description = fillDate(seo.metaDescription);
  return {
    title: { absolute: title },
    description,
    keywords: seo.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    openGraph: { type: "website", locale: "en_IN", url: "https://a7satta.co", siteName: "A7 Satta", title, description, images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "A7 Satta" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.jpg"] },
    alternates: { canonical: "https://www.a7satta.co" },
  };
}

export default async function HomePage() {
  // Khaiwal + SEO are read outside getHomeData's 60s memo so admin saves show immediately.
  const [initialData, khaiwal, seo] = await Promise.all([getHomeData(), getKhaiwal(), getHomepageSeo()]);
  return <HomeClient initialData={{ ...initialData, khaiwal, seo }} />;
}
