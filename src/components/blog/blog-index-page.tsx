import { Link } from "@tanstack/react-router";
import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { getBlogsByLocale } from "~/lib/blog";
import {
  resolveDateLocaleTag,
  useLocale,
  useTranslations,
  withLocalePath,
} from "~/lib/i18n";

function formatPostDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(resolveDateLocaleTag(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BlogIndexPage() {
  const locale = useLocale();
  const t = useTranslations("blog");
  const posts = [...getBlogsByLocale(locale)].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="page-atmo flex min-h-screen flex-col">
      <SiteHeader />

      <section className="page-hero">
        <div className="container">
          <div className="page-hero-copy page-reveal">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t.hero.title}
            </h1>
            <p className="text-muted-foreground mt-4 text-base md:text-lg">
              {t.hero.description}
            </p>
          </div>
        </div>
      </section>

      <main id="main-content" className="page-reveal container py-8 md:py-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-lg font-semibold md:text-xl">{t.list.title}</h2>

          {posts.length === 0 ? (
            <div className="bg-background rounded-lg border p-6 text-center">
              <p className="text-base font-medium">{t.empty.title}</p>
              <p className="text-muted-foreground mt-2 text-sm">{t.empty.description}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {posts.map((post) => (
                <article key={post.slug} className="bg-background rounded-lg border p-5">
                  <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                    <time dateTime={post.date}>{formatPostDate(post.date, locale)}</time>
                    {post.tags?.length ? (
                      <span className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-muted rounded-full px-2 py-0.5 text-[11px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">
                    <Link
                      to={withLocalePath(`/blog/${post.slug}`, locale)}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm">{post.description}</p>
                  <Link
                    to={withLocalePath(`/blog/${post.slug}`, locale)}
                    className="text-primary mt-4 inline-flex text-sm font-medium hover:underline"
                  >
                    {t.list.readMore}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
