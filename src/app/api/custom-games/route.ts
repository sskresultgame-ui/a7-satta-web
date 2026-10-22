import { NextRequest } from "next/server";
import { customGamesCollection } from "@/lib/mongodb";
import { getKhaiwal } from "@/lib/site-settings";

// Credentials live ONLY in the server env (.env.local on the VPS), never in client code.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const GAME_KEYS = ["kohlapur", "manipur", "up-bazar", "palwal-city", "mathura-city"];
const isAuthed = (email?: string, password?: string) =>
  Boolean(ADMIN_EMAIL && ADMIN_PASSWORD) && email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
const dateToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

export async function GET(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams;
    const collection = await customGamesCollection();
    if (params.get("list")) {
      const all = Boolean(params.get("all"));
      const now = new Date();
      const month = Number(params.get("month") || now.getMonth() + 1);
      const year = Number(params.get("year") || now.getFullYear());
      const prefix = `${year}-${String(month).padStart(2, "0")}-`;
      const docs = await collection.find(all ? { date: { $exists: true } } : { date: { $regex: `^${prefix}` } }).toArray();
      const entries = docs.flatMap((doc) => GAME_KEYS.flatMap((game) => doc.games?.[game] ? [{ date: doc.date, game, value: String(doc.games[game]) }] : []))
        .sort((a, b) => b.date.localeCompare(a.date) || GAME_KEYS.indexOf(a.game) - GAME_KEYS.indexOf(b.game));
      return Response.json({ success: true, entries });
    }
    const date = params.get("date") || dateToday();
    const doc = await collection.findOne({ date });
    return Response.json({ success: true, games: doc?.games || {}, khaiwal: await getKhaiwal() });
  } catch (error) {
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, games, date, action } = await req.json();
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return Response.json({ success: false, error: "ADMIN_EMAIL / ADMIN_PASSWORD not set in .env.local" }, { status: 500 });
    if (!isAuthed(email, password)) return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 });

    if (action === "login") return Response.json({ success: true });

    let updatedGames: Record<string, string> | undefined;
    if (games && Object.keys(games).length) {
      const collection = await customGamesCollection();
      const targetDate = date || dateToday();
      const existing = await collection.findOne({ date: targetDate });
      updatedGames = { ...(existing?.games || {}), ...games };
      await collection.updateOne({ date: targetDate }, { $set: { date: targetDate, games: updatedGames, updatedAt: new Date() } }, { upsert: true });
    }
    return Response.json({ success: true, games: updatedGames, khaiwal: await getKhaiwal() });
  } catch (error) {
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { email, password, date, game, value } = await req.json();
    if (!isAuthed(email, password)) return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    if (!date || !game) return Response.json({ success: false, error: "date and game are required" }, { status: 400 });
    await (await customGamesCollection()).updateOne({ date }, { $set: { date, [`games.${game}`]: String(value || "").trim(), updatedAt: new Date() } }, { upsert: true });
    return Response.json({ success: true });
  } catch (error) { return Response.json({ success: false, error: (error as Error).message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const { email, password, date, game } = await req.json();
    if (!isAuthed(email, password)) return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    if (!date || !game) return Response.json({ success: false, error: "date and game are required" }, { status: 400 });
    await (await customGamesCollection()).updateOne({ date }, { $unset: { [`games.${game}`]: "" }, $set: { updatedAt: new Date() } });
    return Response.json({ success: true });
  } catch (error) { return Response.json({ success: false, error: (error as Error).message }, { status: 500 }); }
}
