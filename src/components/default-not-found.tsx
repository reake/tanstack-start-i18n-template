import { Link, useLocation } from "@tanstack/react-router";
import { FileText, House, Info } from "lucide-react";
import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { Button } from "~/components/ui/button";
import { getLocaleFromPath, getMessages, withLocalePath } from "~/lib/i18n";

const quickLinkConfig = [
  { href: "/", icon: House },
  { href: "/blog", icon: FileText },
  { href: "/about", icon: Info },
] as const;

export function DefaultNotFound() {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const t = getMessages("not-found", locale);
  const homePath = withLocalePath("/", locale);
  const quickLinks = quickLinkConfig.map((item, index) => ({
    ...item,
    title: t.quickLinks.items[index]?.title ?? item.href,
    description: t.quickLinks.items[index]?.description ?? "",
  }));

  return (
    <div className="page-atmo flex min-h-screen flex-col">
      <SiteHeader />

      <section className="page-hero">
        <div className="container">
          <div className="page-hero-copy page-reveal space-y-4">
            <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
              {t.badge}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t.title}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">{t.description}</p>
            <p className="text-muted-foreground text-xs">
              {t.pathLabel}:{" "}
              <span className="text-foreground font-medium">{location.pathname}</span>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button type="button" onClick={() => window.history.back()}>
                {t.actions.back}
              </Button>
              <Button
                render={<Link to={homePath} />}
                variant="secondary"
                nativeButton={false}
              >
                {t.actions.home}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="page-reveal container flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-4xl space-y-4">
          <h2 className="text-muted-foreground text-center text-sm font-semibold">
            {t.quickLinks.title}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                to={withLocalePath(item.href, locale)}
                className="bg-background/80 hover:border-primary/40 rounded-xl border p-4 transition-[border-color,box-shadow] hover:shadow-md"
              >
                <item.icon className="text-primary h-5 w-5" />
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-2 text-xs">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
