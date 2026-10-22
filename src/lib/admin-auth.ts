import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

// Set these in Vercel → Project → Settings → Environment Variables.
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const SECRET = process.env.ADMIN_SESSION_SECRET || PASSWORD || "";
export const ADMIN_COOKIE = "a7satta_admin";
const SESSION_HOURS = 12;

export const adminConfigured = () => Boolean(EMAIL && PASSWORD);

const sign = (payload: string) => createHmac("sha256", SECRET).update(payload).digest("hex");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkCredentials(email: string, password: string) {
  return adminConfigured() && safeEqual(String(email), EMAIL!) && safeEqual(String(password), PASSWORD!);
}

export function createSessionToken() {
  const expires = Date.now() + SESSION_HOURS * 3600_000;
  const payload = `a7satta-admin.${expires}`;
  return { token: `${payload}.${sign(payload)}`, maxAge: SESSION_HOURS * 3600 };
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value || "";
  const i = token.lastIndexOf(".");
  if (i < 0) return false;
  const payload = token.slice(0, i);
  const expires = Number(payload.split(".")[1]);
  return Number.isFinite(expires) && expires > Date.now() && safeEqual(token.slice(i + 1), sign(payload));
}

export function requestMeta(req: NextRequest) {
  return {
    ip: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown",
    userAgent: req.headers.get("user-agent") || "unknown",
  };
}
