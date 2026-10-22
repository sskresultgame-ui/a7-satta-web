import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured, checkCredentials, createSessionToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json({ success: false, error: "ADMIN_EMAIL / ADMIN_PASSWORD are not set in Vercel env" }, { status: 500 });
  }
  const { email, password } = await req.json().catch(() => ({}));
  if (!checkCredentials(email, password)) {
    await new Promise((r) => setTimeout(r, 800)); // slow down password guessing
    return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
  }
  const { token, maxAge } = createSessionToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 0 });
  return res;
}
