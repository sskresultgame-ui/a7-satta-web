import HomeClient from "./HomeClient";
import { getHomeData } from "@/lib/home-data";

// Re-render the server data at most every 30s (matches the API edge cache).
// Keeps Firestore reads off the hot path while staying fresh.
export const revalidate = 30;

export default async function HomePage() {
  const initialData = await getHomeData();
  return <HomeClient initialData={initialData} />;
}
