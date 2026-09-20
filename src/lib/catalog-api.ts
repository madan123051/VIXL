import { getFirebaseDatabaseUrl } from "@/lib/firebase-config";
import { getWork, parseCatalog, parseWork, type Catalog, type Work } from "@/lib/media";

const DATABASE_URL = getFirebaseDatabaseUrl();

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

export async function fetchCatalog(): Promise<Catalog | null> {
  if (!DATABASE_URL) return null;
  try {
    const res = await fetch(`${DATABASE_URL}/catalog.json`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    return res.ok ? parseCatalog(await res.json()) : null;
  } catch {
    return null;
  }
}
