import { siteConfig } from "~/site.config";

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

// Open Graph wants underscore form (`zh_CN`). Extend when you add a locale.
const OG_LOCALE_BY_LOCALE: Record<string, string> = {
  en: "en_US",
  zh: "zh_CN",
};

export const BASE_URL = siteConfig.url.replace(/\/+$/, "");
export const DEFAULT_OG_IMAGE = ABSOLUTE_URL_PATTERN.test(siteConfig.ogImage)
  ? siteConfig.ogImage
  : `${BASE_URL}${siteConfig.ogImage}`;

export interface SeoConfig {
  title: string;
  description: string;
  /** Path with locale prefix, e.g. `/zh/blog`. */
  path: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  robots?: string;
}

export interface SeoMeta {
  title?: string;
  name?: string;
  content?: string;
  property?: string;
  charSet?: string;
}

export interface SeoLink {
  rel: string;
  href: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ArticleJsonLdConfig {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  image?: string;
  inLanguage?: string;
  type?: "Article" | "BlogPosting";
}

export function absoluteUrl(path: string): string {
  return ABSOLUTE_URL_PATTERN.test(path) ? path : `${BASE_URL}${path}`;
}

function getOpenGraphLocale(path: string): string {
  const localePrefix = path.split("/")[1]?.toLowerCase();
  return OG_LOCALE_BY_LOCALE[localePrefix] ?? OG_LOCALE_BY_LOCALE.en;
}

/** Meta tags for a page: description, canonical-aware Open Graph, Twitter card. */
export function generateSeoMeta(config: SeoConfig): SeoMeta[] {
  const {
    title,
    description,
    keywords,
    path,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = "website",
    robots,
  } = config;
  const canonicalUrl = absoluteUrl(path);

  const meta: SeoMeta[] = [{ title }, { name: "description", content: description }];

  if (keywords) meta.push({ name: "keywords", content: keywords });
  if (robots) meta.push({ name: "robots", content: robots });

  meta.push(
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonicalUrl },
    { property: "og:type", content: ogType },
    { property: "og:image", content: ogImage },
    { property: "og:locale", content: getOpenGraphLocale(path) },
    { property: "og:site_name", content: siteConfig.name },
  );

  meta.push(
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  );

  return meta;
}

export function generateCanonicalLink(path: string): SeoLink {
  return { rel: "canonical", href: absoluteUrl(path) };
}

/** WebSite JSON-LD for the home page. */
export function generateWebsiteJsonLd(inLanguage: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: `${BASE_URL}/`,
    inLanguage,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: BASE_URL,
    },
  });
}

export function generateCollectionJsonLd(config: {
  name: string;
  description: string;
  url: string;
  inLanguage?: string;
}): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: config.name,
    description: config.description,
    url: config.url,
    inLanguage: config.inLanguage,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: BASE_URL,
    },
  });
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[] = []): string | null {
  if (!items.length) return null;

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

export function generateArticleJsonLd(config: ArticleJsonLdConfig): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": config.type ?? "BlogPosting",
    headline: config.headline,
    description: config.description,
    url: config.url,
    datePublished: config.datePublished,
    dateModified: config.dateModified,
    image: config.image,
    inLanguage: config.inLanguage,
    author: config.authorName
      ? { "@type": "Person", name: config.authorName }
      : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": config.url },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: BASE_URL,
    },
  });
}

export function generateFaqJsonLd(items: FaqItem[] = []): string | null {
  if (!items.length) return null;

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  });
}
