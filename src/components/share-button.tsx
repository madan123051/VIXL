import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { workCanonical } from "@/lib/seo";
import type { Work } from "@/lib/media";
import { cn } from "@/lib/utils";

async function frameFile(work: Work): Promise<File | null> {
  try {
    const src = work.poster ?? work.src;
    if (!src) return null;
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    const type = blob.type || "image/jpeg";
    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
    return new File([blob], `${work.id}.${ext}`, { type });
  } catch {
    return null;
  }
}

export function ShareButton({ work, className }: { work: Work; className?: string }) {
  async function share() {
    const url = workCanonical(work.id);
    const title = `${work.title} — VIXL`;
    const file = await frameFile(work);
    const canFiles =
      file &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] });

    try {
      if (typeof navigator.share === "function") {
        if (canFiles && file) {
          try {
            await navigator.share({ title, url, files: [file] });
            return;
          } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;
          }
        }
        await navigator.share({ title, url });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      window.open(
        `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm tracking-tight text-muted shadow-border transition-[background-color,color] duration-150 hover:bg-fg/8 hover:text-fg",
        className,
      )}
    >
      <Share2 className="size-4" strokeWidth={1.5} />
      Share
    </button>
  );
}
