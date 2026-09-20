import { useEffect, useMemo, useState } from "react";
import {
  SEED_CATALOG,
  adjacentIds,
  getWork,
  publishedWorks,
  type Catalog,
  type Work,
} from "@/lib/media";
import { fetchCatalog } from "@/lib/catalog-api";

export function useCatalog(opts?: { includeDrafts?: boolean }) {
  const includeDrafts = opts?.includeDrafts === true;
  const [catalog, setCatalog] = useState<Catalog>(SEED_CATALOG);
  const [source, setSource] = useState<"seed" | "firebase">("seed");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const nextCatalog = await fetchCatalog();
      if (cancelled || !nextCatalog?.works.length) return;
      setCatalog(nextCatalog);
      setSource("firebase");
    })();

    return () => {
      cancelled = true;
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
