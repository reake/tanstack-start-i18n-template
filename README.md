# TanStack Start i18n SEO Template

A production-ready starter for building multilingual,
SEO-friendly websites with TanStack Start.

## Why this template?

Most TanStack Start examples demonstrate framework features. This starter is for
content-driven websites where internationalization and organic search belong in the
architecture from the beginning. It was extracted from a production website and
keeps routing, content, metadata, and discovery files aligned.

## Features

### Internationalization

- Multi-language routing with an optional {-$locale} segment
- Optional-locale routing: `/blog` for English and `/zh/blog` for Chinese
- Lazy-loaded message catalogs with English fallback
- Automatic language switcher, `hreflang`, and `x-default` links

### Content and SEO

- Localized MDX posts with validated front matter and translated article links
- Canonical URLs, Open Graph, Twitter cards, and JSON-LD helpers
- Generated `sitemap.xml` and `robots.txt`

### Developer experience

- TypeScript, type-safe TanStack routing, React, and Tailwind CSS
- Accessible reusable UI primitives
- Cloudflare Pages and Workers deployment targets

## Production example

### [SVGView](https://svgview.com)

SVGView is a multilingual SVG toolkit built and deployed with this architecture.

## Project structure

```text
content/
└── blogs/                   MDX posts, one file per locale
public/                      Static assets and generated sitemap/robots files
scripts/                     Blog, sitemap, and deployment scripts
src/
├── routes/                  TanStack Start file-based routes
│   ├── __root.tsx            Root document and global SEO alternates
│   ├── index.tsx
│   └── {-$locale}/           Optional locale segment
│       └── (pages)/          Localized page route group
│           ├── blog/
│           └── about.tsx
├── components/              Layout, landing, blog, legal, and UI components
├── messages/<locale>/       JSON message catalogs
├── lib/                     i18n, SEO, blog, and request helpers
├── site.config.ts           Site identity and canonical URL
└── router.tsx                Router configuration
```

The important idea is **SEO content architecture**, not just translation: routes,
content, metadata, alternate links, and generated discovery files share the same
locale-aware primitives.

## Quick start

Requirements: Node.js 20+ and pnpm 10.10.0. The repository pins pnpm through
`packageManager`; use Corepack so local and CI installs resolve the same version.

```bash
corepack enable
corepack prepare pnpm@10.10.0 --activate
pnpm install --frozen-lockfile
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

The `url` drives canonical URLs, JSON-LD, the sitemap, and `robots.txt`. Replace the
placeholder assets in `public/` (`logo.png`, `og-image.png`, and `favicon.ico`) and
verify their licenses before redistributing them. See
[`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) for the bundled fonts.

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

Blog MDX is trusted repository content and is compiled as code. Do not connect this
pipeline to user-submitted content without adding a sanitizer and an allowlisted
component set.

## Commands

| Command                 | Purpose                                                 |
| ----------------------- | ------------------------------------------------------- |
| `pnpm dev`              | Start the Vite development server                       |
| `pnpm build`            | Generate sitemap/robots and build for production        |
| `pnpm test`             | Run Vitest                                              |
| `pnpm check`            | Check formatting, lint, and TypeScript                  |
| `pnpm sitemap:generate` | Regenerate `public/sitemap.xml` and `public/robots.txt` |

## Deployment

Cloudflare Pages is the default target:

```bash
pnpm exec wrangler login
CF_PAGES_PROJECT_NAME=your-project pnpm run deploy
```

`CF_PAGES_PROJECT_NAME` is required for a first Pages deployment unless the project
name is already configured in your shell or CI. Use `pnpm run deploy:pages` for Pages
or `pnpm run deploy:workers` for Workers. Workers deployments use
[`wrangler.workers.toml`](./wrangler.workers.toml) and require a Worker already
configured for the account. The Pages build outputs to `dist/`; the Workers build
outputs to `.output/`.

For a reproducible production check, run `pnpm check`, `pnpm test`, and `pnpm build`
before deploying. `pnpm build` regenerates the sitemap, robots.txt, and typed blog
modules, so do not hand-edit those generated files.

After deployment, submit `/sitemap.xml` to Search Console and verify canonical,
`hreflang`, and JSON-LD output on a localized page.

## Contributing

Issues and pull requests are welcome. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for
the local checks and pull request conventions. Repository-specific AI/development
guidance is available in [`AGENTS.md`](./AGENTS.md) and [`CLAUDE.md`](./CLAUDE.md).

## License

This template is released under the [MIT License](./LICENSE). You may use, modify,
and redistribute it, including in commercial projects, under the terms in `LICENSE`.

## Author

Created and maintained by [reake](https://x.com/reakecom).
