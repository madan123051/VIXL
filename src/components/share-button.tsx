import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { workCanonical, workDescription, workTitle } from "@/lib/seo";
import type { Work } from "@/lib/media";
import { cn } from "@/lib/utils";

export function ShareButton({ work, className }: { work: Work; className?: string }) {
  async function share() {
    const url = workCanonical(work.id);
    const title = workTitle(work);
    const text = workDescription(work);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text, url });
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
        `https://x.com/intent/tweet?text=${encodeURIComponent(work.title)}&url=${encodeURIComponent(url)}`,
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
