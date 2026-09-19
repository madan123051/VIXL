import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { getFirebaseApp, isAdminEmail } from "@/lib/firebase";

export function useAdminSession() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const app = getFirebaseApp();
      if (!app) {
        if (!cancelled) setReady(true);
        return;
      }
      const { getAuth, onAuthStateChanged } = await import("firebase/auth");
      if (cancelled) return;
      stop = onAuthStateChanged(getAuth(app), (next) => {
        setUser(next);
        setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  return {
    user,
    ready,
    isAdmin: isAdminEmail(user?.email),
  };
}
