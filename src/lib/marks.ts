import { useCallback, useEffect, useState } from "react";
import { getFirebaseDatabase, logMarkFrame } from "@/lib/firebase";

const LS_KEY = "vixl.marks";

function readLocal(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

function writeLocal(ids: Set<string>) {
  localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
}

export function useMark(workId: string) {
  const [count, setCount] = useState(0);
  const [marked, setMarked] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setMarked(readLocal().has(workId));
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const db = await getFirebaseDatabase();
      if (cancelled) return;
      if (!db) {
        setReady(true);
        return;
      }
      const { onValue, ref } = await import("firebase/database");
      unsubscribe = onValue(
        ref(db, `marks/${workId}/count`),
        (snap) => {
          const value = snap.val();
          setCount(typeof value === "number" && value > 0 ? value : 0);
          setReady(true);
        },
        () => setReady(true),
      );
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [workId]);

  const toggle = useCallback(async () => {
    if (pending) return;
    const next = !marked;
    const previousCount = count;
    setPending(true);
    setMarked(next);
    setCount((n) => (next ? n + 1 : Math.max(0, n - 1)));

    const local = readLocal();
    if (next) local.add(workId);
    else local.delete(workId);
    writeLocal(local);

    const db = await getFirebaseDatabase();
    if (!db) {
      setPending(false);
      void logMarkFrame(workId, next);
      return;
    }

    try {
      const { ref, runTransaction } = await import("firebase/database");
      await runTransaction(ref(db, `marks/${workId}/count`), (current) => {
        const n = typeof current === "number" ? current : 0;
        return next ? n + 1 : Math.max(0, n - 1);
      });
      void logMarkFrame(workId, next);
    } catch {
      setMarked(!next);
      setCount(previousCount);
      const revert = readLocal();
      if (next) revert.delete(workId);
      else revert.add(workId);
      writeLocal(revert);
    } finally {
      setPending(false);
    }
  }, [count, marked, pending, workId]);

  return { count, marked, ready, pending, toggle };
}
