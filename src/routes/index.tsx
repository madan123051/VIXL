import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/hero";
import { Gallery } from "@/components/gallery";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main>
      <Hero />
      <Gallery />
    </main>
  );
}
