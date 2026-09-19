import { renderSitemapXml } from "../../scripts/render-sitemap.mjs";

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

  const xml = await renderSitemapXml();
  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=600",
    },
  });
}
