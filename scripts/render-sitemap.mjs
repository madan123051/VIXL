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

function abs(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE}${path.startsWith("/") ? path : `/${path}`}`;
}

function pageUrl(path, changefreq, priority, lastmod) {
  return `  <url>
    <loc>${escapeXml(`${SITE}${path}`)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function workUrl(work, lastmod) {
  const loc = `${SITE}/work/${work.id}`;
  const video =
    work.kind === "video" && work.src
      ? `
    <video:video>
      <video:thumbnail_loc>${escapeXml(abs(work.poster || work.src))}</video:thumbnail_loc>
      <video:title>${escapeXml(work.title || work.id)}</video:title>
      <video:description>${escapeXml((work.description || work.title || "VIXL motion frame").slice(0, 2048))}</video:description>
      <video:content_loc>${escapeXml(abs(work.src))}</video:content_loc>
      <video:publication_date>${escapeXml(String(work.year || 2026))}-01-01</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>`
      : "";
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${video}
  </url>`;
}

async function liveCatalog() {
  try {
    const res = await fetch(`${DATABASE_URL}/catalog.json`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function renderSitemapXml() {
  const catalog = await liveCatalog();
  const worksMap =
    catalog?.works && typeof catalog.works === "object" ? catalog.works : {};
  const order = Array.isArray(catalog?.order) ? catalog.order : Object.keys(worksMap);
  const lastmod =
    typeof catalog?.updatedAt === "string" && /^\d{4}-\d{2}-\d{2}/.test(catalog.updatedAt)
      ? catalog.updatedAt.slice(0, 10)
      : today();
  const works = [];
  for (const id of order.length ? order : FALLBACK_IDS) {
    const row = worksMap[id];
    if (row && row.published === false) continue;
    if (row && typeof row === "object") {
      works.push({
        id: typeof row.id === "string" ? row.id : id,
        title: row.title,
        description: row.description,
        kind: row.kind,
        src: row.src,
        poster: row.poster,
        year: row.year,
      });
    } else if (typeof id === "string") {
      works.push({ id, kind: "image" });
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${pageUrl("/", "weekly", "1.0", lastmod)}
${pageUrl("/about", "monthly", "0.6", lastmod)}
${pageUrl("/lab", "monthly", "0.5", lastmod)}
${works.map((work) => workUrl(work, lastmod)).join("\n")}
</urlset>
`;
  return xml.replace(/\n+/g, "\n").trim() + "\n";
}
