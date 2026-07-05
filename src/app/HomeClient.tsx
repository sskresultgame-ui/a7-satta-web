"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { FiClock, FiTrendingUp, FiZap, FiBarChart2, FiCalendar, FiChevronDown } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage, t } from "@/context/LanguageContext";
import type { HomeData } from "@/lib/home-data";

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

export default function HomeClient({ initialData }: { initialData: HomeData }) {
  // ✅ Data is fetched on the server and passed in as props — no client-side
  // fetch waterfall, so everything is present on first paint.
  const [liveResults, setLiveResults] = useState<GameResult[]>(initialData.liveResults);
  const [nextResults, setNextResults] = useState<GameResult[]>(initialData.nextResults);
  const [restResults, setRestResults] = useState<GameResult[]>(initialData.restResults);
  const [sk24Games, setSk24Games] = useState<SK24Game[]>(initialData.sk24Games);
  const [sk24Charts] = useState<SK24ChartTable[]>(initialData.sk24Charts);
  const [monthlyChart] = useState<ChartRow[]>(initialData.monthlyChart);
  const [monthlyChartMeta] = useState<{ month: string; year: string }>(initialData.monthlyChartMeta);
  const [customGames, setCustomGames] = useState<Record<string, string>>(initialData.customGames);
  const [customGamesYesterday, setCustomGamesYesterday] = useState<Record<string, string>>(initialData.customGamesYesterday);
  const [loading] = useState(false);
  const [khaiwal] = useState<any>(initialData.khaiwal);

  const containerRef = useScrollAnimation([loading]);
  const { lang } = useLanguage();

  // ─── Live refresh: poll the board every 30s and update in place (no reload). ───
  // Keeps results fresh without a full page navigation. The /api/home response is
  // CDN-cached + memoized for 30s, so this stays inside Firebase's free tier even
  // with many concurrent visitors.
  useEffect(() => {
    let active = true;
    const load = async () => {
      // Don't poll while the tab is in the background — saves needless load.
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch("/api/home", { cache: "no-store" });
        if (!res.ok || !active) return;
        const d = (await res.json()) as HomeData;
        if (!active) return;
        setLiveResults(d.liveResults || []);
        setNextResults(d.nextResults || []);
        setRestResults(d.restResults || []);
        setSk24Games(d.sk24Games || []);
        setCustomGames(d.customGames || {});
        setCustomGamesYesterday(d.customGamesYesterday || {});
      } catch {
        // Network hiccup — keep showing the last good data, try again next tick.
      }
    };
    const id = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const updatedAt = format(new Date(), "dd MMMM yyyy, hh:mm a") + " IST";

  // Games to hide from all sections
  const hiddenGames = new Set([
    "gaziabad night",
    "punjab laxmi",
    "new sahibabad",
    "super max",
    "brij rani",
    "verra king",
    "mahalaxmi bazar",
  ]);
  const isHidden = (name: string) => hiddenGames.has(name.toLowerCase().trim());

  // ─── 1ST SECTION: Fixed 9 games ───
  const topGameDefs = [
    { name: "KOHLAPUR", time: "1:30 PM", seedOffset: 1, customKey: "kohlapur", aliases: [] as string[] },
    { name: "MANIPUR", time: "2:30 PM", seedOffset: 3, customKey: "manipur", aliases: [] },
    { name: "UP BAZAR", time: "3:30 PM", seedOffset: 5, customKey: "up-bazar", aliases: ["upbazar"] },
    { name: "PALWAL CITY", time: "4:30 PM", seedOffset: 7, customKey: "palwal-city", aliases: [] },
    { name: "FRIDABAD", time: "5:45 PM", seedOffset: 11, customKey: "", aliases: ["faridabad", "frbd"] },
    { name: "MATHURA CITY", time: "6:50 PM", seedOffset: 9, customKey: "mathura-city", aliases: [] },
    { name: "GAZIABAD", time: "9:20 PM", seedOffset: 13, customKey: "", aliases: ["ghaziabad", "gzbd"] },
    { name: "GALI", time: "11:20 PM", seedOffset: 15, customKey: "", aliases: [] },
    { name: "DISAWAR", time: "5:00 AM", seedOffset: 17, customKey: "", aliases: ["desawar", "desawer", "dswr"] },
  ];

  // const allApiGames = [...liveResults, ...nextResults, ...restResults, ...sk24Games];
  const allApiGames = [
    ...sk24Games,
    ...liveResults,
    ...nextResults,
    ...restResults,
  ];
  const topGames: SK24Game[] = topGameDefs.map(def => {
    const norm = def.name.toLowerCase().replace(/\s+/g, "");
    const allNames = [norm, ...def.aliases];
    // Match scraped data (by name or aliases) for fallback values
    const existing = allApiGames.find(g => {
      const gn = g.name.toLowerCase().replace(/\s+/g, "");
      return allNames.some(n => n === gn);
    });

    // Admin value saved for yesterday's date takes priority for the Yesterday
    // column (so a declared result rolls into Yesterday at midnight IST).
    const adminYesterday = def.customKey ? customGamesYesterday[def.customKey] : "";

    // Admin custom value (Firebase) takes priority when set for today.
    if (def.customKey && customGames[def.customKey]) {
      return {
        name: def.name,
        time: def.time,
        yesterday: adminYesterday || existing?.yesterday || "XX",
        today: customGames[def.customKey],
      };
    }

    if (existing) {
      // Gate the today value by the game's scheduled time and roll the latest
      // scraped result into Yesterday until today's slot is declared.
      const rolled = rollByTime(existing.yesterday, existing.today, def.time);
      return {
        name: def.name,
        time: def.time,
        yesterday: adminYesterday || rolled.yesterday,
        today: rolled.today,
      };
    }

    // No data available - show XX
    return {
      name: def.name,
      time: def.time,
      yesterday: adminYesterday || "XX",
      today: "XX",
    };
  });

  // ─── 3RD SECTION: Specific games ───
  const section3GameNames = [
    "sadar bazar", "gwalior", "delhi bazar", "delhi matka",
    "shri ganesh", "agra", "faridabad", "alwar",
    "gaziabad", "dwarka", "gali",
  ];
  // Alternate name mappings for 3rd section
  const section3Aliases: Record<string, string[]> = {
    "faridabad": ["fridabad", "frbd"],
    "gaziabad": ["ghaziabad", "gzbd"],
    "delhi bazar": ["delhibazar", "dlbz"],
    "shri ganesh": ["shriganesh", "srgn"],
  };
  const section3Games: SK24Game[] = section3GameNames.map(name => {
    const norm = name.toLowerCase().replace(/\s+/g, "");
    const aliases = section3Aliases[name.toLowerCase()] || [];
    const allNames = [norm, ...aliases];
    const existing = allApiGames.find(g => {
      const gn = g.name.toLowerCase().replace(/\s+/g, "");
      return allNames.some(n => n === gn);
    });
    if (existing) {
      const time = existing.time || "";
      // Gate today by the game's scheduled time and roll the latest scraped
      // result into Yesterday until today's slot is declared (same as section 1).
      const rolled = rollByTime(existing.yesterday, existing.today, time);
      return {
        name: name.toUpperCase(),
        time,
        yesterday: rolled.yesterday,
        today: rolled.today,
      };
    }
    return { name: name.toUpperCase(), time: "", yesterday: "XX", today: "XX" };
  });

  // Filter remaining games: exclude top 9 games and 3rd section games from other sections
  const allFixedNames = new Set<string>();
  topGameDefs.forEach(g => {
    allFixedNames.add(g.name.toLowerCase().replace(/\s+/g, ""));
    g.aliases.forEach(a => allFixedNames.add(a));
  });
  section3GameNames.forEach(n => {
    allFixedNames.add(n.toLowerCase().replace(/\s+/g, ""));
    const aliases = section3Aliases[n.toLowerCase()] || [];
    aliases.forEach(a => allFixedNames.add(a));
  });
  const isInFixedList = (name: string) => {
    const n = name.toLowerCase().replace(/\s+/g, "");
    return allFixedNames.has(n);
  };
  const filteredLive = liveResults.filter(g => !isInFixedList(g.name) && !isHidden(g.name));
  const filteredNext = nextResults.filter(g => !isInFixedList(g.name) && !isHidden(g.name));
  const filteredRest = restResults.filter(g => !isInFixedList(g.name) && !isHidden(g.name));

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

        {/* Live countdown to the next result */}
        <CountdownTimer games={topGameDefs} lang={lang} />
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
            {/* ─── 1ST SECTION: Top 9 Games ─── */}
            <GameCardSection
              title={t("आज के A7 सट्टा रिजल्ट", "Today A7 Satta Results", lang)}
              subtitle={t("इंटरनेट पर सबसे तेज़ A7 सट्टा रिजल्ट", "Fastest A7 Satta result on internet", lang)}
              icon={<FiZap size={18} />}
              headerBg="bg-blue-600"
              accentColor="text-blue-600"
              games={topGames}
              isLive
              lang={lang}
            />

            {/* ─── 2ND SECTION: Monthly Chart ─── */}
            <MonthlyChartSection
              initialRows={monthlyChart}
              initialMonth={monthlyChartMeta.month}
              initialYear={monthlyChartMeta.year}
              lang={lang}
            />

            {/* ─── 3RD SECTION: Specific Games ─── */}
            <GameCardSection
              title={t("अन्य गेम रिजल्ट", "Other Game Results", lang)}
              subtitle={t("सदर बाज़ार, ग्वालियर, दिल्ली बाज़ार और अन्य", "Sadar Bazar, Gwalior, Delhi Bazar & more", lang)}
              icon={<FiBarChart2 size={18} />}
              headerBg="bg-purple-600"
              accentColor="text-purple-600"
              games={section3Games}
              isLive
              lang={lang}
            />

            {/* ─── 4TH SECTION: WhatsApp / Khaiwal ─── */}
            <WhatsAppContactSection lang={lang} khaiwal={khaiwal} />

            {/* SK24 Charts */}
            {sk24Charts.length > 0 && (
              <SK24ChartsSection tables={sk24Charts} lang={lang} />
            )}

            {/* LIVE (remaining) */}
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

            {/* UPCOMING (remaining) */}
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

            {/* DECLARED (remaining) */}
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


// Parse a game time like "01:39 PM" / "9:20 PM" into minutes since midnight.
// Returns null if the string is empty or not a recognizable time.
function parseGameTimeToMinutes(time: string): number | null {
  const m = time?.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

// Current wall-clock time in IST as minutes since midnight.
function istNowMinutes(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const min = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  return (h % 24) * 60 + min;
}

// Given a game's latest scraped {yesterday, today} values and its scheduled IST
// time, decide what to show in each column. Before the time passes today, the
// game's "today" slot has not been declared yet — so the latest scraped result
// is really yesterday's. Roll it into the Yesterday column and show XX for Today.
// Once the time has passed, show the freshly declared today value as-is.
function rollByTime(
  existingYesterday: string,
  existingToday: string,
  time: string
): { yesterday: string; today: string } {
  const resultMin = parseGameTimeToMinutes(time);
  const declaredToday = resultMin === null || istNowMinutes() >= resultMin;
  // Treat "XX"/empty as "no value" so a pending marker never overrides a real
  // result (e.g. `"XX" || "91"` would wrongly return "XX" without this).
  const realToday = existingToday && existingToday !== "XX" ? existingToday : "";
  const realYesterday = existingYesterday && existingYesterday !== "XX" ? existingYesterday : "";
  if (declaredToday) {
    return { yesterday: realYesterday || "XX", today: existingToday || "XX" };
  }
  // Not declared yet today: Today is pending. If the source's "today" still holds
  // an un-rolled real number that IS yesterday's result; otherwise use yesterday.
  return {
    yesterday: realToday || realYesterday || "XX",
    today: "XX",
  };
}

// Current IST wall-clock as seconds since midnight (0–86399).
function istSecondsOfDay(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10) % 24;
  const m = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  const s = parseInt(parts.find((p) => p.type === "second")?.value || "0", 10);
  return h * 3600 + m * 60 + s;
}

// Find the next game to be declared and how many seconds away it is (wraps to
// tomorrow's earliest game once the day's last result has passed).
function nextResultTarget(
  games: { name: string; time: string }[],
  istSec: number
): { name: string; diff: number } | null {
  let best: { name: string; diff: number } | null = null;
  for (const g of games) {
    const mins = parseGameTimeToMinutes(g.time);
    if (mins === null) continue;
    let diff = mins * 60 - istSec;
    if (diff <= 0) diff += 24 * 3600; // already passed today → tomorrow
    if (!best || diff < best.diff) best = { name: g.name, diff };
  }
  return best;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// Live "next result in HH:MM:SS" ticker. Isolated so only this small component
// re-renders every second — the heavy board above it does not.
function CountdownTimer({
  games,
  lang,
}: {
  games: { name: string; time: string }[];
  lang: "hi" | "en";
}) {
  const [sec, setSec] = useState<number | null>(null);
  useEffect(() => {
    setSec(istSecondsOfDay());
    const id = setInterval(() => setSec(istSecondsOfDay()), 1000);
    return () => clearInterval(id);
  }, []);

  if (sec === null) return null; // avoid SSR/client mismatch — mount first
  const target = nextResultTarget(games, sec);
  if (!target) return null;

  const hh = Math.floor(target.diff / 3600);
  const mm = Math.floor((target.diff % 3600) / 60);
  const ss = target.diff % 60;

  return (
    <div className="mt-4 flex flex-col items-center gap-1.5">
      <span className="text-[11px] md:text-xs text-gray-400 uppercase tracking-wider">
        {t("अगला रिजल्ट", "Next Result", lang)}
        <span className="text-amber-400 font-bold"> {target.name}</span>
      </span>
      <div className="flex items-center gap-1.5 font-mono">
        {[hh, mm, ss].map((v, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-amber-400 font-bold">:</span>}
            <span className="bg-white/10 border border-white/15 rounded-lg px-2.5 py-1.5 text-lg md:text-xl font-black text-white tabular-nums">
              {pad2(v)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Ordinal suffix for a day number, e.g. 1 -> "st", 27 -> "th".
function ordinalSuffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

// IST day label like "Sat. 27th". offsetDays shifts by whole days (-1 = yesterday).
function istDayLabel(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays) d.setUTCDate(d.getUTCDate() + offsetDays);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
  }).formatToParts(d);
  const weekday = parts.find((p) => p.type === "weekday")?.value || "";
  const day = parseInt(parts.find((p) => p.type === "day")?.value || "0", 10);
  return `${weekday}. ${day}${ordinalSuffix(day)}`;
}

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

              <th className="border border-black px-3 py-2 text-center">
                <div>Yesterday</div>
                <div className="text-[11px] md:text-xs font-semibold text-green-300 mt-0.5">
                  {istDayLabel(-1)}
                </div>
              </th>

              <th className="border border-black px-3 py-2 text-center">
                <div>Today</div>
                <div className="text-[11px] md:text-xs font-semibold text-green-300 mt-0.5">
                  {istDayLabel(0)}
                </div>
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
                      {game.yesterday || "XX"}
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
                        XX
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
                        {cell || "XX"}
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, table.headers.length - row.length) }).map((_, fi) => (
                      <td key={`fill-${fi}`} className="py-1.5 px-1 md:px-3 font-mono font-bold border border-gray-200 text-gray-400">
                        XX
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


function WhatsAppContactSection({ lang, khaiwal }: any) {
  const phone = khaiwal?.whatsapp || "7015670866";
  const name = khaiwal?.name || "Rizwan bhai khaiwal";

  const games = [
                  { name: t("कोहलापुर", "Kohlapur", lang), time: "1:30" },
                  { name: t("मणिपुर", "Manipur", lang), time: "2:30" },
                  { name: t("UP बाज़ार", "UP Bazar", lang), time: "3:30" },
                  { name: t("पलवल City", "Palwal City", lang), time: "4:30" },
                  { name: "Fridabad", time: "5:45" },
                  { name: t("मथूरा City", "Mathura City", lang), time: "6:50" },
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
           
          {name}
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
            +91{phone}
          </a>
        </div>

        {/* Footer Text */}
        <div className="text-center px-4 pt-5">
          <p className="font-black text-xl md:text-2xl text-[#1a1a2e]">
            😊😊{name} 😊😊
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
                        {row[g.key] || "XX"}
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
