import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { JsonLd } from "@/components/json-ld";
import { useCatalog } from "@/lib/use-catalog";
import { SEED_CATALOG } from "@/lib/media";
import { SITE_NAME, SITE_URL, staticHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  component: About,
  head: () =>
    staticHead({
      title: "Studio",
      description: SEED_CATALOG.studio.paragraphs[0] ?? "VIXL studio.",
      path: "/about",
      keywords: "VIXL studio, photography studio Tokyo, aerial, still, motion",
    }),
});

const rise = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

function About() {
  const reduced = useReducedMotion();
  const { studio } = useCatalog();
  const [line1, line2] = studio.headline.split("\n");

  return (
    <main className="mx-auto min-h-[70svh] max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "VIXL Studio",
          url: `${SITE_URL}/about`,
          publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        }}
      />
      <motion.div
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.p
          variants={rise}
          className="text-xs tracking-[0.22em] text-muted uppercase"
        >
          {studio.kicker}
        </motion.p>
        <motion.h1
          variants={rise}
          className="font-display mt-4 text-4xl leading-[1.18] font-semibold tracking-[-0.03em] md:text-6xl"
        >
          {line1}
          {line2 ? (
            <>
              <br />
              {line2}
            </>
          ) : null}
        </motion.h1>
        {studio.paragraphs.map((paragraph, index) => (
          <motion.p
            key={paragraph.slice(0, 32)}
            variants={rise}
            className={`text-base leading-relaxed text-muted md:text-lg ${index === 0 ? "mt-8" : "mt-5"}`}
          >
            {paragraph}
          </motion.p>
        ))}
      </motion.div>

      <section className="mt-16 grid gap-8 sm:grid-cols-3">
        {studio.pillars.map((item) => (
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
        {studio.colophon}
      </p>
    </main>
  );
}
