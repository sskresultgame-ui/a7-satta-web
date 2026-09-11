import mongoose from "mongoose";
import { getISTDateString } from "./utils";
import type { ChartRow, GameChartData, GameResult, HomepageData, MonthlyChartData } from "./types";

const PRIMARY_GAMES = new Set([
  "sadar bazar", "gwalior", "delhi bazar", "delhi matka", "shri ganesh",
  "agra", "faridabad", "alwar", "ghaziabad", "dwarka", "gali", "desawer",
]);

const NAME_ALIASES: Record<string, string> = {
  gaziabad: "ghaziabad",
  desawar: "desawer",
  disawar: "desawer",
  fridabad: "faridabad",
};

type DbName = "primary" | "fast";
type GameDoc = { _id: unknown; name: string; code?: string; resultTime?: string; isActive?: boolean; showIndex?: number };
type ResultDoc = { game: unknown; resultDate: string; result: string };

declare global {
  var mongoClients: Partial<Record<DbName, Promise<mongoose.Connection>>> | undefined;
}

function envFor(name: DbName) {
  return name === "primary" ? process.env.MONGODB_URI : process.env.SATTA_KING_FAST_MONGODB_URI;
}

async function db(name: DbName) {
  const uri = envFor(name);
  if (!uri) throw new Error(`${name === "primary" ? "MONGODB_URI" : "SATTA_KING_FAST_MONGODB_URI"} is not configured`);
  global.mongoClients ??= {};
  global.mongoClients[name] ??= mongoose.createConnection(uri, { serverSelectionTimeoutMS: 10_000 }).asPromise();
  return (await global.mongoClients[name]).db!;
}

function normalize(name: string) {
  const value = name.toLowerCase().trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
  return NAME_ALIASES[value] || value;
}

