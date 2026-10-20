import { customGamesCollection, getBoardGames, getHomepageFromMongo, getMonthlyChartFromMongo } from "./mongodb";
import { getISTDateString } from "./utils";
import type { ChartRow, GameResult, HomepageData, SK24ChartTable, SK24Game } from "./types";

export interface HomeData {
  liveResults: GameResult[]; nextResults: GameResult[]; restResults: GameResult[];
  sk24Games: SK24Game[]; sk24Charts: SK24ChartTable[]; monthlyChart: ChartRow[];
  monthlyChartMeta: { month: string; year: string }; customGames: Record<string, string>;
  customGamesYesterday: Record<string, string>; khaiwal: { name: string; whatsapp: string } | null;
}

const GAME_KEYS = ["kohlapur", "manipur", "up-bazar", "palwal-city", "mathura-city"];
let cache: { data: HomeData; expiresAt: number } | null = null;

async function customGamesForDate(date: string) {
  const doc = await (await customGamesCollection()).findOne({ date });
  return { games: Object.fromEntries(GAME_KEYS.map((key) => [key, String(doc?.games?.[key] || "")])), khaiwal: doc?.khaiwal || null };
}

export async function getHomeData(): Promise<HomeData> {
  if (cache && Date.now() < cache.expiresAt) return cache.data;
  const now = new Date();
  const collection = await customGamesCollection();
  const monthName = now.toLocaleString("en-US", { month: "long" });
  const [homepage, board, monthly, custom, yesterday, global] = await Promise.all([
    getHomepageFromMongo(), getBoardGames(), getMonthlyChartFromMongo(monthName, String(now.getFullYear())),
    customGamesForDate(getISTDateString(0)), customGamesForDate(getISTDateString(-1)),
    collection.findOne({ type: "khaiwal" }),
  ]);
  const data: HomeData = {
    liveResults: homepage.live, nextResults: homepage.next, restResults: homepage.rest, sk24Games: board,
    sk24Charts: [], monthlyChart: monthly.results,
    monthlyChartMeta: { month: monthly.month, year: monthly.year },
    customGames: custom.games, customGamesYesterday: yesterday.games, khaiwal: global?.khaiwal || custom.khaiwal || null,
  };
  cache = { data, expiresAt: Date.now() + 60_000 };
  return data;
}

export async function getMongoHomepageData(): Promise<HomepageData> { return getHomepageFromMongo(); }
