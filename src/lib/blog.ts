import {
  getBlogSummariesByLocale,
  getBlogSummaryBySlug,
  getBlogSummaryBySlugAndLocale,
  getBlogTranslations as getGeneratedBlogTranslations,
  hasBlogTranslations as getGeneratedHasBlogTranslations,
  getRelatedBlogSummaries,
  loadBlogPostBySlug,
  loadBlogPostBySlugAndLocale,
  type BlogPost,
  type BlogSummary,
} from "~/generated/blog.generated";
import type { Locale } from "~/lib/i18n";

export type { BlogPost, BlogSummary };

/**
 * Get all blogs for a specific locale, falling back to the default locale.
 */
export function getBlogsByLocale(locale: Locale) {
  const localizedBlogs = getBlogSummariesByLocale(locale);
  return localizedBlogs.length ? localizedBlogs : getBlogSummariesByLocale("en");
}

/**
 * Get a blog summary by slug and locale, falling back to the default locale.
 */
export function getBlogBySlugAndLocale(slug: string, locale: Locale) {
  return (
    getBlogSummaryBySlugAndLocale(slug, locale) ??
    getBlogSummaryBySlugAndLocale(slug, "en") ??
    getGeneratedBlogTranslations(slug)[0]
  );
}

/**
 * Get a blog summary by slug across all locales
 */
export function getBlogBySlug(slug: string) {
  return getBlogSummaryBySlug(slug);
}

/**
 * Load a full blog post by slug and locale, falling back to the default locale.
 */
export async function getBlogPostBySlugAndLocale(slug: string, locale: Locale) {
  const localizedPost = (await loadBlogPostBySlugAndLocale(slug, locale)) as
    | BlogPost
    | undefined;
  if (localizedPost) return localizedPost;

  const defaultLocalePost = (await loadBlogPostBySlugAndLocale(slug, "en")) as
    | BlogPost
    | undefined;
  if (defaultLocalePost) return defaultLocalePost;

  const fallbackLocale = getGeneratedBlogTranslations(slug)[0]?.locale;
  if (!fallbackLocale) return undefined;

  return (await loadBlogPostBySlugAndLocale(slug, fallbackLocale)) as
    | BlogPost
    | undefined;
}

/**
 * Load a full blog post by slug with locale fallback
 */
export function getBlogPostBySlug(slug: string) {
  return loadBlogPostBySlug(slug) as Promise<BlogPost | undefined>;
}

/**
 * Get related blogs based on tags, filtered by locale
 */
export function getRelatedBlogs(
  currentSlug: string,
  tags: string[],
  locale: Locale,
  limit = 2,
) {
  return getRelatedBlogSummaries(currentSlug, tags, locale, limit);
}

/**
 * Get available translations for a blog post
 */
export function getBlogTranslations(slug: string) {
  const translations = getGeneratedBlogTranslations(slug);
  return translations.reduce(
    (acc, blog) => {
      acc[blog.locale] = blog;
      return acc;
    },
    {} as Record<string, BlogSummary>,
  );
}

/**
 * Get the locale codes that actually exist for a blog post.
 */
export function getBlogTranslationLocales(slug: string): Locale[] {
  return getGeneratedBlogTranslations(slug).map((blog) => blog.locale as Locale);
}

/**
 * Check if a blog has translations in other languages
 */
export function hasBlogTranslations(slug: string, currentLocale: Locale) {
  return getGeneratedHasBlogTranslations(slug, currentLocale);
}
