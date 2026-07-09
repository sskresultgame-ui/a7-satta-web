import { NextRequest } from "next/server";
import { getMonthlyChartFromFirestore } from "@/lib/firebase-cache";
import { scrapeMonthlyChart } from "@/lib/scraper";
import { memGet, memSet, CHART_CACHE_HEADERS } from "@/lib/api-helpers";
import type { MonthlyChartData } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const now = new Date();
  const monthName = (searchParams.get("month") ||
    now.toLocaleString("en-US", { month: "long" })).toLowerCase();
  const year = searchParams.get("year") || now.getFullYear().toString();
  const cacheKey = `chart:${monthName}:${year}`;

  const cached = memGet<MonthlyChartData>(cacheKey);
  if (cached) {
    return Response.json(
      { success: true, month: cached.month, year: cached.year, results: cached.results },
      { headers: CHART_CACHE_HEADERS }
    );
  }

  // Firebase primary
  const firebaseData = await getMonthlyChartFromFirestore(monthName, year);
  if (firebaseData?.results?.length) {
    memSet(cacheKey, firebaseData, 120);
    return Response.json(
      { success: true, month: firebaseData.month, year: firebaseData.year, results: firebaseData.results },
      { headers: CHART_CACHE_HEADERS }
    );
  }

  // Fallback: Firebase empty / quota exhausted — scrape the source directly.
  try {
    const results = await scrapeMonthlyChart(monthName, year);
    const data: MonthlyChartData = {
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      year,
      results,
      scrapedAt: Date.now(),
    };
    if (results.length) memSet(cacheKey, data, 120);
    return Response.json(
      { success: true, month: data.month, year: data.year, results: data.results },
      { headers: CHART_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("[monthly-chart] fallback scrape failed:", (err as Error).message);
    return Response.json(
      { success: false, error: "Chart data not available" },
      { status: 503 }
    );
  }
}
