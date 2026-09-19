import { renderSitemapXml } from "../../scripts/render-sitemap.mjs";

const FALLBACK = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://vixl.xyz/</loc></url>
  <url><loc>https://vixl.xyz/about</loc></url>
  <url><loc>https://vixl.xyz/lab</loc></url>
</urlset>
`;

type SitemapEvent = {
  url: URL;
  req: { method: string };
};

export default async function sitemapMiddleware(
  event: SitemapEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return next();
  if (event.url.pathname !== "/sitemap.xml") return next();

  let xml = FALLBACK;
  try {
    xml = await renderSitemapXml();
  } catch {
    xml = FALLBACK;
  }
  return new Response(xml, {
    status: 200,
    headers: {
      "content-type": "text/xml; charset=utf-8",
      "cache-control": "public, max-age=300",
      "x-content-type-options": "nosniff",
    },
  });
}
