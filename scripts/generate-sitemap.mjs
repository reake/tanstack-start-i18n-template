#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from the route files and the MDX blog content.
 * Static pages are advertised in every supported locale; blog posts only in the
 * locales that actually have a translated file.
 *
 * Base URL comes from src/site.config.ts, or from --base-url= / SITE_URL.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const DEFAULT_LOCALE = "en";
const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROUTE_META = {
  "/": { changefreq: "weekly", priority: "1.0" },
  "/blog": { changefreq: "weekly", priority: "0.7" },
  "/about": { changefreq: "monthly", priority: "0.5" },
};

function parseArgValue(flag) {
  const arg = process.argv.find((item) => item.startsWith(`${flag}=`));
  return arg ? arg.slice(flag.length + 1) : undefined;
}

async function getBaseUrl() {
  const explicit = parseArgValue("--base-url") ?? process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const config = await fs.readFile(path.join(ROOT_DIR, "src", "site.config.ts"), "utf8");
  return config.match(/url:\s*"([^"]+)"/)[1].replace(/\/+$/, "");
}

async function getSupportedLocales() {
  const entries = await fs.readdir(path.join(ROOT_DIR, "src", "messages"), {
    withFileTypes: true,
  });
  const locales = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      await fs.access(path.join(ROOT_DIR, "src", "messages", entry.name, "common.json"));
      locales.push(entry.name);
    } catch {
      // Locale folder without common.json is not a language.
    }
  }

  locales.sort((a, b) =>
    a === DEFAULT_LOCALE ? -1 : b === DEFAULT_LOCALE ? 1 : a.localeCompare(b),
  );
  return locales;
}

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walkFiles(fullPath)));
    else files.push(fullPath);
  }
  return files;
}

/** Turn "/{-$locale}/(pages)/blog/" into "/blog". Dynamic routes are skipped. */
function routePatternToPath(routePattern) {
  if (!routePattern.startsWith("/{-$locale}")) return null;

  const pathname = routePattern
    .replace(/^\/\{\-\$locale\}/, "")
    .replace(/\/\([^/]+\)/g, "")
    .replace(/\/$/, "");

  if (pathname.includes("$")) return null;
  return pathname || "/";
}

async function getStaticRoutes() {
  const files = await walkFiles(path.join(ROOT_DIR, "src", "routes", "{-$locale}"));
  const routes = new Set();

  for (const filePath of files) {
    if (!filePath.endsWith(".tsx")) continue;
    const content = await fs.readFile(filePath, "utf8");
    for (const match of content.matchAll(
      /createFileRoute\s*\(\s*["']([^"']+)["']\s*,?\s*\)/g,
    )) {
      const pathname = routePatternToPath(match[1]);
      if (pathname) routes.add(pathname);
    }
  }

  return [...routes].sort(
    (a, b) => (ROUTE_META[b]?.priority ?? 0) - (ROUTE_META[a]?.priority ?? 0),
  );
}

function extractLastmod(content) {
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  return (
    frontmatter.match(/^updated:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*$/m)?.[1] ??
    frontmatter.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*$/m)?.[1] ??
    null
  );
}

async function getBlogEntries(supportedLocales, fallbackLastmod) {
  const blogsDir = path.join(ROOT_DIR, "content", "blogs");
  let files = [];
  try {
    files = await fs.readdir(blogsDir);
  } catch {
    return [];
  }

  const bySlug = new Map();

  for (const fileName of files) {
    const match = fileName.match(/^(.*?)(?:\.([a-z]{2}(?:-[A-Za-z]{2})?))?\.mdx$/);
    if (!match) continue;

    const [, slug, locale = DEFAULT_LOCALE] = match;
    if (!supportedLocales.includes(locale)) continue;

    const lastmod = extractLastmod(
      await fs.readFile(path.join(blogsDir, fileName), "utf8"),
    );
    if (!bySlug.has(slug)) bySlug.set(slug, new Map());
    bySlug.get(slug).set(locale, lastmod ?? fallbackLastmod);
  }

  return [...bySlug.entries()].map(([slug, localeLastmod]) => {
    const locales = supportedLocales.filter((locale) => localeLastmod.has(locale));
    return {
      basePath: `/blog/${slug}`,
      locales,
      lastmod: localeLastmod.get(locales[0]),
      changefreq: "monthly",
      priority: "0.5",
    };
  });
}

function localizePath(basePath, locale) {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return basePath === "/" ? prefix || "/" : `${prefix}${basePath}`;
}

function xmlEscape(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRobotsTxt(baseUrl) {
  return `# robots.txt\nUser-agent: *\nAllow: /\n\n# Block TanStack Router template paths that leak through JS bundles\nDisallow: /*{-$locale}*\nDisallow: /*(pages)*\nDisallow: /*$slug*\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
}

function toSitemapXml(baseUrl, entries) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  for (const entry of entries) {
    const alternates = entry.locales.length ? entry.locales : [DEFAULT_LOCALE];
    const xDefault = alternates.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : alternates[0];

    for (const locale of alternates) {
      const loc = xmlEscape(
        `${baseUrl}${encodeURI(localizePath(entry.basePath, locale))}`,
      );
      lines.push("  <url>", `    <loc>${loc}</loc>`);

      for (const alt of alternates) {
        const href = xmlEscape(
          `${baseUrl}${encodeURI(localizePath(entry.basePath, alt))}`,
        );
        lines.push(`    <xhtml:link rel="alternate" hreflang="${alt}" href="${href}" />`);
      }

      const xDefaultHref = xmlEscape(
        `${baseUrl}${encodeURI(localizePath(entry.basePath, xDefault))}`,
      );
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />`,
        `    <lastmod>${entry.lastmod}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        "  </url>",
      );
    }
  }

  lines.push("</urlset>");
  return `${lines.join("\n")}\n`;
}

async function main() {
  const baseUrl = await getBaseUrl();
  const outputPath = path.resolve(
    ROOT_DIR,
    parseArgValue("--output") ?? "public/sitemap.xml",
  );
  const lastmod = parseArgValue("--lastmod") ?? new Date().toISOString().slice(0, 10);

  const locales = await getSupportedLocales();
  const staticEntries = (await getStaticRoutes()).map((basePath) => ({
    basePath,
    locales,
    lastmod,
    ...(ROUTE_META[basePath] ?? { changefreq: "monthly", priority: "0.5" }),
  }));
  const blogEntries = await getBlogEntries(locales, lastmod);
  const entries = [...staticEntries, ...blogEntries];

  await fs.writeFile(outputPath, toSitemapXml(baseUrl, entries), "utf8");
  await fs.writeFile(
    path.join(ROOT_DIR, "public", "robots.txt"),
    toRobotsTxt(baseUrl),
    "utf8",
  );
  console.log(
    `[sitemap] ${path.relative(ROOT_DIR, outputPath)}: ${entries.length} pages across ${locales.join(", ")}`,
  );
}

main().catch((error) => {
  console.error("[sitemap] Failed to generate sitemap:");
  console.error(error);
  process.exit(1);
});
