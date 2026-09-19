const SITE = "https://vixl.xyz";
const DATABASE_URL = "https://vixl-1c88f-default-rtdb.firebaseio.com";

const FALLBACK_IDS = [
  "threshold-of-light",
  "coast-drifting",
  "the-last-rehearsal",
  "after-the-rain",
  "geometry-of-wind",
  "one-window",
  "first-weather",
  "the-witness",
  "alpenglow",
  "lantern-hour",
  "caustic",
  "undertow",
  "night-glass",
];

function escapeXml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => {
    if (ch === "&") return "&#38;";
    if (ch === "<") return "&#60;";
    if (ch === ">") return "&#62;";
    if (ch === '"') return "&#34;";
    return "&#39;";
  });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function urlEntry(path, lastmod) {
  return `  <url>
    <loc>${escapeXml(`${SITE}${path}`)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
  </url>`;
}

async function liveIds() {
  try {
    const res = await fetch(`${DATABASE_URL}/catalog.json`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return { ids: [], lastmod: today() };
    const catalog = await res.json();
    const works = catalog?.works && typeof catalog.works === "object" ? catalog.works : {};
    const order = Array.isArray(catalog?.order) ? catalog.order : Object.keys(works);
    const ids = [];
    for (const id of order) {
      if (typeof id !== "string" || !id) continue;
      const row = works[id];
      if (row && row.published === false) continue;
      ids.push(id);
    }
    const lastmod =
      typeof catalog?.updatedAt === "string" && /^\d{4}-\d{2}-\d{2}/.test(catalog.updatedAt)
        ? catalog.updatedAt.slice(0, 10)
        : today();
    return { ids: ids.length ? ids : FALLBACK_IDS, lastmod };
  } catch {
    return { ids: FALLBACK_IDS, lastmod: today() };
  }
}

export async function renderSitemapXml() {
  const { ids, lastmod } = await liveIds();
  const body = [
    urlEntry("/", lastmod),
    urlEntry("/about", lastmod),
    urlEntry("/lab", lastmod),
    ...ids.map((id) => urlEntry(`/work/${id}`, lastmod)),
  ].join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}
