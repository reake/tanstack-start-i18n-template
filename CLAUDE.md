# Development Guide

This repository is a production-oriented TanStack Start starter for multilingual,
SEO-friendly tool and content websites.

## Architecture

- `src/routes/` contains file-based TanStack Start routes. Keep the optional
  `{-$locale}` segment intact when adding localized pages.
- `src/messages/` contains user-visible translations. Do not hardcode UI copy in
  route or component files.
- `content/blogs/` contains trusted, locale-specific MDX content.
- `src/lib/i18n.ts` and `src/lib/seo.ts` are the shared primitives for locale-aware
  URLs, metadata, canonical links, and structured data.

## Important conventions

- Keep routes SEO-friendly and use `withLocalePath` for generated links.
- Preserve canonical URLs, `hreflang`, sitemap, and robots.txt behavior.
- Prefer server functions for server-only work and keep browser tools local when
  handling user files.
- Run `pnpm check` and `pnpm test` before submitting changes.

See [`AGENTS.md`](./AGENTS.md) for the complete repository guidelines.
