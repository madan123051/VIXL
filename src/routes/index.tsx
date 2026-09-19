import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/hero";
import { Gallery } from "@/components/gallery";
import { JsonLd } from "@/components/json-ld";
import { SEED_CATALOG } from "@/lib/media";
import { SITE_NAME, SITE_URL, staticHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: Home,
  head: () =>
    staticHead({
      title: `${SITE_NAME} — Visual Excellence Lab`,
      description: SEED_CATALOG.site.description,
      path: "/",
      keywords:
        "VIXL, photography, cinematic stills, drone, aerial, motion, visual excellence lab, Tokyo",
    }),
});

function Home() {
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: SITE_NAME,
          description: SEED_CATALOG.site.description,
          url: SITE_URL,
          publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        }}
      />
      <Hero />
      <Gallery />
    </main>
  );
}
