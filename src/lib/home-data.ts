import {
  getHomepageFromFirestore,
  getMonthlyChartFromFirestore,
  getSK24GamesFromFirestore,
  getSK24ChartsFromFirestore,
} from "./firebase-cache";
import {
  scrapeHomepage,
  scrapeMonthlyChart,
  scrapeSK24Games,
  scrapeSK24Charts,
} from "./scraper";
import { adminDb } from "./firebase-admin";
import { getISTDateString } from "./utils";
import type {
  GameResult,
  ChartRow,
  SK24Game,
  SK24ChartTable,
  HomepageData,
} from "./types";

// ─── Firebase-primary reads with a scrape fallback ───
// Normal path: read from Firebase (cheap, cached upstream). If Firebase returns
// nothing — because the doc is empty OR its free-tier read quota is exhausted
// (getXFromFirestore swallows the error and returns null) — fall back to scraping
// the public source so the site NEVER goes blank. The whole result is memoized
// for 60s below, so the source is hit at most once per 60s per instance.

async function homepageWithFallback(): Promise<HomepageData | null> {
  const fb = await getHomepageFromFirestore();
  if (fb && (fb.live?.length || fb.rest?.length || fb.next?.length)) return fb;
  try {
    const s = await scrapeHomepage();
    return { ...s, scrapedAt: Date.now() };
  } catch {
    return fb;
  }
}

async function sk24GamesWithFallback(): Promise<SK24Game[]> {
  const fb = await getSK24GamesFromFirestore();
  if (fb?.games?.length) return fb.games;
  try {
    return await scrapeSK24Games();
  } catch {
    return fb?.games || [];
  }
}

async function sk24ChartsWithFallback(): Promise<SK24ChartTable[]> {
  const fb = await getSK24ChartsFromFirestore();
  if (fb?.tables?.length) return fb.tables;
  try {
    return await scrapeSK24Charts();
  } catch {
    return fb?.tables || [];
  }
}

async function monthlyChartWithFallback(
  monthName: string,
  year: string
): Promise<{ results: ChartRow[]; month: string; year: string }> {
  const fb = await getMonthlyChartFromFirestore(monthName, year);
  if (fb?.results?.length) {
    return { results: fb.results, month: fb.month || monthName, year: fb.year || year };
  }
  try {
    const results = await scrapeMonthlyChart(monthName, year);
    return {
      results,
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      year,
    };
  } catch {
    return { results: fb?.results || [], month: fb?.month || monthName, year: fb?.year || year };
  }
}

export interface HomeData {
  liveResults: GameResult[];
  nextResults: GameResult[];
  restResults: GameResult[];
  sk24Games: SK24Game[];
  sk24Charts: SK24ChartTable[];
  monthlyChart: ChartRow[];
  monthlyChartMeta: { month: string; year: string };
  customGames: Record<string, string>;
  customGamesYesterday: Record<string, string>;
  khaiwal: { name: string; whatsapp: string } | null;
}

const CUSTOM_COLLECTION = "custom_games";

// Read today's custom game values + khaiwal directly from Firestore (server-side).
async function getCustomGamesForDate(date: string) {
  try {
    const snap = await adminDb.collection(CUSTOM_COLLECTION).doc(date).get();
    if (!snap.exists) return { games: {} as Record<string, string>, khaiwal: null };
    const d = snap.data() || {};
    return {
      games: {
        kohlapur: d.kohlapur || "",
        manipur: d.manipur || "",
        "up-bazar": d["up-bazar"] || "",
        "palwal-city": d["palwal-city"] || "",
        "mathura-city": d["mathura-city"] || "",
      } as Record<string, string>,
      khaiwal: d.khaiwal || null,
    };
  } catch (err) {
    console.error("[home-data] custom games read failed:", (err as Error).message);
    return { games: {} as Record<string, string>, khaiwal: null };
  }
}

// Fetch everything the homepage needs, in parallel, from Firestore (no scraping).
// Process-level memo so the SSR page render AND every /api/home poll share a
// single Firestore read. This is the main lever that keeps the whole system
// inside Firebase's free tier (50k reads/day): each cycle reads 6 docs, so at
// 60s that is ~8.6k reads/day per instance — comfortably free even across a few
// instances. The backend cron only refreshes the source data once per minute,
// so caching for 60s loses ZERO freshness while halving reads vs. 30s.
let homeCache: { data: HomeData; expiresAt: number } | null = null;
const HOME_TTL_MS = 60_000; // 60s — matches the 1-min backend cron cycle

export async function getHomeData(): Promise<HomeData> {
  if (homeCache && Date.now() < homeCache.expiresAt) {
    return homeCache.data;
  }

  const now = new Date();
  const monthName = now.toLocaleString("en-US", { month: "long" }).toLowerCase();
  const year = now.getFullYear().toString();
  // Use IST so results roll over at midnight IST, not midnight UTC.
  const today = getISTDateString(0);
  const yesterday = getISTDateString(-1);

  const [homepageR, sk24R, sk24chartR, chartR, customR, customPrevR] =
    await Promise.allSettled([
      homepageWithFallback(),
      sk24GamesWithFallback(),
      sk24ChartsWithFallback(),
      monthlyChartWithFallback(monthName, year),
      getCustomGamesForDate(today),
      getCustomGamesForDate(yesterday),
    ]);

  const homepage = homepageR.status === "fulfilled" ? homepageR.value : null;
  const sk24Games = sk24R.status === "fulfilled" ? sk24R.value : [];
  const sk24Charts = sk24chartR.status === "fulfilled" ? sk24chartR.value : [];
  const chart =
    chartR.status === "fulfilled"
      ? chartR.value
      : { results: [], month: monthName, year };
  const custom = customR.status === "fulfilled" ? customR.value : { games: {}, khaiwal: null };
  const customPrev = customPrevR.status === "fulfilled" ? customPrevR.value : { games: {}, khaiwal: null };

  const data: HomeData = {
    liveResults: homepage?.live || [],
    nextResults: homepage?.next || [],
    restResults: homepage?.rest || [],
    sk24Games,
    sk24Charts,
    monthlyChart: chart.results || [],
    monthlyChartMeta: { month: chart.month || monthName, year: chart.year || year },
    customGames: custom.games || {},
    customGamesYesterday: customPrev.games || {},
    khaiwal: custom.khaiwal || null,
  };

  // If even the fallback produced an empty board (both Firebase AND source down),
  // cache only briefly so we retry soon instead of pinning a blank board for 60s.
  const ttl = homepage && (homepage.live.length || homepage.rest.length) ? HOME_TTL_MS : 5_000;
  homeCache = { data, expiresAt: Date.now() + ttl };
  return data;
}
