import { NextRequest } from "next/server";
import { scrapeGameChart, scrapeSK24GameChart } from "@/lib/scraper";
import { getGameChartFromFirestore } from "@/lib/firebase-cache";
import type { GameChartData } from "@/lib/types";
import { memGet, memSet, CHART_CACHE_HEADERS } from "@/lib/api-helpers";

// Homepage uses Hinglish display spellings, but Firebase + the source site
// store charts under canonical slugs. Normalize before any lookup so the
// "Chart →" links for these games resolve correctly.
const SLUG_ALIASES: Record<string, string> = {
  fridabad: "faridabad",
  frbd: "faridabad",
  gaziabad: "ghaziabad",
  gzbd: "ghaziabad",
  disawar: "desawar",
  desawer: "desawar",
  dswr: "desawar",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawSlug = searchParams.get("slug");
  const month = searchParams.get("month") || undefined;
  const year = searchParams.get("year") || undefined;

  if (!rawSlug) {
    return Response.json({ success: false, error: "slug is required" }, { status: 400 });
  }

  const slug = SLUG_ALIASES[rawSlug.toLowerCase()] || rawSlug.toLowerCase();

  const cacheKey = `game:${slug}:${month || "current"}:${year || "current"}`;

  // 1. In-memory cache
  const cached = memGet<GameChartData>(cacheKey);
  if (cached) {
    return Response.json({ success: true, ...cached }, { headers: CHART_CACHE_HEADERS });
  }

  // 2. Live scrape — authoritative source. The source site always serves the
  // full, current month's chart, so it stays in sync with the homepage's
  // live/next/rest results. (The Firebase game-chart cache is unmaintained and
  // can be stale/incomplete, so it is only used as a fallback below.)
  try {
    let result = await scrapeGameChart(slug, month, year);
    if (!result) {
      result = await scrapeSK24GameChart(slug, month, year);
    }
    if (result && result.results?.length) {
      const chartData: GameChartData = { ...result, scrapedAt: Date.now() };
      memSet(cacheKey, chartData, 300);
      return Response.json({ success: true, ...chartData }, { headers: CHART_CACHE_HEADERS });
    }
  } catch (error) {
    // Scrape failed (network/parse) — fall through to the Firebase cache.
    console.error("[game-chart] scrape failed:", (error as Error).message);
  }

  // 3. Firebase fallback (only when the live scrape returns nothing).
  const firebaseData = await getGameChartFromFirestore(slug, month, year);
  if (firebaseData) {
    memSet(cacheKey, firebaseData, 300);
    return Response.json({ success: true, ...firebaseData }, { headers: CHART_CACHE_HEADERS });
  }

  return Response.json({ success: false, error: "Game not found" }, { status: 404 });
}
