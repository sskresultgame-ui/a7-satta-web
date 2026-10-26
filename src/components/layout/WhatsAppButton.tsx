"use client";

import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppLink } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

// All styles for the floating button live here (inline + scoped <style>),
// so the colours always show even if globals.css is cached.
const CTA_CSS = `
@keyframes a7WaFlow { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
@keyframes a7WaGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,.65), 0 10px 28px rgba(22,163,74,.55); }
  50%      { box-shadow: 0 0 0 10px rgba(220,38,38,0), 0 10px 28px rgba(220,38,38,.55); }
}
@keyframes a7WaShake {
  0%, 84%, 100% { transform: rotate(0); }
  87% { transform: rotate(-16deg); } 90% { transform: rotate(16deg); }
  93% { transform: rotate(-10deg); } 96% { transform: rotate(10deg); }
}
@keyframes a7WaShine { 0% { left: -60%; } 60%, 100% { left: 130%; } }
.a7-wa-cta {
  background-color: #16a34a;
  background-image: linear-gradient(90deg, #15803d, #22c55e, #dc2626, #ef4444, #15803d);
  background-size: 200% 100%;
  animation: a7WaFlow 2.4s linear infinite, a7WaGlow 1.6s ease-in-out infinite;
}
.a7-wa-cta::after {
  content: ""; position: absolute; top: 0; bottom: 0; width: 40%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,.35), transparent);
  animation: a7WaShine 2.8s ease-in-out infinite; pointer-events: none;
}
.a7-wa-icon { animation: a7WaShake 2.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .a7-wa-cta, .a7-wa-cta::after, .a7-wa-icon { animation: none; }
}
`;

export function WhatsAppButton({ phone }: { phone: string }) {
  const { lang, toggleLang } = useLanguage();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CTA_CSS }} />

      {/* Spacer so the fixed bottom button never covers the end of the page */}
      <div aria-hidden style={{ height: 96 }} />

      {/* Language toggle — bottom right, above the WhatsApp bar */}
      <button
        onClick={toggleLang}
        className="fixed right-3 md:right-6 bottom-24 md:bottom-28 z-50 bg-[#1a1a2e] text-white px-4 py-2.5 rounded-2xl shadow-xl shadow-black/20 text-sm font-bold border border-white/15 hover:bg-[#2a2a4e] transition-all hover:scale-105 active:scale-95"
      >
        {lang === "hi" ? "A→अ" : "अ→A"}
      </button>

      {/* WhatsApp — bottom centre, wide, green/red animated */}
      <div className="fixed inset-x-0 bottom-3 md:bottom-5 z-50 flex justify-center px-3 pointer-events-none">
        <a
          href={getWhatsAppLink(phone, "A7 SATTA")}
          data-track-location="floating_whatsapp_button"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp par game khelo – hand to hand payment"
          className="a7-wa-cta pointer-events-auto relative overflow-hidden flex items-center gap-3 w-full max-w-md rounded-full pl-2 pr-5 py-2 text-white transition-transform hover:scale-[1.03] active:scale-95"
          style={{ backgroundColor: "#16a34a", border: "2px solid rgba(255,255,255,.9)" }}
        >
          <span
            className="a7-wa-icon flex items-center justify-center rounded-full shrink-0"
            style={{ width: 48, height: 48, background: "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,.25)" }}
          >
            <FaWhatsapp style={{ width: 30, height: 30, color: "#16a34a" }} />
          </span>
          <span className="flex flex-col flex-1 items-center text-center leading-tight" style={{ textShadow: "0 1px 3px rgba(0,0,0,.45)" }}>
            <span className="font-black text-[15px] sm:text-lg uppercase tracking-wide whitespace-nowrap">
              WhatsApp par game khelo
            </span>
            <span
              className="mt-1 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider rounded-full px-2.5 py-0.5"
              style={{ background: "#facc15", color: "#1a1a2e", textShadow: "none" }}
            >
              ✅ Hand to hand payment
            </span>
          </span>
        </a>
      </div>
    </>
  );
}
