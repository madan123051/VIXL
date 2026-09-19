import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { CinematicMedia } from "@/components/cinematic-media";
import { AiPanel } from "@/components/ai-panel";
import { Button } from "@/components/ui/button";
import { KIND_LABEL, adjacentIds, getWork } from "@/lib/media";

export const Route = createFileRoute("/work/$id")({
  component: WorkRoom,
});

function WorkRoom() {
  const { id } = Route.useParams();
  const work = getWork(id);

  if (!work) {
    return (
      <main className="mx-auto flex min-h-[70svh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">404</p>
        <h1 className="font-display mt-3 text-3xl tracking-tight">
          Frame not in the catalog
        </h1>
        <Button className="mt-8" asChild>
          <Link to="/">Return to index</Link>
        </Button>
      </main>
    );
  }

  const { prev, next } = adjacentIds(work.id);

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10 md:px-6 md:py-14">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/">
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          Index
        </Link>
      </Button>

      <div className="mt-6 overflow-hidden rounded-lg bg-surface">
        <CinematicMedia
          work={work}
          priority
          className="max-h-[78svh] w-full object-contain"
        />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)]">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted uppercase">
            {KIND_LABEL[work.kind]} · {work.year}
          </p>
          <h1 className="font-display mt-2 text-3xl tracking-tight md:text-5xl">
            {work.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            {work.description}
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs tracking-[0.14em] text-subtle uppercase">
                Location
              </dt>
              <dd className="mt-1 text-fg">{work.location}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.14em] text-subtle uppercase">
                Camera
              </dt>
              <dd className="mt-1 text-fg">{work.camera}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.14em] text-subtle uppercase">
                Lens
              </dt>
              <dd className="mt-1 text-fg">{work.lens}</dd>
            </div>
          </dl>
          <div className="mt-10 flex gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/work/$id" params={{ id: prev }}>
                Previous
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/work/$id" params={{ id: next }}>
                Next
              </Link>
            </Button>
          </div>
        </div>
        <AiPanel work={work} />
      </div>
    </main>
  );
}
