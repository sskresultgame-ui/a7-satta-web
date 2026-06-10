import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const COLLECTION = "custom_games";

// GET - Fetch custom game values for a date (default: today)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const today = searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const snap = await adminDb.collection(COLLECTION).doc(today).get();

    if (!snap.exists) {
      return Response.json({ success: true, games: {} });
    }

    return Response.json({ success: true, games: snap.data() || {} });
  } catch (error) {
    return Response.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST - Save custom game values (with simple auth)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, games, date } = body;

    // Static auth check
    if (email !== "kapil123@gmail.com" || password !== "Kapil@1997") {
      return Response.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const targetDate = date || new Date().toISOString().slice(0, 10);

    // Merge with existing data for that date
    const docRef = adminDb.collection(COLLECTION).doc(targetDate);
    const existing = await docRef.get();
    const existingData = existing.exists ? existing.data() || {} : {};

    const updatedData = { ...existingData, ...games, updatedAt: Date.now() };
    await docRef.set(updatedData);

    return Response.json({ success: true, games: updatedData });
  } catch (error) {
    return Response.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
