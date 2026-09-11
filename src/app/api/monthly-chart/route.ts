import { NextRequest } from "next/server";
import { memGet, memSet, CHART_CACHE_HEADERS } from "@/lib/api-helpers";
import { getMonthlyChartFromMongo } from "@/lib/mongodb";
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

  try {
    const data = await getMonthlyChartFromMongo(monthName, year);
    memSet(cacheKey, data, 120);
    return Response.json({ success: true, month: data.month, year: data.year, results: data.results }, { headers: CHART_CACHE_HEADERS });
  } catch (error) {
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
