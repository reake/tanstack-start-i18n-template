import { createFileRoute, lazyRouteComponent, notFound } from "@tanstack/react-router";
import {
  getMessages,
  loadLocaleMessageCatalog,
  resolveLocale,
  withLocalePath,
} from "~/lib/i18n";
import {
  BASE_URL,
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  generateCanonicalLink,
  generateSeoMeta,
  type SeoMeta,
} from "~/lib/seo";

export const Route = createFileRoute("/{-$locale}/(pages)/blog/$slug")({
  loader: async ({ params }) => {
    const locale = resolveLocale(params?.locale);
    const slug = params?.slug;
    if (!slug) return undefined;
    const { getBlogPostBySlugAndLocale } = await import("~/lib/blog");
    const post = await getBlogPostBySlugAndLocale(slug, locale);

    if (!post) {
      throw notFound();
    }

    return post;
  },
  head: async ({ params }) => {
    const locale = resolveLocale(params?.locale);
    await loadLocaleMessageCatalog(locale);
    const slug = params?.slug;
    const { getBlogBySlugAndLocale } = await import("~/lib/blog");
    const post = slug ? getBlogBySlugAndLocale(slug, locale) : undefined;

    if (slug && !post) {
      throw notFound();
    }

    const canonicalPath = withLocalePath(`/blog/${slug ?? ""}`, post?.locale ?? locale);
    const fallback = getMessages("blog", locale);
    const ogImage = post?.cover
      ? post.cover.startsWith("http")
        ? post.cover
        : `${BASE_URL}${post.cover.startsWith("/") ? post.cover : `/${post.cover}`}`
      : undefined;
    const articleMeta: SeoMeta[] = [];

    if (post?.date) {
      articleMeta.push({
        property: "article:published_time",
        content: post.date,
      });
    }
    if (post?.updated) {
      articleMeta.push({
        property: "article:modified_time",
        content: post.updated,
      });
    }
    if (post?.author) {
      articleMeta.push({
        name: "author",
        content: post.author,
      });
    }
    if (post?.tags?.length) {
      post.tags.forEach((tag) => {
        articleMeta.push({
          property: "article:tag",
          content: tag,
        });
      });
    }

    const breadcrumbJsonLd = generateBreadcrumbJsonLd([
      {
        name: fallback.breadcrumb.home,
        url: `${BASE_URL}${withLocalePath("/", locale)}`,
      },
      {
        name: fallback.breadcrumb.blog,
        url: `${BASE_URL}${withLocalePath("/blog", locale)}`,
      },
      ...(post
        ? [
            {
              name: post.title,
              url: `${BASE_URL}${canonicalPath}`,
            },
          ]
        : []),
    ]);

    return {
      meta: [
        ...generateSeoMeta({
          title: post?.title ?? fallback.meta.title,
          description: post?.description ?? fallback.meta.description,
          keywords: post?.tags?.join(", ") ?? fallback.meta.keywords,
          path: canonicalPath,
          ogImage,
          ogType: post ? "article" : "website",
        }),
        ...articleMeta,
      ],
      links: [generateCanonicalLink(canonicalPath)],
      scripts: [
        ...(post
          ? [
              {
                type: "application/ld+json",
                children: generateArticleJsonLd({
                  headline: post.title,
                  description: post.description,
                  url: `${BASE_URL}${canonicalPath}`,
                  datePublished: post.date,
                  dateModified: post.updated,
                  authorName: post.author,
                  image: ogImage,
                  inLanguage: post.locale,
                  type: "BlogPosting",
                }),
              },
            ]
          : []),
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
    () => import("~/components/blog/blog-post-page"),
    "BlogPostPage",
  ),
});
