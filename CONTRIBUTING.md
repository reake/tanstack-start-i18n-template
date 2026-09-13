# Contributing

Thanks for improving the template. Keep changes focused on reusable TanStack Start,
i18n, SEO, content, and Cloudflare deployment patterns.

## Local workflow

Use Node.js 20+ and pnpm 10.10.0. Run the following before opening a pull request:

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```

`pnpm check` is intentionally read-only. Use `pnpm format` when you want Prettier
to rewrite files.

## Pull requests

- Explain the user-facing or maintenance reason for the change.
- Add or update tests for routing, i18n, SEO, and shared component behavior.
- Keep generated files out of commits; `src/generated/`, `public/sitemap.xml`, and
  `public/robots.txt` are produced by the build scripts.
- Update the README when a command, deployment target, or repository convention
  changes.

Blog MDX is trusted repository content and is compiled as code. Do not add a CMS or
user-submitted content path without first redesigning that trust boundary.

Cloudflare deployments are explicit: use `pnpm run deploy:pages` for Pages or
`pnpm run deploy:workers` for Workers. Keep their Nitro presets and Wrangler
configurations separate.
