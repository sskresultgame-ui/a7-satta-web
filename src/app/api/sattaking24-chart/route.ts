import { NextResponse } from "next/server";
import { getSK24ChartsFromFirestore } from "@/lib/firebase-cache";
import { scrapeSK24Charts } from "@/lib/scraper";
import { memGet, memSet, CHART_CACHE_HEADERS } from "@/lib/api-helpers";
import type { SK24ChartsData } from "@/lib/types";

export async function GET() {
  try {
    const cached = memGet<SK24ChartsData>("sk24-charts");
    if (cached) {
      return NextResponse.json(
        { success: true, tables: cached.tables },
        { headers: CHART_CACHE_HEADERS }
      );
    }

    // Firebase primary
    const firebaseData = await getSK24ChartsFromFirestore();
    if (firebaseData?.tables?.length) {
      memSet("sk24-charts", firebaseData, 300);
      return NextResponse.json(
        { success: true, tables: firebaseData.tables },
        { headers: CHART_CACHE_HEADERS }
      );
    }

    // Fallback: Firebase empty / quota exhausted — scrape the source directly.
    const tables = await scrapeSK24Charts();
    if (tables.length) {
      memSet("sk24-charts", { tables, scrapedAt: Date.now() }, 300);
    }
    return NextResponse.json(
      { success: true, tables },
      { headers: CHART_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("SK24 chart error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
