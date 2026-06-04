"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { FiClock, FiTrendingUp, FiZap, FiBarChart2, FiCalendar, FiChevronDown } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage, t } from "@/context/LanguageContext";

// ─── Types ───

interface GameResult {
  name: string;
  time: string;
  yesterday: string;
  today: string;
}

interface SK24Game {
  name: string;
  time: string;
  yesterday: string;
  today: string;
}

interface SK24ChartTable {
  title: string;
  headers: string[];
  rows: string[][];
}

interface ChartRow {
  date: string;
  dswr: string;
  frbd: string;
  gzbd: string;
  gali: string;
  srgn: string;
  dlbz: string;
}

// ─── Scroll Animation ───

function useScrollAnimation(deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeInUp");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    const el = ref.current;
    if (el) el.querySelectorAll(".sa").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

// ─── Skeleton ───

function CardSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-2xl px-4 py-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="skeleton h-4 w-28 mb-1.5" />
            <div className="skeleton h-3 w-16" />
          </div>
          <div className="skeleton h-8 w-12" />
          <div className="skeleton h-8 w-12" />
          <div className="skeleton h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ───

export default function HomePage() {
  const [liveResults, setLiveResults] = useState<GameResult[]>([]);
  const [nextResults, setNextResults] = useState<GameResult[]>([]);
  const [restResults, setRestResults] = useState<GameResult[]>([]);
  const [sk24Games, setSk24Games] = useState<SK24Game[]>([]);
  const [sk24Charts, setSk24Charts] = useState<SK24ChartTable[]>([]);
  const [monthlyChart, setMonthlyChart] = useState<ChartRow[]>([]);
  const [monthlyChartMeta, setMonthlyChartMeta] = useState<{ month: string; year: string }>({ month: "", year: "" });
  const [loading, setLoading] = useState(true);
  const containerRef = useScrollAnimation([loading]);
  const { lang } = useLanguage();

  useEffect(() => {
    const safeFetch = (url: string) =>
      fetch(url).then((r) => r.json()).catch(() => ({ success: false }));

    const now = new Date();
    const monthName = now.toLocaleString("en-US", { month: "long" }).toLowerCase();
    const year = now.getFullYear().toString();

    Promise.all([
      safeFetch("/api/live-results"),
      safeFetch("/api/next-results"),
      safeFetch("/api/rest-results"),
      safeFetch("/api/sattaking24"),
      safeFetch("/api/sattaking24-chart"),
      safeFetch(`/api/monthly-chart?month=${monthName}&year=${year}`),
    ]).then(([live, next, rest, sk24, sk24chart, chart]) => {
      if (live.success) setLiveResults(live.results || []);
      if (next.success) setNextResults(next.results || []);
      if (rest.success) setRestResults(rest.results || []);
      if (sk24.success) setSk24Games(sk24.games || []);
      if (sk24chart.success) setSk24Charts(sk24chart.tables || []);
      if (chart.success) {
        setMonthlyChart(chart.results || []);
        setMonthlyChartMeta({ month: chart.month || monthName, year: chart.year || year });
      }
      setLoading(false);
    });
  }, []);

  const updatedAt = format(new Date(), "dd MMMM yyyy, hh:mm a") + " IST";

  // Sort SK24 games by time sequence
  const parseTimeToMinutes = (timeStr: string): number => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 9999;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === "AM" && hours === 12) hours = 0;
    if (period === "PM" && hours !== 12) hours += 12;
    return hours * 60 + minutes;
  };
  const sk24GamesSorted = [...sk24Games].sort(
    (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
  );

  const sk24Names = new Set(sk24Games.map(g => g.name.toLowerCase().replace(/\s+/g, "")));
  const isInSK24 = (name: string) => sk24Names.has(name.toLowerCase().replace(/\s+/g, ""));
  const filteredLive = liveResults.filter(g => !isInSK24(g.name));
  const filteredNext = nextResults.filter(g => !isInSK24(g.name));
  const filteredRest = restResults.filter(g => !isInSK24(g.name));

  return (
    <div ref={containerRef} className="bg-white">
      {/* Hero */}
      <div className="bg-[#1a1a2e] text-white text-center py-6 md:py-10 px-3 md:px-4">
        <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/20">
          <span className="text-gray-200 text-xs md:text-sm font-bold tracking-wider uppercase">
            {t("लाइव रिजल्ट डैशबोर्ड", "Live Results Dashboard", lang)}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-2">
          A7 Satta {format(new Date(), "yyyy")}
          <br className="md:hidden" />
          <span className="text-amber-400"> {t("लाइव रिजल्ट", "Live Results", lang)}</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
          {t(
            "सबसे तेज़ A7 सट्टा रिजल्ट अपडेट। गली, देसावर, गाज़ियाबाद, फरीदाबाद और 100+ गेम्स।",
            "Fastest A7 Satta result updates. Gali, Desawar, Ghaziabad, Faridabad & 100+ games.",
            lang
          )}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-gray-400">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-live-pulse" />
          {t("अंतिम अपडेट", "Last Updated", lang)}: {updatedAt}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border-b border-gray-200 py-1.5 px-2 md:px-4">
        <p className="text-center text-[11px] md:text-xs text-gray-500 max-w-4xl mx-auto">
          <span className="font-bold text-red-500">{t("अस्वीकरण", "DISCLAIMER", lang)}:</span>{" "}
          {t(
            "A7Satta.co एक स्वतंत्र सूचनात्मक वेबसाइट है। हम जुआ या सट्टेबाजी को बढ़ावा नहीं देते।",
            "A7Satta.co is an independent informational website. We do not promote gambling or betting.",
            lang
          )}{" "}
          <Link href="/disclaimer" className="text-blue-600 hover:underline font-medium">
            {t("पूरा अस्वीकरण पढ़ें", "Read Full Disclaimer", lang)}
          </Link>
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto px-2 sm:px-3 md:px-6 py-5 md:py-8 space-y-8 md:space-y-10">

        {loading ? (
          <div className="space-y-10">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <>
            {/* SK24 Results - sorted by time */}
            {sk24GamesSorted.length > 0 && (
              <GameCardSection
                title={t("आज के A7 सट्टा रिजल्ट", "Today A7 Satta Results", lang)}
                subtitle={t("इंटरनेट पर सबसे तेज़ A7 सट्टा रिजल्ट", "Fastest A7 Satta result on internet", lang)}
                icon={<FiZap size={18} />}
                headerBg="bg-blue-600"
                accentColor="text-blue-600"
                games={sk24GamesSorted}
                isLive
                lang={lang}
              />
            )}

            {/* LIVE */}
            {filteredLive.length > 0 && (
              <GameCardSection
                title={t("लाइव रिजल्ट", "LIVE Results", lang)}
                subtitle={t("अभी जारी हो रहे गेम्स", "Games currently being declared", lang)}
                icon={<FiZap size={18} />}
                headerBg="bg-red-600"
                accentColor="text-red-600"
                games={filteredLive}
                isLive
                lang={lang}
              />
            )}

            {/* Monthly Chart */}
            <MonthlyChartSection
              initialRows={monthlyChart}
              initialMonth={monthlyChartMeta.month}
              initialYear={monthlyChartMeta.year}
              lang={lang}
            />

            {/* SK24 Charts */}
            {sk24Charts.length > 0 && (
              <SK24ChartsSection tables={sk24Charts} lang={lang} />
            )}

            {/* WhatsApp Contact */}
            <WhatsAppContactSection lang={lang} />

            {/* UPCOMING */}
            {filteredNext.length > 0 && (
              <GameCardSection
                title={t("आने वाले रिजल्ट", "Upcoming Results", lang)}
                subtitle={t("ये गेम्स जल्द जारी होंगे", "These games will be declared soon", lang)}
                icon={<FiClock size={18} />}
                headerBg="bg-amber-600"
                accentColor="text-amber-600"
                games={filteredNext}
                lang={lang}
              />
            )}

            {/* DECLARED */}
            {filteredRest.length > 0 && (
              <GameCardSection
                title={t("घोषित रिजल्ट", "Declared Results", lang)}
                subtitle={t("आज के पूरे हुए गेम रिजल्ट", "Today's completed game results", lang)}
                icon={<FiTrendingUp size={18} />}
                headerBg="bg-emerald-600"
                accentColor="text-emerald-600"
                games={filteredRest}
                lang={lang}
              />
            )}
          </>
        )}

        {/* Welcome */}
        <div className="sa opacity-0 translate-y-8 bg-gray-50 rounded-2xl border border-gray-200 p-5 md:p-8 space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>
            {t(
              <>
                <strong className="text-gray-900">A7Satta.co</strong> में आपका स्वागत है - लाइव <strong className="text-gray-900">A7 सट्टा रिजल्ट</strong> ट्रैक करने का सबसे अच्छा प्लेटफॉर्म। हमारा सिस्टम रिजल्ट घोषित होते ही तुरंत अपडेट करता है।
              </> as unknown as string,
              <>
                Welcome to <strong className="text-gray-900">A7Satta.co</strong> - the ultimate platform for tracking live <strong className="text-gray-900">A7 Satta results</strong>. Our infrastructure delivers results the exact moment they are declared.
              </> as unknown as string,
              lang
            )}
          </p>
          <p>
            {t(
              "100% सटीक दैनिक अपडेट, ऐतिहासिक चार्ट और 100+ राष्ट्रीय व क्षेत्रीय बाजारों की जानकारी, पूरी तरह मुफ्त पाएं।",
              "Get 100% accurate daily updates, historical charts, and insights for over 100+ national and regional markets, completely free.",
              lang
            )}
          </p>
        </div>

        {/* CTA */}
        <div className="sa opacity-0 translate-y-8 bg-[#1a1a2e] rounded-2xl p-5 md:p-6 text-center">
          <p className="text-lg md:text-xl font-black text-white">
            {t("अपना गेम यहाँ एडवरटाइज़ करें", "ADVERTISE YOUR GAME HERE", lang)}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {t("A7Satta.co पर अपने गेम को फीचर करने के लिए संपर्क करें", "Contact us to feature your game on A7Satta.co", lang)}
          </p>
        </div>

        {/* SEO */}
        <SeoContent lang={lang} />
      </div>
    </div>
  );
}

