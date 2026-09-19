import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-widest uppercase",
  {
    variants: {
      variant: {
        default: "bg-fg/10 text-fg",
        muted: "bg-fg/6 text-muted",
        ai: "bg-ai/15 text-ai shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-ai)_40%,transparent)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
