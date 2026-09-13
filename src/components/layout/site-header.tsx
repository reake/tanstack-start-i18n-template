import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, Globe, Menu } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  NATIVE_LANGUAGE_LABELS,
  stripLocaleFromPath,
  SUPPORTED_LOCALES,
  useLocale,
  useTranslations,
  withLocalePath,
  type Locale,
} from "~/lib/i18n";
import { siteConfig } from "~/site.config";

const NAV_ITEMS = [
  { to: "/", labelKey: "home" },
  { to: "/blog", labelKey: "blog" },
  { to: "/about", labelKey: "about" },
] as const;

function getLanguageLabel(locale: Locale) {
  return NATIVE_LANGUAGE_LABELS[locale] ?? locale.toUpperCase();
}

export function SiteHeader() {
  const location = useLocation();
  const locale = useLocale();
  const t = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);

  const basePath = stripLocaleFromPath(location.pathname);
  // Keep the current page when switching language.
  const localePath = (target: Locale) =>
    `${withLocalePath(basePath, target)}${location.searchStr}${location.hash}`;

  const navLinkClass =
    "text-muted-foreground hover:text-foreground [&.active]:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors";

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t.a11y.skipToMain}
      </a>
      <header className="site-header fixed inset-x-0 top-0 z-50 w-full border-b">
        <div className="container flex h-14 items-center">
          <Link to={withLocalePath("/", locale)} className="mr-6 flex items-center gap-2">
            <img
              src={siteConfig.logo}
              alt={t.nav.logoAlt.replace("{name}", siteConfig.name)}
              className="logo h-7 w-7 shrink-0"
              width={28}
              height={28}
              decoding="async"
              fetchPriority="high"
              loading="eager"
            />
            <span className="font-bold">{siteConfig.name}</span>
          </Link>

          <nav
            className="hidden items-center gap-6 md:flex"
            aria-label={t.nav.mainNavigation}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={withLocalePath(item.to, locale)}
                className={navLinkClass}
                activeOptions={{ exact: item.to === "/" }}
              >
                {t.nav[item.labelKey]}
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <div className="hidden md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="text-muted-foreground hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
                  render={(props) => (
                    <button {...props} aria-label={t.nav.language}>
                      <Globe className="h-4 w-4" />
                      <span className="ml-1.5 text-sm">{getLanguageLabel(locale)}</span>
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </button>
                  )}
                />
                <DropdownMenuContent align="end" sideOffset={8}>
                  {SUPPORTED_LOCALES.map((code) => (
                    <DropdownMenuItem
                      key={code}
                      className={code === locale ? "text-foreground font-medium" : ""}
                    >
                      <Link to={localePath(code)} className="w-full">
                        {getLanguageLabel(code)}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <ThemeToggle />

            <div className="md:hidden">
              <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(true)}
                  aria-label={t.nav.openMenu}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <DialogContent className="fixed top-0 left-0 h-full w-full max-w-none -translate-x-0 -translate-y-0 overflow-y-auto rounded-none p-6 sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl">
                  <DialogHeader>
                    <DialogTitle>{t.nav.menu}</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="grid gap-1.5">
                      {NAV_ITEMS.map((item) => (
                        <Link
                          key={item.to}
                          to={withLocalePath(item.to, locale)}
                          onClick={() => setMobileOpen(false)}
                          className="hover:bg-muted rounded-md px-2 py-2 text-sm"
                        >
                          {t.nav[item.labelKey]}
                        </Link>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        {t.nav.language}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {SUPPORTED_LOCALES.map((code) => (
                          <Button
                            key={code}
                            variant={code === locale ? "default" : "outline"}
                            size="sm"
                            render={
                              <Link
                                to={localePath(code)}
                                onClick={() => setMobileOpen(false)}
                              />
                            }
                            nativeButton={false}
                          >
                            {getLanguageLabel(code)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>
      <div className="site-header-spacer h-14 w-full shrink-0" aria-hidden="true" />
    </>
  );
}
