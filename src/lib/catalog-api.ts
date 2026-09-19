import { getWork, parseWork, type Work } from "@/lib/media";

const DATABASE_URL = (
  import.meta.env.VITE_FIREBASE_DATABASE_URL ??
  "https://vixl-1c88f-default-rtdb.firebaseio.com"
).replace(/\/$/, "");

/** Seed first, then live catalog — so new posts have titles and images for crawlers. */
export async function fetchWorkById(id: string): Promise<Work | null> {
  const local = getWork(id) ?? null;
  if (!DATABASE_URL || !id) return local;
  try {
    const res = await fetch(
      `${DATABASE_URL}/catalog/works/${encodeURIComponent(id)}.json`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return local;
    const parsed = parseWork(await res.json());
    if (!parsed || parsed.published === false) return local;
    return parsed;
  } catch {
    return local;
  }
}
