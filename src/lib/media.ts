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
};

export const KIND_LABEL: Record<MediaKind, string> = {
  image: "Image",
  drone: "Drone",
  video: "Video",
};

export const WORKS: Work[] = [
  {
    id: "threshold-of-light",
    title: "Threshold of Light",
    kind: "drone",
    src: "/gallery/coast-basalt.jpg",
    width: 1792,
    height: 1008,
    year: 2025,
    location: "Faroe Islands",
    camera: "DJI Inspire 3",
    lens: "Zenmuse X9-8K",
    description:
      "Basalt falling into the North Atlantic at the last usable hour. The water holds a colder green than the sky will admit.",
  },
  {
    id: "coast-drifting",
    title: "Coast, Drifting",
    kind: "video",
    src: "/gallery/coast-drift.mp4",
    poster: "/gallery/coast-basalt.jpg",
    width: 1920,
    height: 1080,
    year: 2025,
    location: "Faroe Islands",
    camera: "DJI Inspire 3",
    lens: "Zenmuse X9-8K",
    description:
      "A single push over the cliff line at dawn. Almost still. The horizon is a temperature, not a line.",
  },
  {
    id: "the-last-rehearsal",
    title: "The Last Rehearsal",
    kind: "image",
    src: "/gallery/last-rehearsal.jpg",
    width: 1152,
    height: 1728,
    year: 2024,
    location: "Studio",
    camera: "Leica M11",
    lens: "Summilux-M 50mm f/1.4",
    description:
      "One tungsten source. A body and a length of silk in the same second. The face is not the subject; the light is.",
  },
  {
    id: "after-the-rain",
    title: "After the Rain",
    kind: "image",
    src: "/gallery/after-the-rain.jpg",
    width: 1728,
    height: 1152,
    year: 2025,
    location: "Porto",
    camera: "Canon EOS R5",
    lens: "RF 50mm f/1.2L",
    description:
      "An emptied boulevard writing the city back onto itself. Sodium, a red sign, and the wet as a second street.",
  },
  {
    id: "geometry-of-wind",
    title: "Geometry of Wind",
    kind: "drone",
    src: "/gallery/dune-geometry.jpg",
    width: 1792,
    height: 1008,
    year: 2024,
    location: "Namib Desert",
    camera: "Hasselblad X2D",
    lens: "XCD 45mm f/3.5",
    description:
      "Ridges drawn overnight. From the air the desert is a drafting table — ochre, rust, and a blue that only exists in shadow.",
  },
  {
    id: "one-window",
    title: "One Window",
    kind: "image",
    src: "/gallery/one-window.jpg",
    width: 1152,
    height: 1728,
    year: 2025,
    location: "Rotterdam",
    camera: "Phase One XF IQ4",
    lens: "Schneider 80mm LS",
    description:
      "Blue hour on poured concrete. A single occupied room. The plaza is a mirror the building has not asked for.",
  },
  {
    id: "first-weather",
    title: "First Weather",
    kind: "image",
    src: "/gallery/threshold-forest.jpg",
    width: 1728,
    height: 1152,
    year: 2024,
    location: "Yakushima",
    camera: "Nikon Z8",
    lens: "Nikkor Z 35mm f/1.8",
    description:
      "Fog thick enough to be a material. Light finds the trunks the way a hand finds a banister in the dark.",
  },
  {
    id: "the-witness",
    title: "The Witness",
    kind: "image",
    src: "/gallery/witness.jpg",
    width: 1152,
    height: 1728,
    year: 2025,
    location: "Osaka",
    camera: "ARRI Alexa Mini LF",
    lens: "Signature Prime 35mm",
    description:
      "A figure at glass, face withheld. The city arrives as color, not architecture. Interior as exposure, not room.",
  },
  {
    id: "alpenglow",
    title: "Alpenglow",
    kind: "image",
    src: "/gallery/alpenglow.jpg",
    width: 1792,
    height: 1008,
    year: 2025,
    location: "Hakuba",
    camera: "Fujifilm GFX 100 II",
    lens: "GF 45mm f/2.8",
    description:
      "First light on a winter ridge. The peak takes the sun; the valley keeps the night a little longer.",
  },
  {
    id: "lantern-hour",
    title: "Lantern Hour",
    kind: "image",
    src: "/gallery/lantern-street.jpg",
    width: 1152,
    height: 1728,
    year: 2026,
    location: "Tokyo",
    camera: "Leica Q3",
    lens: "Summilux 28mm f/1.7",
    description:
      "A backstreet after rain. Paper light, black water, steam. The alley is empty on purpose.",
  },
  {
    id: "caustic",
    title: "Caustic",
    kind: "image",
    src: "/gallery/caustic.jpg",
    width: 1408,
    height: 1408,
    year: 2025,
    location: "Studio",
    camera: "Phase One XF IQ4",
    lens: "Schneider 120mm LS Macro",
    description:
      "Cut glass and a single beam. The subject is not the vessel — it is the light that has to go through it.",
  },
  {
    id: "undertow",
    title: "Undertow",
    kind: "image",
    src: "/gallery/undertow.jpg",
    width: 1728,
    height: 1152,
    year: 2025,
    location: "Izu",
    camera: "RED V-Raptor",
    lens: "Prime 24mm, Nauticam housing",
    description:
      "From below the break. The surface is a ceiling of white fire; everything under it is a held breath.",
  },
  {
    id: "night-glass",
    title: "Night, Glass",
    kind: "video",
    src: "/gallery/rain-glass.mp4",
    poster: "/gallery/after-the-rain.jpg",
    width: 1920,
    height: 1080,
    year: 2026,
    location: "Tokyo",
    camera: "Sony Venice 2",
    lens: "Cooke S4/i 75mm",
    description:
      "Rain rehearsing on a dark pane. The city stays out of focus, which is how a city should behave at this hour.",
  },
];

export const HERO_WORK = WORKS.find((w) => w.id === "coast-drifting") ?? WORKS[0]!;

export const FILTERS = [
  { id: "all", label: "All" },
  { id: "image", label: "Still" },
  { id: "drone", label: "Drone" },
  { id: "video", label: "Motion" },
] as const;

export type FilterId = (typeof FILTERS)[number]["id"];

export function getWork(id: string): Work | undefined {
  return WORKS.find((work) => work.id === id);
}

export function adjacentIds(id: string): { prev: string; next: string } {
  const index = WORKS.findIndex((work) => work.id === id);
  const safe = index < 0 ? 0 : index;
  const prev = WORKS[(safe - 1 + WORKS.length) % WORKS.length]!;
  const next = WORKS[(safe + 1) % WORKS.length]!;
  return { prev: prev.id, next: next.id };
}
