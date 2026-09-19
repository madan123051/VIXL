import { motion, useReducedMotion } from "motion/react";
import { CinematicMedia } from "@/components/cinematic-media";
import { HERO_WORK } from "@/lib/media";

const rise = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
      <CinematicMedia
        work={HERO_WORK}
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
          Visual Excellence Lab
        </motion.p>
        <motion.h1
          variants={rise}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="font-display max-w-4xl text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-fg sm:text-5xl md:text-7xl"
        >
          The Art of Sight.
          <br />
          The Science of Intelligence.
        </motion.h1>
        <motion.p
          variants={rise}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md text-sm leading-relaxed text-muted md:text-base"
        >
          Still, aerial, and moving image — observed, then understood. A quiet
          instrument for pictures that remember how light behaved.
        </motion.p>
      </motion.div>
    </section>
  );
}
