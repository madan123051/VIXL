import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CinematicMedia } from "@/components/cinematic-media";
import { AiPanel } from "@/components/ai-panel";
import { MarkButton } from "@/components/mark-button";
import { ShareButton } from "@/components/share-button";
import { KIND_LABEL, type Work } from "@/lib/media";

type Props = {
  work: Work | undefined;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function Lightbox({ work, onClose, onPrev, onNext }: Props) {
  const open = Boolean(work);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onPrev, onNext]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="inset-0 top-0 left-0 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto overscroll-contain rounded-none bg-bg p-0 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:h-[94svh] lg:max-h-[94svh] lg:w-[min(98vw,1540px)] lg:translate-x-[-50%] lg:translate-y-[-50%] lg:flex-row lg:overflow-hidden lg:rounded-xl lg:p-2">
        {work ? (
          <>
            <div className="relative flex min-h-[42svh] min-w-0 flex-none items-center justify-center overflow-hidden bg-bg-elevated lg:h-full lg:flex-1 lg:rounded-md">
              <CinematicMedia
                work={work}
                priority
                className="max-h-[52svh] w-full object-contain lg:max-h-none lg:h-full"
              />
              <button
                type="button"
                onClick={onPrev}
                aria-label="Previous frame"
                className="absolute top-1/2 left-2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md bg-bg/55 text-fg backdrop-blur-sm transition-[background-color] duration-150 hover:bg-bg/80"
              >
                <ChevronLeft className="size-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={onNext}
                aria-label="Next frame"
                className="absolute top-1/2 right-2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md bg-bg/55 text-fg backdrop-blur-sm transition-[background-color] duration-150 hover:bg-bg/80"
              >
                <ChevronRight className="size-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-5 px-4 py-5 pb-10 lg:h-full lg:w-80 lg:overflow-y-auto lg:px-4 lg:py-4">
              <div>
                <p className="text-xs tracking-widest text-muted uppercase">
                  {KIND_LABEL[work.kind]} · {work.year}
                </p>
                <DialogTitle className="mt-2">{work.title}</DialogTitle>
                <DialogDescription className="mt-3">
                  {work.description}
                </DialogDescription>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="tracking-widest text-subtle uppercase">
                    Location
                  </dt>
                  <dd className="mt-1 text-fg">{work.location}</dd>
                </div>
                <div>
                  <dt className="tracking-widest text-subtle uppercase">
                    Camera
                  </dt>
                  <dd className="mt-1 text-fg">{work.camera}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="tracking-widest text-subtle uppercase">Lens</dt>
                  <dd className="mt-1 text-fg">{work.lens}</dd>
                </div>
              </dl>
              <AiPanel work={work} />
              <div className="flex flex-wrap gap-2">
                <MarkButton workId={work.id} title={work.title} />
                <ShareButton work={work} />
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/work/$id" params={{ id: work.id }}>
                  Open viewing room
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <DialogTitle className="sr-only">Frame</DialogTitle>
        )}
      </DialogContent>
    </Dialog>
  );
}