// ─── Game Results Section ───

// function GameCardSection({
//   title,
//   subtitle,
//   icon,
//   headerBg,
//   accentColor,
//   games,
//   isLive,
//   lang,
// }: {
//   title: string;
//   subtitle: string;
//   icon: React.ReactNode;
//   headerBg: string;
//   accentColor: string;
//   games: (GameResult | SK24Game)[];
//   isLive?: boolean;
//   lang: "hi" | "en";
// }) {
//   return (
//     <section className="sa opacity-0 translate-y-8">
//       {/* Section Header */}
//       <div className="flex items-center gap-2.5 md:gap-3 mb-4">
//         <div className="min-w-0">
//           <h2 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2">
//             {title}
//             {isLive && <span className="w-2 h-2 bg-red-500 rounded-full animate-live-pulse" />}
//           </h2>
//           <p className="text-xs text-gray-400">{subtitle}</p>
//         </div>
//         <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold bg-gray-100 border border-gray-200 ${accentColor} shrink-0`}>
//           {games.length} {t("गेम्स", "Games", lang)}
//         </div>
//       </div>

//       {/* Game List */}
//       <div className="space-y-2 md:space-y-2.5">
//         {games.map((game, i) => {
//           const slug = game.name.toLowerCase().replace(/\s+/g, "-");
//           const hasResult = game.today && game.today !== "XX" && game.today !== "--";
//           return (
//             <div
//               key={game.name + i}
//               className="game-row group bg-gray-50 rounded-2xl px-3.5 md:px-5 py-3 md:py-3.5 flex items-center gap-3 md:gap-4 shadow-sm shadow-gray-200 transition-all duration-300 hover:shadow-md hover:shadow-gray-300"
//               style={{ animationDelay: `${i * 50}ms` }}
//             >
//               {/* Left: Name + Time */}
//               <div className="flex-1 min-w-0">
//                 <h3 className="font-black text-gray-900 uppercase text-[13px] md:text-sm leading-tight truncate group-hover:text-amber-600 transition-colors duration-300">
//                   {game.name}
//                 </h3>
//                 <p className="text-[10px] md:text-xs text-gray-400 font-medium mt-0.5">{game.time}</p>
//               </div>

