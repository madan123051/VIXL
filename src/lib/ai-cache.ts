import type { AiTag } from "@/lib/ai-tagging";

const PREFIX = "vixl:ai-tag:";

export function readCachedTag(workId: string): AiTag | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + workId);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const rec = parsed as Record<string, unknown>;
    if (typeof rec.cinematicTitle !== "string") return null;
    return parsed as AiTag;
  } catch {
    return null;
  }
}

export function writeCachedTag(workId: string, tag: AiTag): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + workId, JSON.stringify(tag));
  } catch {
    /* quota — ignore */
  }
}
