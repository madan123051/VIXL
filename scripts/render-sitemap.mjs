import seed from "../src/lib/catalog-data.json" with { type: "json" };

const SITE = (process.env.VITE_SITE_URL ?? "https://vixl.xyz").replace(/\/$/, "");
const DATABASE_URL = (
  process.env.VITE_FIREBASE_DATABASE_URL ??
  "https://vixl-1c88f-default-rtdb.firebaseio.com"
).replace(/\/$/, "");

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => {
    if (ch === "&") return "&#38;";
    if (ch === "<") return "&#60;";
    if (ch === ">") return "&#62;";
    if (ch === '"') return "&#34;";
    return "&#39;";
  });
}

function loc(path, changefreq, priority, lastmod) {
  return `  <url>
    <loc>${escapeXml(`${SITE}${path}`)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ""}
  </url>`;
}

async function liveWorkIds() {
  try {
    const res = await fetch(`${DATABASE_URL}/catalog.json`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ids: [], lastmod: "" };
    const catalog = await res.json();
    const works = catalog?.works && typeof catalog.works === "object" ? catalog.works : {};
    const order = Array.isArray(catalog?.order) ? catalog.order : Object.keys(works);
    const ids = [];
    for (const id of order) {
      const row = works[id];
      if (!id || typeof id !== "string") continue;
      if (!row || row.published === false) continue;
      ids.push(id);
    }
    return { ids, lastmod: typeof catalog?.updatedAt === "string" ? catalog.updatedAt.slice(0, 10) : "" };
  } catch {
    return { ids: [], lastmod: "" };
  }
}

export async function renderSitemapXml() {
  const live = await liveWorkIds();
  const seedIds = Array.isArray(seed.order)
    ? seed.order.filter((id) => typeof id === "string")
    : Object.keys(seed.works ?? {});
  const ids = live.ids.length ? live.ids : seedIds;
  const lastmod = live.lastmod || new Date().toISOString().slice(0, 10);
  const urls = [
    loc("/", "weekly", "1.0", lastmod),
    loc("/about", "monthly", "0.6", lastmod),
    loc("/lab", "monthly", "0.5", lastmod),
    ...ids.map((id) => loc(`/work/${id}`, "weekly", "0.8", lastmod)),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}
