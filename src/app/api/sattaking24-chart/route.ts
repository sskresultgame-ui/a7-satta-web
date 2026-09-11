import { NextResponse } from "next/server";
import { memGet, memSet, CHART_CACHE_HEADERS } from "@/lib/api-helpers";

export async function GET() {
  try {
    const cached = memGet<{ tables: never[]; scrapedAt: number }>("sk24-charts");
    if (cached) {
      return NextResponse.json(
        { success: true, tables: cached.tables },
        { headers: CHART_CACHE_HEADERS }
      );
    }

    const tables: never[] = [];
    memSet("sk24-charts", { tables, scrapedAt: Date.now() }, 300);
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