//               {/* Center: Yesterday + Today */}
//               <div className="flex items-center gap-2 md:gap-3 shrink-0">
//                 {/* Yesterday */}
//                 <div className="text-center min-w-[40px] md:min-w-[50px]">
//                   <p className="text-[8px] md:text-[10px] text-gray-400 uppercase font-bold tracking-wider">{t("पिछला कल", "Yesterday", lang)}</p>
//                   <p className="font-mono font-extrabold text-gray-800 text-xl md:text-3xl leading-none mt-0.5">
//                     {game.yesterday || "--"}
//                   </p>
//                 </div>

//                 {/* Divider */}
//                 <div className="w-px h-8 md:h-10 bg-gray-300" />

//                 {/* Today */}
//                 <div className="text-center min-w-[40px] md:min-w-[50px]">
//                   <p className="text-[8px] md:text-[10px] text-gray-400 uppercase font-bold tracking-wider">{t("आज", "Today", lang)}</p>
//                   {hasResult ? (
//                     <p className="font-mono font-black text-green-600 text-xl md:text-3xl leading-none mt-0.5 animate-resultPop">
//                       {game.today}
//                     </p>
//                   ) : isLive ? (
//                     <span className="inline-flex items-center gap-0.5 text-[10px] md:text-xs font-bold text-red-500 mt-1">
//                       <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-live-pulse" />
//                       {t("रुको", "WAIT", lang)}
//                     </span>
//                   ) : (
//                     <p className="font-mono font-black text-gray-400 text-xl md:text-3xl leading-none mt-0.5">--</p>
//                   )}
//                 </div>
//               </div>

