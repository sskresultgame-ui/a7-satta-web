"use client";

import { FaWhatsapp } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";

export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 text-sm mb-8">Get in touch with A7Satta.co team</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* WhatsApp Card */}
          <a
            href={`https://wa.me/91${phone}?text=${encodeURIComponent("A7 SATTA")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-50 rounded-2xl border border-gray-200 p-5 flex items-start gap-4 hover:shadow-lg hover:border-green-300 transition-all group"
          >
            <div className="p-3 rounded-xl bg-green-500 text-white shrink-0 group-hover:scale-110 transition-transform">
              <FaWhatsapp size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">WhatsApp</h3>
              <p className="text-gray-500 text-sm mt-0.5">Chat with us instantly</p>
              <p className="text-green-600 font-bold text-sm mt-2">{phone}</p>
            </div>
          </a>

          {/* Phone Card */}
          <a
            href={`tel:+91${phone}`}
            className="bg-gray-50 rounded-2xl border border-gray-200 p-5 flex items-start gap-4 hover:shadow-lg hover:border-blue-300 transition-all group"
          >
            <div className="p-3 rounded-xl bg-blue-600 text-white shrink-0 group-hover:scale-110 transition-transform">
              <FiPhone size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Phone</h3>
              <p className="text-gray-500 text-sm mt-0.5">Call us directly</p>
              <p className="text-blue-600 font-bold text-sm mt-2">+91 {phone}</p>
            </div>
          </a>

        </div>

        {/* WhatsApp CTA */}
        <div className="bg-[#1a1a2e] rounded-2xl p-6 md:p-8 text-center">
          <p className="text-white font-bold text-lg mb-1">Game play karne ke liye contact kare</p>
          <p className="text-amber-400 font-black text-2xl mb-4">A7 SATTA</p>
          <a
            href={`https://wa.me/91${phone}?text=${encodeURIComponent("A7 SATTA")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-black text-lg px-8 py-3.5 rounded-2xl shadow-xl shadow-green-500/25 transition-all hover:scale-105"
          >
            <FaWhatsapp className="w-7 h-7" />
            <div className="text-left">
              <div className="text-lg font-black leading-tight">WhatsApp Now</div>
              <div className="text-xs font-semibold opacity-80">Click to chat instantly</div>
            </div>
          </a>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700">
          <strong>Disclaimer:</strong> A7Satta.co is an informational website only. We do not promote or facilitate gambling in any form. Please follow your local laws.
        </div>
      </div>
    </div>
  );
}
