import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md bg-surface px-3 text-sm text-fg shadow-border outline-none transition-[box-shadow] duration-150 placeholder:text-subtle focus-visible:shadow-border-hover disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md bg-surface px-3 py-2.5 text-sm leading-relaxed text-fg shadow-border outline-none transition-[box-shadow] duration-150 placeholder:text-subtle focus-visible:shadow-border-hover disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs tracking-[0.16em] text-subtle uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

export { Input, Textarea, Field };
