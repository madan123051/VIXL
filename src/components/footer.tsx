import { Link } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { VixlWordmark } from "@/components/vixl-mark";

export function Footer() {
  return (
    <footer className="mt-24 px-4 pb-10 md:px-6">
      <Separator />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 pt-8 text-sm text-muted sm:flex-row sm:items-end sm:justify-between">
        <div>
          <VixlWordmark compact />
          <p className="mt-3 text-xs tracking-[0.16em] uppercase">Tokyo</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs tracking-tight">
          <Link to="/" className="transition-colors duration-150 hover:text-fg">
            Index
          </Link>
          <Link to="/lab" className="transition-colors duration-150 hover:text-fg">
            Lab
          </Link>
          <Link to="/about" className="transition-colors duration-150 hover:text-fg">
            About
          </Link>
          <span>2019 — 2026</span>
        </div>
      </div>
    </footer>
  );
}
