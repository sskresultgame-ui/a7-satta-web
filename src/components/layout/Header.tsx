"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="bg-[#1a1a2e] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-black text-lg text-white shadow-md">
              A7
            </div>
            <span className="text-lg md:text-xl font-black tracking-tight">
              <span className="text-white">A7</span>
              <span className="text-amber-400">SATTA</span>
            </span>
          </Link>

          {/* Nav links - always visible */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                    active
                      ? "bg-amber-500 text-white shadow-md"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Yellow marquee bar */}
      <div className="bg-amber-500 text-white py-1 overflow-hidden w-full">
        <div className="animate-marquee whitespace-nowrap text-[10px] md:text-xs font-bold">
          Welcome to A7Satta.co &mdash; Superfast Live A7 Satta Results &bull; Gali, Desawar, Ghaziabad, Faridabad, Shri Ganesh, Delhi Bazar &bull; 100+ Games &bull; Free Monthly Chart Records 2015-2026 &bull; Updated Every Minute
        </div>
      </div>
    </header>
  );
}
