import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/** Viewfinder mark — V of light in a ground-glass frame. */
export function VixlMark({ className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="7" fill="#000000" />
      <rect
        x="3"
        y="3"
        width="26"
        height="26"
        rx="4"
        fill="none"
        stroke="#f4f4f1"
        strokeWidth="1.25"
      />
      <path
        d="M10 8.5 L16 23.5 L22 8.5"
        fill="none"
        stroke="#f4f4f1"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 5.2 v2.4 M16 24.4 v2.4"
        stroke="#d4cfc8"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VixlWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <VixlMark className={compact ? "size-7" : "size-8"} />
      <span className="flex min-w-0 flex-col items-start leading-none">
        <span className="font-display text-lg font-semibold tracking-[-0.06em] text-fg">
          VIXL
        </span>
        <span className="mt-1 max-w-full truncate text-[0.62rem] tracking-[0.14em] text-muted uppercase">
          (Visual Excellence Lab)
        </span>
      </span>
    </span>
  );
}
