import { Link, useRouterState } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Index" },
  { to: "/lab", label: "Lab" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-fg/8 bg-bg/55 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 md:h-16 md:px-6">
        <Link
          to="/"
          className="font-display text-lg font-semibold tracking-[-0.06em] md:text-xl"
          aria-label="VIXL home"
        >
          <span className="bg-gradient-to-r from-fg via-fg to-ai bg-clip-text text-transparent">
            VIXL
          </span>
        </Link>

        <nav className="flex items-center gap-1 md:gap-2" aria-label="Primary">
          {LINKS.map((link) => {
            const active =
              link.to === "/"
                ? pathname === "/"
                : pathname === link.to || pathname.startsWith(`${link.to}/`);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "inline-flex h-11 items-center px-3 text-sm tracking-tight transition-[color,opacity] duration-150",
                  active ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link to="/lab" className="ml-1 hidden sm:inline-flex">
            <Badge variant="ai">Beta AI</Badge>
          </Link>
        </nav>
      </div>
    </header>
  );
}
