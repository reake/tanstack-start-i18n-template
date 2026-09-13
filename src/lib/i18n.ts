import { useParams } from "@tanstack/react-router";

export const DEFAULT_LOCALE = "en" as const;

/**
 * Every message file that exists in `src/messages/<locale>/` must be listed
 * here. Add a namespace, add a JSON file per locale, done.
 */
export const MESSAGE_NAMESPACES = [
  "about",
  "blog",
  "common",
  "index",
  "not-found",
] as const;

export type MessageNamespace = (typeof MESSAGE_NAMESPACES)[number];

export type MessageSchema = {
  about: typeof import("../messages/en/about.json");
  blog: typeof import("../messages/en/blog.json");
  common: typeof import("../messages/en/common.json");
  index: typeof import("../messages/en/index.json");
  "not-found": typeof import("../messages/en/not-found.json");
};

export type LocaleMessageCatalog = Partial<{
  [Namespace in MessageNamespace]: MessageSchema[Namespace];
}>;

/** Native language names shown in the language switcher. */
export const NATIVE_LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  zh: "中文",
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeJson(base: unknown, override: unknown): unknown {
  if (override === undefined) return base;
  if (Array.isArray(override)) return override;

  if (isPlainRecord(base) && isPlainRecord(override)) {
    const merged: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(override)) {
      merged[key] = mergeJson(base[key], value);
    }
    return merged;
  }

  return override;
}

const defaultLocaleModules = import.meta.glob("../messages/en/*.json", {
  eager: true,
  import: "default",
}) as Record<string, MessageSchema[MessageNamespace]>;

const lazyMessageModules = import.meta.glob(
  ["../messages/*/*.json", "!../messages/en/*.json"],
  {
    import: "default",
  },
) as Record<string, () => Promise<MessageSchema[MessageNamespace]>>;

const localeSet = new Set(
  Object.keys(lazyMessageModules)
    .filter((key) => key.endsWith("/common.json"))
    .map((key) => {
      const parts = key.split("/");
      const messagesIndex = parts.lastIndexOf("messages");
      return messagesIndex >= 0 ? parts[messagesIndex + 1] : undefined;
    })
    .filter((locale): locale is string => Boolean(locale)),
);

localeSet.add(DEFAULT_LOCALE);

export const SUPPORTED_LOCALES = Array.from(localeSet).sort();

export type Locale = (typeof SUPPORTED_LOCALES)[number];

const localeCatalogCache = new Map<Locale, LocaleMessageCatalog>();
const localeCatalogPromiseCache = new Map<Locale, Promise<LocaleMessageCatalog>>();

export function isLocale(value?: string): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value);
}

export function resolveLocale(value?: string): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

function getMessageModuleKey(locale: string, namespace: MessageNamespace) {
  return `../messages/${locale}/${namespace}.json`;
}

function getDefaultMessages<N extends MessageNamespace>(namespace: N): MessageSchema[N] {
  return defaultLocaleModules[
    getMessageModuleKey(DEFAULT_LOCALE, namespace)
  ] as MessageSchema[N];
}

function getCachedLocaleMessages<N extends MessageNamespace>(
  namespace: N,
  locale: Locale,
): MessageSchema[N] | undefined {
  return localeCatalogCache.get(locale)?.[namespace] as MessageSchema[N] | undefined;
}

/** Merge a locale catalog into the in-memory cache (used by the route loader). */
export function primeLocaleMessageCatalog(
  locale: Locale,
  catalog: LocaleMessageCatalog,
): LocaleMessageCatalog {
  if (locale === DEFAULT_LOCALE) return catalog;

  const merged = mergeJson(
    localeCatalogCache.get(locale) ?? {},
    catalog,
  ) as LocaleMessageCatalog;
  localeCatalogCache.set(locale, merged);
  return merged;
}

export function clearLocaleMessageCatalogCache() {
  localeCatalogCache.clear();
  localeCatalogPromiseCache.clear();
}

/** Lazily load every namespace for a non-default locale. */
export async function loadLocaleMessageCatalog(
  locale?: string,
): Promise<LocaleMessageCatalog> {
  const resolvedLocale = resolveLocale(locale);
  if (resolvedLocale === DEFAULT_LOCALE) return {};

  const cached = localeCatalogCache.get(resolvedLocale);
  if (cached) return cached;

  const existingPromise = localeCatalogPromiseCache.get(resolvedLocale);
  if (existingPromise) return existingPromise;

  const promise = (async () => {
    const catalogEntries = await Promise.all(
      MESSAGE_NAMESPACES.map(async (namespace) => {
        const loader = lazyMessageModules[getMessageModuleKey(resolvedLocale, namespace)];
        if (!loader) return null;
        const messages = (await loader()) as MessageSchema[typeof namespace];
        return [namespace, messages] as const;
      }),
    );

    const nextCatalog = Object.fromEntries(
      catalogEntries.filter((entry): entry is NonNullable<typeof entry> =>
        Boolean(entry),
      ),
    ) as LocaleMessageCatalog;

    const mergedCatalog = primeLocaleMessageCatalog(resolvedLocale, nextCatalog);
    localeCatalogPromiseCache.delete(resolvedLocale);
    return mergedCatalog;
  })();

  localeCatalogPromiseCache.set(resolvedLocale, promise);
  return promise;
}

/**
 * Read a namespace for a locale. English is the fallback for missing keys.
 * Synchronous: call `loadLocaleMessageCatalog` first for non-default locales.
 */
export function getMessages<N extends MessageNamespace>(
  namespace: N,
  locale?: string,
): MessageSchema[N] {
  const resolvedLocale = resolveLocale(locale);
  const fallback = getDefaultMessages(namespace);
  const localized =
    resolvedLocale === DEFAULT_LOCALE
      ? undefined
      : getCachedLocaleMessages(namespace, resolvedLocale);

  return mergeJson(fallback ?? {}, localized ?? {}) as MessageSchema[N];
}

export const getTranslations = getMessages;

export function useTranslations<N extends MessageNamespace>(
  namespace: N,
): MessageSchema[N] {
  return getMessages(namespace, useLocale());
}

export function resolveDateLocaleTag(locale?: string): string {
  if (locale?.toLowerCase() === "zh") return "zh-CN";
  return "en-US";
}

export function useLocale(): Locale {
  const params = useParams({ strict: false }) as { locale?: string };
  return resolveLocale(params?.locale);
}

export function getLocaleFromPath(pathname: string): Locale {
  if (!pathname) return DEFAULT_LOCALE;

  for (const locale of SUPPORTED_LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}

export function stripLocaleFromPath(pathname: string): string {
  if (!pathname) return "/";

  for (const locale of SUPPORTED_LOCALES) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }

  return pathname;
}

/** Default locale is unprefixed: `/` and `/blog`, others get `/zh/blog`. */
export function withLocalePath(pathname: string, locale: Locale): string {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

  if (pathname === "/") return prefix || "/";

  return `${prefix}${pathname}`;
}
