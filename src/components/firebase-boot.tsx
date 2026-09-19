import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { getFirebaseApp, getFirebaseAnalytics, logPageView } from "@/lib/firebase";

/** Client-only: start Analytics and log a page view on each navigation. */
export function FirebaseBoot() {
  const href = useRouterState({ select: (s) => s.location.href });

  useEffect(() => {
    getFirebaseApp();
    void getFirebaseAnalytics();
  }, []);

  useEffect(() => {
    void logPageView(href);
  }, [href]);

  return null;
}
