import { motion, useReducedMotion } from "motion/react";
import { CinematicMedia } from "@/components/cinematic-media";
import { useCatalog } from "@/lib/use-catalog";

const rise = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  const reduced = useReducedMotion();
  const { hero, site } = useCatalog();

  if (!hero) return null;

  const [line1, line2] = site.headline.split("\n");

  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
      <CinematicMedia
        work={hero}
        priority
        kenBurns
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-bg via-bg/35 to-bg/20"
        aria-hidden="true"
      />

      <motion.div
        className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-[1600px] flex-col gap-5 px-4 pb-12 md:px-6 md:pb-16"
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.p
          variants={rise}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs tracking-[0.22em] text-accent uppercase"
        >
          {site.kicker}
        </motion.p>
        <motion.p
          variants={rise}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs tracking-[0.18em] text-muted uppercase"
        >
          ({site.subtitle})
        </motion.p>
        <motion.h1
          variants={rise}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="font-display max-w-4xl text-4xl leading-[1.18] font-semibold tracking-[-0.03em] text-fg sm:text-5xl md:text-7xl"
        >
          {line1}
          {line2 ? (
            <>
              <br />
              {line2}
            </>
          ) : null}
        </motion.h1>
        <motion.p
          variants={rise}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md text-sm leading-relaxed text-muted md:text-base"
        >
          {site.lede}
        </motion.p>
      </motion.div>
    </section>
  );
}
