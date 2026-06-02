"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { FiClock, FiTrendingUp, FiZap, FiBarChart2 } from "react-icons/fi";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";

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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
          <div className="skeleton h-5 w-24 mb-2" />
          <div className="skeleton h-3 w-16 mb-4" />
          <div className="flex gap-3">
            <div className="skeleton h-10 flex-1 rounded-xl" />
            <div className="skeleton h-10 flex-1 rounded-xl" />
          </div>
          <div className="skeleton h-4 w-20 mt-3 mx-auto" />
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
          <span className="text-gray-200 text-xs md:text-sm font-bold tracking-wider uppercase">Live Results Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-2">
          A7 Satta {format(new Date(), "yyyy")}
          <br className="md:hidden" />
          <span className="text-amber-400"> Live Results</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
          Fastest A7 Satta result updates. Gali, Desawar, Ghaziabad, Faridabad &amp; 100+ games.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-gray-400">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-live-pulse" />
          Last Updated: {updatedAt}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border-b border-gray-200 py-1.5 px-2 md:px-4">
        <p className="text-center text-[11px] md:text-xs text-gray-500 max-w-4xl mx-auto">
          <span className="font-bold text-red-500">DISCLAIMER:</span>{" "}
          A7Satta.co is an independent informational website. We do not promote gambling or betting.{" "}
          <Link href="/disclaimer" className="text-blue-600 hover:underline font-medium">
            Read Full Disclaimer
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
            {/* SK24 Results */}
            {sk24Games.length > 0 && (
              <GameCardSection
                title="Today A7 Satta Results"
                subtitle="Fastest A7 Satta result on internet"
                icon={<FiZap size={18} />}
                headerBg="bg-blue-600"
                accentColor="text-blue-600"
                games={sk24Games}
                isLive
              />
            )}

            {/* LIVE */}
            {filteredLive.length > 0 && (
              <GameCardSection
                title="LIVE Results"
                subtitle="Games currently being declared"
                icon={<FiZap size={18} />}
                headerBg="bg-red-600"
                accentColor="text-red-600"
                games={filteredLive}
                isLive
              />
            )}

            {/* Monthly Chart */}
            {monthlyChart.length > 0 && (
              <MonthlyChartSection
                rows={monthlyChart}
                month={monthlyChartMeta.month}
                year={monthlyChartMeta.year}
              />
            )}

            {/* SK24 Charts */}
            {sk24Charts.length > 0 && (
              <SK24ChartsSection tables={sk24Charts} />
            )}

            {/* WhatsApp Contact */}
            <WhatsAppContactSection />

            {/* UPCOMING */}
            {filteredNext.length > 0 && (
              <GameCardSection
                title="Upcoming Results"
                subtitle="These games will be declared soon"
                icon={<FiClock size={18} />}
                headerBg="bg-amber-600"
                accentColor="text-amber-600"
                games={filteredNext}
              />
            )}

            {/* DECLARED */}
            {filteredRest.length > 0 && (
              <GameCardSection
                title="Declared Results"
                subtitle="Today's completed game results"
                icon={<FiTrendingUp size={18} />}
                headerBg="bg-emerald-600"
                accentColor="text-emerald-600"
                games={filteredRest}
              />
            )}
          </>
        )}

        {/* Welcome */}
        <div className="sa opacity-0 translate-y-8 bg-gray-50 rounded-2xl border border-gray-200 p-5 md:p-8 space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>
            Welcome to <strong className="text-gray-900">A7Satta.co</strong> - the ultimate platform for tracking live <strong className="text-gray-900">A7 Satta results</strong>. Our infrastructure delivers results the exact moment they are declared.
          </p>
          <p>
            Get 100% accurate daily updates, historical charts, and insights for over 100+ national and regional markets, completely free.
          </p>
        </div>

        {/* CTA */}
        <div className="sa opacity-0 translate-y-8 bg-[#1a1a2e] rounded-2xl p-5 md:p-6 text-center">
          <p className="text-lg md:text-xl font-black text-white">ADVERTISE YOUR GAME HERE</p>
          <p className="text-sm text-gray-400 mt-1">Contact us to feature your game on A7Satta.co</p>
        </div>

        {/* Telegram */}
        <TelegramSection />

        {/* SEO */}
        <SeoContent />
      </div>
    </div>
  );
}

// ─── Game Card Section ───

