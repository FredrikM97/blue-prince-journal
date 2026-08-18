// Stamps today's date into dist/sitemap.xml so Google sees a freshness signal on every release.
import { readFileSync, writeFileSync } from "node:fs";

const sitemapPath = new URL("../dist/sitemap.xml", import.meta.url);
const today = new Date().toISOString().slice(0, 10);

const xml = readFileSync(sitemapPath, "utf8").replace(
  /( *)(<priority>[^<]+<\/priority>)\n(?: *<lastmod>[^<]*<\/lastmod>\n)?( *)(<\/url>)/g,
  (_match, indent, priority, closeIndent, closeTag) =>
    `${indent}${priority}\n${indent}<lastmod>${today}</lastmod>\n${closeIndent}${closeTag}`,
);

writeFileSync(sitemapPath, xml);
