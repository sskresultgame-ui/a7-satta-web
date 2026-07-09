import HomeClient from "./HomeClient";
import { getHomeData } from "@/lib/home-data";

// Re-render the server data at most every 60s (matches the getHomeData memo and
// the /api/home edge cache). The backend cron only refreshes source data once a
// minute, so this loses no freshness while keeping Firestore reads within the
// free tier no matter how much traffic the page gets.
export const revalidate = 60;

export default async function HomePage() {
  const initialData = await getHomeData();
  return <HomeClient initialData={initialData} />;
}
