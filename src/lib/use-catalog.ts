import { useEffect, useMemo, useState } from "react";
import {
  SEED_CATALOG,
  adjacentIds,
  getWork,
  parseCatalog,
  type Catalog,
  type Work,
} from "@/lib/media";
import { ensureFirebaseAuth, getFirebaseDatabase } from "@/lib/firebase";

export function useCatalog() {
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
    const hero =
      catalog.works.find((work) => work.id === catalog.heroId) ?? catalog.works[0];
    return {
      ...catalog,
      hero,
      source,
      getWork: (id: string) => getWork(id, catalog.works),
      adjacentIds: (id: string) => adjacentIds(id, catalog.works),
    };
  }, [catalog, source]);
}

export type LiveCatalog = ReturnType<typeof useCatalog>;
export type { Work };
