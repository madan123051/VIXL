import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";

export const Route = createFileRoute("/about")({ component: About });

const rise = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

function About() {
  const reduced = useReducedMotion();

  return (
    <main className="mx-auto min-h-[70svh] max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <motion.div
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.p
          variants={rise}
          className="text-xs tracking-[0.22em] text-muted uppercase"
        >
          Studio
        </motion.p>
        <motion.h1
          variants={rise}
          className="font-display mt-4 text-4xl leading-tight font-semibold tracking-[-0.04em] md:text-6xl"
        >
          Pictures first.
          <br />
          Intelligence after.
        </motion.h1>
        <motion.p
          variants={rise}
          className="mt-8 text-base leading-relaxed text-muted md:text-lg"
        >
          VIXL is a small studio for still, aerial, and moving image. We make
          pictures that remember how light behaved — then we ask a model to
          read them. Not to replace the eye. To give the frame a second, slower
          look.
        </motion.p>
        <motion.p variants={rise} className="mt-5 text-base leading-relaxed text-muted md:text-lg">
          The interface is meant to disappear. Black field, tight type, the
          work in the clear. Camera notes stay in the catalog; the lab writes
          a cinematic title and a search line only when you ask.
        </motion.p>
      </motion.div>

      <section className="mt-16 grid gap-8 sm:grid-cols-3">
        {[
          {
            k: "01",
            t: "Still",
            d: "Large format, rangefinder, cinema stills. One frame, held.",
          },
          {
            k: "02",
            t: "Aerial",
            d: "Drone studies of land that already composed itself.",
          },
          {
            k: "03",
            t: "Motion",
            d: "Muted loops. Almost still. The horizon as a temperature.",
          },
        ].map((item) => (
          <article key={item.k}>
            <p className="font-mono text-xs tracking-[0.18em] text-subtle">
              {item.k}
            </p>
            <h2 className="font-display mt-2 text-xl tracking-tight">{item.t}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.d}</p>
          </article>
        ))}
      </section>

      <p className="mt-16 text-xs tracking-[0.16em] text-subtle uppercase">
        Tokyo · Visual Excellence Lab
      </p>
    </main>
  );
}
