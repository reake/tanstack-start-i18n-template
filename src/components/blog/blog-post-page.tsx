import { getRouteApi, Link } from "@tanstack/react-router";
import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { getRelatedBlogs } from "~/lib/blog";
import {
  resolveDateLocaleTag,
  useLocale,
  useTranslations,
  withLocalePath,
} from "~/lib/i18n";

const blogPostRoute = getRouteApi("/{-$locale}/(pages)/blog/$slug");

export function BlogPostPage() {
  const locale = useLocale();
  const t = useTranslations("blog");
  const post = blogPostRoute.useLoaderData();
  const relatedPosts = post
    ? getRelatedBlogs(post.slug, post.tags ?? [], post.locale)
    : [];
  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(resolveDateLocaleTag(locale), {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (!post) {
    return (
      <div className="page-atmo flex min-h-screen flex-col">
        <SiteHeader />
        <main id="main-content" className="container py-10 md:py-16">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <div className="text-xl font-semibold md:text-2xl">{t.empty.title}</div>
            <p className="text-muted-foreground text-sm">{t.empty.description}</p>
            <Link
              to={withLocalePath("/blog", locale)}
              className="text-primary inline-flex text-sm font-medium hover:underline"
            >
              {t.actions.backToBlog}
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="page-atmo flex min-h-screen flex-col">
      <SiteHeader />

      <section className="page-hero">
        <div className="container">
          <div className="page-hero-copy page-reveal">
            <Link
              to={withLocalePath("/blog", locale)}
              className="text-primary text-xs font-medium hover:underline"
            >
              {t.actions.backToBlog}
            </Link>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            <p className="text-muted-foreground mt-5 text-base">{post.description}</p>
            <div className="text-muted-foreground mt-5 flex flex-wrap items-center justify-center gap-3 text-xs">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.tags?.length ? (
                <span className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="bg-muted rounded-full px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="page-reveal container py-2 md:py-3">
        <article className="blog-content mx-auto max-w-3xl">
          {/* post.html is generated from trusted repository MDX at build time. */}
          {/* eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml */}
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>

        {relatedPosts.length ? (
          <section className="mx-auto mt-10 max-w-3xl border-t pt-8">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{t.relatedPosts.title}</h2>
              <p className="text-muted-foreground text-sm">
                {t.relatedPosts.description}
              </p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((item) => (
                <article key={item.slug} className="bg-background rounded-lg border p-4">
                  <p className="text-muted-foreground text-xs">{formatDate(item.date)}</p>
                  <h3 className="mt-2 text-base font-semibold">
                    <Link
                      to={withLocalePath(`/blog/${item.slug}`, locale)}
                      className="hover:text-primary transition-colors"
                    >
                      {item.title}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
