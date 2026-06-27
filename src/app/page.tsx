import HomeClient from "./HomeClient";
import { getHomeData } from "@/lib/home-data";

// Re-render the server data at most every 10s (matches the API edge cache).
// Keeps Firestore reads off the hot path while showing fresh results fast.
export const revalidate = 10;

export default async function HomePage() {
  const initialData = await getHomeData();
  return <HomeClient initialData={initialData} />;
}
