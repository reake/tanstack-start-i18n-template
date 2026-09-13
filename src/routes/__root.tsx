/// <reference types="vite/client" />
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
  useRouterState,
} from "@tanstack/react-router";

import appCss from "~/styles.css?url";

import { DefaultNotFound } from "~/components/default-not-found";
import { ThemeProvider } from "~/components/theme-provider";
import { getBlogTranslationLocales } from "~/lib/blog";
import {
  DEFAULT_LOCALE,
  getLocaleFromPath,
  stripLocaleFromPath,
  SUPPORTED_LOCALES,
  withLocalePath,
} from "~/lib/i18n";
import { isInternalRouteTemplatePath } from "~/lib/route-template-path";
import { BASE_URL } from "~/lib/seo";
import { siteConfig } from "~/site.config";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: siteConfig.name },
    ],
    links: [
      {
        rel: "preload",
        href: "/fonts/lexend-latin.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: siteConfig.logo },
    ],
  }),
  notFoundComponent: DefaultNotFound,
  shellComponent: RootShell,
  component: () => <Outlet />,
});

function RootShell({ children }: { readonly children: React.ReactNode }) {
  return <RootDocument>{children}</RootDocument>;
}

/**
 * Blog posts may exist in a subset of locales, so their alternates come from
 * the content collection. Every other page has all locales.
 */
function getAlternateLocalesForPath(basePath: string) {
  const blogPostMatch = basePath.match(/^\/blog\/([^/?#]+)$/);

  if (blogPostMatch) {
    const locales = getBlogTranslationLocales(decodeURIComponent(blogPostMatch[1]));
    if (locales.length) return locales;
  }

  return SUPPORTED_LOCALES;
}

function RootDocument({ children }: { readonly children: React.ReactNode }) {
  const { pathname } = useLocation();
  const statusCode = useRouterState({ select: (state) => state.statusCode });
  const locale = getLocaleFromPath(pathname);
  const basePath = stripLocaleFromPath(pathname);
  const shouldExposeSeoLinks =
    statusCode !== 404 && !isInternalRouteTemplatePath(pathname);
  const alternateLocales = shouldExposeSeoLinks
    ? getAlternateLocalesForPath(basePath)
    : [];
  const alternateLinks = alternateLocales.map((lang) => ({
    lang,
    href: `${BASE_URL}${withLocalePath(basePath, lang)}`,
  }));
  const xDefaultLocale = alternateLocales.includes(DEFAULT_LOCALE)
    ? DEFAULT_LOCALE
    : (alternateLocales[0] ?? DEFAULT_LOCALE);
  const defaultHref = `${BASE_URL}${withLocalePath(basePath, xDefaultLocale)}`;

  return (
    // suppress since the "dark" class is applied by ThemeProvider
    <html lang={locale} suppressHydrationWarning>
      <head>
        {appCss ? <link rel="stylesheet" href={appCss} /> : null}
        <HeadContent />
        {shouldExposeSeoLinks ? null : <meta name="robots" content="noindex, follow" />}
        {/* Bing treats hreflang as a weak signal and wants an explicit hint */}
        <meta httpEquiv="content-language" content={locale} />
        {alternateLinks.map((link) => (
          <link
            key={`alt-${link.lang}`}
            rel="alternate"
            hrefLang={link.lang}
            href={link.href}
          />
        ))}
        {shouldExposeSeoLinks ? (
          <link rel="alternate" hrefLang="x-default" href={defaultHref} />
        ) : null}
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
