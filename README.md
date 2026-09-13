# TanStack Start i18n Template

A production-minded multilingual starter for [TanStack Start](https://tanstack.com/start).
This is the open-source foundation used to build [SVGView.com](https://svgview.com),
with localized routing, SEO metadata, an MDX blog, and a small accessible design system.

## Case study: [SVGView.com](https://svgview.com)

[SVGView](https://svgview.com) is the reference implementation for this repository.
The same foundation was extended into a browser-based SVG toolkit for viewing,
editing, optimizing, and converting assets, including SVG-to-PNG and SVG-to-React
export flows.

The implementation demonstrates how to extend the skeleton without changing its
core conventions:

- localized routes and language-aware links for a global audience;
- SEO-ready tool pages, canonical URLs, `hreflang`, JSON-LD, sitemap, and robots.txt;
- reusable landing-page and content components for viewer, optimizer, and converter flows;
- local-only browser processing, keeping SVG files on the user's device;
- Cloudflare-ready builds for fast, low-maintenance delivery.

Use this repository as the reusable skeleton; visit [svgview.com](https://svgview.com)
to see one product built on top of it.

## Included

- **Canonical i18n routing** — English is unprefixed (`/blog`), while Chinese uses
  `/zh/blog`; `/en/*` redirects to the default locale.
- **SEO by default** — canonical links, localized `hreflang` with `x-default`, Open
  Graph/Twitter cards, and JSON-LD helpers.
- **Typed, lazy messages** — JSON catalogs with English fallback and per-locale loading.
- **MDX content** — Zod-validated front matter, static compilation, localized slugs,
  related posts, and translated article links.
- **Accessible UI** — Tailwind CSS v4 tokens, light/dark themes, responsive layout,
  keyboard-friendly navigation, and shadcn-style primitives.
- **Cloudflare targets** — one build workflow for Pages or Workers.

## Requirements

- Node.js 20+
- pnpm 10.10.0 (Corepack recommended; pnpm 9+ is supported)

## Quick start

```bash
corepack enable
pnpm install
pnpm dev                 # http://localhost:3000
```

Local development does not require environment variables.

## Configure the site

Update [`src/site.config.ts`](./src/site.config.ts) before deploying:

```ts
export const siteConfig = {
  name: "Your Product",
  url: "https://your-domain.com",
  email: "hello@your-domain.com",
  // description, logo, and ogImage
} as const;
```

The same `url` drives canonical URLs, JSON-LD, the sitemap, and `robots.txt`. Replace
the placeholder assets in `public/` (`logo.png`, `og-image.png`, and `favicon.ico`).

## Internationalization

Locales are discovered from `src/messages/*/common.json`.

1. Copy `src/messages/en/` to `src/messages/<locale>/` and translate the values.
2. Add the native label to `NATIVE_LANGUAGE_LABELS` in [`src/lib/i18n.ts`](./src/lib/i18n.ts).
3. Add the Open Graph locale to `OG_LOCALE_BY_LOCALE` in [`src/lib/seo.ts`](./src/lib/seo.ts).

Routes, language switchers, `hreflang`, and the sitemap update automatically. Keep the
default locale (`en`) unprefixed and use `withLocalePath` for generated links.

| URL        | Meaning                  |
| ---------- | ------------------------ |
| `/blog`    | English (default locale) |
| `/zh/blog` | Chinese                  |
| `/en/blog` | Redirects to `/blog`     |
| `/unknown` | 404 with `noindex`       |

Every user-visible string belongs in `src/messages`. Add a namespace to
`MESSAGE_NAMESPACES` before adding its JSON catalog.

## Blog content

Create translated posts next to each other in `content/blogs/`:

```text
getting-started.en.mdx
getting-started.zh.mdx
```

Both files share the `getting-started` slug and are linked as language alternates.
Front matter supports `title`, `description`, `date`, optional `updated`, `tags`,
`author`, and `cover`.

```mdx
---
title: "Getting started"
description: "A short summary for search and social cards."
date: "2026-01-12"
tags: ["setup", "i18n"]
---
```

Blog files are trusted repository content: the build compiles MDX and renders its HTML
directly. Do not connect this pipeline to user-submitted content without adding a
sanitizer and an allowlisted component set.

## Project structure

```text
content/blogs/            MDX posts, one file per locale
public/                   Static assets and generated sitemap/robots files
scripts/                  Blog generation, sitemap generation, deployment
src/site.config.ts        Site identity and canonical URL
src/lib/                  i18n, SEO, blog, and request helpers
src/messages/<locale>/    JSON message catalogs
src/routes/               TanStack Start file-based routes
src/components/           Layout, landing, blog, legal, and UI components
```

## Commands

| Command                 | Purpose                                                 |
| ----------------------- | ------------------------------------------------------- |
| `pnpm dev`              | Start the Vite development server                       |
| `pnpm build`            | Generate sitemap/robots and build for production        |
| `pnpm test`             | Run Vitest                                              |
| `pnpm check`            | Check formatting, lint, and TypeScript                  |
| `pnpm sitemap:generate` | Regenerate `public/sitemap.xml` and `public/robots.txt` |

## Deployment

Cloudflare Pages is the default target. Authenticate once, set the project name, and
deploy:

| Command                   | Purpose                                |
| ------------------------- | -------------------------------------- |
| `pnpm run deploy`         | Build and deploy to Cloudflare Pages   |
| `pnpm run deploy:pages`   | Explicit Pages deployment              |
| `pnpm run deploy:workers` | Build and deploy to Cloudflare Workers |

```bash
pnpm exec wrangler login
CF_PAGES_PROJECT_NAME=your-project pnpm run deploy
```

For Workers, run `pnpm run deploy:workers`. The Pages build outputs to `dist/`; the
Workers build outputs to `.output/`. Do not deploy one target with the other target's
Wrangler command. Deployment variables are documented in [`.env.example`](./.env.example).

After deployment, submit `/sitemap.xml` to Search Console and verify canonical,
`hreflang`, and JSON-LD output on a localized page.

## Scope and license

Authentication, databases, APIs, analytics, and CMS integrations are intentionally
left out so each product can choose the right architecture. See
[`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`SECURITY.md`](./SECURITY.md) for project
workflows. This template is released under the [MIT License](./LICENSE). You may use,
modify, and redistribute it, including in commercial projects, under the terms in
[`LICENSE`](./LICENSE).
