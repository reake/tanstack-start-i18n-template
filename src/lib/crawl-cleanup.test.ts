import { describe, expect, it } from "vitest";

import {
  cleanupInternalRouteTemplateRequest,
  withNoindexForNotFound,
} from "./crawl-cleanup";

function request(path: string, init?: RequestInit) {
  return new Request(`https://example.test${path}`, init);
}

describe("crawl cleanup", () => {
  it("returns a cacheable 410 for leaked TanStack route-template URLs", () => {
    const response = cleanupInternalRouteTemplateRequest(
      request("/{-$locale}/(pages)/blog/$slug/zh/getting-started"),
    );

    expect(response?.status).toBe(410);
    expect(response?.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(response?.headers.get("cache-control")).toBe(
      "public, max-age=3600, s-maxage=86400",
    );
  });

  it("ignores normal public paths and non-idempotent methods", () => {
    expect(cleanupInternalRouteTemplateRequest(request("/zh/blog"))).toBeNull();
    expect(
      cleanupInternalRouteTemplateRequest(
        request("/{-$locale}/(tools)/example", { method: "POST" }),
      ),
    ).toBeNull();
  });

  it("adds X-Robots-Tag to 404 responses only", () => {
    const notFound = withNoindexForNotFound(new Response("Missing", { status: 404 }));
    const ok = withNoindexForNotFound(new Response("OK", { status: 200 }));

    expect(notFound.headers.get("x-robots-tag")).toBe("noindex, follow");
    expect(ok.headers.get("x-robots-tag")).toBeNull();
  });
});
