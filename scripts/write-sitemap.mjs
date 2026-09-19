import { writeFileSync } from "node:fs";
import { renderSitemapXml } from "./render-sitemap.mjs";

const xml = await renderSitemapXml();
writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log("wrote public/sitemap.xml", xml.match(/<url>/g)?.length ?? 0, "urls");
