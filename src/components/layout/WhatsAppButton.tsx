"use client";

import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppLink } from "@/lib/utils";

export function WhatsAppButton() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";

  return (
    <div className="fixed bottom-4 right-3 md:bottom-6 md:right-6 z-50">
      <a
        href={getWhatsAppLink(phone, "A7 SATTA")}
        target="_blank"
        rel="noopener noreferrer"
        className="animate-float bg-green-500 hover:bg-green-600 text-white p-3.5 md:p-4 rounded-2xl shadow-xl shadow-green-500/30 transition-all hover:scale-110 block"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="w-6 h-6 md:w-8 md:h-8" />
      </a>
    </div>
  );
}
