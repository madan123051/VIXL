import { Link, createFileRoute } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { CinematicMedia } from "@/components/cinematic-media";
import { AiPanel } from "@/components/ai-panel";
import { MarkButton } from "@/components/mark-button";
import { ShareButton } from "@/components/share-button";
import { Comments } from "@/components/comments";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { fetchWorkById } from "@/lib/catalog-api";
import { KIND_LABEL } from "@/lib/media";
import { useCatalog } from "@/lib/use-catalog";
import { workHead, workJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/work/$id")({
  loader: async ({ params }) => ({ work: await fetchWorkById(params.id) }),
  head: ({ loaderData }) => {
    const work = loaderData?.work;
    if (!work) {
      return {
        meta: [
          { title: "Frame not in the catalog | VIXL" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return workHead(work);
  },
  component: WorkRoom,
});

function WorkRoom() {
  const { id } = Route.useParams();
  const loaded = Route.useLoaderData();
  const live = useCatalog();
  const work = live.getWork(id) ?? loaded.work ?? null;
  const waiting = !work && live.source !== "firebase";

  useLayoutEffect(() => {
    if (!work || typeof window === "undefined") return;
    if (window.location.hash) return;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [work?.id]);

  if (waiting) {
    return (
      <main className="mx-auto max-w-[1400px] px-4 py-10 md:px-6 md:py-14">
        <div className="bg-surface vixl-shimmer h-[70svh] rounded-lg" />
      </main>
    );
  }

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

  const { prev, next } = live.adjacentIds(work.id);

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10 md:px-6 md:py-14">
      <JsonLd data={workJsonLd(work)} />
      <Button variant="ghost" size="sm" asChild>
        <Link to="/">
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          Index
        </Link>
      </Button>

      <article>
        <div className="mt-6 flex justify-center">
          <div className="w-fit max-w-full overflow-hidden rounded-lg bg-surface">
            <CinematicMedia
              work={work}
              priority
              playback={work.kind === "video" ? "watch" : "still"}
              className="h-auto max-h-[78svh] w-auto max-w-full"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)]">
          <div>
            <p className="text-xs tracking-[0.18em] text-muted uppercase">
              {KIND_LABEL[work.kind]} · {work.year}
            </p>
            <h1 className="font-display mt-2 overflow-visible text-3xl leading-snug tracking-tight md:text-5xl">
              {work.title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
              {work.description}
            </p>
            {work.tags.length ? (
              <ul className="mt-5 flex flex-wrap gap-2">
                {work.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full px-3 py-1 text-xs tracking-[0.08em] text-muted shadow-border"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <MarkButton workId={work.id} title={work.title} />
              <ShareButton work={work} />
              <a
                href="#comments"
                className="inline-flex h-11 items-center rounded-full px-4 text-sm tracking-tight text-muted shadow-border transition-[background-color,color] duration-150 hover:bg-fg/8 hover:text-fg"
              >
                Comment
              </a>
            </div>
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
            <Comments workId={work.id} title={work.title} />
          </div>
          <AiPanel work={work} />
        </div>
      </article>
    </main>
  );
}
