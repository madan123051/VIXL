import { KIND_LABEL, type Work } from "@/lib/media";

export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://vixl.xyz").replace(
  /\/$/,
  "",
);
export const SITE_NAME = "VIXL";

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function workPath(id: string): string {
  return `/work/${id}`;
}

export function workCanonical(id: string): string {
  return absoluteUrl(workPath(id));
}

export function clipMeta(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

export function workTitle(work: Work): string {
  return `${work.title} — ${work.location} ${work.year} | ${SITE_NAME}`;
}

export function workDescription(work: Work): string {
  const kind = KIND_LABEL[work.kind];
  return clipMeta(
    `${work.description} ${kind} by ${SITE_NAME}. ${work.camera}, ${work.lens}. Photographed in ${work.location}, ${work.year}.`,
  );
}

export function workKeywords(work: Work): string {
  return [
    ...work.tags,
    work.title,
    work.location,
    KIND_LABEL[work.kind],
    work.camera,
    work.lens,
    SITE_NAME,
    "photography",
    "cinematic",
  ]
    .filter(Boolean)
    .join(", ");
}

export function workImage(work: Work): string {
  return absoluteUrl(work.poster ?? work.src);
}

export function workJsonLd(work: Work) {
  const creator = {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  };
  if (work.kind === "video") {
    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: work.title,
      description: work.description,
      identifier: work.id,
      thumbnailUrl: workImage(work),
      contentUrl: absoluteUrl(work.src),
      uploadDate: `${work.year}-01-01`,
      keywords: work.tags.join(", "),
      creator,
      publisher: creator,
      contentLocation: { "@type": "Place", name: work.location },
      url: workCanonical(work.id),
      mainEntityOfPage: workCanonical(work.id),
      isFamilyFriendly: true,
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "Photograph",
    name: work.title,
    description: work.description,
    identifier: work.id,
    image: workImage(work),
    dateCreated: String(work.year),
    keywords: work.tags.join(", "),
    creator,
    contentLocation: { "@type": "Place", name: work.location },
    url: workCanonical(work.id),
  };
}

export function workHead(work: Work) {
  const title = workTitle(work);
  const description = workDescription(work);
  const url = workCanonical(work.id);
  const image = workImage(work);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "keywords", content: workKeywords(work) },
      { name: "author", content: SITE_NAME },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: work.kind === "video" ? "video.other" : "article" },
      { property: "og:image", content: image },
      { property: "og:image:alt", content: work.title },
      ...(work.kind === "video"
        ? [{ property: "og:video", content: absoluteUrl(work.src) }]
        : []),
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:site_name", content: SITE_NAME },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function staticHead(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  noindex?: boolean;
}) {
  const title = opts.title.includes(SITE_NAME) ? opts.title : `${opts.title} | ${SITE_NAME}`;
  const url = absoluteUrl(opts.path);
  const description = clipMeta(opts.description);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(opts.keywords ? [{ name: "keywords", content: opts.keywords }] : []),
      { name: "author", content: SITE_NAME },
      {
        name: "robots",
        content: opts.noindex ? "noindex, nofollow" : "index, follow",
      },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
