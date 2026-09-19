import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { KIND_LABEL, FILTERS, type FilterId, type Work } from "@/lib/media";
import { useCatalog } from "@/lib/use-catalog";
import { CinematicMedia } from "@/components/cinematic-media";
import { Lightbox } from "@/components/lightbox";
import { cn } from "@/lib/utils";

export function Gallery() {
  const { works: catalog } = useCatalog();
  const [filter, setFilter] = useState<FilterId>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const works = useMemo(
    () => (filter === "all" ? catalog : catalog.filter((w) => w.kind === filter)),
    [catalog, filter],
  );

  const openWork: Work | undefined =
    works.find((w) => w.id === openId) ?? catalog.find((w) => w.id === openId);

  return (
    <section className="mx-auto max-w-[1600px] px-4 pt-14 md:px-6 md:pt-20" id="index">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.22em] text-muted uppercase">Index</p>
          <h2 className="font-display mt-2 text-2xl tracking-tight text-fg md:text-3xl">
            {works.length} frames
          </h2>
        </div>
        <div
          className="flex flex-wrap gap-1"
          role="tablist"
          aria-label="Filter by medium"
        >
          {FILTERS.map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "h-11 min-w-11 rounded-full px-4 text-sm tracking-tight transition-[background-color,color] duration-150",
                  active
                    ? "bg-fg text-bg"
                    : "text-muted hover:bg-fg/8 hover:text-fg",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="vixl-gallery">
        {works.map((work, index) => (
          <Link
            key={work.id}
            to="/work/$id"
            params={{ id: work.id }}
            className="vixl-tile group relative w-full overflow-hidden rounded-xs bg-surface text-left"
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
              if (!fine) return;
              event.preventDefault();
              setOpenId(work.id);
            }}
            aria-label={`${work.title}, ${KIND_LABEL[work.kind]}`}
          >
            <CinematicMedia
              work={work}
              priority={index < 3}
              playback="still"
              className="vixl-media"
            />
            <div className="vixl-caption pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/55 to-transparent px-3 pt-12 pb-3">
              <p className="font-display text-sm tracking-tight text-fg">
                {work.title}
              </p>
              <p className="mt-0.5 text-xs tracking-[0.16em] text-muted uppercase">
                {KIND_LABEL[work.kind]}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {works.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted">
          Nothing in this drawer yet.
        </p>
      ) : null}

      <Lightbox
        work={openWork}
        onClose={() => setOpenId(null)}
        onPrev={() => {
          if (!openWork) return;
          const list = works.length ? works : catalog;
          const i = list.findIndex((w) => w.id === openWork.id);
          const prev = list[(i - 1 + list.length) % list.length];
          if (prev) setOpenId(prev.id);
        }}
        onNext={() => {
          if (!openWork) return;
          const list = works.length ? works : catalog;
          const i = list.findIndex((w) => w.id === openWork.id);
          const next = list[(i + 1) % list.length];
          if (next) setOpenId(next.id);
        }}
      />
    </section>
  );
}
