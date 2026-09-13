import { describe, expect, it } from "vitest";

import { generateSeoMeta } from "./seo";

describe("SEO metadata", () => {
  it("emits a locale-aware Open Graph language tag", () => {
    const meta = generateSeoMeta({
      title: "SVG Viewer",
      description: "View SVG files online.",
      path: "/zh/svg-viewer",
    });

    expect(meta).toContainEqual({ property: "og:locale", content: "zh_CN" });
  });

  it("uses the default language for the canonical English URL", () => {
    const meta = generateSeoMeta({
      title: "SVG Viewer",
      description: "View SVG files online.",
      path: "/svg-viewer",
    });

    expect(meta).toContainEqual({ property: "og:locale", content: "en_US" });
  });
});
