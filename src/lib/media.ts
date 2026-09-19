import seed from "@/lib/catalog-data.json";

export type MediaKind = "image" | "drone" | "video";

export type Work = {
  id: string;
  title: string;
  kind: MediaKind;
  src: string;
  poster?: string;
  width: number;
  height: number;
  year: number;
  location: string;
  camera: string;
  lens: string;
  description: string;
  tags: string[];
};

export type StudioPillar = { k: string; t: string; d: string };

export type Catalog = {
  heroId: string;
  site: {
    kicker: string;
    headline: string;
    lede: string;
    title: string;
    description: string;
  };
  studio: {
    kicker: string;
    headline: string;
    paragraphs: string[];
    pillars: StudioPillar[];
    colophon: string;
  };
  works: Work[];
};

const KINDS = new Set<MediaKind>(["image", "drone", "video"]);

function asWork(value: unknown): Work | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.title !== "string") return null;
  if (typeof item.kind !== "string" || !KINDS.has(item.kind as MediaKind)) return null;
  if (typeof item.src !== "string") return null;
  return {
    id: item.id,
    title: item.title,
    kind: item.kind as MediaKind,
    src: item.src,
    poster: typeof item.poster === "string" ? item.poster : undefined,
    width: Number(item.width) || 1,
    height: Number(item.height) || 1,
    year: Number(item.year) || 0,
    location: typeof item.location === "string" ? item.location : "",
    camera: typeof item.camera === "string" ? item.camera : "",
    lens: typeof item.lens === "string" ? item.lens : "",
    description: typeof item.description === "string" ? item.description : "",
    tags: Array.isArray(item.tags)
      ? item.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
      : [],
  };
}

export function parseCatalog(raw: unknown): Catalog | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const worksMap =
    data.works && typeof data.works === "object" && !Array.isArray(data.works)
      ? (data.works as Record<string, unknown>)
      : null;
  const order = Array.isArray(data.order)
    ? data.order.filter((id): id is string => typeof id === "string")
    : worksMap
      ? Object.keys(worksMap)
      : [];
  const works = order
    .map((id) => asWork(worksMap?.[id]))
    .filter((work): work is Work => Boolean(work));
  if (!works.length) return null;

  const siteIn = data.site && typeof data.site === "object" ? (data.site as Record<string, unknown>) : {};
  const studioIn =
    data.studio && typeof data.studio === "object" ? (data.studio as Record<string, unknown>) : {};
  const pillarsRaw = Array.isArray(studioIn.pillars) ? studioIn.pillars : [];

  return {
    heroId: typeof data.heroId === "string" ? data.heroId : works[0]!.id,
    site: {
      kicker: typeof siteIn.kicker === "string" ? siteIn.kicker : "Visual Excellence Lab",
      headline:
        typeof siteIn.headline === "string"
          ? siteIn.headline
          : "The Art of Sight.\nThe Science of Intelligence.",
      lede:
        typeof siteIn.lede === "string"
          ? siteIn.lede
          : "Still, aerial, and moving image — observed, then understood.",
      title: typeof siteIn.title === "string" ? siteIn.title : "VIXL",
      description:
        typeof siteIn.description === "string"
          ? siteIn.description
          : "VIXL — Visual Excellence Lab.",
    },
    studio: {
      kicker: typeof studioIn.kicker === "string" ? studioIn.kicker : "Studio",
      headline:
        typeof studioIn.headline === "string"
          ? studioIn.headline
          : "Pictures first.\nIntelligence after.",
      paragraphs: Array.isArray(studioIn.paragraphs)
        ? studioIn.paragraphs.filter((p): p is string => typeof p === "string")
        : [],
      pillars: pillarsRaw
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const p = item as Record<string, unknown>;
          if (typeof p.k !== "string" || typeof p.t !== "string" || typeof p.d !== "string") {
            return null;
          }
          return { k: p.k, t: p.t, d: p.d };
        })
        .filter((item): item is StudioPillar => Boolean(item)),
      colophon:
        typeof studioIn.colophon === "string" ? studioIn.colophon : "Tokyo · Visual Excellence Lab",
    },
    works,
  };
}

export const SEED_CATALOG: Catalog = parseCatalog(seed) ?? {
  heroId: "",
  site: {
    kicker: "Visual Excellence Lab",
    headline: "VIXL",
    lede: "",
    title: "VIXL",
    description: "",
  },
  studio: {
    kicker: "Studio",
    headline: "VIXL",
    paragraphs: [],
    pillars: [],
    colophon: "",
  },
  works: [],
};

export const WORKS: Work[] = SEED_CATALOG.works;

export const KIND_LABEL: Record<MediaKind, string> = {
  image: "Image",
  drone: "Drone",
  video: "Video",
};

export const HERO_WORK =
  WORKS.find((w) => w.id === SEED_CATALOG.heroId) ?? WORKS[0]!;

export const FILTERS = [
  { id: "all", label: "All" },
  { id: "image", label: "Still" },
  { id: "drone", label: "Drone" },
  { id: "video", label: "Motion" },
] as const;

export type FilterId = (typeof FILTERS)[number]["id"];

export function getWork(id: string, list: Work[] = WORKS): Work | undefined {
  return list.find((work) => work.id === id);
}

export function adjacentIds(id: string, list: Work[] = WORKS): { prev: string; next: string } {
  const index = list.findIndex((work) => work.id === id);
  const safe = index < 0 ? 0 : index;
  const prev = list[(safe - 1 + list.length) % list.length]!;
  const next = list[(safe + 1) % list.length]!;
  return { prev: prev.id, next: next.id };
}

export const CATALOG_SEED_PAYLOAD = seed;

export function catalogToPayload(catalog: Catalog) {
  const works: Record<string, Work> = {};
  const order: string[] = [];
  for (const work of catalog.works) {
    const row: Work = { ...work };
    if (!row.poster) delete row.poster;
    works[work.id] = row;
    order.push(work.id);
  }
  return {
    heroId: catalog.heroId,
    site: catalog.site,
    studio: catalog.studio,
    order,
    works,
    updatedAt: new Date().toISOString(),
  };
}

