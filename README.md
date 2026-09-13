# TanStack Start i18n Template

An open-source multilingual starter built on [TanStack Start](https://tanstack.com/start): localized routing, SEO metadata that search engines actually use, an MDX blog, and a light/dark design system.

It ships with a landing page, an about page, and a blog so the wiring is visible end to end — then you delete what you do not need.

## What is included

- **Locale-prefixed routing** — English is the default and stays unprefixed (`/blog`), Chinese lives under `/zh/blog`. `/en/blog` 301-redirects to `/blog`, so every page has exactly one canonical URL.
- **SEO out of the box** — per-page `canonical`, `hreflang` alternates with `x-default`, Open Graph, Twitter cards, and JSON-LD (`WebSite`, `CollectionPage`, `ItemList`, `BlogPosting`, `BreadcrumbList`, `FAQPage`).
- **Generated sitemap and robots.txt** — built from the route files and the MDX front matter, including alternate-language links.
- **Typed message catalogs** — JSON namespaces with English fallback, lazily loaded per locale so non-default languages stay out of the initial bundle.
- **MDX blog** — posts validated with Zod, compiled to static HTML at build time, with locale-aware slugs and related-post links.
- **Design system** — Tailwind CSS v4 tokens, light/dark themes with no flash on first paint, accessible navigation, responsive layout.
- **Server rendering** — TanStack Start SSR on a Cloudflare Pages preset via Nitro.

## Requirements

- Node.js 20 or newer
- pnpm 10.10.0 (Corepack is recommended; pnpm 9+ is supported by the package metadata)

## Quick start

```bash
corepack enable
pnpm install
pnpm dev          # http://localhost:3000
```

No environment variables are required.

## Project structure

```text
content/blogs/            MDX posts, one file per locale (post.en.mdx, post.zh.mdx)
public/                   Static assets, robots.txt, generated sitemap.xml
scripts/
  blog-data-generator.mjs Internal Vite plugin step for src/generated/
  generate-sitemap.mjs    Writes public/sitemap.xml and public/robots.txt
src/
  site.config.ts          Site name, URL, email, logo, OG image
  lib/i18n.ts             Locale detection, message loading, path helpers
  lib/seo.ts              Meta tags and JSON-LD builders
  lib/blog.ts             Blog queries with locale fallback
  messages/<locale>/      JSON message catalogs
  routes/
    __root.tsx            Document shell, hreflang alternates, 404 handling
    {-$locale}/           The optional locale segment wraps the route tree
      index.tsx           Landing page
      (pages)/about.tsx   About page
      (pages)/blog/       Blog index and post pages
  components/             Layout, landing sections, blog pages, UI primitives
```

## 1. Configure the site

Edit `src/site.config.ts`:

```ts
export const siteConfig = {
  name: "Your Product",
  url: "https://your-domain.com", // canonical URLs, OG, JSON-LD, sitemap
  email: "hello@your-domain.com",
  // ...
};
```

`scripts/generate-sitemap.mjs` reads `url` from this file, so the sitemap and `robots.txt` stay in sync. Override it with `--base-url=` or `SITE_URL` if you generate the sitemap in CI with a different domain.

Also replace the placeholder brand assets: `public/logo.png`, `public/og-image.png`, and `public/favicon.ico`.

## 2. Add or remove a language

Locales are discovered from `src/messages/*/common.json`.

To add a language:

1. Copy `src/messages/en` to `src/messages/<locale>` and translate the values.
2. Add the native name to `NATIVE_LANGUAGE_LABELS` in `src/lib/i18n.ts` (shown in the language switcher).
3. Add the matching Open Graph locale to `OG_LOCALE_BY_LOCALE` in `src/lib/seo.ts`.

Routes, hreflang alternates, and the sitemap pick the new locale up automatically.

To remove one, delete the folder and the two map entries.

### How routing stays canonical

| URL        | Result                               |
| ---------- | ------------------------------------ |
| `/blog`    | English (default locale, unprefixed) |
| `/zh/blog` | Chinese                              |
| `/en/blog` | `301` to `/blog`                     |
| `/unknown` | `404` with `noindex`                 |

Interface copy lives in `src/messages`. Add a namespace to `MESSAGE_NAMESPACES` in `src/lib/i18n.ts` and create one JSON file per locale.

## 3. Write blog posts

Create an MDX file in `content/blogs` with a locale suffix:

```text
content/blogs/getting-started.en.mdx
content/blogs/getting-started.zh.mdx
```

Both files share the slug `getting-started`, so they become translations of one article and link to each other with `hreflang`. A post without a suffix is treated as English.

```mdx
---
title: "Getting started"
description: "A short summary used for meta description and cards."
date: "2026-01-12"
updated: "2026-01-20" # optional, used for article:modified_time and lastmod
tags: ["setup", "i18n"] # optional, drives related posts
author: "Your Name" # optional
cover: "/og-image.png" # optional, used as og:image
---

# Body

Write markdown here. Internal links are rewritten with the correct locale prefix.
```

Upload the post's cover image to `public/blog/` and reference it as `/blog/<file>.png`.

### Content trust boundary

Files under `content/blogs/` are trusted source code. The build compiles MDX with
`new Function` and the post renderer uses the resulting HTML directly, so this
pipeline is intentionally for repository-owned content only. Do not connect it to
user-submitted or CMS content without replacing the compiler boundary and adding a
sanitizer plus an allowlisted component set.

## Scripts

| Command                             | Description                                                        |
| ----------------------------------- | ------------------------------------------------------------------ |
| `pnpm dev`                          | Dev server on port 3000                                            |
| `pnpm build`                        | Generate `sitemap.xml` and `robots.txt`, then build for production |
| `pnpm run deploy`                   | Build and deploy to Cloudflare Pages (default)                     |
| `pnpm run deploy:pages`             | Build and deploy to Cloudflare Pages                               |
| `pnpm run deploy:workers`           | Build and deploy to Cloudflare Workers                             |
| `pnpm sitemap:generate`             | Regenerate the sitemap and robots.txt                              |
| `pnpm test`                         | Vitest                                                             |
| `pnpm lint` / `pnpm check-types`    | ESLint / TypeScript                                                |
| `pnpm format` / `pnpm format:check` | Write / verify Prettier formatting                                 |
| `pnpm check`                        | Verify formatting, lint, and type-check (read-only)                |

## Deployment

The default deployment target is Cloudflare Pages. Authenticate with Wrangler
once, then set the Pages project name and deploy:

```bash
pnpm exec wrangler login
CF_PAGES_PROJECT_NAME=your-project pnpm run deploy
```

You can also set `CF_PAGES_PROJECT_NAME` in your shell or CI environment. Security
headers live in `public/_headers`.

The non-secret deployment variables are listed in [`.env.example`](./.env.example).
The deploy script reads them from the process environment; copy the values into
your shell or CI provider rather than committing a local `.env` file.

To deploy the same app as a Cloudflare Worker, use the dedicated Workers preset and
configuration:

```bash
pnpm run deploy:workers
```

`pnpm run deploy` accepts `pages` or `workers` as its first argument, and defaults
to Pages. The equivalent environment-variable form is
`CF_DEPLOY_TARGET=workers pnpm run deploy`. Worker settings live in
`wrangler.workers.toml`; Pages settings live in `wrangler.toml` and the Pages
project dashboard.

The two targets intentionally use different Nitro presets and output directories:
Pages uses `dist/` with `cloudflare-pages`, while Workers uses `.output/` with
`cloudflare-module`. Do not deploy a Pages build with `wrangler deploy` or a Worker
build with `wrangler pages deploy`.

Nitro is pinned to a tested nightly release because the Cloudflare Pages adapter is
currently consumed from that channel. Upgrade it only together with a lockfile
update and a full `pnpm check`, `pnpm test`, and `pnpm build` verification.

## After you deploy

1. Set the real domain in `src/site.config.ts` and run `pnpm build`.
2. Submit `https://your-domain.com/sitemap.xml` in Google Search Console.
3. Check a page in the [Rich Results Test](https://search.google.com/test/rich-results) to confirm the JSON-LD parses.
4. Confirm `view-source:` shows `canonical`, `hreflang`, and `x-default` for a non-default locale, for example `/zh`.

## What is intentionally left out

Authentication, database, API layer, analytics, and a CMS. Those choices depend on the product being built, and a wrong guess costs more to remove than to add.

## Contributing and security

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the local workflow and [SECURITY.md](./SECURITY.md)
for private vulnerability reporting. The repository stays `private: true` in
`package.json` so cloning the template cannot accidentally publish it to npm; the
source itself is released under the Unlicense.

## License

Unlicense / public domain. See [LICENSE](./LICENSE).
