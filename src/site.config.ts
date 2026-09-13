/**
 * Single source of truth for site identity.
 *
 * Update these values when you fork this template. `url` is also read by
 * scripts/generate-sitemap.mjs so sitemap URLs match your canonical URLs.
 */
export const siteConfig = {
  name: "TanStack Start i18n Template",
  shortName: "i18n Starter",
  url: "https://example.com",
  email: "hello@example.com",
  description:
    "A multilingual starter for TanStack Start with SEO-ready routing, content collections, and a light/dark design system.",
  logo: "/logo.png",
  ogImage: "/og-image.png",
} as const;
