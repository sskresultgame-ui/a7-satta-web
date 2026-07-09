import { getHomeData } from "@/lib/home-data";

// Live board data for client-side polling. getHomeData() is memoized (~60s) so
// this rarely touches Firestore, and the CDN cache below means a burst of
// visitors collapses into ~one origin hit per 60s — keeps us in Firebase's free tier.
//
// We return ONLY the fields the client poll actually applies (the live board +
// custom values). The heavier monthlyChart / sk24Charts are left out to keep the
// response small — that directly saves Vercel bandwidth under high traffic.
export async function GET() {
  const d = await getHomeData();
  const board = {
    liveResults: d.liveResults,
    nextResults: d.nextResults,
    restResults: d.restResults,
    sk24Games: d.sk24Games,
    customGames: d.customGames,
    customGamesYesterday: d.customGamesYesterday,
  };
  return Response.json(board, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
      "CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
      "Vercel-CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
    },
  });
}