function GameCardSection({
  title,
  subtitle,
  icon,
  headerBg,
  accentColor,
  games,
  isLive,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  headerBg: string;
  accentColor: string;
  games: (GameResult | SK24Game)[];
  isLive?: boolean;
}) {
  return (
    <section className="sa opacity-0 translate-y-8">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 md:gap-3 mb-4">
        <div className={`p-2.5 rounded-xl ${headerBg} text-white shrink-0 shadow-md`}>
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2">
            {title}
            {isLive && <span className="w-2 h-2 bg-red-500 rounded-full animate-live-pulse" />}
          </h2>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold bg-gray-100 border border-gray-200 ${accentColor} shrink-0`}>
          {games.length} Games
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {games.map((game, i) => {
          const slug = game.name.toLowerCase().replace(/\s+/g, "-");
          const hasResult = game.today && game.today !== "XX" && game.today !== "--";
          return (
            <div
              key={game.name + i}
              className="bg-gray-50 rounded-xl border border-gray-400 p-2 md:p-2.5 transition-all hover:shadow-lg hover:border-gray-500 hover:-translate-y-0.5"
            >
              {/* Game Name */}
              <h3 className="font-black text-gray-900 uppercase text-[13px] md:text-sm leading-tight break-words">
                {game.name}
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">{game.time}</p>

              {/* Results */}
              <div className="flex gap-1.5 mt-1.5">
                <div className="flex-1 bg-white rounded-lg p-1 text-center border border-gray-100">
                  <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Yest</p>
                  <p className="font-mono font-extrabold text-gray-700 text-lg md:text-xl mt-0.5">
                    {game.yesterday || "--"}
                  </p>
                </div>
                <div className={`flex-1 rounded-lg p-1 text-center ${
                  hasResult
                    ? "bg-green-50 border border-green-200"
                    : "bg-white border border-gray-100"
                }`}>
                  <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Today</p>
                  <p className={`font-mono font-black text-lg md:text-xl mt-0.5 ${
                    hasResult ? "text-green-700" : "text-gray-400"
                  }`}>
                    {game.today || (isLive ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-500">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-live-pulse" />
                        WAIT
                      </span>
                    ) : "--")}
                  </p>
                </div>
              </div>

              {/* Chart Link */}
              <Link
                href={`/chart/${slug}`}
                className="block mt-1 text-center text-[10px] md:text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors py-0.5 rounded-lg hover:bg-blue-50"
              >
                View Chart
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── SK24 Charts Section ───

function SK24ChartsSection({ tables }: { tables: SK24ChartTable[] }) {
  return (
    <div className="sa opacity-0 translate-y-8 space-y-6">
      <div className="flex items-center gap-2.5 md:gap-3 mb-1">
        <div className="p-2.5 rounded-xl bg-teal-600 text-white shrink-0 shadow-md">
          <FiBarChart2 size={18} />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-black text-gray-900">Monthly Charts</h2>
          <p className="text-xs text-gray-400">A7 Satta chart records</p>
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

function WhatsAppContactSection() {
  const phone = "1234567890";

  return (
    <section className="sa opacity-0 translate-y-8">
      <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-400">
        {/* Header */}
        <div className="text-center py-4 px-4 bg-amber-500">
          <p className="text-white font-black text-2xl md:text-3xl tracking-wide">
            A7 SATTA
          </p>
          <p className="text-blue-100 font-bold text-sm md:text-base mt-1 italic">
            Game play karne ke liye contact kare
          </p>
        </div>

        {/* Rate + Payment */}
        <div className="px-4 md:px-8 py-4 grid grid-cols-2 gap-3 max-w-md mx-auto">
          <div className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-center">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Jodi Rate</p>
            <p className="text-blue-600 font-black text-xl mt-1">10 - 960</p>
          </div>
          <div className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-center">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Haruf Rate</p>
            <p className="text-blue-600 font-black text-xl mt-1">100 - 960</p>
          </div>
        </div>

        {/* Payment Options */}
        <div className="px-4 py-3 text-center">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Payment Options</p>
          <p className="text-gray-700 text-sm font-semibold">PAYTM // PHONE PAY // GOOGLE PAY // BANK TRANSFER</p>
        </div>

        {/* Phone */}
        <div className="px-4 py-3 text-center">
          <a
            href={`tel:+91${phone}`}
            className="inline-block text-blue-600 font-black text-2xl md:text-3xl tracking-widest hover:text-blue-700 transition-colors border-t-2 border-b-2 border-blue-200 py-3 px-6"
          >
            {phone}
          </a>
        </div>

        {/* WhatsApp CTA */}
        <div className="px-4 py-4 text-center">
          <p className="text-gray-500 text-sm font-bold mb-3">
            Game play karne ke liye niche click kare
          </p>
          <a
            href={`https://wa.me/91${phone}?text=${encodeURIComponent("A7 SATTA")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-black text-lg px-8 py-3.5 rounded-2xl shadow-lg shadow-green-500/20 transition-all hover:scale-105"
          >
            <FaWhatsapp className="w-7 h-7" />
            <div className="text-left">
              <div className="text-lg font-black leading-tight">WhatsApp Now</div>
              <div className="text-xs font-semibold opacity-80">Click to chat instantly</div>
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

function MonthlyChartSection({
  rows,
  month,
  year,
}: {
  rows: ChartRow[];
  month: string;
  year: string;
}) {
  const title = `${month.charAt(0).toUpperCase() + month.slice(1)} ${year} Monthly Chart`;

  return (
    <section className="sa opacity-0 translate-y-8">
      <div className="flex items-center gap-2.5 md:gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-md">
          <FiBarChart2 size={18} />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-black text-gray-900">{title}</h2>
          <p className="text-xs text-gray-400">Delhi Bazar, Shri Ganesh, Faridabad, Gaziabad, Gali, Disawar</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden shadow-sm">
        <div className="bg-amber-500 text-white text-center py-2.5 px-3 text-sm md:text-base font-bold">
          {title}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white text-[10px] md:text-xs uppercase">
                <th className="py-2 px-1.5 md:px-3 font-semibold border border-gray-300">Date</th>
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
    </section>
  );
}

// ─── Telegram Section ───

function TelegramSection() {
  const telegramLink = "https://t.me/kingfast24";

  return (
    <section className="sa opacity-0 translate-y-8">
      <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-[#0088cc] text-white text-center py-4 px-4">
          <FaTelegramPlane className="w-8 h-8 mx-auto mb-2" />
          <p className="font-black text-lg md:text-xl">Satta King Daily Passing Tricks</p>
        </div>

        {/* Content */}
        <div className="px-4 md:px-8 py-5 text-center space-y-4">
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            Delhi Bazar se Disawar tak daily passing pane ke liye hamare Telegram channel ko join karein.
          </p>

          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#0088cc] hover:bg-[#0077b5] text-white font-black text-base md:text-lg px-8 py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
          >
            <FaTelegramPlane className="w-6 h-6" />
            <div className="text-left">
              <div className="font-black leading-tight">Join Telegram Channel</div>
              <div className="text-xs font-semibold opacity-80">Daily 2-3 game passing updates</div>
            </div>
          </a>

          <p className="text-gray-400 text-xs md:text-sm">
            Channel join karke website ko bookmark kar lo, taaki aapko rozana 2-3 game passing aur latest updates milti rahein.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── SEO Content ───

function SeoContent() {
  return (
    <div className="sa opacity-0 translate-y-8 bg-gray-50 rounded-2xl border border-gray-200 p-5 md:p-8 space-y-4 text-sm text-gray-600 leading-relaxed">
      <h2 className="text-xl md:text-2xl font-black text-gray-900">Understanding A7 Satta &amp; A7Satta.co</h2>
      <p>
        <strong className="text-gray-900">A7Satta.co</strong> is designed to provide the fastest, most reliable <strong className="text-gray-900">A7 Satta results</strong> on the internet. Our platform pulls data directly from official sources and updates in real-time.
      </p>
      <p>
        Whether you follow <strong className="text-gray-900">Gali</strong>, <strong className="text-gray-900">Desawar</strong>, <strong className="text-gray-900">Ghaziabad</strong>, <strong className="text-gray-900">Faridabad</strong>, or any of the 100+ regional games, we have you covered with instant updates and comprehensive chart records.
      </p>

      <h3 className="text-lg font-bold text-gray-900">Why Choose A7Satta.co?</h3>
      <ul className="list-none space-y-2 pl-0">
        <li className="flex items-start gap-2">
          <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
          <span><strong className="text-gray-900">Lightning Fast:</strong> Results updated the moment they are declared.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
          <span><strong className="text-gray-900">100+ Games:</strong> Complete coverage of national and regional markets.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
          <span><strong className="text-gray-900">Chart Records:</strong> Historical data from 2015 to {new Date().getFullYear()}.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
          <span><strong className="text-gray-900">Mobile Optimized:</strong> Built for the best mobile experience.</span>
        </li>
      </ul>

      <h3 className="text-lg font-bold text-gray-900">Disclaimer</h3>
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700">
        <strong>Important:</strong> A7Satta.co is strictly for informational purposes. We do not own, operate, or facilitate any gambling operations. Please comply with your regional laws.
      </div>
    </div>
  );
}
