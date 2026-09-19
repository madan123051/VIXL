import { useEffect, useMemo, useState } from "react";
import {
  SEED_CATALOG,
  adjacentIds,
  getWork,
  parseCatalog,
  publishedWorks,
  type Catalog,
  type Work,
} from "@/lib/media";
import { ensureFirebaseAuth, getFirebaseDatabase } from "@/lib/firebase";

export function useCatalog(opts?: { includeDrafts?: boolean }) {
  const includeDrafts = opts?.includeDrafts === true;
  const [catalog, setCatalog] = useState<Catalog>(SEED_CATALOG);
  const [source, setSource] = useState<"seed" | "firebase">("seed");

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      await ensureFirebaseAuth();
      const db = await getFirebaseDatabase();
      if (!db || cancelled) return;
      const { onValue, ref } = await import("firebase/database");
      unsubscribe = onValue(
        ref(db, "catalog"),
        (snap) => {
          const parsed = parseCatalog(snap.val());
          if (!parsed?.works.length) return;
          setCatalog(parsed);
          setSource("firebase");
        },
        () => {
          /* permission denied — keep seed */
        },
      );
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return useMemo(() => {
    const works = includeDrafts ? catalog.works : publishedWorks(catalog.works);
    const hero = works.find((work) => work.id === catalog.heroId) ?? works[0];
    return {
      ...catalog,
      works,
      allWorks: catalog.works,
      hero,
      source,
      getWork: (id: string) => getWork(id, works),
      adjacentIds: (id: string) => adjacentIds(id, works),
    };
  }, [catalog, source, includeDrafts]);
}

export type LiveCatalog = ReturnType<typeof useCatalog>;
export type { Work };
