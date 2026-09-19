import { useCallback, useEffect, useState } from "react";
import { ensureFirebaseAuth, getFirebaseDatabase } from "@/lib/firebase";

export type StudioComment = {
  id: string;
  name: string;
  body: string;
  createdAt: number;
};

const NAME_KEY = "vixl.commentName";
const LAST_KEY = "vixl.commentAt";
const GAP_MS = 12_000;

export function readCommentName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

function parseComment(id: string, value: unknown): StudioComment | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.name !== "string" || typeof row.body !== "string") return null;
  if (typeof row.createdAt !== "number") return null;
  return { id, name: row.name, body: row.body, createdAt: row.createdAt };
}

export function useComments(workId: string) {
  const [comments, setComments] = useState<StudioComment[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void (async () => {
      await ensureFirebaseAuth();
      const db = await getFirebaseDatabase();
      if (!db || cancelled) return;
      const { onValue, ref } = await import("firebase/database");
      unsubscribe = onValue(
        ref(db, `comments/${workId}`),
        (snap) => {
          const raw = snap.val() as Record<string, unknown> | null;
          const list = raw
            ? Object.entries(raw)
                .map(([id, value]) => parseComment(id, value))
                .filter((row): row is StudioComment => Boolean(row))
                .sort((a, b) => a.createdAt - b.createdAt)
            : [];
          setComments(list);
        },
        () => setComments([]),
      );
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [workId]);

  const add = useCallback(
    async (name: string, body: string) => {
      const cleanName = name.replace(/\s+/g, " ").trim().slice(0, 40);
      const cleanBody = body.replace(/\s+/g, " ").trim().slice(0, 500);
      if (cleanName.length < 2) throw new Error("Name needs at least two letters.");
      if (cleanBody.length < 2) throw new Error("Write a little more.");
      const last = Number(localStorage.getItem(LAST_KEY) ?? 0);
      if (Date.now() - last < GAP_MS) throw new Error("Give it a moment before the next note.");
      setPending(true);
      setError(null);
      try {
        await ensureFirebaseAuth();
        const db = await getFirebaseDatabase();
        if (!db) throw new Error("Comments are offline.");
        const { push, ref, set } = await import("firebase/database");
        const node = push(ref(db, `comments/${workId}`));
        await set(node, {
          name: cleanName,
          body: cleanBody,
          createdAt: Date.now(),
        });
        localStorage.setItem(NAME_KEY, cleanName);
        localStorage.setItem(LAST_KEY, String(Date.now()));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Comment did not land.";
        setError(message);
        throw err;
      } finally {
        setPending(false);
      }
    },
    [workId],
  );

  const remove = useCallback(
    async (id: string) => {
      const db = await getFirebaseDatabase();
      if (!db) return;
      const { ref, remove: drop } = await import("firebase/database");
      await drop(ref(db, `comments/${workId}/${id}`));
    },
    [workId],
  );

  return { comments, pending, error, add, remove };
}
