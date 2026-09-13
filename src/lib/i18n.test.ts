import { describe, expect, it } from "vitest";

import {
  clearLocaleMessageCatalogCache,
  getLocaleFromPath,
  getMessages,
  loadLocaleMessageCatalog,
  primeLocaleMessageCatalog,
  resolveDateLocaleTag,
  resolveLocale,
  stripLocaleFromPath,
  SUPPORTED_LOCALES,
  withLocalePath,
} from "./i18n";
import { isInternalRouteTemplatePath } from "./route-template-path";

describe("supported locales", () => {
  it("discovers en and zh from the message folders", () => {
    expect(SUPPORTED_LOCALES).toEqual(["en", "zh"]);
  });

  it("falls back to the default locale for unknown values", () => {
    expect(resolveLocale("de")).toBe("en");
    expect(resolveLocale(undefined)).toBe("en");
    expect(resolveLocale("zh")).toBe("zh");
  });

  it("uses a locale-aware date tag", () => {
    expect(resolveDateLocaleTag("zh")).toBe("zh-CN");
    expect(resolveDateLocaleTag("en")).toBe("en-US");
  });
});

describe("locale paths", () => {
  it("keeps the default locale unprefixed and prefixes the rest", () => {
    expect(withLocalePath("/", "en")).toBe("/");
    expect(withLocalePath("/blog", "en")).toBe("/blog");
    expect(withLocalePath("/", "zh")).toBe("/zh");
    expect(withLocalePath("/blog", "zh")).toBe("/zh/blog");
  });

  it("round-trips locale prefixes", () => {
    expect(stripLocaleFromPath("/zh/blog")).toBe("/blog");
    expect(stripLocaleFromPath("/zh")).toBe("/");
    expect(stripLocaleFromPath("/blog")).toBe("/blog");
  });

  it("reads the locale from a path", () => {
    expect(getLocaleFromPath("/zh/blog/hello")).toBe("zh");
    expect(getLocaleFromPath("/blog")).toBe("en");
  });

  it("detects leaked TanStack route-template paths", () => {
    expect(isInternalRouteTemplatePath("/{-$locale}/(pages)/blog/$slug")).toBe(true);
    expect(isInternalRouteTemplatePath("/-$locale/about")).toBe(true);
    expect(isInternalRouteTemplatePath("/zh/about")).toBe(false);
  });
});

describe("message catalogs", () => {
  it("merges primed catalogs over the English fallback", () => {
    clearLocaleMessageCatalogCache();
    primeLocaleMessageCatalog("zh", {
      common: { nav: { about: "关于自定义" } },
    } as never);

    const messages = getMessages("common", "zh");
    expect(messages.nav.about).toBe("关于自定义");
    expect(messages.nav.blog).toBe("Blog");
  });

  it("loads a locale catalog on demand and caches it", async () => {
    clearLocaleMessageCatalogCache();

    const catalog = await loadLocaleMessageCatalog("zh");

    expect(catalog.common?.nav.about).toBe("关于");
    expect(getMessages("common", "zh").nav.about).toBe("关于");
  });

  it("returns English for the default locale without loading files", async () => {
    clearLocaleMessageCatalogCache();

    expect(await loadLocaleMessageCatalog("en")).toEqual({});
    expect(getMessages("common", "en").nav.about).toBe("About");
  });
});
