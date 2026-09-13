import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import {
  getMessages,
  loadLocaleMessageCatalog,
  resolveLocale,
  withLocalePath,
} from "~/lib/i18n";
import {
  BASE_URL,
  generateBreadcrumbJsonLd,
  generateCanonicalLink,
  generateCollectionJsonLd,
  generateSeoMeta,
} from "~/lib/seo";

export const Route = createFileRoute("/{-$locale}/(pages)/blog/")({
  head: async ({ params }) => {
    const locale = resolveLocale(params?.locale);
    await loadLocaleMessageCatalog(locale);
    const t = getMessages("blog", locale);
    const path = withLocalePath("/blog", locale);
    const { getBlogsByLocale } = await import("~/lib/blog");
    const posts = [...getBlogsByLocale(locale)].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const itemListJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: post.title,
        url: `${BASE_URL}${withLocalePath(`/blog/${post.slug}`, locale)}`,
      })),
    });

    const breadcrumbJsonLd = generateBreadcrumbJsonLd([
      { name: t.breadcrumb.home, url: `${BASE_URL}${withLocalePath("/", locale)}` },
      { name: t.breadcrumb.blog, url: `${BASE_URL}${path}` },
    ]);

    return {
      meta: generateSeoMeta({
        title: t.meta.title,
        description: t.meta.description,
        keywords: t.meta.keywords,
        path,
      }),
      links: [generateCanonicalLink(path)],
      scripts: [
        {
          type: "application/ld+json",
          children: generateCollectionJsonLd({
            name: t.meta.title,
            description: t.meta.description,
            url: `${BASE_URL}${path}`,
            inLanguage: locale,
          }),
        },
        {
          type: "application/ld+json",
          children: itemListJsonLd,
        },
        ...(breadcrumbJsonLd
          ? [
              {
                type: "application/ld+json",
                children: breadcrumbJsonLd,
              },
            ]
          : []),
      ],
    };
  },
  component: lazyRouteComponent(
    () => import("~/components/blog/blog-index-page"),
    "BlogIndexPage",
  ),
});