function timeForDisplay(value?: string) {
  if (!value) return "";
  const [hours = "0", minutes = "0"] = value.split(":");
  const hour = Number(hours);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes.padStart(2, "0")} ${suffix}`;
}

async function gamesWithResults(source: DbName): Promise<GameResult[]> {
  const database = await db(source);
  const [games, results] = await Promise.all([
    database.collection<GameDoc>("games").find({ isActive: { $ne: false } }).sort({ showIndex: 1, name: 1 }).toArray(),
    database.collection<ResultDoc>("gameresults").find({ resultDate: { $in: [getISTDateString(0), getISTDateString(-1)] } }).toArray(),
  ]);
  const byGame = new Map<string, { today?: string; yesterday?: string }>();
  for (const result of results) {
    const id = String(result.game);
    const current = byGame.get(id) || {};
    if (result.resultDate === getISTDateString(0)) current.today = String(result.result || "XX");
    if (result.resultDate === getISTDateString(-1)) current.yesterday = String(result.result || "XX");
    byGame.set(id, current);
  }
  return games.map((game) => {
    const values = byGame.get(String(game._id));
    return {
      name: game.name,
      time: timeForDisplay(game.resultTime),
      yesterday: values?.yesterday || "XX",
      today: values?.today || "XX",
    };
  });
}

export async function getBoardGames(): Promise<GameResult[]> {
  const [primary, fast] = await Promise.all([gamesWithResults("primary"), gamesWithResults("fast")]);
  // The named markets always come from MONGODB_URI; every other market comes
  // from SATTA_KING_FAST_MONGODB_URI, even where both databases contain a name.
  return [
    ...primary.filter((game) => PRIMARY_GAMES.has(normalize(game.name))),
    ...fast.filter((game) => !PRIMARY_GAMES.has(normalize(game.name))),
  ];
}

function byResultTime(games: GameResult[]): HomepageData {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (time: string) => {
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let hour = Number(match[1]) % 12;
    if (match[3].toUpperCase() === "PM") hour += 12;
    return hour * 60 + Number(match[2]);
  };
  return {
    live: games.filter((game) => Math.abs(toMinutes(game.time) - minutes) <= 30),
    next: games.filter((game) => toMinutes(game.time) > minutes + 30),
    rest: games.filter((game) => toMinutes(game.time) < minutes - 30),
    scrapedAt: Date.now(),
  };
}

export async function getHomepageFromMongo(): Promise<HomepageData> {
  return byResultTime(await getBoardGames());
}

export async function getGameChartFromMongo(slug: string, month?: string, year?: string): Promise<GameChartData | null> {
  const wanted = normalize(slug.replace(/-/g, " "));
  const source: DbName = PRIMARY_GAMES.has(wanted) ? "primary" : "fast";
  const database = await db(source);
  const games = await database.collection<GameDoc>("games").find({}).toArray();
  const game = games.find((item) => normalize(item.name) === wanted && item.isActive !== false)
    || games.find((item) => normalize(item.name) === wanted);
  if (!game) return null;
  const now = new Date();
  const monthIndex = month ? ["january","february","march","april","may","june","july","august","september","october","november","december"].indexOf(month.toLowerCase()) : now.getMonth();
  const selectedYear = Number(year || now.getFullYear());
  if (monthIndex < 0 || !Number.isInteger(selectedYear)) return null;
  const prefix = `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}`;
  const records = await database.collection<ResultDoc>("gameresults").find({ game: game._id, resultDate: { $regex: `^${prefix}` } }).toArray();
  const values = new Map(records.map((record) => [record.resultDate, String(record.result || "XX")]));
  const days = new Date(selectedYear, monthIndex + 1, 0).getDate();
  const monthLabel = new Date(selectedYear, monthIndex).toLocaleString("en-US", { month: "long" });
  return {
    gameName: game.name,
    chartTitle: `${game.name.toUpperCase()} - ${monthLabel} ${selectedYear}`,
    month: monthLabel,
    year: String(selectedYear),
    columns: ["Date", "Day", "Result"],
    results: Array.from({ length: days }, (_, index) => {
      const day = index + 1;
      const date = `${prefix}-${String(day).padStart(2, "0")}`;
      return { date: String(day).padStart(2, "0"), day: new Date(selectedYear, monthIndex, day).toLocaleString("en-US", { weekday: "long" }), result: values.get(date) || "XX" };
    }),
    scrapedAt: Date.now(),
  };
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MONTHLY_GAMES: Record<keyof Omit<ChartRow, "date">, string> = {
  dlbz: "delhi bazar",
  srgn: "shri ganesh",
  frbd: "faridabad",
  gzbd: "ghaziabad",
  gali: "gali",
  dswr: "desawer",
};

export async function getMonthlyChartFromMongo(month: string, year: string): Promise<MonthlyChartData> {
  const monthIndex = MONTHS.indexOf(month.toLowerCase());
  const selectedYear = Number(year);
  if (monthIndex < 0 || !Number.isInteger(selectedYear)) throw new Error("Invalid month or year");

  const database = await db("primary");
  const games = await database.collection<GameDoc>("games").find({}).toArray();
  const gameIds = new Map<keyof Omit<ChartRow, "date">, unknown>();
  for (const [key, name] of Object.entries(MONTHLY_GAMES) as [keyof Omit<ChartRow, "date">, string][]) {
    const game = games.find((item) => normalize(item.name) === name && item.isActive !== false)
      || games.find((item) => normalize(item.name) === name);
    if (game) gameIds.set(key, game._id);
  }

  const prefix = `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}`;
  const records = await database.collection<ResultDoc>("gameresults")
    .find({ game: { $in: [...gameIds.values()] }, resultDate: { $regex: `^${prefix}` } })
    .toArray();
  const resultKeyByGame = new Map([...gameIds.entries()].map(([key, id]) => [String(id), key]));
  const values = new Map<string, string>();
  for (const record of records) {
    const key = resultKeyByGame.get(String(record.game));
    if (key) values.set(`${record.resultDate}:${key}`, String(record.result || "XX"));
  }

  const days = new Date(selectedYear, monthIndex + 1, 0).getDate();
  const results: ChartRow[] = Array.from({ length: days }, (_, index) => {
    const date = `${prefix}-${String(index + 1).padStart(2, "0")}`;
    return {
      date: String(index + 1).padStart(2, "0"),
      dlbz: values.get(`${date}:dlbz`) || "XX",
      srgn: values.get(`${date}:srgn`) || "XX",
      frbd: values.get(`${date}:frbd`) || "XX",
      gzbd: values.get(`${date}:gzbd`) || "XX",
      gali: values.get(`${date}:gali`) || "XX",
      dswr: values.get(`${date}:dswr`) || "XX",
    };
  });
  return { month: month[0].toUpperCase() + month.slice(1).toLowerCase(), year: String(selectedYear), results, scrapedAt: Date.now() };
}

export async function customGamesCollection() {
  return (await db("fast")).collection("custom_games");
}
