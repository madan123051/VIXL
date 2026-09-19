import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Work } from "@/lib/media";

type Props = {
  work: Work;
  className?: string;
  priority?: boolean;
  kenBurns?: boolean;
};

export function CinematicMedia({ work, className, priority, kenBurns }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const isVideo = work.kind === "video";

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

  if (isVideo) {
    return (
      <video
        ref={videoRef}
        className={cn(
          "h-auto max-w-full",
          kenBurns && reduced !== true && "hero-media",
          className,
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
    );
  }

  return (
    <img
      src={work.src}
      alt={work.title}
      width={work.width}
      height={work.height}
      className={cn(
        "h-auto max-w-full",
        kenBurns && reduced !== true && "hero-media",
        className,
      )}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}
