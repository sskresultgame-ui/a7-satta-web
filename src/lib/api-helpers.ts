import { getHomepageFromFirestore } from "./firebase-cache";
import { scrapeHomepage } from "./scraper";
import type { HomepageData } from "./types";

// ─── Simple In-Memory Cache ───

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memCache = new Map<string, CacheEntry<unknown>>();

export function memGet<T>(key: string): T | null {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memCache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function memSet<T>(key: string, data: T, ttlSeconds: number): void {
  memCache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

// ─── Get Homepage Data (Firebase primary, scrape fallback) ───
// Normal path is Firebase. If Firebase is empty or its read quota is exhausted
// (getHomepageFromFirestore returns null), scrape the public source so the board
// never goes blank. Memoized 60s so the source is hit at most once per minute.

export async function getHomepageData(): Promise<HomepageData | null> {
  const cached = memGet<HomepageData>("homepage");
  if (cached) return cached;

  const firebaseData = await getHomepageFromFirestore();
  if (firebaseData && (firebaseData.live?.length || firebaseData.rest?.length)) {
    memSet("homepage", firebaseData, 60);
    return firebaseData;
  }

  // Fallback: Firebase empty / quota exhausted — scrape the source directly.
  try {
    const { live, next, rest } = await scrapeHomepage();
    const data: HomepageData = { live, next, rest, scrapedAt: Date.now() };
    memSet("homepage", data, live.length || rest.length ? 60 : 5);
    return data;
  } catch (err) {
    console.error("[api-helpers] homepage fallback scrape failed:", (err as Error).message);
    return firebaseData; // may be null
  }
}

// ─── Cache Headers ───

export const EDGE_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
  "CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
  "Vercel-CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
} as const;

export const CHART_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  "Vercel-CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
} as const;