//               {/* Right: Chart */}
//               <Link
//                 href={`/chart/${slug}`}
//                 className="shrink-0 text-[10px] md:text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
//               >
//                 {t("चार्ट", "Chart", lang)} &rarr;
//               </Link>
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// }
function GameCardSection({
  title,
  subtitle,
  icon,
  headerBg,
  accentColor,
  games,
  isLive,
  lang,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  headerBg: string;
  accentColor: string;
  games: (GameResult | SK24Game)[];
  isLive?: boolean;
  lang: "hi" | "en";
}) {
  return (
    <section className="opacity-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2">
            {title}
            {isLive && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-live-pulse" />
            )}
          </h2>

          <p className="text-xs text-gray-500">
            {subtitle}
          </p>
        </div>

        <div
          className={`ml-auto px-3 py-1 rounded-full text-xs font-bold bg-gray-100 border border-gray-300 ${accentColor}`}
        >
          {games.length} Games
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border-2 border-black rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="border border-black px-3 py-3 text-left">
                Game
              </th>

              <th className="border border-black px-3 py-3 text-center">
                Yesterday
              </th>

              <th className="border border-black px-3 py-3 text-center">
                Today
              </th>
            </tr>
          </thead>

          <tbody>
            {games.map((game, i) => {
              const slug = game.name
                .toLowerCase()
                .replace(/\s+/g, "-");

              const hasResult =
                game.today &&
                game.today !== "XX" &&
                game.today !== "--";

              return (
                <tr
                  key={game.name + i}
                  className="bg-gray-100 hover:bg-yellow-50 transition"
                >
                  {/* Game Name */}
                  <td className="border border-black px-1 py-2 bg-amber-50 text-center">
                    <div className="font-black uppercase text-sm md:text-base leading-none">
                      {game.name}
                    </div>
                    <div className="text-[10px] text-black leading-none mt-1">{game.time}</div>
                    <Link
                      href={`/chart/${slug}`}
                      className="inline-block text-[10px] font-bold text-blue-600 hover:text-blue-800 leading-none mt-0.5"
                    >
                      Chart →
                    </Link>
                  </td>

                  {/* Yesterday */}
                  <td className="border border-black px-3 py-1.5 text-center">
                    <span className="font-mono font-black text-2xl md:text-3xl text-gray-800">
                      {game.yesterday || "--"}
                    </span>
                  </td>

                  {/* Today */}
                  <td className="border border-black px-3 py-1.5 text-center">
                    {hasResult ? (
                      <span className="font-mono font-black text-2xl md:text-3xl text-green-600">
                        {game.today}
                      </span>
                    ) : isLive ? (
                      <span className="font-bold text-red-500 text-sm md:text-base">
                       XX
                      </span>
                    ) : (
                      <span className="font-mono font-black text-2xl md:text-3xl text-gray-400">
                        --
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
// ─── SK24 Charts Section ───

function SK24ChartsSection({ tables, lang }: { tables: SK24ChartTable[]; lang: "hi" | "en" }) {
  return (
    <div className="sa opacity-0 translate-y-8 space-y-6">
      <div className="flex items-center gap-2.5 md:gap-3 mb-1">
        <div className="p-2.5 rounded-xl bg-teal-600 text-white shrink-0 shadow-md">
          <FiBarChart2 size={18} />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-black text-gray-900">
            {t("मंथली चार्ट", "Monthly Charts", lang)}
          </h2>
          <p className="text-xs text-gray-400">
            {t("A7 सट्टा चार्ट रिकॉर्ड", "A7 Satta chart records", lang)}
          </p>
        </div>
      </div>
      {tables.map((table, idx) => (
        <div key={idx} className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden shadow-sm">
          <div className="bg-teal-600 text-white text-center py-2.5 px-3 text-sm md:text-base font-bold">
            {table.title}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm md:text-base border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white text-xs md:text-sm uppercase">
                  {table.headers.map((h, hi) => (
                    <th key={hi} className="py-2 px-1 md:px-3 font-semibold border border-gray-300">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, ri) => (
                  <tr key={ri} className={`text-center ${ri % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`py-1.5 px-1 md:px-3 font-mono font-bold border border-gray-200 ${
                          ci === 0 ? "text-red-500" : "text-gray-800"
                        }`}
                      >
                        {cell || "--"}
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, table.headers.length - row.length) }).map((_, fi) => (
                      <td key={`fill-${fi}`} className="py-1.5 px-1 md:px-3 font-mono font-bold border border-gray-200 text-gray-400">
                        --
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── WhatsApp Contact Section ───

// function WhatsAppContactSection({ lang }: { lang: "hi" | "en" }) {
//   const phone = "918901302607";

//   return (
//     <section className="sa opacity-0 translate-y-8">
//       <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-400">
//         {/* Header */}
//         <div className="text-center py-4 px-4 bg-amber-500">
//           <p className="text-white font-black text-2xl md:text-3xl tracking-wide">
//             A7 SATTA
//           </p>
//           <p className="text-blue-100 font-bold text-sm md:text-base mt-1 italic">
//             {t("गेम खेलने के लिए संपर्क करें", "Game play karne ke liye contact kare", lang)}
//           </p>
//         </div>

//         {/* Online Khaiwal + Game Timing */}
//         <div className="bg-[#1a1a2e] text-white px-4 md:px-8 py-5">
//           <div className="text-center mb-4">
//             <p className="text-amber-400 font-black text-lg md:text-xl">
//               Online Khaiwal
//             </p>
//             <p className="text-gray-400 text-sm font-semibold">
//               ( Roni bhai Khaiwal )
//             </p>
//           </div>

//           <div className="text-center mb-4">
//             <p className="text-amber-400 font-bold text-sm md:text-base uppercase tracking-wider">
//               {t("सभी गेम टाइमिंग", "All Game Timing", lang)}
//             </p>
//           </div>

//           <div className="space-y-2.5 max-w-sm mx-auto">
//             {[
//               { name: t("कोहलापुर", "Kohlapur", lang), time: "1:30" },
//               { name: t("मणिपुर", "Manipur", lang), time: "2:30" },
//               { name: t("UP बाज़ार", "UP Bazar", lang), time: "3:30" },
//               { name: t("पलवल City", "Palwal City", lang), time: "4:30" },
//               { name: t("मथूरा City", "Mathura City", lang), time: "6:00" },
//             ].map((game) => (
//               <div
//                 key={game.name}
//                 className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-2.5 border border-white/10"
//               >
//                 <span className="font-bold text-sm md:text-base">{game.name}</span>
//                 <span className="text-amber-400 font-mono font-bold text-sm">
//                   {game.time} Last time
//                 </span>
//               </div>
//             ))}
//           </div>

//           <p className="text-center text-gray-400 text-xs md:text-sm mt-4">
//             {t(
//               "फोन पे, गूगल पे, पेटीएम स्कैनर माँग लो",
//               "Phone Pe, Google Pe, Paytm Scanner mang lo",
//               lang
//             )}
//           </p>
//         </div>

//         {/* Rate + Payment */}
//         <div className="px-4 md:px-8 py-4 grid grid-cols-2 gap-3 max-w-md mx-auto">
//           <div className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-center">
//             <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
//               {t("जोड़ी रेट", "Jodi Rate", lang)}
//             </p>
//             <p className="text-blue-600 font-black text-xl mt-1">10 - 960</p>
//           </div>
//           <div className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-center">
//             <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
//               {t("हरूफ रेट", "Haruf Rate", lang)}
//             </p>
//             <p className="text-blue-600 font-black text-xl mt-1">100 - 960</p>
//           </div>
//         </div>

//         {/* Payment Options */}
//         <div className="px-4 py-3 text-center">
//           <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
//             {t("भुगतान के तरीके", "Payment Options", lang)}
//           </p>
//           <p className="text-gray-700 text-sm font-semibold">PAYTM // PHONE PAY // GOOGLE PAY // BANK TRANSFER</p>
//         </div>

//         {/* Phone */}
//         <div className="px-4 py-3 text-center">
//           <a
//             href={`tel:+${phone}`}
//             className="inline-block text-blue-600 font-black text-2xl md:text-3xl tracking-widest hover:text-blue-700 transition-colors border-t-2 border-b-2 border-blue-200 py-3 px-6"
//           >
//             +{phone}
//           </a>
//         </div>

//         {/* WhatsApp CTA */}
//         <div className="px-4 py-4 text-center">
//           <p className="text-gray-500 text-sm font-bold mb-3">
//             {t("गेम खेलने के लिए नीचे क्लिक करें", "Game play karne ke liye niche click kare", lang)}
//           </p>
//           <a
//             href={`https://wa.me/${phone}?text=${encodeURIComponent("A7 SATTA")}`}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-black text-lg px-8 py-3.5 rounded-2xl shadow-lg shadow-green-500/20 transition-all hover:scale-105"
//           >
//             <FaWhatsapp className="w-7 h-7" />
//             <div className="text-left">
//               <div className="text-lg font-black leading-tight">WhatsApp Now</div>
//               <div className="text-xs font-semibold opacity-80">
//                 {t("तुरंत चैट करने के लिए क्लिक करें", "Click to chat instantly", lang)}
//               </div>
//             </div>
//           </a>
//         </div>
//       </div>
//     </section>
//   );
// }
function WhatsAppContactSection({ lang }: { lang: "hi" | "en" }) {
  const phone = "918901302607";

  const games = [
                  { name: t("कोहलापुर", "Kohlapur", lang), time: "1:30" },
                  { name: t("मणिपुर", "Manipur", lang), time: "2:30" },
                  { name: t("UP बाज़ार", "UP Bazar", lang), time: "3:30" },
                  { name: t("पलवल City", "Palwal City", lang), time: "4:30" },
                  { name: t("मथूरा City", "Mathura City", lang), time: "6:00" },
                ];

  return (
    <section className="sa opacity-0 translate-y-8">
      <div className="relative overflow-hidden rounded-3xl border-4 border-dashed border-red-500 bg-gradient-to-b from-yellow-300 via-yellow-100 to-white shadow-xl">

        {/* Top Header */}
        <div className="text-center px-4 pt-6 pb-3">
          <p className="text-lg md:text-xl font-black text-gray-900">
            ⭐ Direct Company No.1 Khaiwal ⭐
          </p>

          <h2 className="mt-3 text-2xl md:text-4xl font-black text-[#1a1a2e]">
           
            Roni bhai Khaiwal
          </h2>
        </div>

        {/* Timing List */}
        <div className="max-w-xl mx-auto px-4 pb-5">
          <div className="bg-white/60 backdrop-blur rounded-2xl border-2 border-yellow-500 p-4">

            {games.map((game) => (
              <div
                key={game.name}
                className="flex items-center justify-between py-2 border-b border-dashed border-gray-400 last:border-0"
              >
                <div className="flex items-center gap-2 font-bold text-gray-800">
                  <span className="text-xl">⏰</span>
                  <span>{game.name}</span>
                </div>

                <span className="font-black text-[#1a1a2e]">
                  {game.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rates */}
        <div className="grid grid-cols-2 gap-3 px-4 max-w-md mx-auto">
          <div className="bg-white border-2 border-yellow-500 rounded-2xl p-3 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase">
              Jodi Rate
            </p>
            <p className="text-2xl font-black text-blue-700">
              10-960
            </p>
          </div>

          <div className="bg-white border-2 border-yellow-500 rounded-2xl p-3 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase">
              Haruf Rate
            </p>
            <p className="text-2xl font-black text-blue-700">
              100-960
            </p>
          </div>
        </div>

        {/* Payment */}
        <div className="text-center px-4 py-5">
          <p className="font-bold text-gray-700 text-sm">
            PAYTM • PHONEPE • GOOGLE PAY • BANK TRANSFER
          </p>

          <p className="mt-2 text-sm font-semibold text-red-600">
            PhonePe, GooglePay & Paytm Scanner Available
          </p>
        </div>

        {/* Phone */}
        <div className="text-center px-4">
          <a
            href={`tel:+${phone}`}
            className="inline-block text-3xl md:text-4xl font-black text-blue-700 border-b-4 border-blue-700"
          >
            +{phone}
          </a>
        </div>

        {/* Footer Text */}
        <div className="text-center px-4 pt-5">
          <p className="font-black text-xl md:text-2xl text-[#1a1a2e]">
            😊😊 Roni bhai Khaiwal 😊😊
          </p>

          <p className="mt-2 text-sm md:text-base font-bold text-gray-700">
            Game play karne ke liye niche link par click kare
          </p>
        </div>

        {/* WhatsApp Button */}
        <div className="px-4 pb-8 pt-5 flex justify-center">
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(
              "A7 SATTA"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-black text-lg shadow-lg hover:scale-105 transition-all"
          >
            <FaWhatsapp className="text-4xl" />

            <div className="text-left">
              <div className="text-xl leading-none">
                WhatsApp
              </div>
              <div className="text-sm opacity-90">
                Click To Chat
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Monthly Chart Section ───

const CHART_GAMES = [
  { key: "dlbz" as const, name: "Delhi Bazar" },
  { key: "srgn" as const, name: "Shri Ganesh" },
  { key: "frbd" as const, name: "Faridabad" },
  { key: "gzbd" as const, name: "Gaziabad" },
  { key: "gali" as const, name: "Gali" },
  { key: "dswr" as const, name: "Disawar" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function MonthlyChartSection({
  initialRows,
  initialMonth,
  initialYear,
  lang,
}: {
  initialRows: ChartRow[];
  initialMonth: string;
  initialYear: string;
  lang: "hi" | "en";
}) {
  const now = new Date();
  const currentMonthName = initialMonth || now.toLocaleString("en-US", { month: "long" });
  const currentYear = initialYear || String(now.getFullYear());

  const [rows, setRows] = useState<ChartRow[]>(initialRows);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [chartLoading, setChartLoading] = useState(false);

  const years = Array.from({ length: 12 }, (_, i) => String(now.getFullYear() - i));

  const fetchChart = async (m: string, y: string) => {
    setChartLoading(true);
    try {
      const res = await fetch(`/api/monthly-chart?month=${m.toLowerCase()}&year=${y}`);
      const data = await res.json();
      if (data.success) {
        setRows(data.results || []);
      } else {
        setRows([]);
      }
    } catch {
      setRows([]);
    } finally {
      setChartLoading(false);
    }
  };

  const handleMonthChange = (m: string) => {
    setSelectedMonth(m);
    fetchChart(m, selectedYear);
  };

  const handleYearChange = (y: string) => {
    setSelectedYear(y);
    fetchChart(selectedMonth, y);
  };

  const displayMonth = selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1);
  const title = lang === "hi"
    ? `${displayMonth} ${selectedYear} मंथली चार्ट`
    : `${displayMonth} ${selectedYear} Monthly Chart`;

  return (
    <section className="sa opacity-0 translate-y-8">
      <div className="flex items-center gap-2.5 md:gap-3 mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-gray-900">
            {lang === "hi" ? "मंथली चार्ट" : "Monthly Chart"} {selectedYear}
          </h2>
          <p className="text-xs text-gray-400">Delhi Bazar, Shri Ganesh, Faridabad, Gaziabad, Gali, Disawar</p>
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <FiCalendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-xl pl-8 pr-7 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 appearance-none cursor-pointer"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <FiChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <FiBarChart2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-xl pl-8 pr-7 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 appearance-none cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <FiChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {chartLoading && (
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Chart Table */}
      {chartLoading ? (
        <div className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden shadow-sm">
          <div className="bg-[#1a1a2e] text-white text-center py-2.5 px-3 text-sm md:text-base font-bold">
            {title}
          </div>
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{t("लोड हो रहा है...", "Loading...", lang)}</p>
          </div>
        </div>
      ) : rows.length > 0 ? (
        <div className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden shadow-sm">
          <div className="bg-[#1a1a2e] text-white text-center py-2.5 px-3 text-sm md:text-base font-bold">
            {title}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white text-[10px] md:text-xs uppercase">
                  <th className="py-2 px-1.5 md:px-3 font-semibold border border-gray-300">
                    {t("तारीख", "Date", lang)}
                  </th>
                  {CHART_GAMES.map((g) => (
                    <th key={g.key} className="py-2 px-1.5 md:px-3 font-semibold border border-gray-300">
                      {g.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className={`text-center ${ri % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <td className="py-1.5 px-1.5 md:px-3 font-bold text-red-500 border border-gray-200 text-xs md:text-sm whitespace-nowrap">
                      {row.date}
                    </td>
                    {CHART_GAMES.map((g) => (
                      <td
                        key={g.key}
                        className="py-1.5 px-1.5 md:px-3 font-mono font-bold border border-gray-200 text-gray-800"
                      >
                        {row[g.key] || "--"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 py-12 text-center">
          <FiBarChart2 size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{t("कोई डेटा उपलब्ध नहीं", "No data available", lang)}</p>
          <p className="text-gray-400 text-sm mt-1">{displayMonth} {selectedYear}</p>
        </div>
      )}
    </section>
  );
}

// ─── SEO Content ───

function SeoContent({ lang }: { lang: "hi" | "en" }) {
  return (
    <div className="sa opacity-0 translate-y-8 bg-gray-50 rounded-2xl border border-gray-200 p-5 md:p-8 space-y-4 text-sm text-gray-600 leading-relaxed">
      <h2 className="text-xl md:text-2xl font-black text-gray-900">
        {t("A7 सट्टा और A7Satta.co के बारे में", "Understanding A7 Satta & A7Satta.co", lang)}
      </h2>
      <p>
        {t(
          "A7Satta.co इंटरनेट पर सबसे तेज़ और सबसे भरोसेमंद A7 सट्टा रिजल्ट प्रदान करने के लिए बनाया गया है। हमारा प्लेटफॉर्म आधिकारिक स्रोतों से सीधे डेटा लेता है और रियल-टाइम में अपडेट करता है।",
          "A7Satta.co is designed to provide the fastest, most reliable A7 Satta results on the internet. Our platform pulls data directly from official sources and updates in real-time.",
          lang
        )}
      </p>
      <p>
        {t(
          "चाहे आप गली, देसावर, गाज़ियाबाद, फरीदाबाद, या 100+ क्षेत्रीय गेम्स में से कोई भी फॉलो करते हों, हम आपको तुरंत अपडेट और व्यापक चार्ट रिकॉर्ड प्रदान करते हैं।",
          "Whether you follow Gali, Desawar, Ghaziabad, Faridabad, or any of the 100+ regional games, we have you covered with instant updates and comprehensive chart records.",
          lang
        )}
      </p>

      <h3 className="text-lg font-bold text-gray-900">
        {t("A7Satta.co क्यों चुनें?", "Why Choose A7Satta.co?", lang)}
      </h3>
      <ul className="list-none space-y-2 pl-0">
        <li className="flex items-start gap-2">
          <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
          <span>
            <strong className="text-gray-900">{t("बिजली की तेज़ी:", "Lightning Fast:", lang)}</strong>{" "}
            {t("रिजल्ट घोषित होते ही अपडेट।", "Results updated the moment they are declared.", lang)}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
          <span>
            <strong className="text-gray-900">{t("100+ गेम्स:", "100+ Games:", lang)}</strong>{" "}
            {t("राष्ट्रीय और क्षेत्रीय बाजारों की पूरी कवरेज।", "Complete coverage of national and regional markets.", lang)}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
          <span>
            <strong className="text-gray-900">{t("चार्ट रिकॉर्ड:", "Chart Records:", lang)}</strong>{" "}
            {t(`2015 से ${new Date().getFullYear()} तक का ऐतिहासिक डेटा।`, `Historical data from 2015 to ${new Date().getFullYear()}.`, lang)}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
          <span>
            <strong className="text-gray-900">{t("मोबाइल ऑप्टिमाइज़्ड:", "Mobile Optimized:", lang)}</strong>{" "}
            {t("सबसे अच्छे मोबाइल अनुभव के लिए बनाया गया।", "Built for the best mobile experience.", lang)}
          </span>
        </li>
      </ul>

      <h3 className="text-lg font-bold text-gray-900">{t("अस्वीकरण", "Disclaimer", lang)}</h3>
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700">
        <strong>{t("महत्वपूर्ण:", "Important:", lang)}</strong>{" "}
        {t(
          "A7Satta.co पूरी तरह से सूचनात्मक उद्देश्यों के लिए है। हम किसी भी जुआ संचालन का स्वामित्व, संचालन या सुविधा नहीं देते। कृपया अपने क्षेत्रीय कानूनों का पालन करें।",
          "A7Satta.co is strictly for informational purposes. We do not own, operate, or facilitate any gambling operations. Please comply with your regional laws.",
          lang
        )}
      </div>
    </div>
  );
}
