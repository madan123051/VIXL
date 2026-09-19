import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("vixl-shimmer rounded-sm bg-fg/6", className)}
      {...props}
    />
  );
}

export { Skeleton };
