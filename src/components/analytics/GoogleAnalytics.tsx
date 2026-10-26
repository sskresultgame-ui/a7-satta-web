"use client";

import Script from "next/script";
import { useEffect } from "react";

// GA4 property "a7satta.co" (Satta King 24 account). Can be overridden with NEXT_PUBLIC_GA_MEASUREMENT_ID.
export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-TY37ZC0N28";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function track(event: string, params: Record<string, string>) {
  window.gtag?.("event", event, params);
}

/**
 * Loads GA4 and counts every WhatsApp and phone click on the site.
 * One listener on the whole page catches ALL WhatsApp links (wa.me / api.whatsapp.com),
 * including ones added in the future. Add data-track-location="..." to a link to name it in reports.
 */
export function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_ID) return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.href || "";
      const location = link.dataset.trackLocation || "unlabelled";
      const base = { button_location: location, page_path: window.location.pathname, link_url: href };

      if (/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|whatsapp:)/i.test(href)) {
        track("whatsapp_click", base);
      } else if (href.startsWith("tel:")) {
        track("phone_click", base);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!GA_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
