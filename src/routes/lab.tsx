import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CinematicMedia } from "@/components/cinematic-media";
import { AiPanel } from "@/components/ai-panel";
import { Badge } from "@/components/ui/badge";
import { KIND_LABEL } from "@/lib/media";
import { useCatalog } from "@/lib/use-catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lab")({ component: Lab });

function Lab() {
  const { works } = useCatalog();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const work = works.find((item) => item.id === selectedId) ?? works[0];

  if (!work) {
    return (
      <main className="px-4 py-24 text-center text-muted">No frames in the lab.</main>
    );
  }

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-12 md:px-6 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-xs tracking-[0.22em] text-muted uppercase">Lab</p>
            <Badge variant="ai">Beta AI</Badge>
          </div>
          <h1 className="font-display mt-3 text-3xl tracking-tight md:text-5xl">
            A second exposure
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">
            Choose a frame. The lab writes a cinematic title, a search line, and
            inferred EXIF — once, then remembers it on this device.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="overflow-hidden rounded-lg bg-surface">
          <CinematicMedia
            work={work}
            priority
            className="max-h-[64svh] w-full object-contain"
          />
          <div className="px-4 py-4">
            <p className="text-xs tracking-[0.16em] text-muted uppercase">
              {KIND_LABEL[work.kind]} · {work.location} · {work.year}
            </p>
            <h2 className="font-display mt-1 text-xl tracking-tight">
              {work.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {work.description}
            </p>
          </div>
        </div>
        <AiPanel work={work} />
      </div>

      <div className="mt-12">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">
          Select a frame
        </p>
        <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {works.map((item) => {
            const active = item.id === work.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-pressed={active}
                  aria-label={item.title}
                  className={cn(
                    "block w-full overflow-hidden rounded-sm transition-[box-shadow,opacity] duration-150",
                    active
                      ? "shadow-ai opacity-100"
                      : "opacity-55 hover:opacity-100",
                  )}
                >
                  <img
                    src={item.poster ?? item.src}
                    alt=""
                    width={item.width}
                    height={item.height}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
