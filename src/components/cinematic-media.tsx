import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Work } from "@/lib/media";
import { VixlMark } from "@/components/vixl-mark";

type Props = {
  work: Work;
  className?: string;
  priority?: boolean;
  kenBurns?: boolean;
};

function CopyrightBug() {
  return (
    <span className="pointer-events-none absolute right-3 bottom-3 z-10 flex items-center gap-2 rounded-md bg-bg/45 px-2 py-1 backdrop-blur-sm">
      <VixlMark className="size-5" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[0.65rem] font-semibold tracking-[-0.04em] text-fg">
          VIXL
        </span>
        <span className="mt-0.5 text-[0.45rem] tracking-[0.12em] text-fg/70 uppercase">
          ©
        </span>
      </span>
    </span>
  );
}

export function CinematicMedia({ work, className, priority, kenBurns }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const isVideo = work.kind === "video";
  const abs = /\babsolute\b/.test(className ?? "");

  useEffect(() => {
    const el = videoRef.current;
    if (!isVideo || !el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && !reduced) {
          void el.play().catch(() => {
            /* autoplay may be blocked — poster remains */
          });
        } else {
          el.pause();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isVideo, reduced]);

  return (
    <span
      className={cn(
        "vixl-frame isolate",
        abs ? "absolute inset-0 block h-full w-full" : "relative inline-block max-w-full",
      )}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          className={cn(
            "h-auto max-w-full",
            kenBurns && reduced !== true && "hero-media",
            className,
            abs && "absolute inset-0 h-full w-full",
          )}
          poster={work.poster}
          muted
          loop
          playsInline
          preload={priority ? "auto" : "metadata"}
          width={work.width}
          height={work.height}
          aria-label={work.title}
        >
          <source src={work.src} type="video/mp4" />
        </video>
      ) : (
        <img
          src={work.src}
          alt={work.title}
          width={work.width}
          height={work.height}
          className={cn(
            "h-auto max-w-full",
            kenBurns && reduced !== true && "hero-media",
            className,
            abs && "absolute inset-0 h-full w-full",
          )}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
        />
      )}
      {isVideo ? <CopyrightBug /> : null}
    </span>
  );
}
