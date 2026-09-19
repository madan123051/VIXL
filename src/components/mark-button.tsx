import { Bookmark } from "lucide-react";
import { useMark } from "@/lib/marks";
import { cn } from "@/lib/utils";

type Props = {
  workId: string;
  title: string;
  className?: string;
};

export function MarkButton({ workId, title, className }: Props) {
  const { count, marked, pending, toggle } = useMark(workId);

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={pending}
      aria-pressed={marked}
      aria-label={marked ? `Unmark ${title}` : `Mark ${title}`}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm tracking-tight transition-[background-color,color] duration-150",
        marked
          ? "bg-fg text-bg"
          : "text-muted shadow-border hover:bg-fg/8 hover:text-fg",
        className,
      )}
    >
      <Bookmark
        className="size-4"
        strokeWidth={1.5}
        fill={marked ? "currentColor" : "none"}
      />
      <span>{marked ? "Marked" : "Mark"}</span>
      <span className="font-mono text-xs tabular-nums opacity-80">{count}</span>
    </button>
  );
}
