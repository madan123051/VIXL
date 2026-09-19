import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ensureFirebaseAuth, getFirebaseAnalytics, logPageView } from "@/lib/firebase";

/** Client-only: anonymous session, Analytics, page views. Catalog seed runs in useCatalog. */
export function FirebaseBoot() {
  const href = useRouterState({ select: (s) => s.location.href });

  useEffect(() => {
    void (async () => {
      await ensureFirebaseAuth();
      void getFirebaseAnalytics();
    })();
  }, []);

  useEffect(() => {
    void logPageView(href);
  }, [href]);

  return null;
}
