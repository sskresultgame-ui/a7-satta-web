import {
  getHomepageFromFirestore,
  getMonthlyChartFromFirestore,
  getSK24GamesFromFirestore,
  getSK24ChartsFromFirestore,
} from "./firebase-cache";
import { adminDb } from "./firebase-admin";
import type {
  GameResult,
  ChartRow,
  SK24Game,
  SK24ChartTable,
} from "./types";

export interface HomeData {
  liveResults: GameResult[];
  nextResults: GameResult[];
  restResults: GameResult[];
  sk24Games: SK24Game[];
  sk24Charts: SK24ChartTable[];
  monthlyChart: ChartRow[];
  monthlyChartMeta: { month: string; year: string };
  customGames: Record<string, string>;
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
export async function getHomeData(): Promise<HomeData> {
  const now = new Date();
  const monthName = now.toLocaleString("en-US", { month: "long" }).toLowerCase();
  const year = now.getFullYear().toString();
  const today = now.toISOString().slice(0, 10);

  const [homepage, sk24, sk24chart, chart, custom] = await Promise.all([
    getHomepageFromFirestore(),
    getSK24GamesFromFirestore(),
    getSK24ChartsFromFirestore(),
    getMonthlyChartFromFirestore(monthName, year),
    getCustomGamesForDate(today),
  ]);

  return {
    liveResults: homepage?.live || [],
    nextResults: homepage?.next || [],
    restResults: homepage?.rest || [],
    sk24Games: sk24?.games || [],
    sk24Charts: sk24chart?.tables || [],
    monthlyChart: chart?.results || [],
    monthlyChartMeta: {
      month: chart?.month || monthName,
      year: chart?.year || year,
    },
    customGames: custom.games || {},
    khaiwal: custom.khaiwal || null,
  };
}
