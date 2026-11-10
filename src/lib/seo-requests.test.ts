// @vitest-environment node
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
// jsdom is already a project test dependency; keep this import type-free so
// check-types does not require an additional package solely for the suite.
// @ts-expect-error jsdom has no bundled declarations in this dependency set.
import { JSDOM } from "jsdom";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { siteConfig } from "../site.config";

const locales = readdirSync("src/messages").filter((locale) => {
  try {
    readFileSync(`src/messages/${locale}/common.json`);
    return true;
  } catch {
    return false;
  }
});
const base = siteConfig.url.replace(/\/+$/, "");
const localize = (route: string, locale: string) =>
  locale === "en" ? route : `/${locale}${route === "/" ? "" : route}`;
let server: ChildProcess;
let origin: string;
let temporary: string;

async function documentAt(route: string) {
  const response = await fetch(`${origin}${route}`, { redirect: "manual" });
  const document = new JSDOM(await response.text()).window.document;
  return { response, document };
}

beforeAll(async () => {
  const socket = createServer();
  await new Promise<void>((resolve) => socket.listen(0, "127.0.0.1", resolve));
  const address = socket.address();
  if (!address || typeof address === "string") throw new Error("No available port");
  const port = address.port;
  await new Promise<void>((resolve, reject) =>
    socket.close((error) => (error ? reject(error) : resolve())),
  );
  origin = `http://127.0.0.1:${port}`;
  server = spawn(
    "./node_modules/.bin/vite",
    ["dev", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
    {
      stdio: "pipe",
      // Content Collections has an internal NODE_ENV=test branch intended for its
      // own source tests; this child is a real development server.
      env: { ...process.env, NODE_ENV: "development" },
    },
  );
  let output = "";
  server.stderr?.on("data", (chunk) => {
    output += String(chunk);
  });
  for (let attempt = 0; attempt < 200; attempt++) {
    if (server.exitCode !== null) throw new Error(`Vite exited: ${output}`);
    try {
      await fetch(origin);
      break;
    } catch {
      if (attempt === 199) throw new Error(`Vite failed to start: ${output}`);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  temporary = mkdtempSync(path.join(tmpdir(), "sitemap-test-"));
  execFileSync("node", [
    "scripts/generate-sitemap.mjs",
    `--output=${temporary}/sitemap.xml`,
  ]);
}, 60000);

afterAll(() => {
  server?.kill();
  if (temporary) rmSync(temporary, { recursive: true, force: true });
});

describe("localized HTTP responses", () => {
  it("redirects explicit English paths and preserves the query string", async () => {
    const response = await fetch(`${origin}/en/blog?tag=seo`, { redirect: "manual" });
    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("/blog?tag=seo");
  });

  it("does not index unknown locales", async () => {
    const { response, document } = await documentAt("/xx/blog");
    expect(response.status).toBe(404);
    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute("content"),
    ).toContain("noindex");
  });

  it("keeps sitemap URLs, canonical links and alternates consistent", async () => {
    const xml = new JSDOM(readFileSync(`${temporary}/sitemap.xml`, "utf8"), {
      contentType: "text/xml",
    }).window.document;
    const entries = [...xml.getElementsByTagName("url")];
    const urls = entries.map(
      (entry) => entry.getElementsByTagName("loc")[0]?.textContent ?? "",
    );
    for (const url of urls) {
      const route = new URL(url).pathname;
      const { response, document } = await documentAt(route);
      expect(response.status, route).toBe(200);
      expect(
        document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
        route,
      ).toBe(url);
      const sitemapEntry = entries.find(
        (entry) => entry.getElementsByTagName("loc")[0]?.textContent === url,
      );
      const expectedAlternates = Array.from(
        sitemapEntry?.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "link") ??
          [],
        (link: Element) => [link.getAttribute("hreflang"), link.getAttribute("href")],
      ).sort();
      const actualAlternates = Array.from(
        document.querySelectorAll('link[rel="alternate"][hreflang]'),
        (link: Element) => [link.getAttribute("hreflang"), link.getAttribute("href")],
      ).sort();
      expect(actualAlternates, route).toEqual(expectedAlternates);
      for (const [, href] of actualAlternates) expect(urls).toContain(href);
    }
    for (const route of ["/", "/about", "/blog"]) {
      for (const locale of locales) {
        const url = `${base}${localize(route, locale)}`;
        expect(urls).toContain(url);
        const { document } = await documentAt(localize(route, locale));
        expect(
          Array.from(
            document.querySelectorAll('link[rel="alternate"][hreflang]'),
            (link: Element) => link.getAttribute("hreflang"),
          ).sort(),
        ).toEqual([...locales, "x-default"].sort());
        for (const alternate of [...locales, "x-default"]) {
          const expected = `${base}${localize(route, alternate === "x-default" ? "en" : alternate)}`;
          expect(
            document
              .querySelector(`link[rel="alternate"][hreflang="${alternate}"]`)
              ?.getAttribute("href"),
          ).toBe(expected);
          expect(urls).toContain(expected);
        }
      }
    }
  }, 60000);
});
