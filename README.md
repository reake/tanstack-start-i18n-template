# TanStack Start i18n Template

A production-ready multilingual starter for building SEO-friendly tool websites with
[TanStack Start](https://tanstack.com/start).

🚀 **Used in production:** [SVGView.com](https://svgview.com)

## Preview

[![SVGView — a multilingual SVG toolkit powered by this starter](https://svgview.com/og-image.png)](https://svgview.com)

This template powers [SVGView.com](https://svgview.com), a multilingual SVG toolkit
serving users worldwide. Open the [live demo](https://svgview.com) to see the routing,
SEO pages, and content architecture in production.

## Why this template?

Most TanStack Start examples focus on framework features. This starter focuses on
shipping real-world, content-driven websites where internationalization and organic
search are part of the architecture from day one:

- 🌍 Multi-language routing
- 🔎 SEO-friendly localized URLs
- 📄 Markdown content system
- 🗺️ Automatic sitemap and robots.txt generation
- 🏗️ Production-ready project structure
- ⚡ Optimized for content-driven tools and utility websites

## Features

### Internationalization

- ✅ Multi-language routing with an optional `{-$locale}` segment
- ✅ SEO-friendly localized pages
- ✅ Automatic `hreflang` and `x-default` links
- ✅ Accessible language switcher

### Content system

- ✅ Markdown/MDX-based content
- ✅ Zod-validated front matter
- ✅ Localized blog pages and slugs
- ✅ Related posts and translated article links

### SEO

- ✅ Metadata and Open Graph/Twitter card helpers
- ✅ Canonical URLs
- ✅ JSON-LD structured data
- ✅ Generated `sitemap.xml` and `robots.txt`

### Developer experience

- ✅ TypeScript and type-safe routing
- ✅ Clean, reusable architecture
- ✅ Responsive accessible UI with Tailwind CSS
- ✅ Cloudflare Pages and Workers build targets

## Tech stack

- [TanStack Start](https://tanstack.com/start)
- [TanStack Router](https://tanstack.com/router)
- React
- TypeScript
- Tailwind CSS
- Vite
- Markdown/MDX content
- `{-$locale}` optional-locale routing

## Production example

This template is used by:

### [SVGView](https://svgview.com)

SVGView is a browser-based SVG toolkit built on top of this repository.

- SVG viewing, editing, optimizing, and conversion tools
- Multi-language SEO pages
- Content-led acquisition through localized articles and landing pages
- Build-time content generation and Cloudflare delivery
- Local-only browser processing for user files

The production site is intentionally separate from this starter so the repository
remains a focused, reusable foundation for tool and content websites.

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

Requirements: Node.js 20+ and pnpm 10.10.0 (pnpm 9+ is supported).

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

The `url` drives canonical URLs, JSON-LD, the sitemap, and `robots.txt`. Replace the
placeholder assets in `public/` (`logo.png`, `og-image.png`, and `favicon.ico`).

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

Use `pnpm run deploy:pages` for Pages or `pnpm run deploy:workers` for Workers. The
Pages build outputs to `dist/`; the Workers build outputs to `.output/`.

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
