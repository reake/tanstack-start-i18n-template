import { Link } from "@tanstack/react-router";
import { useLocale, useTranslations, withLocalePath } from "~/lib/i18n";
import { siteConfig } from "~/site.config";

const FOOTER_LINKS = [
  { to: "/", labelKey: "home" },
  { to: "/blog", labelKey: "blog" },
  { to: "/about", labelKey: "about" },
] as const;

export function SiteFooter() {
  const locale = useLocale();
  const t = useTranslations("common");
  const currentYear = new Date().getFullYear();
  const copyright = t.footer.copyright
    .replace("{year}", String(currentYear))
    .replace("{name}", siteConfig.name);

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container">
        <div className="grid gap-8 py-12 sm:grid-cols-2 lg:py-14">
          <div className="max-w-sm">
            <Link
              to={withLocalePath("/", locale)}
              className="focus-visible:border-ring focus-visible:ring-ring/50 inline-flex rounded-sm text-xl font-bold focus-visible:ring-[3px] focus-visible:outline-none"
            >
              {siteConfig.name}
            </Link>
            <p className="text-muted-foreground mt-4 text-sm leading-6">
              {t.footer.description}
            </p>
          </div>

          <nav aria-label={t.footer.navigation} className="sm:justify-self-end">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {FOOTER_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={withLocalePath(link.to, locale)}
                    activeOptions={{ exact: link.to === "/" }}
                    className="text-muted-foreground hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 rounded-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
                  >
                    {t.nav[link.labelKey]}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-muted-foreground hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 rounded-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
                >
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">{copyright}</p>
          <p className="text-muted-foreground text-sm">{t.footer.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}
