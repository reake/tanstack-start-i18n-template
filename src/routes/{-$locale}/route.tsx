import { createFileRoute, notFound, Outlet, redirect } from "@tanstack/react-router";
import { DefaultNotFound } from "~/components/default-not-found";
import {
  DEFAULT_LOCALE,
  isLocale,
  loadLocaleMessageCatalog,
  primeLocaleMessageCatalog,
  resolveLocale,
  stripLocaleFromPath,
} from "~/lib/i18n";

export const Route = createFileRoute("/{-$locale}")({
  loader: async ({ params, location }) => {
    // The optional segment also matches unknown single segments like `/typo`.
    if (params?.locale && !isLocale(params.locale)) {
      throw notFound();
    }

    const locale = resolveLocale(params?.locale);
    if (locale === DEFAULT_LOCALE) {
      // `/en/...` duplicates the canonical prefix-less URLs -> 301.
      if (params?.locale) {
        throw redirect({
          href: `${stripLocaleFromPath(location.pathname)}${location.searchStr}`,
          statusCode: 301,
        });
      }
      return null;
    }

    const catalog = await loadLocaleMessageCatalog(locale);
    return { locale, catalog };
  },
  notFoundComponent: DefaultNotFound,
  component: LocaleLayout,
});

function LocaleLayout() {
  const loaderData = Route.useLoaderData();

  if (loaderData) {
    primeLocaleMessageCatalog(loaderData.locale, loaderData.catalog);
  }

  return <Outlet />;
}
